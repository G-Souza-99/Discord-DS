import 'dotenv/config';
import { REST, Routes, SlashCommandBuilder } from 'discord.js';

// /copy1t1
const copy1t1 = new SlashCommandBuilder()
  .setName('copy1t1')
  .setDescription('Kick off copy funnel helper on a link (+optional translation).')
  .addStringOption(o =>
    o.setName('link')
      .setDescription('URL to process')
      .setRequired(true))
  .addBooleanOption(o =>
    o.setName('translate')
      .setDescription('Translate the content? (defaults to false)'))
  .addStringOption(o =>
    o.setName('languagefrom')
      .setDescription('Source language code, e.g. "nl"')
      .setMaxLength(10))
  .addStringOption(o =>
    o.setName('languageto')
      .setDescription('Target language code, e.g. "en"')
      .setMaxLength(10));

// /help
const help = new SlashCommandBuilder()
  .setName('help')
  .setDescription('How to use the bot commands')
  .addStringOption(o =>
    o.setName('command')
      .setDescription('Get help for a specific command')
      .addChoices(
        { name: 'copy1t1', value: 'copy1t1' }
      )
  );

const commands = [copy1t1.toJSON(), help.toJSON()];

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

try {
  const res = await rest.put(
    Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
    { body: commands }
  );
  console.log(`✅ Registered ${res.length} guild command(s).`);
} catch (err) {
  console.error('❌ Failed to register commands:', err);
}
