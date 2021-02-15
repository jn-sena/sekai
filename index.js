const Discord = require('discord.js');
const admin = require('firebase-admin');
const AutoPoster = require('topgg-autoposter');

const token = ''; // FIXME: Enter your bot token.
const firebase = require(''); // FIXME: Require your Firebase admin credentials JSON file.
const topggToken = ''; // FIXME: Enter your top.gg token.

const client = new Discord.Client();
const ap = AutoPoster(topggToken, client);

admin.initializeApp({
  credential: admin.credential.cert(firebase)
});
const db = admin.firestore();

client.login(token);
