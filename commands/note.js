const Enmap = require('enmap');
const { clean, log } = require('../config/myFun');

module.exports = {
  // command properties
  name: 'note',
  brief: 'keeps note of something',
  cooldown: 10,
  guildOnly: true,
  description: { embed: {
    color: 0x22ffaa,
    description: '**description**\nStores notes you provide in a database to look afterwards.',
    fields:[
      { name:'**Show**', value:'`--show <index>` shows the whole note with the index' },
      { name:'**Altering the database**', value:`\`--noteconfig add\` ( or \`--nc add\`) at the end adds the note to database.
\`--noteconfig rem <index>\` ( or \`--nc rem <index>\`) at the end removes the note from the database.` }],
  } },
  usage: '[ --show <index> | --nc <add|rem> [index]]',
  // command function
  async run(msg, args) {
    const users = new Enmap(msg.client.notesMap.get(msg.guild.id));
    const user = users.get(msg.author.id);

    if (!['--nc', '--noteconfig'].some(val => args.includes(val))) {
      try {
        const codeblock = { split: true };
        const reg = /--show\s+(\d+)$/;
        let reply = 'You don\'t have any notes here!';

        if (reg.test(args.join(' ')) && user.notes.length) {
          const index = args.join(' ').match(reg);

          if (parseInt(index[1]) && user.notes[index[1] - 1]) {
            reply = user.notes[index[1] - 1];
            codeblock.code = '';
          } else {
            reply = 'There isn\'t any note in that index!';
          }
        } else {
          user.notes.forEach((note, noteIndex) => {
            note = note.replace(/\u200b/, '\n');
            if (note.length > 100) note = `${note.slice(0, 100)}...`;
            if (noteIndex == 0) {
              reply = `${noteIndex + 1}: ${note}`;
            } else {
              reply += `\n${noteIndex + 1}: ${note}`;
            }
          });
        }
        await msg.channel.send(reply, codeblock).catch(e => log(msg, e));
      } catch (error) {
        msg.channel.send('if (err) beep(\'baymax\');', { code: 'js' }).catch(e => log(msg, e));
        console.log(error.stack);
      }
    } else {
      const argsJoined = args.join(' ').replace(/\n/, '\u200b');
      let reply = 'Check usage please! (use advance help)';

      if (['--nc', '--noteconfig'].some(val => args.includes(val))) {
        try {
          const reg = /--(nc|noteconfig)\s+(add|rem)\s*(\d+)*$/;

          if (reg.test(argsJoined)) {
            const index = argsJoined.match(reg);

            args.splice(args.indexOf(`--${index[1]}`));
            if (index[2] === 'add') {
              const newNote = clean(msg, args.join(' '));

              user.notes.push(newNote);
              reply = 'Added note to database.';
            }
            if (index[2] === 'rem' && parseInt(index[3])) {
              if (!user.notes[index[3] - 1] || index[3] < 0) return msg.channel.send('There isn\'t any note in that index!');
              const rem = user.notes.splice([index[3] - 1], 1);

              reply = `Removed ${rem.length > 20 ? `\`${rem.slice(0, 20)}...\`` : `\`${rem}\``} from database.`;
            }
            users.set(msg.author.id, user);
            await msg.client.notesMap.set(msg.guild.id, [...users]);
          }
          msg.channel.send(reply, { split: true });
        } catch (error) {
          msg.channel.send('if (err) beep(\'baymax\');', { code: 'js' }).catch(e => log(msg, e));
          console.log(error.stack);
        }
      }
    }
  },
};