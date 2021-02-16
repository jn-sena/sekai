const Discord = require('discord.js');
const AutoPoster = require('topgg-autoposter');
const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

const token = ''; // FIXME: Enter your bot token.
const firebase = require(''); // FIXME: Require your Firebase admin credentials JSON file.
const topggToken = ''; // FIXME: Enter your top.gg token.

const client = new Discord.Client();
const ap = AutoPoster(topggToken, client);

admin.initializeApp({
  credential: admin.credential.cert(firebase)
});
const db = admin.firestore();

const act_types = ['LISTENING', 'WATCHING', 'PLAYING', 'STREAMING', 'COMPETING'];
const setActivity = () => {
    let type = act_types[Math.floor(Math.random() * act_types.length)];
    // Masterpiece by Snazz on YouTube.
    client.user.setActivity(`世界 ＊ &help`, {type: type, url: 'https://youtu.be/K0MDWjelrgY'})
      .catch(console.error);
}

let commandModules = [];

client.on('ready', () => {
  setActivity();
  setInterval(setActivity, 600e3);

  let commandsPath = path.join(`${__dirname}/commands`);
  fs.readdirSync(commandsPath).forEach(file => commandModules.push(require(`${commandsPath}/${file}`)));
});

client.on('message', message => {
  if (message.author.bot) return;

  let prefix = '&';
  if (!message.content.startsWith(prefix)) return;

  let command = message.content.replace(prefix, '').split(/ +/g)[0].toLowerCase();
  let args = message.content.split(/ +/g);
  args.splice(args.indexOf(`${prefix}${command}`, 1));

  for (const i of commandModules) if (i[command]) {
    message.channel.startTyping();
    i[command](message, client, args, db);
    break;
  }
});

client.on('invalidated', () => process.kill(process.pid, 'SIGTERM'));
client.login(token);
