const { Client, GatewayIntentBits, REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');
const config = require('./config.json');

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

const commands = [
  ...require('./commands/basic'),
  ...require('./commands/diary'),
  ...require('./commands/vacation'),  
].map(command => command.toJSON());

const rest = new REST({ version: '10' }).setToken(config.token);

async function registerCommands() {
  await rest.put(Routes.applicationCommands(config.clientId), { body: commands });
}

client.on('ready', () => {
  console.log(`봇 로그인 완료: ${client.user.tag}`);
});

client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;

  const basicHandler = require('./commands/basicHandler');
  const diaryHandler = require('./commands/diaryHandler');
  const vacationHandler = require('./commands/vacationHandler');  

  await basicHandler(interaction);
  await diaryHandler(interaction);
  await vacationHandler(interaction);
});

registerCommands().then(() => client.login(config.token));