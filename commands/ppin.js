const { between, log } = require('../config/myFun');

module.exports = {
  // command properties
  name: 'ppin',
  brief: 'pins a message.',
  argReq: true,
  cooldown: 5,
  guildOnly : true,
  description: `puts a message in {pinChannel}.\n
  Note: I can't delete a pin yet! Don't tell me I didn't warn ya!
  Pss: if you want to delete, then ask {owner}.`,
  usage: '<pin_message>',
  // command function
  async run(msg, args) {
    const pinmes = args.join(' ');
    let reply = 'Cannot quote that msg!';
    if (between(pinmes.length, 0, 2048)) {
      const PinEmbed = { embed: {
        color: 0x22ffaa,
        author: { name: msg.author.username, icon_url: msg.author.displayAvatarURL },
        description: `\t${pinmes}`,
      } };
      reply = 'Yay! I Pinned the message.';
      await msg.guild.channels.get(msg.client.config.get(msg.guild.id).pinChannel)
        .send(PinEmbed).catch((err) => {
          console.log(`Couldn't pin the message '${pinmes}' with id '${msg.id}'\n Error:${err}`);
          reply = 'Something wrong happened.';
        });
    }
    msg.channel.send(reply).catch(e => log(msg, e));
  },
};
// fetchmessage by id, then remove but not now.