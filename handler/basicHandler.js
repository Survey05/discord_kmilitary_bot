const fs = require('fs');
const path = require('path');
const dayjs = require('dayjs');

const dataPath = path.join(__dirname, '..', 'data', 'data.json');
const servicePeriods = { 육군: 18, 해군: 20, 공군: 21 };

function loadData() {
  if (!fs.existsSync(dataPath)) return {};
  return JSON.parse(fs.readFileSync(dataPath, 'utf8'));
}

function saveData(data) {
  fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
}

module.exports = async function(interaction) {
  const { commandName, options } = interaction;
if (!['정보등록', '전역일', '리스트', '자대등록', '자대', '입대일'].includes(commandName)) return;
  const data = loadData();

  if (commandName === '정보등록') {
    const name = options.getString('이름');
    const branch = options.getString('군종');
    const dateStr = options.getString('입대날짜');

    if (!servicePeriods[branch]) {
      return interaction.reply({ content: '군종은 "육군", "공군", "해군" 중 하나여야 합니다.', ephemeral: true });
    }

    const enlistDate = dayjs(dateStr);
    const dischargeDate = enlistDate.add(servicePeriods[branch], 'month').subtract(1, 'day');

    data[name] = {
      ...data[name],
      branch,
      enlistDate: enlistDate.format('YYYY-MM-DD'),
      dischargeDate: dischargeDate.format('YYYY-MM-DD'),
    };

    saveData(data);
    await interaction.reply(`${name}님의 전역일은 ${dischargeDate.format('YYYY-MM-DD')} 입니다.`);
  }

  if (commandName === '전역일') {
    const name = options.getString('이름');
    if (!data[name]) {
      return interaction.reply({ content: `${name}님에 대한 정보가 없습니다.`, ephemeral: true });
    }
    await interaction.reply(`${name}님의 전역일은 \`${data[name].dischargeDate}\` 입니다.`);
  }

  if (commandName === '리스트') {
    const list = Object.entries(data)
      .filter(([_, info]) => info.dischargeDate)
      .sort((a, b) => new Date(a[1].dischargeDate) - new Date(b[1].dischargeDate))
      .map(([name, info], i) => `${i + 1}. \`${name}\` - 전역일: \`${info.dischargeDate}\``);

    return interaction.reply(list.length
      ? `📋 전역일 순으로 정렬된 사용자 목록:\n${list.join('\n')}`
      : '등록된 사용자가 없습니다.');
  }



  if (commandName === '자대등록') {
    const name = options.getString('이름');
    const unit = options.getString('자대');
    const specialty = options.getString('특기');

    if (!data[name]) {
      return interaction.reply({ content: `${name}님에 대한 정보가 없습니다.`, ephemeral: true });
    }

    data[name].unit = unit;
    data[name].specialty = specialty;

    saveData(data);
    return interaction.reply(`${name}님의 자대와 특기가 등록되었습니다.`);
  }

  if (commandName === '자대') {
    const name = options.getString('이름');
    if (!data[name]) {
      return interaction.reply({ content: `${name}님에 대한 정보가 없습니다.`, ephemeral: true });
    }

    const unit = data[name].unit || '등록되지 않음';
    const specialty = data[name].specialty || '등록되지 않음';

    return interaction.reply(`${name}님의\n> 📍 자대: ${unit}\n> 🛠️ 특기: ${specialty}`);
  }

  if (commandName === '입대일') {
    const name = options.getString('이름');
    console.log('입대일 명령어 실행:', name);
    console.log('저장된 데이터:', data[name]);

    if (!data[name]) {
      return interaction.reply({ content: `${name}님에 대한 정보가 없습니다.`, ephemeral: true });
    }
    return interaction.reply(`${name}님의 입대일은 \`${data[name].enlistDate}\` 입니다.`);
  }
}
