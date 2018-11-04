const { authorId, errorLogs } = require('../config/botconfig.json');
const { log } = require('../config/myFun');

module.exports = {
  // command properties
  name: 'say',
  brief: 'Repeats what you say.',
  argReq: true,
  cooldown: 5,
  description: 'Makes the bot repeat what you say.',
  usage: '<text>',

  // command function
  async run(msg, args) {
    const words = args.join(' ');
    let reply = 'something wrong happened.';
    if (msg.author.id === authorId
      || (msg.member && msg.member.roles.some(role => ['Alpha', 'Veteran Tester'].includes(role.name)))
      || msg.author.id === msg.guild.ownerID) reply = words;
    else reply = `${msg.author.username} said ${words}`;
    msg.delete().catch(e => log(msg, e));
    msg.channel.send(reply).catch(e => log(msg, e));
  },
};
