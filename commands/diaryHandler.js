const fs = require('fs');
const path = require('path');
const dayjs = require('dayjs');

const dataPath = path.join(__dirname, '..', 'data.json');
const diaryDir = path.join(__dirname, '..', 'diaries');
if (!fs.existsSync(diaryDir)) fs.mkdirSync(diaryDir);

function loadData() {
  if (!fs.existsSync(dataPath)) return {};
  return JSON.parse(fs.readFileSync(dataPath, 'utf8'));
}

function loadDiary(name) {
  const file = path.join(diaryDir, `diary_${name}.json`);
  if (!fs.existsSync(file)) return [];
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function saveDiary(name, data) {
  const file = path.join(diaryDir, `diary_${name}.json`);
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

module.exports = async function(interaction) {
  const { commandName, options } = interaction;
  if (!commandName.startsWith('일기')) return;

  const name = options.getString('이름');
  const data = loadData();

  if (!data[name]) {
    return interaction.reply({ content: `${name}님에 대한 정보가 없습니다.`, ephemeral: true });
  }

  const diary = loadDiary(name);

  if (commandName === '일기등록') {
    const title = options.getString('제목');
    const content = options.getString('내용');
    diary.push({ date: dayjs().format('YYYY-MM-DD'), title, content });
    saveDiary(name, diary);
    return interaction.reply(`${name}님의 일기가 등록되었습니다. (총 ${diary.length}개)`);
  }

  if (commandName === '일기') {
    if (diary.length === 0) return interaction.reply(`${name}님의 일기가 없습니다.`);
    const list = diary.map((d, i) => `> ${i + 1}. [${d.date}] ${d.title}`).join('\n');
    return interaction.reply(`${name}님의 일기 목록:\n${list}`);
  }

  if (commandName === '일기열람') {
    const idx = options.getInteger('일기번호') - 1;
    if (idx < 0 || idx >= diary.length) {
      return interaction.reply({ content: '유효하지 않은 번호입니다.', ephemeral: true });
    }
    const entry = diary[idx];
    return interaction.reply(`${name}님의 일기 #${idx + 1}\n> 날짜: ${entry.date}\n> 제목: ${entry.title}\n\n${entry.content}`);
  }

  if (commandName === '일기삭제') {
    const idx = options.getInteger('일기번호') - 1;
    if (idx < 0 || idx >= diary.length) {
      return interaction.reply({ content: '유효하지 않은 번호입니다.', ephemeral: true });
    }
    diary.splice(idx, 1);
    saveDiary(name, diary);
    return interaction.reply(`${name}님의 일기 #${idx + 1}이 삭제되었습니다.`);
  }
}
