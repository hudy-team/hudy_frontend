import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js";
import { registerCoreTools } from "@/lib/mcp/tools/core";
import { registerCustomHolidayTools } from "@/lib/mcp/tools/custom-holidays";

export async function handleMcpRequest(req: Request): Promise<Response> {
  const server = new McpServer({
    name: "hudy",
    version: "1.0.0",
  });

  registerCoreTools(server);
  registerCustomHolidayTools(server);

  const transport = new WebStandardStreamableHTTPServerTransport({
    sessionIdGenerator: undefined,
    enableJsonResponse: true,
  });

  await server.connect(transport);

  try {
    return await transport.handleRequest(req);
  } finally {
    await transport.close();
    await server.close();
  }
}
