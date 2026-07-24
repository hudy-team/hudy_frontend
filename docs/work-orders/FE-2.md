# FE-2 — API 키 발급/회전을 서버측 RPC로 전환 [최우선]

담당 파일 (이 1개 외에는 **어떤 파일도 수정 금지**):

- 수정 `app/dashboard/api-keys/page.tsx`

## 배경 (왜 고치는가 — 반드시 읽을 것)

기존 코드는 **브라우저에서 API 키 문자열을 생성**해 `api_keys` 테이블에 직접 INSERT 했다.
이 구조에서는 악의적 사용자가 Supabase REST를 직접 호출해 자기가 고른 임의의 키 값
(예: `hd_live_00000000000000000000000000000000`)을 등록할 수 있었다. 백엔드
(`hudy_backend`)는 키 문자열만으로 인증하므로 예측 가능한 키가 서비스에 그대로 통한다.

2026-07-24에 DB 권한을 잠갔다. 현재 프로덕션 상태:

- `authenticated` 역할의 `api_keys` **INSERT 권한 없음** (정책도 삭제됨)
- `UPDATE` 는 `name`, `is_active` **컬럼만** 허용 — `key` 컬럼 변경 불가
- 대신 `issue_api_key(key_name text)` / `rotate_api_key(p_key_id uuid)` RPC가 신설됨

즉 **현재 배포된 프론트의 키 생성/재생성 버튼은 이미 동작하지 않는다.**
이 태스크가 그 장애를 복구한다. 그래서 최우선이다.

## RPC 계약 (실제 DB에 배포된 시그니처 — 검증 완료)

### `issue_api_key(key_name text)`

- 반환: `TABLE(id uuid, key text, name text)` — 단일 행
- 동작: 호출자(`auth.uid()`)의 **기존 키를 모두 삭제**한 뒤 새 키 1개를 발급한다
  (기존 "1유저 1키" UX를 그대로 유지 — 원장 D2)
- 키 형식: `'hd_live_' || 32자리 hex` (총 40자)
- 에러: 미인증 시 `not authenticated`, 이름이 공백이거나 100자 초과면 `invalid key name`
- 권한: `authenticated` 만 실행 가능

### `rotate_api_key(p_key_id uuid)`

- 반환: `text` (새 키 문자열)
- 동작: 해당 키의 `key` 컬럼만 교체한다. `id` / `name` / `created_at` 은 유지된다
- 에러: 본인 소유가 아니거나 없는 id면 `key not found`
- 권한: `authenticated` 만 실행 가능

> 두 RPC 모두 `SECURITY DEFINER` 이며 내부에서 `auth.uid()` 로 소유권을 강제한다.
> 클라이언트는 `user_id` 를 전달하지 않는다 (전달할 수도 없다).

## 수정 내용

### 1. 클라이언트 키 생성 함수 삭제

**Before** (63-71행):

```ts
  const generateKey = () => {
    return (
      "hd_live_" +
      Array.from(crypto.getRandomValues(new Uint8Array(24)))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("")
        .slice(0, 32)
    )
  }

```

**After**: 이 함수를 **통째로 삭제**한다. 키 생성은 이제 전적으로 DB의 몫이다.

### 2. `performCreateKey` 를 RPC 호출로 교체

**Before** (107-160행, 함수 전체):

```ts
  const performCreateKey = async () => {
    setCreating(true)

    const supabase = createClient()
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      toast.error("인증 정보를 확인할 수 없습니다.")
      setCreating(false)
      return
    }

    // Delete all existing keys first
    if (keys.length > 0) {
      const { error: deleteError } = await supabase
        .from("api_keys")
        .delete()
        .eq("user_id", user.id)

      if (deleteError) {
        toast.error("기존 키 삭제 중 오류가 발생했습니다.")
        console.error(deleteError)
        setCreating(false)
        setShowReplaceDialog(false)
        return
      }
    }

    const { error } = await supabase
      .from("api_keys")
      .insert({
        user_id: user.id,
        key: generateKey(),
        name: newKeyName.trim(),
      })

    if (error) {
      toast.error("API 키 생성 중 오류가 발생했습니다.")
      console.error(error)
      setCreating(false)
      setShowReplaceDialog(false)
      return
    }

    toast.success("API 키가 생성되었습니다.")
    await fetchKeys()
    setNewKeyName("")
    setShowCreate(false)
    setCreating(false)
    setShowReplaceDialog(false)
  }
```

