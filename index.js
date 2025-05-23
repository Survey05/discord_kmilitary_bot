const { Client, GatewayIntentBits, REST, Routes, ActivityType } = require('discord.js');
const config = require('./config.json');

const basicCommands = require('./commands/basic');
const diaryCommands = require('./commands/diary');
const vacationCommands = require('./commands/vacation');

const basicHandler = require('./handler/basicHandler');
const diaryHandler = require('./handler/diaryHandler');
const vacationHandler = require('./handler/vacationHandler');

console.log("🔧 봇 초기화 시작");

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildPresences] });

console.log("📦 명령어 로드 중...");

const commands = [
  ...basicCommands,
  ...diaryCommands,
  ...vacationCommands,
].map(command => command.toJSON());

const commandHandlers = {};

const assignHandlers = () => {
  basicCommands.forEach(cmd => {
    commandHandlers[cmd.name] = basicHandler;
    console.log(`🔗 basic 명령어 연결됨: ${cmd.name}`);
  });
  diaryCommands.forEach(cmd => {
    commandHandlers[cmd.name] = diaryHandler;
    console.log(`🔗 diary 명령어 연결됨: ${cmd.name}`);
  });
  vacationCommands.forEach(cmd => {
    commandHandlers[cmd.name] = vacationHandler;
    console.log(`🔗 vacation 명령어 연결됨: ${cmd.name}`);
  });
};
assignHandlers();

const rest = new REST({ version: '10' }).setToken(config.token);

async function registerCommands() {
  try {
    console.log('📡 Discord에 명령어 등록 요청...');
    await rest.put(Routes.applicationCommands(config.clientId), { body: commands });
    console.log('✅ 명령어 등록 성공');
  } catch (error) {
    console.error('❌ 명령어 등록 중 오류 발생:', error);
  }
}

client.once('ready', () => {
  console.log(`✅ 봇 로그인 완료: ${client.user.tag}`);

  client.user.setPresence({
    status: 'online',
    activities: [
      {
        name: '✏️전역일 계산',
        type: ActivityType.Playing,
      },
    ],
  });
});

client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;

  console.log(`📥 명령어 호출됨: ${interaction.commandName}`);

  const handler = commandHandlers[interaction.commandName];
  if (!handler) {
    console.warn(`⚠️ 핸들러 없음: ${interaction.commandName}`);
    await interaction.reply({ content: '알 수 없는 명령어입니다.', ephemeral: true });
    return;
  }

  try {
    await handler(interaction);
    console.log(`✅ 명령어 처리 완료: ${interaction.commandName}`);
  } catch (error) {
    console.error(`❌ 명령어 처리 중 오류: ${interaction.commandName}`, error);
    if (!interaction.replied) {
      await interaction.reply({ content: '명령어 실행 중 오류가 발생했습니다.', ephemeral: true });
    }
  }
});

(async () => {
  console.log("🚀 봇 실행 시작");
  await registerCommands();
  await client.login(config.token);
})();
