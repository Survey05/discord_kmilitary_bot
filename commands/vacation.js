const { SlashCommandBuilder } = require('discord.js');

module.exports = [
  new SlashCommandBuilder()
    .setName('휴가등록')
    .setDescription('휴가를 등록합니다.')
    .addStringOption(o => o.setName('이름').setDescription('유저 이름').setRequired(true))
    .addStringOption(o => o.setName('휴가시작일').setDescription('YYYY-MM-DD 형식').setRequired(true))
    .addStringOption(o => o.setName('자대복귀일').setDescription('YYYY-MM-DD 형식').setRequired(true)),

  new SlashCommandBuilder()
    .setName('휴가')
    .setDescription('등록된 휴가 정보를 확인합니다.')
    .addStringOption(o => o.setName('이름').setDescription('유저 이름').setRequired(true)),

  new SlashCommandBuilder()
    .setName('휴가삭제')
    .setDescription('등록된 휴가 정보를 삭제합니다.')
    .addStringOption(o => o.setName('이름').setDescription('유저 이름').setRequired(true)),
];
