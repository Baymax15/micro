/*
Things to remember:
~~~~~~~~~~~~~~~~~~~~~~~
:: Every command should be made in caps (eg: PING) to make bot respond to +ping and +Ping etc..
:: To emit an event, use
  client.emit("EVENT", "REQUIRED_ARGS");
*/

// requires
const Discord = require('discord.js');
const fs = require('fs');
const moment = require('moment');
const Enmap = require('enmap');
const EnmapSql = require('enmap-pgsql');

const { authorId } = require('./config/botconfig.json');
const { log } = require('./config/myFun');
const token = process.env.TOKEN;

const client = new Discord.Client();
client.commands = new Discord.Collection();
const cooldowns = new Discord.Collection();
client.config = new Enmap({ provider: new EnmapSql({ name: require('./config/dbconfig.json').name, connectionString: process.env.DATABASE_URL }) });
client.notesMap = new Enmap({ provider: new EnmapSql({ name: require('./config/dbnotes.json').name, connectionString: process.env.DATABASE_URL }) });


/*    ~~~~~~~~~~~~~~~ **COMMAND HANDLER** ~~~~~~~~~~~~~~~ */
fs.readdir('./commands/', (err, files) => {
  if (err) console.log(err);
  // Filters files to get files having .js
  const cmdList = files.filter(selected => selected.endsWith('.js'));
  if (cmdList.length <= 0) {
    console.log('File error detected');
    return;
  }
  // Loads and logs all command files
  cmdList.forEach((file) => {
    const cmd = require(`./commands/${file}`);
    client.commands.set(cmd.name, cmd);
  });
  console.log(`Commands loaded: ${client.commands.map(cmd => cmd.name).join(', ')}`);
});
/*    ~~~~~~~~~~~~ **end of  COMMAND HANDLER** ~~~~~~~~~~~~ */


client.on('ready', () => {
  console.log(`Logged in as ${client.user.username}`);
});


