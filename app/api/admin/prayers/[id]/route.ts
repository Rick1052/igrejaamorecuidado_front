import { proxyApiRequest } from "@/lib/server-api";

type Context = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Context) {
  return proxyApiRequest(`/api/prayers/${encodeURIComponent((await params).id)}`, request);
}

export async function DELETE(request: Request, { params }: Context) {
  return proxyApiRequest(`/api/prayers/${encodeURIComponent((await params).id)}`, request);
}
