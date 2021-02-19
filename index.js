const Discord = require('discord.js');
const Topgg = require('@top-gg/sdk');
const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

const Cache = require('./modules/cache');

// FIXME: Create a file named './tokens.json' and fill it. See README.md.
const tokensObject = require('./tokens.json');
const clientToken = tokensObject.clientToken;
const topggToken = tokensObject.topggToken;
const firebaseCredentials = tokensObject.firebaseCredentials;

const client = new Discord.Client();
const api = new Topgg.Api(topggToken);
(function postStats() {
  api.postStats({
    serverCount: client.guilds.cache.size,
    shardCount: client.options.shardCount
  });
  setTimeout(postStats, 30 * 60 * 1e3);
})();


ap.on('posted', () => console.log(' => Successfully posted bot stats to top.gg.'));

admin.initializeApp({
  credential: admin.credential.cert(firebaseCredentials)
});
const db = admin.firestore();
Cache.loadDatabase(db);

const act_types = ['LISTENING', 'WATCHING', 'PLAYING', 'STREAMING', 'COMPETING'];
const setActivity = () => {
    let type = act_types[Math.floor(Math.random() * act_types.length)];
    // Masterpiece by Some1CP on YouTube.
    client.user.setActivity(`世界 ＊ &help`, { type: type, url: 'https://youtu.be/moZtoMP7HAA' })
      .catch(console.error);
}

let commandModules = [];

client.on('ready', () => {
  console.log(' => Bot authenticated successfully.');
  setActivity();
  setInterval(setActivity, 600e3);

  let commandsPath = path.join(`${__dirname}/commands`);
  fs.readdirSync(commandsPath).forEach(file => commandModules.push(require(`${commandsPath}/${file}`)));
});

client.on('guildCreate', guild => Cache.cacheGuildData(guild.id).catch(console.error));

client.on('message', async message => {
  if (message.author.bot) return;

  let prefix = '&';
  if (message.guild) {
    let guildData = await Cache.getGuildData(message.guild.id);
    prefix = guildData.prefix;
  }
  if (!message.content.startsWith(prefix)) return;

  let command = message.content.replace(prefix, '').split(/ +/g)[0].toLowerCase();
  let args = message.content.split(/ +/g);
  args.splice(args.indexOf(`${prefix}${command}`), 1);

  for (const i of commandModules) if (i[command]) {
    message.channel.startTyping();
    i[command](message, client, args, api, db, Cache);
    message.channel.stopTyping(true);
    break;
  }
});

client.on('invalidated', () => process.kill(process.pid, 'SIGTERM'));
client.login(clientToken);
