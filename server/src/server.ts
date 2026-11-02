import cors from "cors";
import express from "express";
import helmet from "helmet";
import { randomUUID } from "node:crypto";
import { access, copyFile, mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { z } from "zod";

const __dirname = dirname(fileURLToPath(import.meta.url));
// Em produção DATA_DIR aponta para um volume persistente; o site.json do repositório serve de conteúdo inicial.
const seedFile = resolve(__dirname, "../data/site.json");
const dataDir = process.env.DATA_DIR ? resolve(process.env.DATA_DIR) : resolve(__dirname, "../data");
const dataFile = resolve(dataDir, "site.json");
const uploadsDir = resolve(dataDir, "uploads");
const maxUploadBytes = 8 * 1024 * 1024;
const port = Number(process.env.PORT || 3333);
const adminEmail = process.env.ADMIN_EMAIL || "admin@iacguarapuava.com.br";
const adminPassword = process.env.ADMIN_PASSWORD || "iac-admin-2026";
const adminToken = process.env.ADMIN_TOKEN || "iac-local-admin-token";
const youtubeChannelId = process.env.YOUTUBE_CHANNEL_ID || "UCwVsHbMl-J0oXMkyOuqjU5A";
const youtubeCacheTtl = Number(process.env.YOUTUBE_CACHE_TTL_MS || 15 * 60 * 1000);
let youtubeCache: { expiresAt: number; sermons: Array<{ title: string; speaker: string; url: string; thumbnail: string }> } | null = null;
const instagramAccessToken = process.env.INSTAGRAM_ACCESS_TOKEN?.trim();
const instagramUserId = process.env.INSTAGRAM_USER_ID?.trim() || "me";
const instagramApiVersion = process.env.INSTAGRAM_API_VERSION?.trim();
const instagramCacheTtl = Number(process.env.INSTAGRAM_CACHE_TTL_MS || 30 * 60 * 1000);
type InstagramPost = { id: string; caption: string; mediaType: "IMAGE" | "VIDEO" | "CAROUSEL_ALBUM"; mediaUrl: string; thumbnailUrl: string; permalink: string; timestamp: string };
let instagramCache: { expiresAt: number; posts: InstagramPost[] } | null = null;

const serviceSchema = z.object({ day: z.string().min(1), title: z.string().min(1), time: z.string().min(1), note: z.string() });
const sermonSchema = z.object({ title: z.string().min(1), speaker: z.string(), url: z.url(), thumbnail: z.union([z.literal(""), z.url()]) });
const cellSchema = z.object({ id: z.string().min(1), name: z.string().min(1), leaders: z.string(), address: z.string().min(1), phone: z.string(), lat: z.number().min(-90).max(90), lng: z.number().min(-180).max(180) });
const instagramResponseSchema = z.object({ data: z.array(z.object({ id: z.string(), caption: z.string().optional(), media_type: z.enum(["IMAGE", "VIDEO", "CAROUSEL_ALBUM"]), media_url: z.url(), thumbnail_url: z.url().optional(), permalink: z.url(), timestamp: z.string().optional() })) });
const siteSchema = z.object({
  announcement: z.object({ enabled: z.boolean(), eyebrow: z.string(), title: z.string().min(1), date: z.string(), url: z.url(), image: z.string().min(1), mobileImage: z.string().min(1) }),
  faceToFace: z.object({
    enabled: z.boolean(), eyebrow: z.string(), title: z.string().min(1), description: z.string(),
    men: z.object({ title: z.string().min(1), date: z.string(), url: z.url(), desktopImage: z.string().min(1), mobileImage: z.string().min(1), cardImage: z.string().min(1) }),
    women: z.object({ title: z.string().min(1), date: z.string(), url: z.url(), desktopImage: z.string().min(1), mobileImage: z.string().min(1), cardImage: z.string().min(1) })
  }),
  hero: z.object({ image: z.string().min(1).default("/hero-worship.png"), mobileImage: z.string().min(1).default("/hero-worship.png"), eyebrow: z.string(), title: z.string().min(1), description: z.string(), primaryCta: z.string(), secondaryCta: z.string() }),
  services: z.array(serviceSchema).min(1),
  sermons: z.array(sermonSchema),
  cells: z.array(cellSchema),
  links: z.object({ instagramChurch: z.url(), instagramPastor: z.url(), youtube: z.url(), cells: z.url(), linktree: z.url(), conference: z.url() }),
  contact: z.object({ address: z.string().min(1), whatsapp: z.string() })
});

async function readSite() {
  return siteSchema.parse(JSON.parse(await readFile(dataFile, "utf8")));
}

async function writeSite(data: z.infer<typeof siteSchema>) {
  await mkdir(dirname(dataFile), { recursive: true });
  const temporary = `${dataFile}.tmp`;
  await writeFile(temporary, JSON.stringify(data, null, 2), "utf8");
  await rename(temporary, dataFile);
}

// Valida pela assinatura do arquivo, não pelo Content-Type enviado pelo navegador.
function detectImageExtension(buffer: Buffer) {
  if (buffer.length > 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) return "jpg";
  if (buffer.length > 8 && buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return "png";
  if (buffer.length > 12 && buffer.toString("ascii", 0, 4) === "RIFF" && buffer.toString("ascii", 8, 12) === "WEBP") return "webp";
  return null;
}

function decodeXml(value: string) {
  return value
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'");
}

async function getLatestYoutubeSermons() {
  if (youtubeCache && youtubeCache.expiresAt > Date.now()) return youtubeCache.sermons;
  const feedUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${youtubeChannelId}`;
  const feedResponse = await fetch(feedUrl, { headers: { "User-Agent": "IACGuarapuavaSite/1.0" }, signal: AbortSignal.timeout(8000) });
  if (!feedResponse.ok) throw new Error(`YouTube feed returned ${feedResponse.status}`);
  const xml = await feedResponse.text();
  const entries = [...xml.matchAll(/<entry>([\s\S]*?)<\/entry>/g)].slice(0, 3);
  const sermons = entries.map((entry) => {
    const content = entry[1];
    const videoId = content.match(/<yt:videoId>([^<]+)<\/yt:videoId>/)?.[1] || "";
    const title = decodeXml(content.match(/<title>([\s\S]*?)<\/title>/)?.[1]?.trim() || "Ministração IAC");
    const thumbnail = content.match(/<media:thumbnail\s+url="([^"]+)"/)?.[1] || `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
    const speaker = title.includes("|") ? title.split("|").at(-1)?.trim() || "IAC Guarapuava" : "IAC Guarapuava";
    return { title, speaker, url: `https://www.youtube.com/watch?v=${videoId}`, thumbnail };
  }).filter(sermon => !sermon.url.endsWith("="));
  if (!sermons.length) throw new Error("YouTube feed returned no videos");
  youtubeCache = { sermons, expiresAt: Date.now() + youtubeCacheTtl };
  return sermons;
}

