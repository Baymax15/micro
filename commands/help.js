const { log } = require('../config/myFun');

module.exports = {
  // command properties
  name: 'help',
  brief: 'List of all commands.',
  cooldown: 5,
  description: 'List of all commands and advanced help if arguments are provided.',
  usage: '[commandName]',
  // command function
  async run(msg, args) {
    const prefix = msg.client.config.get(msg.guild.id).prefix;
    const { commands } = msg.client;

    const helpEmbed = { embed : {
      color: 0x22ffaa,
      author: { name: `Requested by : ${msg.author.username}`, icon_url: msg.author.displayAvatarURL },
      timestamp: new Date(),
      fields: [{ name:'**Basic Help**', value: `The Prefix is ${prefix}` }],
      footer: { text: msg.client.user.tag, icon_url: msg.client.user.displayAvatarURL },
    } };
    let command = false;
    if(args.length) {
      command = commands.get(args[0].toLowerCase())
      || commands.find(cmd => cmd.aliases && cmd.aliases.includes(args[0].toLowerCase()));
    }
    if (!command) {
      commands.map(cmd => {
        if (cmd.brief) helpEmbed.embed.fields.push({ name: cmd.name, value: cmd.brief });
      });
      return msg.channel.send(helpEmbed).catch(e => log(msg, e));
    }
    helpEmbed.embed.fields.splice(0, 1, { name:'**Advanced Help**', value: '\u200b' });
    helpEmbed.embed.fields.push({ name: 'Name:', value: command.name, inline: true });
    if (command.aliases) helpEmbed.embed.fields.push({ name: 'Aliases:', value: command.aliases.join(', '), inline: true });
    if (command.description && typeof command.description === 'string') helpEmbed.embed.fields.push({ name: 'Description:', value: command.description });
    if (command.usage) helpEmbed.embed.fields.push({ name: 'Usage:', value: `${prefix}${command.name} ${command.usage}` });
    helpEmbed.embed.fields.push({ name: 'Countdown:', value: `${command.cooldown || 5} second(s)` });
    msg.channel.send(helpEmbed).catch(e => log(msg, e));
    if(typeof command.description === 'object') {
      const description = JSON.parse(JSON.stringify(command.description).replace(/{p}/g, prefix));
      msg.channel.send(description).catch(e => log(msg, e));
    }
  },
};