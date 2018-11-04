const { randInt, log } = require('../config/myFun.js');
module.exports = {
  // command properties
  name: 'hello',
  brief: 'A warm greeting',
  cooldown: 5,
  aliases: ['hi', 'heyo'],
  // command function
  async run(msg, args) {
    const greets = ['Hi', 'Hello', 'Heyo', 'Hii'];
    const greet = greets[randInt(0, greets.length - 1)];
    let reply = `${greet} ${msg.member ? msg.member.displayName : msg.author.username}!`;
    if(msg.member !== null
      && (msg.member.roles.some(role => role.name === 'Fam')
      || msg.member.roles.some(role => role.name === 'Veteran Tester'))) reply += ' \u{2764}';
    msg.channel.send(reply).catch(e => log(msg, e));
  },
};