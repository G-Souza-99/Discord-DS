import dotenv from 'dotenv';
dotenv.config();

// server code to keep bot alive on google cloud run

const http = require('http');
const hostname = '0.0.0.0';
const port = process.env.PORT;
const server = http.createServer((req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain');
  res.end('The server has started\n');
});
server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});

// end of server code 


import { Client, GatewayIntentBits } from 'discord.js';

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.DirectMessages
  ],
});

client.login(process.env.DISCORD_TOKEN);


// Log when the bot is ready
client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

// slash command for handling /create
// ideally opens a modal with buttons to choose from
client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;
  if (interaction.commandName === "create") { 
    await interaction.reply({
      content: 'Creating menu...',
      // ephemeral: true // only visible to user who clicked
    });

    // create a button here etc
    const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
    const row = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('createMenu')
          .setLabel('Create Menu')
          .setStyle(ButtonStyle.Primary),
      );
    await interaction.followUp({ content: 'Click the button to create a menu:', components: [row] });
  }
});


// listen for button interactions
client.on("interactionCreate", async (interaction) => {

  if (interaction.customId === 'createMenu'){

    await interaction.reply({
      content: 'Menu created!',
      // ephemeral: true // only visible to user who clicked
    });


    // create a modal here etc

  }


});