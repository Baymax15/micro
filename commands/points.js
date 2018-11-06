const Enmap = require('enmap');

const { between, log } = require('../config/myFun');

module.exports = {
  // command properties
  name: 'point',
  brief: 'spread the love! (or cookies)',
  argReq: false,
  /** 60 * 60 * 24 */
  cooldown: 5,
  guildOnly: true,
  description: 'well, cookies, love points whatever you wanna call it :>',
  usage: '[mention user]',
  aliases: ['cookie', 'love'],
  // command function
  async run(msg, args) {
    const users = new Enmap(msg.client.notesMap.get(msg.guild.id));
    const user = users.get(msg.author.id);
    const cookie = msg.content.indexOf('cookie');
    const love = msg.content.indexOf('love');
    let val = 'cookie';
    if (love > -1 && (love < cookie || cookie === -1)) val = 'love point';

    let reply = `You have ${user.points == 1 ? `${user.points} ${val}` : `${user.points} ${val}s`}`;
    try {
      if (args.length) {
        let tempUser = msg.author;
        if (msg.mentions.members.size) tempUser = msg.mentions.members.first();
        if (msg.guild.members.has(args[0])) tempUser = msg.guild.members.get(args[0]);
        if (!users.has(tempUser.id)) users.set(tempUser.id, { notes: [], tags: [], afk: { aMsg: '', aTs: null }, points: 0 });
        const reciever = users.get(tempUser.id);
        if (tempUser.id !== msg.author.id) {
          reciever.points++;
          users.set(tempUser.id, reciever);
          await msg.client.notesMap.set(msg.guild.id, [...users]);
          reply = `Hey ${tempUser}! You just got a ${val} from ${msg.member.displayName}!`;
        } else {
          reply = `Hey ${msg.member.displayName}! here have a ${val}`;
        }
      }
      msg.channel.send(reply, { split: true }).catch(e => log(msg, e));
    } catch (error) {
      msg.channel.send('if (err) beep(\'baymax\');', { code: 'js' }).catch(e => log(msg, e));
    }
  },
};
