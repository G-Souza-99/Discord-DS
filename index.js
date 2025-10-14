const http = require("http");
const { verifyKey } = require("discord-interactions");

const port = Number(process.env.PORT) || 8080;
const PUBLIC_KEY = process.env.DISCORD_PUBLIC_KEY || "";

console.log("Booting…");
console.log("Public key present:", PUBLIC_KEY ? `yes (len=${PUBLIC_KEY.length})` : "NO");

const server = http.createServer(async (req, res) => {
  if (req.method !== "POST") {
    res.writeHead(200, { "Content-Type": "text/plain" });
    return res.end("OK\n");
  }
  try {
    const chunks = [];
    for await (const c of req) chunks.push(c);
    const rawBody = Buffer.concat(chunks);

    const sig = req.headers["x-signature-ed25519"];
    const ts  = req.headers["x-signature-timestamp"];

    if (!sig || !ts || !PUBLIC_KEY) {
      console.error("Missing header or public key", { hasSig: !!sig, hasTs: !!ts, hasKey: !!PUBLIC_KEY });
      res.writeHead(401); return res.end("bad signature");
    }

    const valid = verifyKey(rawBody, sig, ts, PUBLIC_KEY);
    if (!valid) {
      console.error("Signature verification FAILED");
      res.writeHead(401); return res.end("bad signature");
    }

    const body = JSON.parse(rawBody.toString("utf8"));
    console.log("Got interaction type:", body.type, "name:", body.data?.name, "custom_id:", body.data?.custom_id);

    // PING -> PONG
    if (body.type === 1) {
      console.log("Replying PONG");
      res.writeHead(200, { "Content-Type": "application/json" });
      return res.end(JSON.stringify({ type: 1 }));
    }

    // /create
    if (body.type === 2 && body.data?.name === "create") {
      const resp = {
        type: 4,
        data: {
          content: "Test menu:",
          components: [{
            type: 1,
            components: [{ type: 2, style: 1, label: "Click me", custom_id: "testButton" }]
          }]
        }
      };
      res.writeHead(200, { "Content-Type": "application/json" });
      return res.end(JSON.stringify(resp));
    }

    // button click
    if (body.type === 3 && body.data?.custom_id === "testButton") {
      const update = { type: 7, data: { content: "Clicked ✅", components: [] } };
      res.writeHead(200, { "Content-Type": "application/json" });
      return res.end(JSON.stringify(update));
    }

    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({}));
  } catch (e) {
    console.error("Handler error:", e);
    res.writeHead(500); res.end("server error");
  }
});

server.listen(port, "0.0.0.0", () => {
  console.log(`Listening on :${port}`);
});
