const Discord = require('discord.js');
const Message = Discord.Message;

const { errorLogs } = require('../config/botconfig.json');

/**
 * Checks if a value is strictly between two numbers
 *
 * @param   {number} value value to be checked
 * @param   {number} minLimit The lower limit
 * @param   {number} maxLimit The upper limit
 * @returns {Boolean} True if minLimit < value < maxLimit, false otherwise
 */
function between(value, minLimit, maxLimit) {
  if (value > minLimit && value < maxLimit) return true;
  return false;
}

/**
 * Logs errors to a channel
 *
 * @param   {Message} message The lower limit
 * @param   {Error} err The lower limit
 * @returns {true}
 */
function log(msg, e) {
  const result = `${msg.channel}:${msg.member.displayName}(${msg.author.id}) - ${e.message}`;
  msg.client.channels.get(errorLogs).send(result, { code: '' }).catch(console.error);
  return true;
}
/**
 * gets a value between two numbers (inclusive)
 *
 * @param   {number} minLimit The lower limit
 * @param   {number} maxLimit The upper limit
 * @returns {number}
 */
function randInt(minLimit, maxLimit) {
  minLimit = Math.ceil(minLimit);
  maxLimit = Math.floor(maxLimit);
  return Math.floor(Math.random() * maxLimit - minLimit + 1) + minLimit;
}
/**
 * Seperates a string into parts of max-length limit
 *
 * @param   {string} text The text to seperate into parts
 * @param   {number} limit The maximum length of part
 * @returns {Array} An array with elements of max length limit
 */
function sep(text, limit) {
  const textArray = [];
  while (text.length > limit) {
    const validText = text.slice(0, limit);
    const validEnd = validText.lastIndexOf('\n');
    if (between(validEnd, 0, limit)) {
      textArray.push(text.slice(0, validEnd));
      text = text.slice(validEnd + 1);
    } else {
      textArray.push(validText);
      text = text.slice(limit);
    }
  }
  textArray.push(text.toString());
  return textArray;
}
/**
 * Cleans a string (roles, mentions and @e and @h ).
 * Should provide a message to get channel, client and guild objects from.
 *
 * @param   {Message} msg The message to get channel, client and guild objects from.
 * @param   {string} text String to clean.
 * @returns {string} String cleaned of mentions.
 */
function clean(msg, text) {
  if (!(msg instanceof Message)) return text;
  return text
    .replace(/@(everyone|here)/g, '@\u200b$1')
    .replace(/<@!?[0-9]+>/g, input => {
      const id = input.replace(/<|!|>|@/g, '');
      if (msg.channel.type === 'dm' || msg.channel.type === 'group') return input;
      const member = msg.channel.guild.members.get(id);
      if (member) {
        if (member.nickname) return `@${member.nickname}`;
        return `@${member.displayName}`;
      } else {
        const user = msg.client.users.get(id);
        if (user) return `@${user.username}`;
        return input;
      }
    })
    .replace(/<@&[0-9]+>/g, input => {
      if (msg.channel.type === 'dm' || msg.channel.type === 'group') return input;
      const role = msg.guild.roles.get(input.replace(/<|@|>|&/g, ''));
      if (role) return `@${role.name}`;
      return input;
    });
}
module.exports = {
  between: between,
  clean: clean,
  randInt: randInt,
  sep: sep,
  log: log,
};