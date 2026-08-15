import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";

export interface PublicHoliday {
  name: string;
  date: string; // "YYYY-MM-DD"
  dayOfWeek: string; // DB day_of_week 원본
  isSubstitute: boolean; // name 에 "대체" 포함 여부
}

/** DB 에 존재하는 연도 목록 (오름차순). */
export async function getAvailableYears(): Promise<number[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase.from("public_holidays").select("year");

  if (error) {
    throw new Error(`getAvailableYears failed: ${error.message}`);
  }

  const years = Array.from(new Set((data ?? []).map((row) => row.year as number)));
  years.sort((a, b) => a - b);
  return years;
}

/** 해당 연도 공휴일 전체, 날짜 오름차순. */
export async function getHolidaysByYear(year: number): Promise<PublicHoliday[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("public_holidays")
    .select("name, date, day_of_week")
    .eq("year", year)
    .order("date");

  if (error) {
    throw new Error(`getHolidaysByYear(${year}) failed: ${error.message}`);
  }

  return (data ?? []).map((row) => ({
    name: row.name as string,
    date: row.date as string,
    dayOfWeek: row.day_of_week as string,
    isSubstitute: (row.name as string).includes("대체"),
  }));
}
