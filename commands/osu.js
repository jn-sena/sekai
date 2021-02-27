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

const osu = {
  data: {
    name: 'osu',
    description: 'Shows information about things on osu!.',
    options: [{
      name: 'profile',
      description: 'Shows profiles of people on osu!.',
      type: 2,
      options: [{
        name: 'get',
        description: 'Shows the profile of the player with given id.',
        type: 1,
        options: [{
          name: 'profile_id',
          description: 'The profile id you want to get the profile of.',
          type: 3,
          required: true
        }, {
          name: 'mode',
          description: 'The mode you want to see profile of.',
          type: 3,
          required: false,
          choices:[{
            name: 'osu!standard',
            value: 'osu'
          }, {
            name: 'osu!mania',
            value: 'mania'
          }, {
            name: 'osu!taiko',
            value: 'taiko'
          }, {
            name: 'osu!catch',
            value: 'fruits'
          }]
        }]
      }, {
        name: 'user',
        description: 'Shows the profile of the mentioned user in Sekai database.',
        type: 1,
        options: [{
          name: 'user',
          description: 'The user you want to get the profile of.',
          type: 6,
          required: false
        }, {
          name: 'mode',
          description: 'The mode you want to see profile of.',
          type: 3,
          required: false,
          choices:[{
            name: 'osu!standard',
            value: 'osu'
          }, {
            name: 'osu!mania',
            value: 'mania'
          }, {
            name: 'osu!taiko',
            value: 'taiko'
          }, {
            name: 'osu!catch',
            value: 'fruits'
          }]
        }]
      }, {
        name: 'set',
        description: 'Sets your osu! profile in Sekai database.',
        type: 1,
        options: [{
          name: 'profile_id',
          description: 'The profile id you want to set as your profile.',
          type: 3,
          required: true
        }]
      }]
    }]
  }, exec: async (interaction, client, _api, db) => {
    let subcommand_group = 'profile';
    if (interaction.data.options) subcommand_group = interaction.data.options[0].name;
    let author = new Discord.User(client, interaction.member ? interaction.member.user : interaction.user);

    if (subcommand_group === 'profile') {
      let subcommand = 'get';
      if (interaction.data.options[0].options) subcommand = interaction.data.options[0].options[0].name;

      let args = {};
      if (interaction.data.options[0].options[0].options) interaction.data.options[0].options[0].options.forEach(e => {
        args[e.name] = e.value;
      });

      if (subcommand === 'get' || subcommand === 'user') {
        let userId = '';
        if (subcommand === 'get') userId = args.profile_id;
        else if (subcommand === 'user') {
          let userData = await Cache.getUserData(args.user ? args.user : author.id);
          userId = userData.osu_profile;
        }
        let mode = args.mode ? args.mode : '';

        let data = await fetch(`https://osu.ppy.sh/api/v2/users/${userId}/${mode}`, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
          }
        });
        data = await data.json();
        if (data.hasOwnProperty('error')) client.api.interactions(interaction.id, interaction.token).callback.post({data: {
          type: 2,
          data: {
            tts: false,
            content: 'Invalid user id or mode!',
            embeds: [],
            allowed_mentions: [],
            flags: 1 << 6
          }
        }});
        else {
          let joinedDate = new Date(data.join_date);
          let joinedStr = joinedDate.toUTCString();
          mode = mode ? mode : data.playmode;
          client.api.interactions(interaction.id, interaction.token).callback.post({data: {
            type: 4,
            data: {
              tts: false,
              embeds: [new Discord.MessageEmbed()
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
                .setFooter(`Requested by: ${author.tag}`, author.displayAvatarURL())],
              allowed_mentions: []
            }
          }});
        }
      } else if (subcommand === 'set') {
        let data = await fetch(`https://osu.ppy.sh/api/v2/users/${args.profile_id}`, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
          }
        });
        data = await data.json();
        if (data.hasOwnProperty('error')) client.api.interactions(interaction.id, interaction.token).callback.post({data: {
          type: 2,
          data: {
            tts: false,
            content: 'Invalid user id!',
            embeds: [],
            allowed_mentions: [],
            flags: 1 << 6
          }
        }});
        else db.collection('users').doc(author.id).set({
          osu_profile: args.profile_id
        }, { merge: true })
          .then(Cache.cacheUserData(author.id))
          .then(() => client.api.interactions(interaction.id, interaction.token).callback.post({data: {
            type: 2,
            data: {
              tts: false,
              content: `Successfully set <@${author.id}>'s osu! profile to **${data.username} (${args.profile_id})**.`,
              embeds: [],
              allowed_mentions: [],
              flags: 1 << 6
            }
          }}))
          .catch(console.error);
      }
    }
  }
};

module.exports = {
  osu
};
