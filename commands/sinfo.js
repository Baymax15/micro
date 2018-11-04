const { log } = require('../config/myFun');

module.exports = {
  // command properties
  name: 'sinfo',
  brief: 'Displays server info',
  cooldown: 5,
  guildOnly : true,
  aliases: ['serverinfo'],
  // command function
  async run(msg, args) {
    if (!msg.guild.available) return;
    const serEmbed = { embed: {
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
        { name: 'Created on:', value: msg.guild.createdAt },
        { name: 'You Joined on:', value: msg.member.joinedAt, inline: true },
        { name: 'Total Members:', value: msg.guild.memberCount },
      ],
      timestamp: new Date(),
      footer: {
        text: msg.client.user.tag,
        icon_url: msg.client.user.displayAvatarURL,
      },
    } };
    msg.channel.send(serEmbed).catch(e => log(msg, e));
  },
};