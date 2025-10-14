// HTTP-only Discord Interactions (no gateway)
const http = require("http");
const { verifyKey } = require("discord-interactions");

const port = Number(process.env.PORT) || 8080;
const PUBLIC_KEY = process.env.DISCORD_PUBLIC_KEY; // from Dev Portal → General Information

const server = http.createServer(async (req, res) => {
  if (req.method !== "POST") {
    res.writeHead(200, { "Content-Type": "text/plain" });
    return res.end("OK\n"); // Cloud Run health
  }

  // Read raw body
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const rawBody = Buffer.concat(chunks);

  // Verify signature (REQUIRED by Discord)
  const sig = req.headers["x-signature-ed25519"];
  const ts  = req.headers["x-signature-timestamp"];
  const valid = PUBLIC_KEY && sig && ts && verifyKey(rawBody, sig, ts, PUBLIC_KEY);
  if (!valid) {
    res.writeHead(401, { "Content-Type": "text/plain" });
    return res.end("invalid request signature");
  }

  const body = JSON.parse(rawBody.toString("utf8"));

  // 1) PING -> PONG (type 1)
  if (body.type === 1) {
    res.writeHead(200, { "Content-Type": "application/json" });
    return res.end(JSON.stringify({ type: 1 }));
  }

  // 2) Slash command (/create) -> show button
  if (body.type === 2 && body.data?.name === "create") {
    const response = {
      type: 4, // CHANNEL_MESSAGE_WITH_SOURCE
      data: {
        content: "Test menu:",
        // flags: 64, // uncomment for ephemeral reply
        components: [{
          type: 1, // action row
          components: [{
            type: 2, style: 1, label: "Click me", custom_id: "testButton"
          }]
        }]
      }
    };
    res.writeHead(200, { "Content-Type": "application/json" });
    return res.end(JSON.stringify(response));
  }

  // 3) Button click -> update message to "Clicked ✅" and remove button
  if (body.type === 3 && body.data?.custom_id === "testButton") {
    const update = {
      type: 7, // UPDATE_MESSAGE
      data: { content: "Clicked ✅", components: [] }
    };
    res.writeHead(200, { "Content-Type": "application/json" });
    return res.end(JSON.stringify(update));
  }

  // Default no-op
  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(JSON.stringify({}));
});

server.listen(port, "0.0.0.0", () => {
  console.log(`Listening on :${port} for Discord interactions`);
});