async function getLatestInstagramPosts() {
  if (!instagramAccessToken) return [];
  if (instagramCache && instagramCache.expiresAt > Date.now()) return instagramCache.posts;
  const versionPath = instagramApiVersion ? `${instagramApiVersion.replace(/^\//, "").replace(/\/$/, "")}/` : "";
  const url = new URL(`https://graph.instagram.com/${versionPath}${encodeURIComponent(instagramUserId)}/media`);
  url.searchParams.set("fields", "id,caption,media_type,media_url,thumbnail_url,permalink,timestamp");
  url.searchParams.set("limit", "6");
  const result = await fetch(url, { headers: { Authorization: `Bearer ${instagramAccessToken}`, "User-Agent": "IACGuarapuavaSite/1.0" }, signal: AbortSignal.timeout(8000) });
  if (!result.ok) throw new Error(`Instagram API returned ${result.status}`);
  const parsed = instagramResponseSchema.parse(await result.json());
  const posts = parsed.data.map(item => ({ id: item.id, caption: item.caption || "", mediaType: item.media_type, mediaUrl: item.media_url, thumbnailUrl: item.thumbnail_url || "", permalink: item.permalink, timestamp: item.timestamp || "" }));
  instagramCache = { posts, expiresAt: Date.now() + instagramCacheTtl };
  return posts;
}

