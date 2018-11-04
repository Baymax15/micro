const Discord = require('discord.js');
exports.run = (client, message, args) => {
  const kUser = message.guild.member(message.mentions.users.first());
  const kReason = args.join(' ').slice(22);
  const kickChannel = message.guild.channels.find(channel => channel.name === 'logs' && channel.type === 'text');

  if (!kUser) return message.channel.send('Can\'t find user!');
  if (!message.member.hasPermission('MANAGE_MESSAGES')) return message.channel.send('No can do pal!');
  if (!kickChannel) return message.channel.send('Can\'t find logs channel.');
  if (kUser.hasPermission(4)) return client.channels.get(kickChannel.id).send('That Person can\'t be kicked!');

  const kickEmbed = new Discord.RichEmbed()
    .setDescription('~Kick~')
    .setColor('#e56b00')
    .addField('Kicked User', `${kUser} with ID ${kUser.id}`)
    .addField('Kicked by', `<@${message.author}> with ID ${message.author.id}`)
    .addField('Kicked In', message.channel)
    .addField('Time', message.createdAt)
    .addField('Reason', kReason);


  message.guild.member(kUser).kick(kReason);
  kickChannel.send(kickEmbed);
};

exports.help = {
  name: 'KICK',
};