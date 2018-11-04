const superagent = require('superagent');
const { log } = require('../config/myFun');
const { homeGuild } = require('../config/botconfig.json');

module.exports = {
  // command properties
  name: 'playerlist',
  brief: 'gets playerlist from sft-pe.',
  cooldown: 30,
  argReq: false,
  guildOnly: true,
  modOnly: true,
  description: 'Fetches the list of players in-game at the moment.\nIf provided arguments, gets player status',
  usage: '[playerIGN]',
  aliases: ['status'],
  // command function
  async run(msg, args) {
    {
      if (msg.guild.id !== homeGuild) return msg.reply('That feature is disabled here.');
      const { body: { players } } = await superagent.get('https://api.mcsrvstat.us/1/pe.sftmc.org:19132');
      let PlayerName = '';
      players.list ? players.list.forEach(player => PlayerName += `${player}\t`) : PlayerName = 'No Players Online.';
      let SFTEmbed = {
        embed: {
          author: { name: msg.author.username, icon_url: msg.author.displayAvatarURL },
          color: 0x51fd75,
          thumbnail: { url: 'https://www.superfuntime.org/logoforum.png' },
          description: '**SFT PE Server Info**',
          fields: [{ name: 'Players Online:', value: `${PlayerName}` }],
          timestamp: new Date(),
          footer: { text: msg.client.user.tag, icon_url: msg.client.user.displayAvatarURL },
        } };
      if (players.list) {
        const blankField = { name: '\u200b', value: '\u200b', inline: true };
        SFTEmbed.embed.fields.push(blankField, blankField);
      }
      // If you provide args, it fetches data about the arg (in game name)
      if (args[0]) {
        const { body: { data } } = await superagent.get(`https://minecraft-statistic.net/api/player/info/${args[0]}/97743`);
        SFTEmbed = {
          embed: {
            author: { name: msg.author.username, icon_url: msg.author.displayAvatarURL },
            color: 0x51fd75,
            thumbnail: { url: 'https://www.superfuntime.org/logoforum.png' },
            description: '**SFT PE Player Info**',
            fields: [
              { name: 'Name:', value: data.name },
              { name: 'Online:', value: `${data.online ? 'True' : 'False'}` },
              { name: 'Total time:', value: data.total_time_play.toString() },
              { name: '\u200b', value: 'Note: The accuracy of data isn\'t guaranteed.' },
            ],
            timestamp: new Date(),
            footer: { text: msg.client.user.tag, icon_url: msg.client.user.displayAvatarURL },
          } };
      }
      msg.channel.send(SFTEmbed).catch(e => log(msg, e));
    }
  },
};