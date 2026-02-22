export const faqs = [
  {
    question: "HuDy API는 무료로 사용할 수 있나요?",
    answer:
      "HuDy는 월 $3의 단일 요금제로 운영되며, 30일 무료 체험을 제공합니다. 무료 체험 기간 동안 모든 기능을 제한 없이 사용할 수 있습니다.",
  },
  {
    question: "어떤 공휴일 데이터를 제공하나요?",
    answer:
      "공공데이터포털의 한국천문연구원 특일 정보(천문법에 근거한 공식 데이터)를 활용하여 대한민국 법정 공휴일, 대체 공휴일, 임시 공휴일을 모두 정확하게 제공합니다. 또한 회사 창립기념일 등 커스텀 공휴일을 직접 등록하여 API로 조회할 수 있습니다.",
  },
  {
    question: "영업일 계산은 어떻게 하나요?",
    answer:
      "HuDy API의 영업일 계산 엔드포인트를 사용하면 특정 날짜의 영업일 여부 확인, 두 날짜 사이의 영업일 수 계산, N영업일 후/전 날짜 계산을 할 수 있습니다. 주말과 공휴일을 자동으로 제외합니다.",
  },
  {
    question: "SDK는 어떤 언어를 지원하나요?",
    answer:
      "현재 Node.js/TypeScript(@hudy-sdk/sdk)와 Python(hudy-sdk)을 공식 지원합니다. npm install 또는 pip install 한 줄로 바로 사용할 수 있습니다.",
  },
  {
    question: "MCP 서버란 무엇인가요?",
    answer:
      "MCP(Model Context Protocol) 서버를 통해 Claude Desktop, Cursor 등 AI 도구에서 공휴일 조회와 영업일 계산 기능을 바로 사용할 수 있습니다. 설정 파일에 HuDy MCP 서버 URL만 추가하면 됩니다.",
  },
  {
    question: "API 응답 속도는 얼마나 빠른가요?",
    answer:
      "HuDy API는 전 세계 어디서나 100ms 이내의 응답 속도를 보장합니다. 안정적인 인프라 위에서 서비스되며, 99.9% 이상의 가동률을 유지합니다.",
  },
]
