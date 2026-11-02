// Publica no site em produção as células de server/data/site.json, sem mexer no restante do conteúdo.
// Uso: node apps/web/server/scripts/publicar-celulas.mjs https://endereco-do-site
import { readFile } from "node:fs/promises";
import { createInterface } from "node:readline";

const siteUrl = (process.argv[2] || "").replace(/\/$/, "");
if (!/^https?:\/\//.test(siteUrl)) {
  console.error("Informe o endereço do site, ex.: node publicar-celulas.mjs https://seusite.com.br");
  process.exit(1);
}

function ask(question, hidden = false) {
  const rl = createInterface({ input: process.stdin, output: process.stdout, terminal: true });
  if (hidden) rl._writeToOutput = text => { if (text.includes(question)) process.stdout.write(text); };
  return new Promise(done => rl.question(question, answer => { rl.close(); if (hidden) process.stdout.write("\n"); done(answer.trim()); }));
}

const { cells } = JSON.parse(await readFile(new URL("../data/site.json", import.meta.url), "utf8"));
const email = await ask("E-mail do admin: ");
const password = await ask("Senha do admin: ", true);

const login = await fetch(`${siteUrl}/api/admin/login`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ email, password }) });
if (!login.ok) throw new Error(`Login falhou (${login.status}): ${await login.text()}`);
const { token } = await login.json();

const current = await fetch(`${siteUrl}/api/admin/site`, { headers: { authorization: `Bearer ${token}` } });
if (!current.ok) throw new Error(`Não foi possível ler o site (${current.status}).`);
const site = await current.json();
console.log(`No ar: ${site.cells.length} células. Novas: ${cells.length}.`);

const saved = await fetch(`${siteUrl}/api/admin/site`, { method: "PUT", headers: { "content-type": "application/json", authorization: `Bearer ${token}` }, body: JSON.stringify({ ...site, cells }) });
if (!saved.ok) throw new Error(`Falha ao salvar (${saved.status}): ${await saved.text()}`);
console.log(`Pronto: ${(await saved.json()).cells.length} células publicadas.`);
