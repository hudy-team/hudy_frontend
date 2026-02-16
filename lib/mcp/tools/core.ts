import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { getAuthContext } from "@/lib/mcp/auth";

const HUDY_API_URL = process.env.HUDY_API_URL || "https://api.hudy.co.kr";

async function callHudyApi(path: string, params: Record<string, string>) {
  const { apiKey } = getAuthContext();
  const url = new URL(path, HUDY_API_URL);
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null) url.searchParams.set(k, v);
  });

  const res = await fetch(url.toString(), {
    headers: { "x-api-key": apiKey },
  });

  if (!res.ok) {
    const error = await res
      .json()
      .catch(() => ({ error: { message: res.statusText } }));
    throw new Error(error.error?.message || `API error: ${res.status}`);
  }

  return res.json();
}

export function registerCoreTools(server: McpServer) {
  // get_holidays: 공휴일 조회
  server.tool(
    "get_holidays",
    "대한민국 공휴일과 사용자 커스텀 공휴일을 조회합니다. year로 연도별 조회하거나, from/to로 기간 조회가 가능합니다.",
    {
      year: z
        .number()
        .int()
        .min(2000)
        .max(2100)
        .optional()
        .describe("조회할 연도 (예: 2026)"),
      from: z
        .string()
        .regex(/^\d{4}-\d{2}-\d{2}$/)
        .optional()
        .describe("시작 날짜 (YYYY-MM-DD)"),
      to: z
        .string()
        .regex(/^\d{4}-\d{2}-\d{2}$/)
        .optional()
        .describe("종료 날짜 (YYYY-MM-DD)"),
    },
    async ({ year, from, to }) => {
      const params: Record<string, string> = {};
      if (year !== undefined) params.year = String(year);
      if (from) params.from = from;
      if (to) params.to = to;

      const data = await callHudyApi("/v2/holidays", params);
      return {
        content: [{ type: "text" as const, text: JSON.stringify(data.data, null, 2) }],
      };
    }
  );

  // count_business_days: 영업일 수 계산
  server.tool(
    "count_business_days",
    "두 날짜 사이의 영업일(주말/공휴일 제외) 수를 계산합니다.",
    {
      from: z
        .string()
        .regex(/^\d{4}-\d{2}-\d{2}$/)
        .describe("시작 날짜 (YYYY-MM-DD)"),
      to: z
        .string()
        .regex(/^\d{4}-\d{2}-\d{2}$/)
        .describe("종료 날짜 (YYYY-MM-DD)"),
    },
    async ({ from, to }) => {
      const data = await callHudyApi("/v2/business-days/count", { from, to });
      return {
        content: [{ type: "text" as const, text: JSON.stringify(data.data, null, 2) }],
      };
    }
  );

  // add_business_days: 영업일 더하기
  server.tool(
    "add_business_days",
    "특정 날짜에서 N 영업일 후의 날짜를 계산합니다. 주말과 공휴일을 건너뜁니다.",
    {
      from: z
        .string()
        .regex(/^\d{4}-\d{2}-\d{2}$/)
        .describe("기준 날짜 (YYYY-MM-DD)"),
      days: z.number().int().min(1).max(3650).describe("더할 영업일 수"),
    },
    async ({ from, days }) => {
      const data = await callHudyApi("/v2/business-days/add", {
        from,
        days: String(days),
      });
      return {
        content: [{ type: "text" as const, text: JSON.stringify(data.data, null, 2) }],
      };
    }
  );

  // check_business_day: 영업일 여부 확인
  server.tool(
    "check_business_day",
    "특정 날짜가 영업일인지 확인합니다. 날짜를 지정하지 않으면 오늘 날짜를 기준으로 확인합니다.",
    {
      day: z
        .string()
        .regex(/^\d{4}-\d{2}-\d{2}$/)
        .optional()
        .describe("확인할 날짜 (YYYY-MM-DD). 미지정 시 오늘 날짜"),
    },
    async ({ day }) => {
      const params: Record<string, string> = {};
      if (day) params.day = day;

      const data = await callHudyApi("/v2/business-days/check", params);
      return {
        content: [{ type: "text" as const, text: JSON.stringify(data.data, null, 2) }],
      };
    }
  );

  // subtract_business_days: 영업일 빼기
  server.tool(
    "subtract_business_days",
    "특정 날짜에서 N 영업일 전의 날짜를 계산합니다. 주말과 공휴일을 건너뜁니다.",
    {
      from: z
        .string()
        .regex(/^\d{4}-\d{2}-\d{2}$/)
        .describe("기준 날짜 (YYYY-MM-DD)"),
      days: z.number().int().min(1).max(3650).describe("뺄 영업일 수"),
    },
    async ({ from, days }) => {
      const data = await callHudyApi("/v2/business-days/subtract", {
        from,
        days: String(days),
      });
      return {
        content: [{ type: "text" as const, text: JSON.stringify(data.data, null, 2) }],
      };
    }
  );
}
