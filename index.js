const { Client, GatewayIntentBits, REST, Routes } = require('discord.js');
const config = require('./config.json');

const basicCommands = require('./commands/basic');
const diaryCommands = require('./commands/diary');
const vacationCommands = require('./commands/vacation');

const basicHandler = require('./handler/basicHandler');
const diaryHandler = require('./handler/diaryHandler');
const vacationHandler = require('./handler/vacationHandler');

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

const commands = [
  ...basicCommands,
  ...diaryCommands,
  ...vacationCommands,
].map(command => command.toJSON());

const commandHandlers = {};

const assignHandlers = () => {
  basicCommands.forEach(cmd => {
    commandHandlers[cmd.name] = basicHandler;
  });
  diaryCommands.forEach(cmd => {
    commandHandlers[cmd.name] = diaryHandler;
  });
  vacationCommands.forEach(cmd => {
    commandHandlers[cmd.name] = vacationHandler;
  });
};
assignHandlers();

const rest = new REST({ version: '10' }).setToken(config.token);

async function registerCommands() {
  try {
    console.log('명령어 등록 중...');
    await rest.put(Routes.applicationCommands(config.clientId), { body: commands });
    console.log('명령어 등록 완료!');
  } catch (error) {
    console.error('명령어 등록 중 오류 발생:', error);
  }
}

client.once('ready', () => {
  console.log(`봇 로그인 완료: ${client.user.tag}`);
});

client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;

  const handler = commandHandlers[interaction.commandName];
  if (!handler) {
    await interaction.reply({ content: '알 수 없는 명령어입니다.', ephemeral: true });
    return;
  }

  try {
    await handler(interaction);
  } catch (error) {
    console.error(error);
    if (!interaction.replied) {
      await interaction.reply({ content: '명령어 실행 중 오류가 발생했습니다.', ephemeral: true });
    }
  }
});

(async () => {
  await registerCommands();
  await client.login(config.token);
})();
