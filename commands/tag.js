const Enmap = require('enmap');

const { clean, log } = require('../config/myFun');


module.exports = {
  // command properties
  name: 'tag',
  brief: 'stores text with a custom key',
  cooldown: 10,
  guildOnly: true,
  description: {
    embed: {
      color: 0x22ffaa,
      description: '**description**\nStores key-value pair you provide in a database to look afterwards.',
      fields: [
        { name: '**Show**', value: '--show <key> shows the whole value with the key' },
        {
          name: '**Altering the database**', value: `\`<value> --tagconfig set <key>\` ( or \`<value> --tc set <key>\`) at the end stores the key-value to database.
\`--tagconfig rem <key>\` ( or \`--tc rem <key>\`) at the end removes the key-value from the database.` }],
    },
  },
  usage: '[ --show <key> | [value] --tc <set|rem> [key]]',
  // command function
  async run(msg, args) {
    const users = new Enmap(msg.client.notesMap.get(msg.guild.id));
    const user = users.get(msg.author.id);

    if (!['--tc', '--tagconfig'].some(val => args.includes(val))) {
      try {
        const codeblock = { split: true };
        const reg = /--show +(.*)+$/;
        const index = args.join(' ').match(reg);
        let reply = 'You don\'t have any tags set here!';

        if (!index && user.tags.length) {
          user.tags.forEach(([key, value], ix) => {
            if (value.length > 30) value = value.slice(0, 30);
            ix == 0 ? reply = `${key} => ${value}` : reply += `\n${key} => ${value}`;
          });
        } else if (index && index[1] && user.tags.length) {
          const tags = new Map(user.tags);

          if (!tags.get(index[1])) {
            reply = 'There isn\'t any tag with that key!';
          } else {
            reply = tags.get(index[1]);
            codeblock.code = '';
          }
        }
        await msg.channel.send(reply, codeblock);
      } catch (error) {
        msg.channel.send('if (err) beep(\'baymax\');', { code: 'js' }).catch(e => log(msg, e));
        console.log(error.stack);
      }
    } else {
      const argsJoined = args.join(' ').replace(/\n/, '\u200b');
      let reply = 'Check usage please! (use advance help)';

      if (['--tc', '--tagconfig'].some(val => args.includes(val))) {
        try {
          const reg = /--(tc|tagconfig) (set|rem) (.+)$/;
          const tags = new Map(user.tags);

          if (reg.test(argsJoined)) {
            const index = argsJoined.match(reg);

            if (index[2] === 'set' && index[3]) {
              args.splice(args.indexOf(`--${index[1]}`));
              tags.set(clean(msg, index[3]), clean(msg, args.join(' ')));
              reply = 'Added tag to database.';
            }
            if (index[2] === 'rem' && index[3]) {
              if (!tags.get(index[3])) return msg.channel.send('There isn\'t any tag with that key!');
              const rem = tags.get(index[3]);

              tags.delete(index[3]);
              reply = `Removed ${index[3]} => ${rem.length > 10 ? `${rem.slice(0, 10)}...` : rem} from database.`;
            }
            user.tags = [...tags];
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
