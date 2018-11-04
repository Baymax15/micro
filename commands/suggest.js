const { between, log } = require('../config/myFun');

// Channel to send suggestions
const { suggestions } = require('../config/botconfig.json');

module.exports = {
  // command properties
  name: 'suggest',
  brief: 'suggest a feature or bug report.',
  argReq: true,
  cooldown: 5,
  description: 'suggest a feature! Or file a bug report',
  usage: '<suggestion or report>',
  // command function
  async run(msg, args) {
    const pinmes = args.join(' ');
    let reply = 'What! your suggestion was too long. That\'s sad... Dm baymax please';
    if (between(pinmes.length, 0, 1000)) {
      const PinEmbed = {
        embed: {
          color: 0x22ffaa,
          author: { name: msg.author.username, icon_url: msg.author.displayAvatarURL },
          description: `${pinmes}`,
        },
      };
      await msg.client.channels.get(suggestions)
        .send(PinEmbed).catch((err) => {
          console.log(`Couldn't pin the message '${pinmes}' with id '${msg.id}'\n Error:${err}`);
          reply = 'Something wrong happened.';
        });
      PinEmbed.content = 'Your suggest was sent.';
      reply = PinEmbed;
    }
    msg.channel.send(reply).catch(e => log(msg, e));
  },
};