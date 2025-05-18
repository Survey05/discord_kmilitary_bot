const { SlashCommandBuilder } = require('discord.js');

module.exports = [
  new SlashCommandBuilder()
    .setName('일기등록')
    .setDescription('일기를 등록합니다.')
    .addStringOption(o => o.setName('이름').setDescription('유저 이름').setRequired(true))
    .addStringOption(o => o.setName('제목').setDescription('일기 제목').setRequired(true))
    .addStringOption(o => o.setName('내용').setDescription('일기 내용을 입력하세요').setRequired(true)),

  new SlashCommandBuilder()
    .setName('일기')
    .setDescription('등록된 유저의 일기 목록을 보여줍니다.')
    .addStringOption(o => o.setName('이름').setDescription('유저 이름').setRequired(true)),

  new SlashCommandBuilder()
    .setName('일기열람')
    .setDescription('특정 일기를 열람합니다.')
    .addStringOption(o => o.setName('이름').setDescription('유저 이름').setRequired(true))
    .addIntegerOption(o => o.setName('일기번호').setDescription('열람할 일기 번호').setRequired(true)),

  new SlashCommandBuilder()
    .setName('일기삭제')
    .setDescription('특정 일기를 삭제합니다.')
    .addStringOption(o => o.setName('이름').setDescription('유저 이름').setRequired(true))
    .addIntegerOption(o => o.setName('일기번호').setDescription('삭제할 일기 번호').setRequired(true)),
];
