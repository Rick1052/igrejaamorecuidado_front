import { SERVER_API_URL } from "@/lib/server-api";

// Serve as imagens enviadas pelo admin na mesma origem do site, mantendo a URL do backend privada.
export async function GET(_request: Request, { params }: { params: Promise<{ file: string }> }) {
  const { file } = await params;
  if (!/^[\w-]+\.(jpg|png|webp)$/.test(file)) return new Response("Not found", { status: 404 });
  try {
    const response = await fetch(`${SERVER_API_URL}/uploads/${file}`, { signal: AbortSignal.timeout(10000) });
    if (!response.ok) return new Response("Not found", { status: 404 });
    return new Response(response.body, {
      headers: { "content-type": response.headers.get("content-type") || "application/octet-stream", "cache-control": "public, max-age=31536000, immutable" }
    });
  } catch {
    return new Response("Unavailable", { status: 502 });
  }
}
