import { proxyApiRequest } from "@/lib/server-api";

export async function GET(request: Request) {
  return proxyApiRequest("/api/prayers", request);
}
