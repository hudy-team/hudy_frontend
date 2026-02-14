import Link from "next/link"
import { HuDyLogo } from "@/components/hudy-logo"

export const metadata = {
  title: "개인정보처리방침 - HuDy",
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-3xl items-center gap-4 px-6 py-4">
          <HuDyLogo size="sm" href="/" />
          <div className="h-5 w-px bg-border" />
          <h1 className="text-sm font-medium text-muted-foreground">개인정보처리방침</h1>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-12">
        <div className="prose prose-invert max-w-none text-sm leading-relaxed text-muted-foreground [&_h2]:mb-4 [&_h2]:mt-10 [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:text-foreground [&_h3]:mb-2 [&_h3]:mt-6 [&_h3]:text-base [&_h3]:font-medium [&_h3]:text-foreground [&_p]:mb-3 [&_ol]:mb-3 [&_ol]:list-decimal [&_ol]:pl-5 [&_ul]:mb-3 [&_ul]:list-disc [&_ul]:pl-5 [&_li]:mb-1 [&_table]:mb-4 [&_table]:w-full [&_table]:text-left [&_th]:border [&_th]:border-border [&_th]:bg-muted/30 [&_th]:px-3 [&_th]:py-2 [&_th]:text-foreground [&_td]:border [&_td]:border-border [&_td]:px-3 [&_td]:py-2">
          <p>
            HuDy(이하 &quot;서비스&quot;)는 「개인정보 보호법」 제30조에 따라 이용자의 개인정보를 보호하고 이와 관련한 고충을 신속하고 원활하게 처리하기 위하여 다음과 같이 개인정보 처리방침을 수립·공개합니다.
          </p>

          <h2>제1조 (개인정보의 처리 목적)</h2>
          <p>서비스는 다음의 목적을 위하여 개인정보를 처리합니다. 처리하고 있는 개인정보는 다음의 목적 이외의 용도로는 이용되지 않으며, 이용 목적이 변경되는 경우에는 「개인정보 보호법」 제18조에 따라 별도의 동의를 받는 등 필요한 조치를 이행할 예정입니다.</p>
          <ol>
            <li>
              <strong>회원 가입 및 관리</strong>
              <br />회원 가입 의사 확인, 회원제 서비스 제공에 따른 본인 식별·인증, 회원 자격 유지·관리, 서비스 부정 이용 방지 목적으로 개인정보를 처리합니다.
            </li>
            <li>
              <strong>서비스 제공</strong>
              <br />API 키 발급 및 관리, API 사용량 통계 제공, 공휴일 데이터 관리 등 서비스 제공과 관련한 목적으로 개인정보를 처리합니다.
            </li>
            <li>
              <strong>서비스 개선</strong>
              <br />서비스 이용 기록 분석, 서비스 품질 개선, 신규 서비스 개발 목적으로 개인정보를 처리합니다.
            </li>
          </ol>

          <h2>제2조 (처리하는 개인정보의 항목)</h2>
          <p>서비스는 다음의 개인정보 항목을 처리하고 있습니다.</p>
          <table>
            <thead>
              <tr>
                <th>구분</th>
                <th>항목</th>
                <th>수집 방법</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>필수 항목</td>
                <td>이메일 주소, 이름(닉네임), 프로필 이미지 URL</td>
                <td>OAuth 로그인(Google, GitHub) 또는 이메일 매직 링크</td>
              </tr>
              <tr>
                <td>자동 수집 항목</td>
                <td>서비스 이용 기록, API 호출 기록, 접속 로그, IP 주소</td>
                <td>서비스 이용 과정에서 자동 생성·수집</td>
              </tr>
            </tbody>
          </table>

          <h2>제3조 (개인정보의 처리 및 보유 기간)</h2>
          <ol>
            <li>서비스는 법령에 따른 개인정보 보유·이용 기간 또는 이용자로부터 개인정보를 수집 시 동의 받은 개인정보 보유·이용 기간 내에서 개인정보를 처리·보유합니다.</li>
            <li>
              각각의 개인정보 처리 및 보유 기간은 다음과 같습니다.
              <ul>
                <li><strong>회원 가입 정보:</strong> 회원 탈퇴 시까지 (탈퇴 후 지체 없이 파기)</li>
                <li><strong>서비스 이용 기록:</strong> 3년 (통신비밀보호법)</li>
                <li><strong>로그인 기록:</strong> 3개월 (통신비밀보호법)</li>
              </ul>
            </li>
          </ol>

          <h2>제4조 (개인정보의 제3자 제공)</h2>
          <p>서비스는 이용자의 개인정보를 제1조에서 명시한 목적 범위 내에서만 처리하며, 이용자의 사전 동의 없이 본래의 목적 범위를 초과하여 처리하거나 제3자에게 제공하지 않습니다.</p>
          <p>다만, 다음의 경우에는 예외로 합니다.</p>
          <ul>
            <li>이용자가 사전에 동의한 경우</li>
            <li>법령에 특별한 규정이 있거나 법령상 의무를 준수하기 위하여 불가피한 경우</li>
            <li>이용자 또는 그 법정대리인이 의사표시를 할 수 없는 상태에 있거나 주소불명 등으로 사전 동의를 받을 수 없는 경우로서 명백히 이용자 또는 제3자의 급박한 생명, 신체, 재산의 이익을 위하여 필요하다고 인정되는 경우</li>
          </ul>

          <h2>제5조 (개인정보처리의 위탁)</h2>
          <p>서비스는 원활한 개인정보 업무처리를 위하여 다음과 같이 개인정보 처리업무를 위탁하고 있습니다.</p>
          <table>
            <thead>
              <tr>
                <th>위탁받는 자(수탁자)</th>
                <th>위탁하는 업무의 내용</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Supabase Inc.</td>
                <td>클라우드 인프라 운영, 데이터베이스 관리, 인증 서비스 제공</td>
              </tr>
              <tr>
                <td>Vercel Inc.</td>
                <td>웹 애플리케이션 호스팅 및 배포</td>
              </tr>
            </tbody>
          </table>

          <h2>제6조 (개인정보의 파기)</h2>
          <ol>
            <li>서비스는 개인정보 보유 기간의 경과, 처리 목적 달성 등 개인정보가 불필요하게 되었을 때에는 지체 없이 해당 개인정보를 파기합니다.</li>
            <li>
              파기의 절차 및 방법은 다음과 같습니다.
              <ul>
                <li><strong>파기 절차:</strong> 불필요한 개인정보는 개인정보의 처리가 불필요한 것으로 인정되는 날로부터 5일 이내에 그 개인정보를 파기합니다.</li>
                <li><strong>파기 방법:</strong> 전자적 파일 형태의 정보는 기록을 재생할 수 없는 기술적 방법을 사용하여 삭제합니다.</li>
              </ul>
            </li>
          </ol>

          <h2>제7조 (정보주체의 권리·의무 및 행사방법)</h2>
          <ol>
            <li>
              이용자는 서비스에 대해 언제든지 다음 각 호의 개인정보 보호 관련 권리를 행사할 수 있습니다.
              <ul>
                <li>개인정보 열람 요구</li>
                <li>오류 등이 있을 경우 정정 요구</li>
                <li>삭제 요구</li>
                <li>처리 정지 요구</li>
              </ul>
            </li>
            <li>제1항에 따른 권리 행사는 서비스 내 설정 메뉴를 통해 또는 이메일을 통해 할 수 있으며, 서비스는 이에 대해 지체 없이 조치합니다.</li>
            <li>이용자가 개인정보의 오류 등에 대한 정정 또는 삭제를 요구한 경우에는 정정 또는 삭제를 완료할 때까지 당해 개인정보를 이용하거나 제공하지 않습니다.</li>
          </ol>

          <h2>제8조 (개인정보의 안전성 확보조치)</h2>
          <p>서비스는 개인정보의 안전성 확보를 위해 다음과 같은 조치를 취하고 있습니다.</p>
          <ul>
            <li><strong>개인정보의 암호화:</strong> 이용자의 개인정보는 암호화되어 저장·관리되고 있으며, 데이터 전송 시 SSL/TLS를 통해 암호화하여 전송합니다.</li>
            <li><strong>접근 제한:</strong> 개인정보를 처리하는 데이터베이스에 대한 접근 권한을 최소한의 인원으로 제한하고 있습니다.</li>
            <li><strong>접속 기록의 보관:</strong> 개인정보 처리 시스템에 접속한 기록을 최소 1년 이상 보관·관리하고 있습니다.</li>
            <li><strong>보안 프로그램 설치:</strong> 해킹이나 악성 프로그램에 의한 개인정보 유출을 방지하기 위해 보안 프로그램을 설치하고 주기적으로 갱신·점검합니다.</li>
          </ul>

          <h2>제9조 (쿠키의 사용)</h2>
          <ol>
            <li>서비스는 이용자에게 개별적인 맞춤 서비스를 제공하기 위해 이용 정보를 저장하고 수시로 불러오는 &apos;쿠키(Cookie)&apos;를 사용합니다.</li>
            <li>쿠키는 서비스를 운영하는 데 이용되는 서버가 이용자의 브라우저에 보내는 소량의 정보이며, 이용자의 컴퓨터에 저장됩니다.</li>
            <li>
              서비스에서 쿠키를 사용하는 목적은 다음과 같습니다.
              <ul>
                <li>로그인 상태 유지 및 인증 관리</li>
                <li>서비스 이용 환경 설정 저장</li>
              </ul>
            </li>
            <li>이용자는 쿠키 설치에 대한 선택권을 가지고 있습니다. 브라우저 옵션을 통해 쿠키 허용, 확인, 거부를 설정할 수 있습니다. 다만, 쿠키 저장을 거부할 경우 로그인이 필요한 일부 서비스 이용에 어려움이 있을 수 있습니다.</li>
          </ol>

          <h2>제10조 (개인정보 보호책임자)</h2>
          <p>서비스는 개인정보 처리에 관한 업무를 총괄해서 책임지고, 개인정보 처리와 관련한 이용자의 불만 처리 및 피해 구제 등을 위하여 아래와 같이 개인정보 보호책임자를 지정하고 있습니다.</p>
          <ul>
            <li><strong>개인정보 보호책임자:</strong> HuDy 운영팀</li>
            <li><strong>연락처:</strong> 서비스 내 문의 기능을 통해 접수</li>
          </ul>
          <p>이용자는 서비스 이용 중 발생한 모든 개인정보 보호 관련 문의, 불만 처리, 피해 구제 등에 관한 사항을 개인정보 보호책임자에게 문의할 수 있습니다.</p>

          <h2>제11조 (권익침해 구제방법)</h2>
          <p>이용자는 개인정보 침해로 인한 구제를 받기 위하여 다음의 기관에 분쟁 해결이나 상담 등을 신청할 수 있습니다.</p>
          <ul>
            <li>개인정보분쟁조정위원회: (국번없이) 1833-6972 (www.kopico.go.kr)</li>
            <li>개인정보침해신고센터: (국번없이) 118 (privacy.kisa.or.kr)</li>
            <li>대검찰청: (국번없이) 1301 (www.spo.go.kr)</li>
            <li>경찰청: (국번없이) 182 (ecrm.cyber.go.kr)</li>
          </ul>

          <h2>제12조 (개인정보 처리방침 변경)</h2>
          <p>이 개인정보 처리방침은 시행일로부터 적용되며, 법령 및 방침에 따른 변경 내용의 추가, 삭제 및 정정이 있는 경우에는 변경 사항의 시행 7일 전부터 서비스 내 공지사항을 통하여 고지할 것입니다.</p>

          <h2>부칙</h2>
          <p>이 개인정보처리방침은 2025년 1월 1일부터 시행합니다.</p>
        </div>

        <div className="mt-16 border-t border-border pt-6 text-center text-xs text-muted-foreground">
          <Link href="/login" className="text-foreground underline underline-offset-2 hover:text-primary">
            로그인으로 돌아가기
          </Link>
          <span className="mx-2">·</span>
          <Link href="/terms" className="text-foreground underline underline-offset-2 hover:text-primary">
            이용약관
          </Link>
        </div>
      </main>
    </div>
  )
}
