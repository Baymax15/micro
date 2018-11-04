const { authorId } = require('../config/botconfig.json');
const { log } = require('../config/myFun');

function format(ms) {
  const t = {
    dd : Math.floor(ms / (1000 * 60 * 60 * 24)),
    hh : Math.floor(ms % (1000 * 60 * 60 * 24) / (1000 * 60 * 60)),
    mm : Math.floor(ms % (1000 * 60 * 60) / (1000 * 60)),
    ss : Math.floor(ms % (1000 * 60) / 1000),
  };
  function s(a) { return a > 1 ? 's' : '\u200b';}
  return `${t.dd ? `${t.dd} day${s(t.dd)} ` : ''}${t.hh ? `${t.hh} hour${s(t.hh)} ` : ''}${t.mm ? `${t.mm} minute${s(t.mm)} ` : ''}${t.ss ? `${t.ss} second${s(t.ss)} ` : ''}`;
}
module.exports = {
  // command properties
  name: 'bot',
  brief: 'Info about the bot.',
  cooldown: 5,
  description: 'Displays basic information about micro.',

  // command function
  async run(msg, args) {
    const BotEmbed = { embed: {
      color: 0x22ffaa,
      author: {
        name: msg.author.tag,
        icon_url: msg.author.displayAvatarURL,
      },
      description: '**Bot Info**',
      thumbnail: { url: msg.client.user.displayAvatarURL },
      fields: [{
        name: 'Name',
        value: msg.client.user.username,
        inline: true,
      }, {
        name: 'Developer',
        value: (msg.guild.members.get(authorId).displayName || 'Baymax'),
        inline: true,
      }, {
        name: 'Server count',
        value: msg.client.guilds.size,
        inline: true,
      }, {
        name: 'Uptime',
        value:  format(msg.client.uptime),
        inline: true,
      }],
      timestamp: new Date(),
      footer: {
        text: msg.client.user.username,
        icon_url: msg.client.user.displayAvatarURL,
      },
    } };
    msg.channel.send(BotEmbed).catch(e => log(msg, e));
  },
};
