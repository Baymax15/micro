// const Discord = require('discord.js');
const Enmap = require('enmap');
const EnmapSql = require('enmap-pgsql');
const pcDb = require('./pcDb.json');
const phoneDb = require('./phoneDb.json');
const pcMap = Enmap.multi(['config', 'notes', 'tickets'], EnmapSql, pcDb);
const phoneMap = Enmap.multi(['config', 'notes', 'tickets'], EnmapSql, phoneDb);

(async function() {
  for (const table in pcMap) {
    const toPhone = false;
    await pcMap[table].defer;
    await phoneMap[table].defer;
    if (toPhone) {
      pcMap[table].keyArray().forEach((key, index) => {
        phoneMap[table].set(key, pcMap[table].array()[index]);
      });
      console.log(pcMap[table].keyArray(), '=>', phoneMap[table].keyArray());
    } else {
      phoneMap[table].keyArray().forEach((key, index) => {
        pcMap[table].set(key, phoneMap[table].array()[index]);
      });
      console.log(phoneMap[table].keyArray(), '=>', pcMap[table].keyArray());
    }
  }
}());
