import "server-only";

export const SERVER_API_URL = (process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:3333").replace(/\/$/, "");

export async function proxyApiRequest(path: string, request?: Request) {
  try {
    const headers = new Headers();
    const contentType = request?.headers.get("content-type");
    const authorization = request?.headers.get("authorization");
    if (contentType) headers.set("content-type", contentType);
    if (authorization) headers.set("authorization", authorization);
    const response = await fetch(`${SERVER_API_URL}${path}`, {
      method: request?.method || "GET",
      headers,
      body: request && !["GET", "HEAD"].includes(request.method) ? await request.arrayBuffer() : undefined,
      cache: "no-store",
      signal: AbortSignal.timeout(10000)
    });
    return new Response(await response.text(), {
      status: response.status,
      headers: { "content-type": response.headers.get("content-type") || "application/json", "cache-control": "no-store" }
    });
  } catch {
    return Response.json({ message: "Não foi possível acessar o servidor." }, { status: 502, headers: { "cache-control": "no-store" } });
  }
}