client.on('message', async (msg) => {
  // If it's a dm not from author, return (temporarily required)
  if ((msg.channel.type !== 'text' && msg.author.id !== authorId) || msg.author.bot) return;
  let prefix = '!';

  if (!client.notesMap.has(msg.guild.id)) await client.notesMap.set(msg.guild.id, [[msg.author.id, { notes: [], tags: [], afk:{ aMsg: '', aTs: null }, points: 0 }]]);
  const users = new Enmap(client.notesMap.get(msg.guild.id));
  if (!users.has(msg.author.id)) {
    users.set(msg.author.id, { notes: [], tags: [], afk: { aMsg: '', aTs: null }, points:0 });
    await client.notesMap.set(msg.guild.id, [...users]);
  }

  // Getting guild prefix (The if is only for my dm)
  if (msg.channel.type === 'text') {
    prefix = client.config.get(msg.guild.id).prefix;
    const botChannel = client.config.get(msg.guild.id).botChannel;

    // Afk message setup
    if (msg.mentions.members.size) {
      msg.mentions.members.forEach(async (afkUser) => {
        if (!users.has(afkUser.id)) users.set(afkUser.id, { notes: [], tags: [], afk: { aMsg: '', aTs: null }, points: 0 });
        await client.notesMap.set(msg.guild.id, [...users]);

        let reply = true;
        if (!users.get(afkUser.id).afk.aMsg.length) reply = false;
        const afkTime = moment(users.get(afkUser.id).afk.aTs);
        const afkMessage = { embed: {
          color: 0x22ffaa,
          author: { name: `${afkUser.displayName} ( ${afkUser.user.tag} )`, icon_url: afkUser.displayAvatarURL },
          fields: [
            { name: users.get(afkUser.id).afk.aMsg, value: '\u200b' },
            { name:'Timestamp:', value: `${afkTime.fromNow()}\t(${afkTime.format('Do MMM YYYY, h:m a Z')})` }],
          timestamp: new Date(),
          footer: { text: client.user.tag, icon_url: client.user.displayAvatarURL },
        } };
        if(reply) msg.channel.send(afkMessage).catch(e => log(msg, e));
      });
    }
    const tempRegex = new RegExp(`^(<@!?${client.user.id}>|\\${prefix})\\s*`);
    if (!tempRegex.test(msg.content)) return;

    if (msg.channel.id !== botChannel && ![authorId, msg.guild.ownerID].includes(msg.author.id)) {
      return msg.channel.send(`We should move to <#${botChannel}>`).catch(e => log(msg, e));
    }
  }
  const prefixRegex = new RegExp(`^(<@!?${client.user.id}>|\\${prefix})\\s*`);
  if (!prefixRegex.test(msg.content)) return;

  // array of message including the command
  const [, matchedPrefix] = msg.content.match(prefixRegex);
  const MessArgs = msg.content.slice(matchedPrefix.length).trim().split(/ +/g);

  // the command in lowercase saved to MessCmd and the removed from args
  const MessCmd = MessArgs.shift().toLowerCase();

  if (MessCmd === 'ping') {
    const tempPing = await msg.channel.send(`${msg.author}`).catch(e => log(msg, e));
    tempPing.edit('Oh you meant this..', { embed: {
      color: 0x22ffaa,
      fields: [
        { name: 'Latency', value: `${tempPing.createdTimestamp - msg.createdTimestamp} ms.`, inline: true },
        { name: 'Api Latency', value: `${Math.round(client.ping)} ms.`, inline: true },
      ],
    } });
  }
  const CommandFile = client.commands.get(MessCmd) || client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(MessCmd));
  if (!CommandFile) return;

  // checking if command (CommandFile) is guildOnly, requires args, etc...
  if (CommandFile.guildOnly && msg.channel.type !== 'text') return msg.reply('this command doesn\'t run on DMs!');
  if (CommandFile.argReq && !MessArgs.length) return msg.reply('you didn\'t supply the nessesary arguments!');
  if (CommandFile.guildOnly && CommandFile.modOnly && !(msg.member.roles.some(r=> client.config.get(msg.guild.id).adminId.includes(r.id)) || msg.author.id === authorId)) return;

  if (!cooldowns.has(CommandFile.name)) {
    cooldowns.set(CommandFile.name, new Discord.Collection());
  }
  /** Cooldown timer Starting */
  const now = Date.now();
  const timestamps = cooldowns.get(CommandFile.name);
  const cooldownAmount = (CommandFile.cooldown || 5) * 1000;

  if (!timestamps.has(msg.author.id)) {
    timestamps.set(msg.author.id, now);
    setTimeout(() => timestamps.delete(msg.author.id), cooldownAmount);
  } else {
    const expirationTime = timestamps.get(msg.author.id) + cooldownAmount;

    if (now < expirationTime) {
      const timeLeft = (expirationTime - now) / 1000;
      return msg.reply(`please wait ${timeLeft.toFixed(1)} more second(s) before reusing the \`${CommandFile.name}\` command.`);
    }
    timestamps.set(msg.author.id, now);
    setTimeout(() => timestamps.delete(msg.author.id), cooldownAmount);
  }
  /** Cooldown timer ends. */
  try {
    CommandFile.run(msg, MessArgs);
  } catch(error) {
    console.log(error);
    msg.channel.send('An error has occured.');
  }
  // This runs the command from the command collection
});


/** Guild Member count update events */
client.on('guildMemberAdd', (member) => {
  const WelcomeChannel = client.config.get(member.guild.id).welcomeChannel;
  client.guilds.get(member.guild.id).channels.get(WelcomeChannel).send(`Welcome ${member.displayName} to ${member.guild}`).catch(console.error);
});
client.on('guildMemberRemove', (member) => {
  const WelcomeChannel = client.config.get(member.guild.id).welcomeChannel;
  client.guilds.get(member.guild.id).channels.get(WelcomeChannel).send(`Sadly, ${member.user.username} has left us`).catch(console.error);
});
/** Guild Member count update events */

client.login(token);

// Logs errors and prevents bot crash on error
client.on('error', (error) => {
  const excludedErrors = [
    'read ECONNRESET',
    'read ECONNABORTED',
    'getaddrinfo ENOTFOUND gateway.discord.gg gateway.discord.gg:443',
  ];
  if (excludedErrors.includes(error.message)) return;
  console.log(error);
});
