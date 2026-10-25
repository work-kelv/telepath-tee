// Serves the static build in out/ (run `npm run build` first). It listens on every network
// interface, so a phone on the same Wi-Fi can open it for testing.
import http from "http";
import { promises as fs } from "fs";
import os from "os";
import path from "path";

const root = path.resolve("out");
const port = Number(process.env.PORT ?? 4173);
const types = { ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".css": "text/css", ".png": "image/png", ".svg": "image/svg+xml", ".json": "application/json", ".txt": "text/plain", ".ico": "image/x-icon", ".woff2": "font/woff2" };

http
  .createServer(async (req, res) => {
    const urlPath = decodeURIComponent(new URL(req.url ?? "/", "http://x").pathname);
    let file = path.join(root, urlPath);
    if (!file.startsWith(root)) return res.writeHead(403).end();
    try {
      if ((await fs.stat(file)).isDirectory()) file = path.join(file, "index.html");
      res.writeHead(200, { "Content-Type": types[path.extname(file)] ?? "application/octet-stream" });
      res.end(await fs.readFile(file));
    } catch {
      res.writeHead(404, { "Content-Type": "text/html; charset=utf-8" });
      res.end(await fs.readFile(path.join(root, "404.html")).catch(() => "Not found"));
    }
  })
  .listen(port, "0.0.0.0", () => {
    const lan = Object.values(os.networkInterfaces()).flat().find((i) => i && i.family === "IPv4" && !i.internal);
    console.log(`Preview: http://localhost:${port}` + (lan ? `  (phone on same Wi-Fi: http://${lan.address}:${port})` : ""));
  });
