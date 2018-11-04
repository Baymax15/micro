const token = process.env.TOKEN;
const { log } = require('../config/myFun');

module.exports = {
  // command properties
  name: 'restart',
  brief: 'Restarts the bot.',
  argReq: false,
  cooldown: 5,
  modOnly: true,
  description: 'Restarts or kills the bot.',
  usage: '[--KILL]',

  // command function
  async run(msg, args) {
    if (args.length <= 0) args = ['args', 'not', 'provided'];
    if (args[args.length - 1].startsWith('--KILL')) {
      msg.reply('Cyaa!')
        .then(
          async (message) => {
            await msg.delete().catch(e => log(msg, e));
            await message.delete();
          },
        ).then(() => {
          process.exit();
        })
        .catch(e => log(msg, e));
    } else {
      const commandMap = msg.client.commands.clone();
      msg.channel.send('Reboot Initiated.')
        .then(async (message) => {
          commandMap.forEach(cmd => {
            delete require.cache[require.resolve(`./${cmd.name}.js`)];
            msg.client.commands.delete(cmd.name);
            const props = require(`./${cmd.name}.js`);
            msg.client.commands.set(cmd.name, props);
          });
          await message.edit('Commands reloaded!').catch(e => log(msg, e));
          await message.client.destroy();
          await message.client.login(token);
          await message.edit('Rebooted!').catch(e => log(msg, e));
        });
    }
  },
};

/*
exports.run = (client, message, args) => {
  if(!args || args.size < 1) return message.reply("Must provide a command name to reload.");
  const commandName = args[0];
  // Check if the command exists and is valid
  if(!client.commands.has(commandName)) {
    return message.reply("That command does not exist");
  }
  // the path is relative to the *current folder*, so just ./filename.js
  delete require.cache[require.resolve(`./${commandName}.js`)];
  // We also need to delete and reload the command from the client.commands Enmap
  client.commands.delete(commandName);
  const props = require(`./${commandName}.js`);
  client.commands.set(commandName, props);
  message.reply(`The command ${commandName} has been reloaded`);
};
*/