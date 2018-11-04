const { log } = require('../config/myFun');

module.exports = {
  name : 'purge',
  brief : 'Purge messages.',
  argReq: true,
  guildOnly : true,
  modOnly: true,
  description : 'Bulk-deletes specified amount of messages [1 <= amount < 99]',
  usage: '<amount>',
  async run(msg, args) {
    const amount = parseInt(args[0]) + 1;
    if (isNaN(amount) || amount <= 1 || amount > 100) return msg.reply('amount should be in between 1 and 99');
    msg.channel.bulkDelete(amount, true).catch(err => {
      console.error(err);
      msg.channel.send('there was an error trying to prune messages in this channel!').catch(e => log(msg, e));
    });
  },
};
