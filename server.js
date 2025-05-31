require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');
const { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus } = require('@discordjs/voice');
const ytdl = require('ytdl-core');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

client.once('ready', () => {
  console.log(`🤖 已登入：${client.user.tag}`);
});

client.on('messageCreate', async message => {
  if (!message.content.startsWith('!play') || message.author.bot) return;

  const args = message.content.split(' ');
  const url = args[1];
  if (!url || !ytdl.validateURL(url)) {
    return message.reply('請提供有效的 YouTube 連結！');
  }

  const voiceChannel = message.member.voice.channel;
  if (!voiceChannel) {
    return message.reply('你需要先加入語音頻道！');
  }

  const connection = joinVoiceChannel({
    channelId: voiceChannel.id,
    guildId: message.guild.id,
    adapterCreator: message.guild.voiceAdapterCreator,
  });

  const stream = ytdl(url, { filter: 'audioonly' });
  const resource = createAudioResource(stream);
  const player = createAudioPlayer();

  player.play(resource);
  connection.subscribe(player);

  message.reply(`🎶 開始播放：${url}`);

  player.on(AudioPlayerStatus.Idle, () => {
    connection.destroy();
  });
});

client.login(process.env.DISCORD_TOKEN);
