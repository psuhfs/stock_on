import { serve } from "bun";
import { join } from "path";

const port = 3000;

serve({
  port: port,
  fetch(req) {
    const url = new URL(req.url);
    let filePath = "";

    if (url.pathname === "/") {
      filePath = "./src/index.html";
    } else if (url.pathname === "/login") {
      filePath = "./src/login.html";
    } else if (url.pathname === "/signup") {
      filePath = "./src/signup.html";
    } else if (url.pathname.endsWith(".css")) {
      filePath = `./src${url.pathname}`;
    } else if (url.pathname.endsWith(".js")) {
      filePath = `./dist${url.pathname}`;
    } else {
      return new Response("Not Found", { status: 404 });
    }

    return new Response(Bun.file(filePath));
  },
});

console.log(`Server running on http://localhost:${port}`);