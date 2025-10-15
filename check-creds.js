import 'dotenv/config';
import { REST, Routes } from 'discord.js';

function mask(s) {
  if (!s) return 'MISSING';
  return s.slice(0,6) + '...' + s.slice(-4);
}

console.log('CLIENT_ID:', process.env.CLIENT_ID);
console.log('GUILD_ID :', process.env.GUILD_ID);
console.log('TOKEN    :', mask(process.env.DISCORD_TOKEN));

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

try {
  // Confirms the token is a valid *bot* token and tied to this application
  const meApp = await rest.get(Routes.oauth2CurrentApplication());
  console.log('✅ App OK:', meApp.id, meApp.name);

  if (meApp.id !== process.env.CLIENT_ID) {
    console.error('❌ Mismatch: CLIENT_ID in .env does not match token’s application id!');
  }

  // Optional: check the guild exists/visible to the bot (not strictly needed to register)
  // If this throws 403/404 the bot likely isn’t in the guild yet.
  try {
    const guild = await rest.get(Routes.guild(process.env.GUILD_ID));
    console.log('✅ Guild visible:', guild.id, guild.name);
  } catch (e) {
    console.warn('⚠️ Guild check failed (bot may not be in the server yet):', e.status);
  }
} catch (e) {
  console.error('❌ Token check failed:', e.status, e.message);
  console.error('Likely causes: wrong token, wrong token type, or env not loaded.');
}
