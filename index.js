const http = require("http");
const { verifyKey } = require("discord-interactions");

const port = Number(process.env.PORT) || 8080;
const PUBLIC_KEY = process.env.DISCORD_PUBLIC_KEY;

const server = http.createServer(async (req, res) => {
  if (req.method !== "POST") {
    res.writeHead(200, { "Content-Type": "text/plain" });
    return res.end("OK\n");
  }

  const chunks = [];
  for await (const c of req) chunks.push(c);
  const rawBody = Buffer.concat(chunks);

  const sig = req.headers["x-signature-ed25519"];
  const ts  = req.headers["x-signature-timestamp"];
  const valid = PUBLIC_KEY && sig && ts && verifyKey(rawBody, sig, ts, PUBLIC_KEY);
  if (!valid) { res.writeHead(401); return res.end("bad signature"); }

  const body = JSON.parse(rawBody.toString("utf8"));

  if (body.type === 1) { // PING
    res.writeHead(200, { "Content-Type": "application/json" });
    return res.end(JSON.stringify({ type: 1 }));
  }

  if (body.type === 2 && body.data?.name === "create") { // /create
    const resp = {
      type: 4,
      data: {
        content: "Test menu:",
        // flags: 64, // uncomment for ephemeral
        components: [{
          type: 1,
          components: [{ type: 2, style: 1, label: "Click me", custom_id: "testButton" }]
        }]
      }
    };
    res.writeHead(200, { "Content-Type": "application/json" });
    return res.end(JSON.stringify(resp));
  }

  if (body.type === 3 && body.data?.custom_id === "testButton") { // button
    const update = { type: 7, data: { content: "Clicked ✅", components: [] } };
    res.writeHead(200, { "Content-Type": "application/json" });
    return res.end(JSON.stringify(update));
  }

  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(JSON.stringify({}));
});

server.listen(port, "0.0.0.0", () => {
  console.log(`Listening on :${port} for Discord interactions`);
});
