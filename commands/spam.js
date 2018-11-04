module.exports = {
  name : 'spam',
  brief : 'Spams',
  argReq: true,
  description : '',
  usage: '<amount> [message]',
  async run(msg, args) {
    const amount = parseInt(args.shift()) + 1;
    if (!args.length) args.push('Have a nice day :3');
    if (isNaN(amount) || amount <= 1 || amount > 1001) return msg.reply('amount should be in between 1 and 1000');
    for(let i=0; i < amount; i++) {
      msg.author.send(args.join()).catch(e => {
        msg.channel.send('Somethin ain\'t right ;-;');
        i = 1000;
      });
    }
  },
};
