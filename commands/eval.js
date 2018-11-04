const Discord = require('discord.js');
const fs = require('fs');
const moment = require('moment');
const superagent = require('superagent');
const Enmap = require('enmap');
const EnmapSql = require('enmap-pgsql');

const { sep, between, clean, randInt, log } = require('../config/myFun');
const botconfig = require('../config/botconfig.json');
const dbconfig = require('../config/dbconfig.json');
const spam = Array(256).fill('Y0U &R3 B31NG $P&MMY');
function format(ms) {
  return {
    dd : Math.floor(ms / (1000 * 60 * 60 * 24)),
    hh : Math.floor(ms % (1000 * 60 * 60 * 24) / (1000 * 60 * 60)),
    mm : Math.floor(ms % (1000 * 60 * 60) / (1000 * 60)),
    ss : Math.floor(ms % (1000 * 60) / 1000),
  };
}

module.exports = {
  // command properties
  name: 'eval',
  cooldown: 2,

  // command function
  async run(msg, args) {
    if (msg.author.id !== botconfig.authorId) return;
    let EvalChannel = msg.channel;
    if (args[args.length - 1] === '--DM') {
      args.pop();
      EvalChannel = msg.author;
    }
    if (args.length <= 0) args = ['false'];
    let ArgsJoined = args.join(' ');
    try {
      let result = eval(ArgsJoined);
      if (!result) result = 'false';
      let tempArgsJoined = ArgsJoined;
      if (ArgsJoined.length > 1023) tempArgsJoined = `${ArgsJoined.slice(0, 100)}...`;
      const TickEmbed = new Discord.RichEmbed()
        .setColor('#22ffaa')
        .setTitle('\u{2699} Eval')
        .addField('Input:', `\`\`\`js\n${tempArgsJoined.replace(/`/g, '`\u200b')}\`\`\``)
        .addField('Output:', `\`\`\`js\n${result.toString().replace(/`/g, '`\u200b')}\`\`\``)
        .addField('Type:', `\`\`\`js\n${typeof result}\`\`\``);
      EvalChannel.send(TickEmbed).catch(console.error);
      if (EvalChannel === msg.author) msg.react('\u{2705}');
    } catch (eror) {
      let count = 0;
      let error = 'empty';
      typeof eror === 'string' ? error = eror : error = eror.stack.toString();
      if (ArgsJoined.length > 1023) ArgsJoined = `${ArgsJoined.slice(0, 100)}...`;
      const ErrArray = sep(error, 1023);
      const TickEmbed = new Discord.RichEmbed()
        .setColor('#22ffaa')
        .setTitle('\u{2699}Eval')
        .addField('Input:', `\`\`\`js\n${ArgsJoined.replace(/`/g, '`\u200b')}\`\`\``);
      ErrArray.forEach((ErrLine) => {
        TickEmbed.addField(`Error${count ? `(${count})` : ''}:`, `\`\`\`js\n${ErrLine.replace(/`/g, '`\u200b')}\`\`\``);
        count++;
      });
      EvalChannel.send(TickEmbed).catch(console.error);
      if (EvalChannel === msg.author) msg.react('\u{2716}');
    }
  },
};