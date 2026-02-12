import { createHmac } from "crypto"

type JwtPayload = {
  api_key_id: string
  user_id: string
  token_version: number
  iat: number
  exp: number
}

function toBase64Url(value: string): string {
  return Buffer.from(value).toString("base64url")
}

export function signApiKeyToken(payload: JwtPayload, secret: string): string {
  const header = {
    alg: "HS256",
    typ: "JWT",
  }

  const encodedHeader = toBase64Url(JSON.stringify(header))
  const encodedPayload = toBase64Url(JSON.stringify(payload))
  const signingInput = `${encodedHeader}.${encodedPayload}`

  const signature = createHmac("sha256", secret).update(signingInput).digest("base64url")
  return `${signingInput}.${signature}`
}
