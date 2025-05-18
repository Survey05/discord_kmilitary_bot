const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, '..', 'vacation.json');

function loadVacationData() {
  if (!fs.existsSync(dataPath)) return {};
  return JSON.parse(fs.readFileSync(dataPath, 'utf8'));
}

function saveVacationData(data) {
  fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
}

module.exports = async function(interaction) {
  const { commandName, options } = interaction;
  if (!['휴가등록', '휴가', '휴가삭제'].includes(commandName)) return;

  const vacationData = loadVacationData();

  if (commandName === '휴가등록') {
    const name = options.getString('이름');
    const startDate = options.getString('휴가시작일');
    const returnDate = options.getString('자대복귀일');

    if (!name || !startDate || !returnDate) {
      return interaction.reply({ content: '모든 정보를 정확히 입력해주세요.', ephemeral: true });
    }

    vacationData[name] = {
      startDate,
      returnDate,
    };

    saveVacationData(vacationData);

    return interaction.reply(`${name}님의 휴가가 등록되었습니다.\n휴가기간: \`${startDate} ~ ${returnDate}\``);
  }

  if (commandName === '휴가') {
    const name = options.getString('이름');

    if (!vacationData[name]) {
      return interaction.reply({ content: `${name}님의 휴가 정보가 없습니다.`, ephemeral: true });
    }

    const { startDate, returnDate } = vacationData[name];
    return interaction.reply(`${name}님의 휴가 기간은 \`${startDate} ~ ${returnDate}\` 입니다.`);
  }

  if (commandName === '휴가삭제') {
    const name = options.getString('이름');

    if (!vacationData[name]) {
      return interaction.reply({ content: `${name}님의 휴가 정보가 없습니다.`, ephemeral: true });
    }

    delete vacationData[name];
    saveVacationData(vacationData);

    return interaction.reply(`${name}님의 휴가 정보가 삭제되었습니다.`);
  }
}
