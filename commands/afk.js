const Enmap = require('enmap');

const { between, log } = require('../config/myFun');

module.exports = {
  // command properties
  name: 'afk',
  brief: 'Set an afk message',
  guildOnly : true,
  description: 'Set an afk message and display it if someone mentions you. run without arguments to disable afk',
  usage: '[message]',
  // command function
  async run(msg, args) {
    const users = new Enmap(msg.client.notesMap.get(msg.guild.id));
    const user = users.get(msg.author.id);
    let reply = 'Something went wrong ;-;';
    try {
      if (!args.length) {
        user.afk = { aMsg: '', aTs: null };
        reply = 'Disabled your afk status.';
      } else if (between(args.join(' ').length, 0, 256)) {
        user.afk = { aMsg: args.join(' '), aTs: Date.now() };
        reply = 'Your afk status has been set!';
      } else {
        reply = 'The status is too long! It should be less than 256 characters.';
      }
      users.set(msg.author.id, user);
      await msg.client.notesMap.set(msg.guild.id, [...users]);
      msg.channel.send(reply, { split: true });
    } catch (error) {
      msg.channel.send('if (err) beep(\'baymax\');', { code: 'js' }).catch(e => log(msg, e));
      console.log(error.stack);
    }
  },
};
