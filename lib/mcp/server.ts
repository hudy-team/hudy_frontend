import { createMcpHandler } from "mcp-handler";
import { registerCoreTools } from "@/lib/mcp/tools/core";
import { registerCustomHolidayTools } from "@/lib/mcp/tools/custom-holidays";

export const mcpHandler = createMcpHandler(
  (server) => {
    registerCoreTools(server);
    registerCustomHolidayTools(server);
  },
  {
    serverInfo: {
      name: "hudy",
      version: "1.0.0",
    },
  },
  {
    basePath: "/api",
    verboseLogs: process.env.NODE_ENV === "development",
  }
);
