const Discord = require('discord.js');
const moment = require('moment');
const Enmap = require('enmap');
const EnmapSql = require('enmap-pgsql');
const request = require('request');

const { sep, log } = require('../config/myFun');

const tickets = new Enmap({ provider: new EnmapSql({ name: require('../config/dbtickets.json').name, connectionString: process.env.DATABASE_URL }) });

module.exports = {
  name: 'ticket',
  brief: 'Used to create support channel. Only one active support channel per user.',
  cooldown: 5,
  guildOnly: true,
  description:
  {
    embed: {
      color: 0x22ffaa,
      description: `**description**\n__**default syntax**__\`\`\`{p}ticket <issue> \`\`\`
  • you can only have one active ticket channel so revoke your ticket if the issue is solved.
**NOTE:** abuse of tickets isn't tolerated.\n
__**commands inside the ticket-channel:**__`,
      fields: [{
        name: '*__revoke__* :',
        value: `\`\`\`{p}ticket <comment on our service> --REVOKE\`\`\`  • this revokes your access to the channel.
  • Sends a transcript to all participants (may take a moment to finish the process)
  • The channel is set to \`inactive\` and will be deleted by an administrator after inspection
*note: case sensitive*`,
      }, {
        name: '*__delete__* :',
        value: `\`\`\`{p}ticket --DELETE\`\`\`  • this deletes the channel.
  • The channel is removed from the storage
*note: case sensitive*
*extra note: can only delete the channel if you have admin permissions and the channel is inactive (ie: after revoked)*`,
      }, {
        name: '*__redelete__* :',
        value: `\`\`\`{p}ticket --REDELETE\`\`\`  • this deletes the channel.
  • The channel is removed from the storage
*note: case sensitive*
*extra note: can only delete the channel if you have admin permissions and the channel is active (ie: not revoked)*`,
      }],
      timestamp: new Date(),
    },
  },
  usage: '[issue] [ --REVOKE | --DELETE | --REDELETE ]',
  async run(msg, args) {
    const prefix = msg.client.config.get(msg.guild.id).prefix;
    const ttime = moment(Date.now()).format('YYYYMMDDhhmmss');

    const ChannelName = `${msg.author.username}-${ttime}`;
    const category = msg.guild.channels.find(cat => cat.name === 'tickets' && cat.type === 'category');

    if (!category) return msg.reply('The \'tickets\' category isn\'t set up!');

    // Returns a message if an issue is not provided.
    if (!args.length) return msg.reply('You didn\'t add an issue. Please provide an issue and try again.');
    let ArgsJoined = args.join(' ');
    if (!['--REVOKE', '--DELETE', '--REDELETE'].includes(args[args.length - 1])) {
      /* ~~~~~~~~~~~ START of Default function of ticket ~~~~~~~~~~~ */
      const TickEmbed = new Discord.RichEmbed()
        .setAuthor(msg.author.username, msg.author.displayAvatarURL)
        .setColor('#22ffaa')
        .addField('Issue:', ArgsJoined.slice(0, 1000), true)
        .addField('Channel:', `${msg.channel}`, true)
        .addField('\u200b', `If the issue is resolved,
please do \`${prefix}ticket [your comment on our service] --REVOKE\` here.`)
        .setTimestamp()
        .setFooter(msg.client.user.tag, msg.client.user.displayAvatarURL);

      if (msg.channel.parent === category) {
        await msg.author.send('Sorry, you cannot create a support channel while inside one.')
          .catch(() => msg.reply('Please allow DM\'s from this server to proceed.'));
        await msg.delete().catch(e => log(msg, e));
        return;
      }

      for (const sChannel in tickets) {
        if (tickets.get(sChannel) && tickets.get(sChannel).userId === msg.author.id && !tickets.get(sChannel).status) {
          msg.author.send('Sorry, you already have a support channel.')
            .catch(() => msg.reply('Please allow DM\'s from this server to proceed.'));
          msg.delete().catch(e => log(msg, e));
          return;
        }
      }

      msg.guild.createChannel(ChannelName, 'text', [{
        id: msg.guild.id,
        deny: Discord.Permissions.ALL,
      },
      {
        id: msg.client.user.id,
        allow: Discord.Permissions.ALL,
      },
      {
        id: msg.author.id,
        allow: ['SEND_MESSAGES', 'ADD_REACTIONS', 'ATTACH_FILES', 'VIEW_CHANNEL', 'READ_MESSAGE_HISTORY'],
      },
      {
        id: msg.client.config.get(msg.guild.id).adminId,
        allow: ['SEND_MESSAGES', 'MANAGE_MESSAGES', 'VIEW_CHANNEL', 'READ_MESSAGE_HISTORY', 'MANAGE_CHANNELS'],
      }])
        .then(async (channel) => {
          channel.setParent(category);
          channel.send(`${msg.author}\nIssue : ${msg.cleanContent.split(/ +/g).slice(1).join(' ')}`, TickEmbed).catch(e => log(msg, e));
          if (msg.attachments.size) {
            for (const attach of msg.attachments.values()) {
              url = attach.url
              request({ url, encoding: null }, async function(err, resp, data) {
                const base64data = Buffer.from(data);
                channel.send({ files: [new Discord.Attachment(base64data, `${attach.filename}`)] }).catch(e => log(msg, e));
              });
            }
            await setTimeout(() => msg ? msg.delete().catch(e => log(msg, e)) : false, 8000);
          }
          tickets.set(channel.id, { 'userId': msg.author.id, 'status': false });
        });
      setTimeout(() => msg ? msg.delete().catch(e => log(msg, e)) : false, 900);
      /* ~~~~~~~~~~~ END of Default function of ticket command ~~~~~~~~~~~ */
    } else {
      if (msg.channel.parent !== category) return;
      if (!tickets.has(msg.channel.id)) {
        msg.channel.send(
          `:confused: This channel shouldn't exist as per my records.
Please delete this channel. If the issue isn't resolved, please make a new ticket. Thank you!`,
        ).catch(e => log(msg, e));
        return;
      }
      const TickAuthor = tickets.get(msg.channel.id).userId;
      /* ~~~~~~ REVOKE ~~~~~~ */
      if (args[args.length - 1] === '--REVOKE'
        && msg.author.id === TickAuthor
        && !tickets.get(msg.channel.id).status) {
        args.pop();
        if (!args.length) args = ['No', 'comment', 'provided'];
        ArgsJoined = args.join(' ');

        const RevokeEmbed = {
          embed: {
            author: { name: msg.author.username, icon_url: msg.author.displayAvatarURL },
            color: 0x22ffaa,
            fields: [
              { name: 'Status', value: 'Issue Has Been Resolved.' },
              { name: 'Comments', value: ArgsJoined.slice(0, 1000) }],
            footer: { text: 'Access to this channel will be revoked now.' },
          },
        };

        const tempTickets = tickets.get(msg.channel.id);
        tempTickets.status = true;
        tickets.set(msg.channel.id, tempTickets);

        msg.channel.send(RevokeEmbed).then((IssueMessage) => {
          const MessId = IssueMessage.id;
          if (msg.client.users.get(TickAuthor)) {
            msg.channel.fetchMessages({ before: MessId })
              .then((messages) => {
                const mess = [];
                messages.forEach((OldMess) => { mess.push(OldMess); });
                mess.reverse();
                let PartBlock = 'Support Transcript\n';
                const Participants = new Set();
                mess.forEach((nMes) => {
                  if (!nMes.author.bot && !Participants.has(nMes.author)) {
                    Participants.add(nMes.author);
                  }
                  PartBlock = `${PartBlock}\n${nMes.member.user.username}: ${nMes.content}`;
                });
                PartBlock = sep(PartBlock, 2000);
                Participants.forEach(Participant => PartBlock.forEach(part => Participant.send(`${part.replace('`', '\\`')}`, { code: '' })));
              },
              (error) => { console.log(error); },
              );
          }
        }).catch(e => log(msg, e));
        msg.channel.overwritePermissions(msg.author,
          { SEND_MESSAGES: false, ADD_REACTIONS: false, ATTACH_FILES: false, VIEW_CHANNEL: false }).catch(e => log(msg, e));
        msg.channel.send(`Please do \`${prefix}ticket  --DELETE\` here to delete this channel and clear my records about this channel.`).catch(e => log(msg, e));
      } else
      /* ~~~~~~ DELETE ~~~~~~ */
      if (args[args.length - 1] === '--DELETE' && tickets.get(msg.channel.id).status) {
        msg.channel.delete('Issue Resolved').catch((err) => { console.log(err.toString()); });
        tickets.delete(msg.channel.id);
      } else
      if (args[args.length - 1] === '--REDELETE'
            && msg.member.roles.get(msg.client.config.get(msg.guild.id).adminId)
            && !tickets.get(msg.channel.id).status) {
        msg.channel.fetchMessages({ before: msg.id })
          .then((messages) => {
            const mess = [];
            messages.forEach((OldMess) => { mess.push(OldMess); });
            mess.reverse();
            let PartBlock = 'Support Transcript\n';
            const Participants = new Set();
            mess.forEach((nMes) => {
              if (!nMes.author.bot && !Participants.has(nMes.author)) {
                Participants.add(nMes.author);
              }
              PartBlock = `${PartBlock}\n${nMes.member.user.username}: ${nMes.content}`;
            });
            PartBlock = sep(PartBlock, 2000);
            Participants.forEach(Participant => PartBlock.forEach(part => Participant.send(`${part.replace('`', '\\`')}`, { code: ' ' }).catch(e => log(msg, e))));
          },
          (error) => { console.log(error); });
        msg.channel.delete('Issue Cancelled').catch((err) => { console.log(err.toString()); });
        tickets.delete(msg.channel.id);
      }
    }
  },
};