**After** (함수 전체를 아래로 교체):

```ts
  const performCreateKey = async () => {
    setCreating(true)

    const supabase = createClient()
    // 키 생성은 서버측 RPC가 담당한다. 기존 키 삭제도 RPC 내부에서 원자적으로 처리된다.
    const { error } = await supabase.rpc("issue_api_key", {
      key_name: newKeyName.trim(),
    })

    if (error) {
      toast.error("API 키 생성 중 오류가 발생했습니다.")
      console.error(error)
      setCreating(false)
      setShowReplaceDialog(false)
      return
    }

    toast.success("API 키가 생성되었습니다.")
    await fetchKeys()
    setNewKeyName("")
    setShowCreate(false)
    setCreating(false)
    setShowReplaceDialog(false)
  }
```

바뀐 점 요약: `auth.getUser()` 왕복 제거(RPC가 `auth.uid()` 사용), 클라이언트측 DELETE 제거
(RPC 내부에서 삭제+삽입이 한 트랜잭션으로 처리되어 "삭제는 됐는데 삽입 실패" 상태가 불가능해진다),
`insert()` → `rpc()`.

### 3. `recycleKey` 를 RPC 호출로 교체

**Before** (162-172행 부근, `const { error } = ...` 부분만):

```ts
    const supabase = createClient()
    const { error } = await supabase
      .from("api_keys")
      .update({ key: generateKey() })
      .eq("id", id)
```

**After**:

```ts
    const supabase = createClient()
    const { error } = await supabase.rpc("rotate_api_key", { p_key_id: id })
```

함수의 나머지 부분(`setRecyclingIds`, toast, `fetchKeys()` 등)은 **그대로 둔다**.

## 금지 사항

- `app/dashboard/page.tsx`, `lib/date.ts`, `lib/plan.ts` 를 건드리지 말 것 (FE-1 담당, 충돌 발생).
- `CLAUDE.md` 를 건드리지 말 것 (FE-3 담당).
- RPC 파라미터 이름을 바꾸지 말 것. `key_name`, `p_key_id` 는 **DB에 배포된 실제 이름**이라
  다르게 쓰면 `PGRST202 function not found` 로 실패한다.
- `toggleActive` 함수는 **수정하지 말 것**. `is_active` 컬럼 UPDATE는 여전히 허용되며 정상 동작한다
  (DB 검증에서 확인: `[3 UPDATE_IS_ACTIVE = ALLOWED ok]`).
- 기존 키를 지우고 새로 만드는 UX(재발급 확인 다이얼로그 포함)를 바꾸지 말 것 — 범위 밖(원장 D2).
- `maskValue` / `copyKey` / `toggleVisibility` 를 수정하지 말 것.

## 수용 기준 (반드시 실행해서 통과 확인)

```bash
cd /Users/minkyu/Documents/hudy/hudy_frontend

# 1. 클라이언트 키 생성이 완전히 사라졌는지 (가장 중요)
grep -n 'generateKey\|getRandomValues' app/dashboard/api-keys/page.tsx
# → 출력이 없어야 한다. 하나라도 나오면 실패.

# 2. 테이블 직접 쓰기가 사라졌는지
grep -n '\.insert(\|\.delete()' app/dashboard/api-keys/page.tsx
# → 출력이 없어야 한다.

# 3. RPC 호출이 들어갔는지
grep -n 'issue_api_key\|rotate_api_key' app/dashboard/api-keys/page.tsx
# → 2건 나와야 한다.

# 4. is_active 토글은 살아있는지 (회귀 방지)
grep -n 'is_active: !currentActive' app/dashboard/api-keys/page.tsx
# → 1건 나와야 한다.

# 5. 빌드 통과
pnpm build

# 6. 타입 검사 (build는 ignoreBuildErrors 때문에 TS 에러를 삼킨다)
npx tsc --noEmit -p tsconfig.json 2>&1 | grep 'app/dashboard/api-keys/page' || echo "TYPE OK"
```

## 커밋

```bash
git add app/dashboard/api-keys/page.tsx
git commit -m "fix: API 키 발급/회전을 서버측 RPC로 전환하여 클라이언트 키 생성 제거"
```

커밋 후 `WORKPLAN.md` 의 FE-2 체크박스를 `[x]` 로 바꾸고 진행 로그에 한 줄 추가한 뒤 함께 커밋한다.
