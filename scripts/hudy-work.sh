#!/usr/bin/env bash
# HuDy 자율 작업 루프 러너.
#
# 용도: 세션이 끊기거나 남은 태스크를 무인으로 완주시킬 때 사용한다.
# 사용법:
#   tmux new -d -s hudy-work './scripts/hudy-work.sh'
#   touch .stop-hudy        # 중지
#   tail -f .omc/logs/hudy-work.log
#
# 설계 근거는 llm-wiki 의 [[autonomous-loop-engineering]] 참고.
#  - --continue 금지 (매 반복 신선한 세션, 맥락은 WORKPLAN.md + git log 가 담당)
#  - --model sonnet 명시 (미지정 시 최상위 모델로 돌아 비용이 폭증한다)
#  - sentinel 은 grep -qx (단독 라인) 로만 매치 — 부분 매치 오탐 방지

set -uo pipefail

cd "$(dirname "$0")/.." || exit 1

SENTINEL="HUDY_GOAL_COMPLETE"
STOP_FILE=".stop-hudy"
LOG_DIR=".omc/logs"
LOG="$LOG_DIR/hudy-work.log"

mkdir -p "$LOG_DIR"

PROMPT='HuDy 프론트엔드 자율 작업 반복이다.

먼저 WORKPLAN.md 를 읽어라. 미완료([ ]) 태스크 중 위에서부터 하나를 골라
docs/work-orders/<ID>.md 지시서를 읽고 그대로 구현해라.

규칙:
- 지시서에 없는 설계 판단을 임의로 하지 마라. 지시서의 금지 사항을 반드시 지켜라.
- 지시서가 없거나 판단이 서지 않으면 WORKPLAN.md 의 해당 태스크에 "BLOCKED: 사유" 를 적고 다음으로 넘어가라.
- 지시서의 수용 기준에 있는 검증 명령을 실제로 실행해 통과했을 때만 체크박스를 [x] 로 바꿔라. 자기 승인 금지.
- 태스크 1개 = 커밋 1개. WORKPLAN.md 의 체크박스와 진행 로그 갱신을 같은 커밋에 포함해라.

WORKPLAN.md 의 모든 골 게이트(G1~G6)가 검증까지 끝났을 때만 마지막 줄에 정확히
HUDY_GOAL_COMPLETE 를 출력해라. 아직이면 남은 태스크를 3줄로 요약하고,
그 신호 문자열은 어떤 형태로도 언급하지 마라.'

echo "=== hudy-work loop started ===" >> "$LOG"

while true; do
  if [ -f "$STOP_FILE" ]; then
    echo "=== stopped by $STOP_FILE ===" >> "$LOG"
    break
  fi

  OUT="$(claude --model sonnet --dangerously-skip-permissions -p "$PROMPT" 2>&1)"
  STATUS=$?

  printf '%s\n' "----- $(date '+%F %T') -----" >> "$LOG"
  printf '%s\n' "$OUT" >> "$LOG"

  # 완주 판정: 마지막 5줄 안에 sentinel 이 단독 라인으로 있을 때만
  if printf '%s' "$OUT" | tail -n 5 | grep -qx "$SENTINEL"; then
    echo "=== GOAL COMPLETE ===" >> "$LOG"
    break
  fi

  # 사용량 리밋: 30분 후 재시도
  if printf '%s' "$OUT" | grep -qiE "usage limit|limit reached|rate.?limit"; then
    echo "=== usage limit detected, sleeping 1800s ===" >> "$LOG"
    sleep 1800
    continue
  fi

  if [ $STATUS -ne 0 ]; then
    # 빈 출력 실패는 백그라운드 작업이 세션을 잠근 경우가 많다 — 더 길게 쉰다
    if [ -z "$OUT" ]; then sleep 300; else sleep 120; fi
    continue
  fi

  sleep 120
done
