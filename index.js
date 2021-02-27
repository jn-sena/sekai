const Discord = require('discord.js');
const Topgg = require('@top-gg/sdk');
const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

const Cache = require('./modules/cache');
const Logger = require('./modules/logger');

// FIXME: Create a file named './tokens.json' and fill it. See README.md.
const tokensObject = require('./tokens.json');
const clientToken = tokensObject.clientToken;
const topggToken = tokensObject.topggToken;
const firebaseCredentials = tokensObject.firebaseCredentials;

const client = new Discord.Client();
const api = new Topgg.Api(topggToken);
if (!tokensObject.nightly) setInterval(() => api.postStats({
  serverCount: client.guilds.cache.size,
  shardCount: client.options.shardCount
}), 30 * 60 * 1e3);

admin.initializeApp({
  credential: admin.credential.cert(firebaseCredentials)
});
const db = admin.firestore();
Cache.loadDatabase(db);
Logger.loadCache(Cache);
Logger.loadDatabase(db);

const act_types = ['LISTENING', 'WATCHING', 'PLAYING', 'STREAMING', 'COMPETING'];
const setActivity = () => {
    let type = act_types[Math.floor(Math.random() * act_types.length)];
    // Masterpiece by Some1CP on YouTube.
    client.user.setActivity(`世界 ＊ /help`, { type: type, url: 'https://youtu.be/moZtoMP7HAA' })
      .catch(console.error);
}

let commandModules = [];

client.on('ready', () => {
  console.log(' => Bot authenticated successfully.');
  setActivity();
  setInterval(setActivity, 600e3);

  let commandsPath = path.join(`${__dirname}/commands`);
  fs.readdirSync(commandsPath).forEach(file => commandModules.push(require(`${commandsPath}/${file}`)));
  commandModules.forEach(module => Object.keys(module).forEach(command => {
    if (!tokensObject.nightly) client.api.applications(client.user.id).commands.post({
      data: module[command].data
    });
    else client.api.applications(client.user.id).guilds(tokensObject.nightlyServer).commands.post({
      data: module[command].data
    });
  }));

  client.ws.on('INTERACTION_CREATE', interaction => {
    const command = interaction.data.name.toLowerCase();
    const args = interaction.data.options;

    for (const i of commandModules) if (i[command]) {
      i[command].exec(interaction, client, api, db);
      break;
    }
  });
});

client.on('guildCreate', guild => Cache.cacheGuildData(guild.id).catch(console.error));

client.on('guildMemberAdd', member => Cache.getGuildData(member.guild.id)
  .then(data => {
    if (data.autoroles.length >= 1) data.autoroles.forEach(element => member.roles.add(member.guild.roles.cache.get(element))
      .catch(console.error));
  })
  .catch(console.error));

client.on('invalidated', () => process.kill(process.pid, 'SIGTERM'));
client.login(clientToken);
