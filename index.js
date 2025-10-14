// Minimal HTTP server so Cloud Run sees the health port
const http = require("http");
const hostname = "0.0.0.0";
const port = Number(process.env.PORT) || 8080;

http
  .createServer((_, res) => {
    res.writeHead(200, { "Content-Type": "text/plain" });
    res.end("OK\n");
  })
  .listen(port, hostname, () => {
    console.log(`Health endpoint on http://${hostname}:${port}`);
  });

// --- Discord bot (no DMs, minimal intents) ---
const dotenv = require("dotenv");
if (!process.env.K_SERVICE) dotenv.config(); // local dev only

const {
  Client,
  GatewayIntentBits,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  Events,
  REST,
  Routes,
} = require("discord.js");

// Fail fast if missing env
if (!process.env.DISCORD_TOKEN) {
  console.error("Missing DISCORD_TOKEN");
  process.exit(1);
}
if (!process.env.APPLICATION_ID) {
  console.error("Missing APPLICATION_ID (Discord Application ID)");
  process.exit(1);
}
// Optional but recommended for instant command registration
const GUILD_ID = process.env.GUILD_ID || null;

// Register the /create command on startup (guild = instant; global can take up to 1h)
(async () => {
  try {
    const rest = new REST({ version: "10" }).setToken(process.env.DISCORD_TOKEN);
    const commands = [
      {
        name: "create",
        description: "Show a test button",
      },
    ];
    if (GUILD_ID) {
      await rest.put(
        Routes.applicationGuildCommands(process.env.APPLICATION_ID, GUILD_ID),
        { body: commands }
      );
      console.log(`Registered /create for guild ${GUILD_ID}`);
    } else {
      await rest.put(
        Routes.applicationCommands(process.env.APPLICATION_ID),
        { body: commands }
      );
      console.log("Registered /create globally (may take up to 1 hour)");
    }
  } catch (e) {
    console.error("Slash command registration failed:", e);
  }
})();

const client = new Client({
  intents: [GatewayIntentBits.Guilds], // minimal; no DMs or message content
});

// Log ready
client.once(Events.ClientReady, (c) => {
  console.log(`Logged in as ${c.user.tag}`);
});

// /create -> shows one button
client.on(Events.InteractionCreate, async (interaction) => {
  try {
    if (interaction.isChatInputCommand() && interaction.commandName === "create") {
      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId("testButton")
          .setLabel("Click me")
          .setStyle(ButtonStyle.Primary)
      );
      await interaction.reply({
        content: "Test menu:",
        components: [row],
        ephemeral: false, // visible to channel; change to true if you want private
      });
      return;
    }

    if (interaction.isButton() && interaction.customId === "testButton") {
      // Edit the original message: show "Clicked" and remove components (closes the UI)
      await interaction.update({
        content: "Clicked ✅",
        components: [],
      });
      return;
    }
  } catch (err) {
    console.error("Interaction error:", err);
    // Try to notify user quietly if something blew up
    if (interaction.isRepliable()) {
      try {
        await interaction.reply({ content: "Error.", ephemeral: true });
      } catch {}
    }
  }
});

// Helpful crash logs
process.on("unhandledRejection", (r) => console.error("UNHANDLED REJECTION:", r));
process.on("uncaughtException", (e) => console.error("UNCAUGHT EXCEPTION:", e));

// Login last
client.login(process.env.DISCORD_TOKEN);
// --- End Discord bot ---