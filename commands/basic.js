const { SlashCommandBuilder } = require('discord.js');

module.exports = [
  new SlashCommandBuilder()
    .setName('정보등록')
    .setDescription('전역일 계산을 위한 정보를 등록합니다.')
    .addStringOption(o => o.setName('이름').setDescription('유저 이름').setRequired(true))
    .addStringOption(o => o.setName('군종').setDescription('육군/공군/해군 중 하나').setRequired(true))
    .addStringOption(o => o.setName('입대날짜').setDescription('YYYY-MM-DD 형식').setRequired(true)),

  new SlashCommandBuilder()
    .setName('전역일')
    .setDescription('등록된 유저의 전역일을 조회합니다.')
    .addStringOption(o => o.setName('이름').setDescription('유저 이름').setRequired(true)),

  new SlashCommandBuilder()
    .setName('리스트')
    .setDescription('등록된 모든 유저의 이름을 보여줍니다.'),

  new SlashCommandBuilder()
    .setName('자대등록')
    .setDescription('자대 및 특기를 등록합니다.')
    .addStringOption(o => o.setName('이름').setDescription('유저 이름').setRequired(true))
    .addStringOption(o => o.setName('자대').setDescription('자대 정보를 입력해주세요.').setRequired(true))
    .addStringOption(o => o.setName('특기').setDescription('특기를 입력해주세요.').setRequired(true)),

  new SlashCommandBuilder()
    .setName('자대')
    .setDescription('등록된 유저의 자대 및 특기를 조회합니다.')
    .addStringOption(o => o.setName('이름').setDescription('유저 이름').setRequired(true)),

  new SlashCommandBuilder()
    .setName('입대일')
    .setDescription('등록된 유저의 입대일을 조회합니다.')
    .addStringOption(option =>
      option.setName('이름').setDescription('유저 이름').setRequired(true)),

];
