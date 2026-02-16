import { NextRequest } from "next/server";
import { mcpHandler } from "@/lib/mcp/server";
import { authStore, validateApiKey } from "@/lib/mcp/auth";

async function withAuth(req: NextRequest) {
  const apiKey = req.headers.get("x-api-key");

  if (!apiKey) {
    return Response.json(
      {
        jsonrpc: "2.0",
        error: { code: -32001, message: "Missing x-api-key header" },
        id: null,
      },
      { status: 401 }
    );
  }

  const authContext = await validateApiKey(apiKey);

  if (!authContext) {
    return Response.json(
      {
        jsonrpc: "2.0",
        error: { code: -32001, message: "Invalid or inactive API key" },
        id: null,
      },
      { status: 401 }
    );
  }

  return authStore.run(authContext, () => mcpHandler(req));
}

export async function GET(req: NextRequest) {
  return withAuth(req);
}

export async function POST(req: NextRequest) {
  return withAuth(req);
}

export async function DELETE(req: NextRequest) {
  return withAuth(req);
}

export const runtime = "nodejs";
