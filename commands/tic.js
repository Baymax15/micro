const winSituations = [
  // Rows
  [1, 2, 3], [4, 5, 6], [7, 8, 9],
  // Columns
  [1, 4, 7], [2, 5, 8], [3, 6, 9],
  // Diagonals
  [1, 5, 9], [3, 5, 7]];

module.exports = {
  // command properties
  name: 'tic',
  brief: 'tic tac toe',
  argReq: false,
  cooldown: 5,
  guildOnly: true,
  description: 'ttt, but doesnt store any leaderboars yet. enjoy the game tho',
  usage: '',
  // command function
  async run(msg, args) {
    // board, state of game and no. of valid moves
    const gameBoard = Array(9).fill(' ');
    let state = false;
    let step_count = 0;

    // Makes a visual board
    function drawBoard(board) {
      let disp = '';
      board.forEach((elmt, index) => {
        let obj;
        switch (elmt) {
        case 'x': obj = '\ud83c\uddfd '; break;
        case 'o': obj = '\ud83c\uddf4 '; break;
        default: obj = '\u25a0 '; break;
        }
        disp += obj;
        if (index % 3 == 2) disp += '\n';
      });
      return {
        embed: {
          color: 0x22ffaa,
          timestamp: new Date(),
          description: `${disp}`,
          footer: { text: msg.client.user.tag, icon_url: msg.client.user.displayAvatarURL },
        },
      };
    }

    // Initial Message
    msg.channel.send(`Who wanna play ttt with ${msg.author}? (say 'me')`).then(() => {

      // Getting second player
      const p2Filter = m => m.content.toLowerCase() === 'me' && m.author.id !== msg.author.id;
      msg.channel.awaitMessages(p2Filter, { maxMatches: 1, time: 30000, errors: ['time'] })
        .then(collected => {
          const player2 = collected.first().author;
          msg.channel.send(`${player2} has joined! Lets begin`);

          function step(player, val) {
            if (val < 1 || val > 9) return ['please enter from 1 to 9 only', false];
            if (gameBoard[val - 1] !== ' ') return ['The slot is already filled. Choose another one!', false];
            gameBoard[val - 1] = player[0];
            players[players.indexOf(player)][1].push(val);
            if (winSituations.some((situation) => situation.every(index => player[1].includes(index)))) state = player;
            return [drawBoard(gameBoard), true];
          }

          // Selecting random first player
          let players = [['x', [], msg.author], ['o', [], player2]];
          if (Math.random() < 0.5) players = [['x', [], player2], ['o', [], msg.author]];
          msg.channel.send(`It's ${players[0][2]}'s turn and is ${players[0][0]}`);



          const filter = m => [msg.author.id, player2.id].includes(m.author.id) && parseInt(m.content);
          const collector = msg.channel.createMessageCollector(filter, { maxMatches: 9, time: 10 * 60 * 1000 });

          collector.on('collect', m => {
            const temp = step(players[step_count % 2], parseInt(m.content));
            if (temp[1]) step_count++;
            msg.channel.send(temp[0]);
            if (state) collector.stop();
          });

          collector.on('end', (ended) => {
            if (state) msg.channel.send(`${state[2]} won!`);
            else msg.channel.send('it\'s a draw');
          });
        })
        .catch(ended => {
          console.log(ended);
          msg.channel.send('Looks like nobody wants to play with you ;-;');
        });
    });
  },
};