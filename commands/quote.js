const { quoteSource } = require('../config/quoteSource.json');
const { log } = require('../config/myFun');

module.exports = {
  // command properties
  name: 'quote',
  brief: 'Random quote.',
  cooldown: 5,
  description: 'Gets a random quote from predefined list.',

  // command function
  async run(msg, args) {
    const RandQuote = Math.floor(Math.random() * quoteSource.length);
    const quot = quoteSource[RandQuote].quote;
    const nam = quoteSource[RandQuote].name;

    const QuoteEmbed = { embed: {
      title:'Quote',
      color:0x22ffaa,
      fields: [{ name:`*${quot}*`, value: `${nam}` }],
    } };
    return msg.channel.send(QuoteEmbed).catch(e => log(msg, e));
  },
};
