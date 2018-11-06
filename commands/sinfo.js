const { log } = require('../config/myFun');

module.exports = {
  // command properties
  name: 'sinfo',
  brief: 'Displays server info',
  cooldown: 5,
  guildOnly: true,
  aliases: ['serverinfo'],
  // command function
  async run(msg, args) {
    if (!msg.guild.available) return;
    let botCount = 0, humanCount = 0;
    msg.guild.members.forEach(member => {
      if (member.user.bot) botCount++;
      else humanCount++;
    });

    let voice = 0, category = 0, text = 0;
    msg.guild.channels.forEach(channel => {
      switch (channel.type) {
      case 'text': text++; break;
      case 'voice': voice++; break;
      case 'category': category++; break;
      default: break;
      }
    });
    const serEmbed = {
      embed: {
        color: 0x22ffaa,
        author: {
          name: `Requested by ${msg.author.username}`,
          icon_url: msg.author.displayAvatarURL,
        },
        description: '**Server Info**',
        thumbnail: { url: msg.guild.iconURL },
        fields: [
          { name: 'Server Name:', value: msg.guild.name },
          { name: 'Owner:', value: `${msg.guild.owner}`, inline: true },
          { name: 'Created on:', value: msg.guild.createdAt, inline: true },
          { name: 'You Joined on:', value: msg.member.joinedAt, inline: true },
          { name: `${text + voice} channels`, value: `category: ${category}\ntext: ${text}\nvoice: ${voice}`, inline: true },
          { name: 'Total Members:', value: msg.guild.memberCount },
        ],
        timestamp: new Date(),
        footer: {
          text: msg.client.user.tag,
          icon_url: msg.client.user.displayAvatarURL,
        },
      },
    };
    if (humanCount + botCount === msg.guild.memberCount) {
      serEmbed.embed.fields.push(
        { name: 'Humans:', value: humanCount },
        { name: 'Bots:', value: botCount }
      );
    }
    msg.channel.send(serEmbed).catch(e => log(msg, e));
  },
};