import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { createServer } from "node:http";
import { extname, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const projectDirectory = resolve(fileURLToPath(new URL("..", import.meta.url)));
const port = Number(process.env.PORT || 4173);

const contentTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".svg": "image/svg+xml",
  ".webp": "image/webp"
};

function getFilePath(requestUrl) {
  const pathName = new URL(requestUrl, "http://localhost").pathname;
  const safePath = pathName === "/" ? "index.html" : pathName.replace(/^\/+/, "");
  const filePath = resolve(projectDirectory, safePath);
  const pathFromProject = relative(projectDirectory, filePath);

  if (pathFromProject.startsWith("..") || pathFromProject.includes(":")) {
    return null;
  }

  return filePath;
}

const server = createServer(async (request, response) => {
  const filePath = getFilePath(request.url || "/");

  if (!filePath) {
    response.writeHead(403).end("Forbidden");
    return;
  }

  try {
    const fileInfo = await stat(filePath);
    if (!fileInfo.isFile()) {
      throw new Error("Not a file");
    }

    response.writeHead(200, {
      "content-type": contentTypes[extname(filePath)] || "application/octet-stream"
    });
    createReadStream(filePath).pipe(response);
  } catch {
    response.writeHead(404).end("Not found");
  }
});

server.listen(port, () => {
  console.log(`Festival preview running at http://localhost:${port}`);
});
