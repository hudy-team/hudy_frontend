import { NextRequest } from "next/server";
import { handleMcpRequest } from "@/lib/mcp/server";
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

  const result = await validateApiKey(apiKey);

  if (!result.ok) {
    const message =
      result.reason === "no_subscription"
        ? "Active subscription required. Please subscribe at https://hudy.co.kr"
        : "Invalid or inactive API key";
    const status = result.reason === "no_subscription" ? 403 : 401;

    return Response.json(
      {
        jsonrpc: "2.0",
        error: { code: -32001, message },
        id: null,
      },
      { status }
    );
  }

  return authStore.run(result.context, () => handleMcpRequest(req));
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
