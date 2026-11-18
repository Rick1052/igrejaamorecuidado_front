import { proxyApiRequest } from "@/lib/server-api";

// Rota pública: o formulário de pedidos de oração do site envia para cá.
export async function POST(request: Request) {
  return proxyApiRequest("/api/prayers", request);
}
