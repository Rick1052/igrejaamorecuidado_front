import { proxyApiRequest } from "@/lib/server-api";

export async function POST(request: Request) {
  return proxyApiRequest("/api/uploads", request);
}