const app = express();
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(cors({ origin: process.env.WEB_URL?.split(",") || ["http://localhost:3000"] }));
app.use(express.json({ limit: "256kb" }));

app.get("/health", (_request, response) => response.json({ status: "ok" }));
app.get("/api/site", async (_request, response, next) => {
  try {
    const site = await readSite();
    try { site.sermons = await getLatestYoutubeSermons(); } catch (error) { console.warn("YouTube sync unavailable; using saved sermons.", error); }
    let instagramPosts: InstagramPost[] = [];
    try { instagramPosts = await getLatestInstagramPosts(); } catch (error) { console.warn("Instagram sync unavailable; using profile fallback.", error); }
    response.setHeader("Cache-Control", "public, max-age=300, stale-while-revalidate=900");
    response.json({ ...site, instagramPosts });
  } catch (error) { next(error); }
});

app.use("/uploads", express.static(uploadsDir, { immutable: true, maxAge: "365d", index: false }));

app.post("/api/auth/login", (request, response) => {
  const parsed = z.object({ email: z.email(), password: z.string() }).safeParse(request.body);
  if (!parsed.success || parsed.data.email !== adminEmail || parsed.data.password !== adminPassword) {
    response.status(401).json({ message: "E-mail ou senha inválidos." });
    return;
  }
  response.json({ token: adminToken });
});

app.put("/api/site", async (request, response, next) => {
  if (request.headers.authorization !== `Bearer ${adminToken}`) {
    response.status(401).json({ message: "Sessão inválida ou expirada." });
    return;
  }
  try {
    const data = siteSchema.parse(request.body);
    await writeSite(data);
    response.json(data);
  } catch (error) { next(error); }
});

// A sessão é conferida antes de ler o corpo para não aceitar 8 MB de quem não está autenticado.
function requireAdmin(request: express.Request, response: express.Response, next: express.NextFunction) {
  if (request.headers.authorization !== `Bearer ${adminToken}`) {
    response.status(401).json({ message: "Sessão inválida ou expirada." });
    return;
  }
  next();
}

app.post("/api/uploads", requireAdmin, express.raw({ type: () => true, limit: maxUploadBytes }), async (request, response, next) => {
  try {
    const buffer = Buffer.isBuffer(request.body) ? request.body : Buffer.alloc(0);
    const extension = detectImageExtension(buffer);
    if (!extension) {
      response.status(415).json({ message: "Envie uma imagem JPG, PNG ou WebP." });
      return;
    }
    await mkdir(uploadsDir, { recursive: true });
    const fileName = `${randomUUID()}.${extension}`;
    await writeFile(resolve(uploadsDir, fileName), buffer);
    response.status(201).json({ url: `/uploads/${fileName}` });
  } catch (error) { next(error); }
});

app.use((error: unknown, _request: express.Request, response: express.Response, _next: express.NextFunction) => {
  if (error instanceof z.ZodError) {
    response.status(400).json({ message: "Revise os campos enviados.", issues: error.issues });
    return;
  }
  if (error && typeof error === "object" && "type" in error && error.type === "entity.too.large") {
    response.status(413).json({ message: "A imagem deve ter no máximo 8 MB." });
    return;
  }
  console.error(error);
  response.status(500).json({ message: "Não foi possível concluir a operação." });
});

await mkdir(dataDir, { recursive: true });
await access(dataFile).catch(() => copyFile(seedFile, dataFile));

app.listen(port, () => console.log(`IAC API disponível em http://localhost:${port}`));
