import 'dotenv/config';
import { Client, GatewayIntentBits, Events } from 'discord.js';

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.once(Events.ClientReady, (c) => {
  console.log(`🤖 Logged in as ${c.user.tag}`);
});

function isValidUrl(str) {
  try {
    const u = new URL(str);
    return ['http:', 'https:'].includes(u.protocol);
  } catch {
    return false;
  }
}

// All command handling logic
client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  // ----- /help -----
  if (interaction.commandName === 'help') {
    const which = interaction.options.getString('command');

    if (which === 'copy1t1') {
      await interaction.reply({
        ephemeral: true,
        content:
`**/copy1t1** — Start copy 1-to-1 workflow for a page (optional translate)

**Usage**
\`/copy1t1 link:<url> [translate:true|false] [languagefrom:<code>] [languageto:<code>]\`

**Parameters**
• **link** (required): Full http(s) URL to process  
• **translate** (optional): Default false. If true, include **languagefrom** and **languageto**  
• **languagefrom** (optional): ISO code, e.g. \`nl\`, \`en\`, \`de\`  
• **languageto** (optional): ISO code, e.g. \`en\`, \`nl\`, \`fr\`

**Examples**
• \`/copy1t1 link:https://example.com/product\`
• \`/copy1t1 link:https://example.com/product translate:true languagefrom:nl languageto:en\`
`
      });
      return;
    }

    // Generic help
    await interaction.reply({
      ephemeral: true,
      content:
`**Funnel Helper Bot — Commands**

• **/copy1t1** — Start copy 1-to-1 workflow  
  → Use \`/help command:copy1t1\` for full usage and examples`
    });
    return;
  }

  // ----- /copy1t1 -----
  if (interaction.commandName !== 'copy1t1') return;

  const link = interaction.options.getString('link', true);
  const translate = interaction.options.getBoolean('translate') ?? false;
  const languageFrom = interaction.options.getString('languagefrom') || null;
  const languageTo = interaction.options.getString('languageto') || null;

  if (!isValidUrl(link)) {
    await interaction.reply({ content: '❌ Please provide a valid http(s) URL.', ephemeral: true });
    return;
  }

  // Basic guardrails if translate is true
  if (translate && (!languageFrom || !languageTo)) {
    await interaction.reply({
      content: '❌ Translate is on — include both `languagefrom` and `languageto` (e.g. `nl` → `en`).',
      ephemeral: true
    });
    return;
  }

  // For now: just acknowledge. (Hook to n8n/make later.)
  await interaction.reply({
    content:
      `✅ Received:\n• Link: ${link}\n• Translate: ${translate ? 'yes' : 'no'}` +
      (translate ? `\n• From: ${languageFrom}\n• To: ${languageTo}` : ''),
    ephemeral: true
  });

  // TODO: trigger your n8n/make webhook here later.
  // Example:
  // await fetch(process.env.N8N_WEBHOOK_URL, {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({ link, translate, languageFrom, languageTo, user: interaction.user.id })
  // });
});

client.login(process.env.DISCORD_TOKEN);
