const Discord = require('discord.js');
const Cache = require('../modules/cache');
const fetch = require('node-fetch');

// FIXME: Create a file named './tokens.json' and fill it. See README.md.
const tokensObject = require('../tokens.json');
const clientId = tokensObject.osu.clientId;
const clientSecret = tokensObject.osu.clientSecret;

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
  if (data.hasOwnProperty('error')) console.error('Invalid osu! clientId or clientSecret!');
  else {
    accessToken = data.access_token;
    setTimeout(tokenExpired, data.expires_in * 1e3 - 500e3);
  }
}));
tokenExpired();

const profile = async (message, _client, args, _api, _db) => {
  let userId = '1';
  let mode = (args.length < 2) ? '' : `${args[1]}`;
  if (message.mentions.users.first()) {
    let userData = await Cache.getUserData(message.mentions.users.first().id)
    userId = userData.osu_profile;
  }
  else if (args.length >= 1) userId = args[0];
  else {
    let userData = await Cache.getUserData(message.author.id)
    userId = userData.osu_profile;
  }

  fetch(`https://osu.ppy.sh/api/v2/users/${userId}/${mode}`, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`
    }
  }).then(response => response.json().then(data => {
    if (data.hasOwnProperty('error')) message.channel.send(message.mentions.users.first() ? 'User has no profile set!' : 'Invalid user ID or mode!')
      .catch(console.error);
    else {
      let joinedDate = new Date(data.join_date);
      let joinedStr = joinedDate.toUTCString();
      mode = mode ? mode : data.playmode;
      message.channel.send(new Discord.MessageEmbed()
        .setColor('#b90069')
        .setAuthor('osu! Statistics', 'https://github.com/ppy/osu/blob/master/assets/lazer.png?raw=true', 'https://osu.ppy.sh')
        .setTitle(data.username + (data.title ? ` ＊ ${data.title}` : ''))
        .setDescription(`osu! **(**${mode}**)** profile of ${data.username}.`)
        .setURL(`https://osu.ppy.sh/users/${userId}/${mode}`)
        .addFields({ name: 'Statistics',  value: `**Level:** \`${data.statistics.level.current}\`\n\
  **PP:** \`${data.statistics.pp}\`\n**Global Rank:** \`#${data.statistics.rank.global}\`\n\
  **Country Rank:** \`#${data.statistics.rank.country}\`\n**Accuracy:** \`${data.statistics.hit_accuracy}%\`\n\
  `, inline: true}, {name: 'Social', value: `**Country:** \`${data.country.name} (${data.country.code})\`\n\
  **Discord:** \`${data.discord ? data.discord : 'Not provided.'}\`\n\
  **Skype:** \`${data.skype ? data.skype : 'Not provided.'}\`\n\
  **Twitter:** \`@${data.twitter ? data.twitter : 'Not provided.'}\`\n\
  **Website:** ${data.website ? data.website : '\`Not provided.\`'}`, inline: true}, {name: 'Other', value: `\
  **Supporter:** \`${data.is_supporter ? 'Supporter' : 'Not Supporter'}\`\n\
  **Online:** \`${data.is_online ? 'Online' : 'Offline'}\`\n\
  **Active:** \`${data.is_active ? 'Active' : 'Not Active'}\`\n\
  **Occupation:** \`${data.occupation ? data.occupation : 'Not provided.'}\`\n\
  **Interests:** \`${data.interests ? data.interests : 'Not provided.'}\`\n\
  **Joined At:** \`${joinedStr}\``, inline: false})
        .setTimestamp()
        .setThumbnail(data.avatar_url)
        .setFooter(`Requested by: ${message.author.tag}`, message.author.displayAvatarURL()));
    }
  }));
}

const setprofile = (message, _client, args, _api, db) => {
  if (args.length < 1) message.channel.send('Please provide your osu! user ID!')
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
      if (data.hasOwnProperty('error')) message.channel.send('Invalid user id!')
        .catch(console.error);
      else {
        db.collection('users').doc(message.author.id).set({
          osu_profile: args[0]
        }, { merge: true })
          .then(Cache.cacheUserData(message.author.id))
          .then(() => message.channel.send(`Successfully set <@${message.author.id}>'s osu! profile to **${data.username} (${args[0]})**.`))
          .catch(console.error);
      }
    }));
  }
}

module.exports = {
  profile, setprofile
};
