import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { getAuthContext } from "@/lib/mcp/auth";
import { createAdminClient } from "@/lib/supabase/admin";

const KOREAN_DAYS = [
  "일요일",
  "월요일",
  "화요일",
  "수요일",
  "목요일",
  "금요일",
  "토요일",
];

export function registerCustomHolidayTools(server: McpServer) {
  // list_custom_holidays
  server.tool(
    "list_custom_holidays",
    "사용자의 커스텀 공휴일 목록을 조회합니다.",
    {
      year: z
        .number()
        .int()
        .min(2000)
        .max(2100)
        .optional()
        .describe("필터링할 연도"),
    },
    async ({ year }) => {
      const { userId } = getAuthContext();
      const supabase = createAdminClient();

      let query = supabase
        .from("custom_holidays")
        .select("*")
        .eq("user_id", userId)
        .order("date", { ascending: true });

      if (year !== undefined) {
        query = query.eq("year", year);
      }

      const { data, error } = await query;

      if (error)
        throw new Error(`Failed to fetch custom holidays: ${error.message}`);

      return {
        content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }],
      };
    }
  );

  // create_custom_holiday
  server.tool(
    "create_custom_holiday",
    "새로운 커스텀 공휴일을 등록합니다.",
    {
      name: z
        .string()
        .min(1)
        .max(128)
        .describe('공휴일 이름 (예: "회사 창립기념일")'),
      date: z
        .string()
        .regex(/^\d{4}-\d{2}-\d{2}$/)
        .describe("날짜 (YYYY-MM-DD)"),
    },
    async ({ name, date }) => {
      const { userId } = getAuthContext();
      const supabase = createAdminClient();

      const dateObj = new Date(date + "T00:00:00");
      const year = dateObj.getFullYear();
      const month = dateObj.getMonth() + 1;
      const day = dateObj.getDate();
      const dayOfWeek = KOREAN_DAYS[dateObj.getDay()];

      const { data, error } = await supabase
        .from("custom_holidays")
        .insert({
          user_id: userId,
          name,
          date,
          year,
          month,
          day,
          day_of_week: dayOfWeek,
        })
        .select()
        .single();

      if (error)
        throw new Error(`Failed to create custom holiday: ${error.message}`);

      return {
        content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }],
      };
    }
  );

  // update_custom_holiday
  server.tool(
    "update_custom_holiday",
    "기존 커스텀 공휴일을 수정합니다.",
    {
      id: z.string().uuid().describe("수정할 공휴일의 UUID"),
      name: z.string().min(1).max(128).optional().describe("변경할 이름"),
      date: z
        .string()
        .regex(/^\d{4}-\d{2}-\d{2}$/)
        .optional()
        .describe("변경할 날짜 (YYYY-MM-DD)"),
    },
    async ({ id, name, date }) => {
      const { userId } = getAuthContext();
      const supabase = createAdminClient();

      const updates: Record<string, unknown> = {};
      if (name !== undefined) updates.name = name;
      if (date !== undefined) {
        const dateObj = new Date(date + "T00:00:00");
        updates.date = date;
        updates.year = dateObj.getFullYear();
        updates.month = dateObj.getMonth() + 1;
        updates.day = dateObj.getDate();
        updates.day_of_week = KOREAN_DAYS[dateObj.getDay()];
      }

      if (Object.keys(updates).length === 0) {
        return {
          content: [{ type: "text" as const, text: "수정할 내용이 없습니다." }],
        };
      }

      const { data, error } = await supabase
        .from("custom_holidays")
        .update(updates)
        .eq("id", id)
        .eq("user_id", userId)
        .select()
        .single();

      if (error)
        throw new Error(`Failed to update custom holiday: ${error.message}`);
      if (!data)
        throw new Error("Custom holiday not found or not owned by user");

      return {
        content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }],
      };
    }
  );

  // delete_custom_holiday
  server.tool(
    "delete_custom_holiday",
    "커스텀 공휴일을 삭제합니다.",
    {
      id: z.string().uuid().describe("삭제할 공휴일의 UUID"),
    },
    async ({ id }) => {
      const { userId } = getAuthContext();
      const supabase = createAdminClient();

      const { error } = await supabase
        .from("custom_holidays")
        .delete()
        .eq("id", id)
        .eq("user_id", userId);

      if (error)
        throw new Error(`Failed to delete custom holiday: ${error.message}`);

      return {
        content: [
          {
            type: "text" as const,
            text: `커스텀 공휴일이 삭제되었습니다. (id: ${id})`,
          },
        ],
      };
    }
  );
}
