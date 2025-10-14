// register.js
const { REST, Routes } = require("discord.js");

const token = process.env.DISCORD_TOKEN;       
const appId = process.env.APPLICATION_ID;      
const guildId = process.env.GUILD_ID;          

const rest = new REST({ version: "10" }).setToken(token);

(async () => {
  try {
    await rest.put(
      Routes.applicationGuildCommands(appId, guildId),
      { body: [{ name: "create", description: "Show a test button" }] }
    );
    console.log("Registered /create for guild", guildId);
  } catch (e) {
    console.error("Failed to register:", e);
  }
})();
