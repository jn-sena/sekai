const Discord = require('discord.js');
const fetch = require('node-fetch');

let accessToken = '';
const tokenExpired = () => fetch('https://osu.ppy.sh/oauth/token', {
    method: 'post',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      'grant_type': 'client_credentials',
      'client_id': clientId,
      'client_secret': clientSecret,
      'scope': 'public'
    })
}).then(response => response.json().then(data => {
  if (Object.keys(data).includes('error')) console.error('Invalid osu! clientId or clientSecret!');
  else {
    accessToken = data.access_token;
    setTimeout(tokenExpired, data.expires_in * 1e3 - 500e3);
  }
}));
tokenExpired();

const profile = (message, _client, args, db) => {

}

const setprofile = (message, _client, args, db) => {
  if (args.length < 1) message.channel.send('Please provide your osu! user id!')
    .catch(console.error)
  else {
    fetch(`https://osu.ppy.sh/api/v2/users/${args[0]}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      }
    }).then(response => response.json().then(data => {
      if (Object.keys(data).includes('error')) message.channel.send('Invalid user id!')
        .catch(console.error);
      else db.collection('users').doc(message.author.id).set({
        osu_profile: args[0]
      }, { merge: true })
        .catch(console.error);
    }));
  }
}

module.exports = {
  setprofile
};
