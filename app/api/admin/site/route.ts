import { proxyApiRequest } from "@/lib/server-api";

export async function GET(request: Request) {
  return proxyApiRequest("/api/site", request);
}

export async function PUT(request: Request) {
  return proxyApiRequest("/api/site", request);
}
