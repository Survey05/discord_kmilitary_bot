const { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');
const dayjs = require('dayjs');
const config = require('./config.json');

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

const servicePeriods = {
  육군: 18,
  해군: 20,
  공군: 21,
};

const dataFilePath = path.join(__dirname, 'data.json');

function loadData() {
  try {
    if (!fs.existsSync(dataFilePath)) {
      return {};
    }
    const fileContent = fs.readFileSync(dataFilePath, 'utf8');
    return fileContent ? JSON.parse(fileContent) : {};
  } catch (error) {
    console.error('data.json 파일 읽기 오류:', error);
    return {};
  }
}

const commands = [
  new SlashCommandBuilder()
    .setName('정보등록')
    .setDescription('전역일 계산을 위한 정보를 등록합니다.')
    .addStringOption(option =>
      option.setName('이름').setDescription('유저 이름').setRequired(true))
    .addStringOption(option =>
      option.setName('군종').setDescription('육군/공군/해군 중 하나').setRequired(true))
    .addStringOption(option =>
      option.setName('입대날짜').setDescription('YYYY-MM-DD 형식').setRequired(true)),

  new SlashCommandBuilder()
    .setName('전역일')
    .setDescription('등록된 유저의 전역일을 조회합니다.')
    .addStringOption(option =>
      option.setName('이름').setDescription('유저 이름').setRequired(true)),

  new SlashCommandBuilder()
    .setName('리스트')
    .setDescription('등록된 모든 유저의 이름을 보여줍니다.'),

  new SlashCommandBuilder()
    .setName('자대등록')
    .setDescription('자대 및 특기를 등록합니다.')
    .addStringOption(option =>
      option.setName('이름').setDescription('유저 이름').setRequired(true))
    .addStringOption(option =>
      option.setName('자대').setDescription('자대 정보를 입력해주세요.').setRequired(true))
    .addStringOption(option =>
      option.setName('특기').setDescription('특기를 입력해주세요.').setRequired(true)),

  new SlashCommandBuilder()
    .setName('자대')
    .setDescription('등록된 유저의 자대 및 특기를 조회합니다.')
    .addStringOption(option =>
      option.setName('이름').setDescription('유저 이름').setRequired(true)),
]
  .map(command => command.toJSON());

const rest = new REST({ version: '10' }).setToken(config.token);

async function registerCommands() {
  try {
    console.log('슬래시 커맨드를 등록 중...');
    await rest.put(
      Routes.applicationCommands(config.clientId),
      { body: commands }
    );
    console.log('등록 완료!');
  } catch (err) {
    console.error(err);
  }
}

client.on('ready', () => {
  console.log(`봇 로그인 완료: ${client.user.tag}`);
});

client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;

  const { commandName, options } = interaction;
  const data = loadData();

  if (commandName === '정보등록') {
    const name = options.getString('이름');
    const branch = options.getString('군종');
    const enlistDateStr = options.getString('입대날짜');

    if (!servicePeriods[branch]) {
      await interaction.reply({ content: '군종은 "육군", "공군", "해군" 중 하나여야 합니다.', ephemeral: true });
      return;
    }

    const dateFormatRegex = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;
    if (!dateFormatRegex.test(enlistDateStr)) {
      await interaction.reply({ content: '입대날짜 형식이 잘못되었습니다. 반드시 YYYY-MM-DD 형식으로 입력해주세요.', ephemeral: true });
      return;
    }

    const enlistDate = dayjs(enlistDateStr);
    if (!enlistDate.isValid()) {
      await interaction.reply({ content: '입대날짜가 유효하지 않습니다.', ephemeral: true });
      return;
    }

    const dischargeDate = enlistDate.add(servicePeriods[branch], 'month').subtract(1, 'day');

    data[name] = {
      ...data[name],
      branch,
      enlistDate: enlistDate.format('YYYY-MM-DD'),
      dischargeDate: dischargeDate.format('YYYY-MM-DD'),
    };

    fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2));
    await interaction.reply(`${name}님의 전역일은 ${dischargeDate.format('YYYY-MM-DD')} 입니다.`);
  }

  else if (commandName === '전역일') {
    const name = options.getString('이름');
    if (!data[name]) {
      await interaction.reply({ content: `${name}님에 대한 정보가 없습니다. 먼저 /정보등록 명령어로 등록해주세요.`, ephemeral: true });
      return;
    }
    await interaction.reply(`${name}님의 전역일은 ${data[name].dischargeDate} 입니다.`);
  }

  else if (commandName === '리스트') {
    const names = Object.keys(data);
    if (names.length === 0) {
      await interaction.reply('아직 등록된 사용자가 없습니다.');
    } else {
      await interaction.reply(`현재 등록된 사용자:\n${names.join('\n')}`);
    }
  }

  else if (commandName === '자대등록') {
    const name = options.getString('이름');
    const unit = options.getString('자대');
    const specialty = options.getString('특기');

    if (!data[name]) {
      await interaction.reply({ content: `${name}님에 대한 정보가 없습니다. 먼저 /정보등록 명령어로 등록해주세요.`, ephemeral: true });
      return;
    }

    data[name].unit = unit;
    data[name].specialty = specialty;

    fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2));
    await interaction.reply(`${name}님의 자대와 특기가 성공적으로 등록되었습니다.`);
  }

  else if (commandName === '자대') {
    const name = options.getString('이름');
    if (!data[name]) {
      await interaction.reply({ content: `${name}님에 대한 정보가 없습니다.`, ephemeral: true });
      return;
    }

    const unit = data[name].unit || '등록되지 않음';
    const specialty = data[name].specialty || '등록되지 않음';
    await interaction.reply(`${name}님의 자대: ${unit}, 특기: ${specialty}`);
  }
});

registerCommands().then(() => client.login(config.token));
