const Discord = require('discord.js');
const Cache = require('../modules/cache');

// FIXME: Create a file named './tokens.json' and fill it. See README.md.
const tokensObject = require('../tokens.json');
const clientId = tokensObject.clientId;

const help = {
  data: {
    name: 'help',
    description: 'Shows the help text for Sekai.',
  }, exec: (interaction, client, _api, _db) => {
    let author = new Discord.User(client, interaction.member ? interaction.member.user : interaction.user);

    let embed = new Discord.MessageEmbed()
      .setColor('#85dbfc')
      .setAuthor('Sekai ＊ 世界', client.user.displayAvatarURL(), 'https://top.gg/bot/772460495949135893')
      .setTitle('Sekai Help')
      .setDescription('Hi! This is **Sekai**. I am a multipurpose Discord bot to serve you. よろしくおねがいします！')
      .addFields(
      { name: 'Usage', value: '`/<command> [options]`', inline: true },
      { name: 'Example', value: '`/help`', inline: false },
      { name: 'Commands', value: '**See **`/commands`** for commands!**', inline: true })
      .setTimestamp()
      .setFooter(`Requested by: ${author.tag}`, author.displayAvatarURL());

    if (author) author.send(embed)
      .catch(() => client.api.interactions(interaction.id, interaction.token).callback.post({data: {
        type: 4,
        data: {
          tts: false,
          content: '',
          embeds: [embed],
          allowed_mentions: []
        }
      }})
      .catch(console.error));
  }
};

const commands = {
  data: {
    name: 'commands',
    description: 'Show information about commands.',
  }, exec: (interaction, client, _api, _db) => {
    let author = new Discord.User(client, interaction.member ? interaction.member.user : interaction.user);

    let embed = new Discord.MessageEmbed()
      .setColor('#85dbfc')
      .setAuthor('Sekai ＊ 世界', client.user.displayAvatarURL(), 'https://top.gg/bot/772460495949135893')
      .setTitle('Sekai Commands')
      .setDescription('Hi! This is **Sekai**. I am a multipurpose Discord bot to serve you. よろしくおねがいします！')
      .addFields(
        { name: 'Miscellaneous', value: '**/help**\n\
=> Shows the help text for Sekai.\n\
\n\
**/commands**\n\
=> Shows the list of commands.\n\
\n\
**/info user** `[@user]`\n\
=> Shows information about the user.\n\
\n\
**/info server**\n\
=> Shows information about the current server.\n\
\n\
**/info bot**\n\
=> Shows information about Sekai.\n\
\n\
**/invite**\n\
=> Shows invite links of Sekai.\n\
\n\
**/vote**\n\
=> Shows vote link of Sekai.', inline: true },
        { name: 'osu!', value: '**/osu profile get** `<profile_id>` `[mode]`\n\
=> Shows the profile of the player with given id.\n\
=> Shows the profile with specified mode if given.\n\
\n\
**/osu profile user** `[@user]` `[mode]`\n\
=> Shows the profile of the mentioned user in Sekai database.\n\
=> Shows the profile with specified mode if given.\n\
\n\
**/osu profile set** `<profile_id>`\n\
=> Sets your osu! profile in Sekai database.', inline: true })
      .setTimestamp()
      .setFooter(`Requested by: ${author.tag}`, author.displayAvatarURL());

    if (author) author.send(embed)
      .catch(() => client.api.interactions(interaction.id, interaction.token).callback.post({data: {
        type: 4,
        data: {
          tts: false,
          content: '',
          embeds: [embed],
          allowed_mentions: []
        }
      }})
      .catch(console.error));
  }
};

const info = {
  data: {
    name: 'info',
    description: 'Shows information about user, server or Sekai.',
    options: [{
      name: 'user',
      description: 'Shows information about user.',
      type: 1,
      options: [{
        name: 'user',
        description: 'The user to get information about.',
        type: 6,
        required: false
      }]
    }, {
      name: 'server',
      description: 'Shows information about current server.',
      type: 1
    }, {
      name: 'bot',
      description: 'Shows information about Sekai.',
      type: 1
    }]
  }, exec: async (interaction, client, api, _db) => {
    let subcommand = 'user';
    if (interaction.data.options) subcommand = interaction.data.options[0].name;
    let author = new Discord.User(client, interaction.member ? interaction.member.user : interaction.user);
    let args = {};
    if (interaction.data.options[0].options) interaction.data.options[0].options.forEach(e => {
      args[e.name] = e.value;
    });

    if (subcommand === 'user') {
      let user = author;
      if (args.user) user = await client.users.fetch(args.user);
      Cache.getUserData(user.id)
        .then(data => api.hasVoted(user.id)
          .then(async voted => {
            let guild;
            if (interaction.guild_id) guild = await client.guilds.fetch(interaction.guild_id);
            let embed = new Discord.MessageEmbed()
              .setColor('#85dbfc')
              .setAuthor('Sekai ＊ 世界', client.user.displayAvatarURL(), 'https://top.gg/bot/772460495949135893')
              .setTitle(`${user.tag} User Information`)
              .addFields(
                { name: 'User ID', value: user.id, inline: true },
                { name: 'Discord Join Timestamp', value: user.createdAt.toUTCString(), inline: false})
              .setThumbnail(user.displayAvatarURL())
              .setTimestamp()
              .setFooter(`Requested by: ${author.tag}`, author.displayAvatarURL());
            if (interaction.guild_id && author === user) embed.addField('Server Join Timestamp', guild.member(user).joinedAt.toUTCString(), false);
            embed.addFields(
              { name: 'Voted', value: `${voted ? 'Yes' : 'No'}`, inline: true },
              { name: 'osu! ID', value: `${data.osu_profile ? data.osu_profile : 'Not Provided'}`, inline: true});
            client.api.interactions(interaction.id, interaction.token).callback.post({data: {
              type: 4,
              data: {
                tts: false,
                embeds: [embed],
                allowed_mentions: []
              }
            }});
          })
          .catch(console.error))
        .catch(console.error);
    } else if (subcommand === 'server') {
      if (!interaction.guild_id) client.api.interactions(interaction.id, interaction.token).callback.post({data: {
        type: 2,
        data: {
          tts: false,
          content: 'This command is only available in servers!',
          embeds: [],
          allowed_mentions: [],
          flags: 1 << 6
        }
      }});
      else {
        let guild = await client.guilds.fetch(interaction.guild_id);
        client.api.interactions(interaction.id, interaction.token).callback.post({data: {
          type: 4,
          data: {
            tts: false,
            embeds: [new Discord.MessageEmbed()
              .setColor('#85dbfc')
              .setAuthor('Sekai ＊ 世界', client.user.displayAvatarURL(), 'https://top.gg/bot/772460495949135893')
              .setTitle(`${guild.name} Server Information`)
              .addFields(
                { name: 'Server ID', value: guild.id, inline: true },
                { name: 'Server Create Timestamp', value: guild.createdAt.toUTCString(), inline: true },
                { name: 'Server Owner', value: `<@${guild.owner.user.id}>`, inline: true })
              .setTimestamp()
              .setFooter(`Requested by: ${author.tag}`, author.displayAvatarURL())],
            allowed_mentions: []
          }
        }});
      }
    } else if (subcommand === 'bot') api.getStats(clientId)
      .then(stats => client.api.interactions(interaction.id, interaction.token).callback.post({data: {
        type: 4,
        data: {
          tts: false,
          embeds: [new Discord.MessageEmbed()
            .setColor('#85dbfc')
            .setAuthor('Sekai ＊ 世界', client.user.displayAvatarURL(), 'https://top.gg/bot/772460495949135893')
            .setTitle('Sekai Bot Information')
            .addFields(
              { name: 'API Latency', value: `**${client.ws.ping}** ms`, inline: true },
              { name: 'Server Count', value: `**${stats.serverCount}** Servers`, inline: true },
              { name: 'Shard Count', value: `**${stats.shardCount}** Shards`, inline: true })
            .setTimestamp()
            .setFooter(`Requested by: ${author.tag}`, author.displayAvatarURL())],
          allowed_mentions: []
        }
      }}))
      .catch(console.error);
  }
};

const invite = {
  data: {
    name: 'invite',
    description: 'Show invite links of Sekai.'
  }, exec: (interaction, client, api, _db) => api.getStats(clientId)
    .then(stats => {
      let author = new Discord.User(client, interaction.member ? interaction.member.user : interaction.user);

      client.api.interactions(interaction.id, interaction.token).callback.post({data: {
        type: 4,
        data: {
          tts: false,
          content: '',
          embeds: [new Discord.MessageEmbed()
            .setColor('#85dbfc')
            .setAuthor('Sekai ＊ 世界', client.user.displayAvatarURL(), 'https://top.gg/bot/772460495949135893')
            .setTitle('Invite Sekai')
            .addFields(
              { name: 'Bot Invite', value: 'https://top.gg/bot/772460495949135893/invite', inline: true },
              { name: 'Support Server Invite', value: 'https://discord.com/invite/sfwuVnTFJ2', inline: true },
              { name: 'Server Count', value: `**${stats.serverCount}** Servers`, inline: true })
            .setTimestamp()
            .setFooter(`Requested by: ${author.tag}`, author.displayAvatarURL())],
          allowed_mentions: []
        }
      }})
    })
    .catch(console.error)
};

const vote = {
  data: {
    name: 'vote',
    description: 'Shows vote link for Sekai.'
  }, exec: (interaction, client, api, _db) => {
    let author = new Discord.User(client, interaction.member ? interaction.member.user : interaction.user);

    api.hasVoted(author.id)
      .then(voted => client.api.interactions(interaction.id, interaction.token).callback.post({data: {
        type: 4,
        data: {
          tts: false,
          content: '',
          embeds: [new Discord.MessageEmbed()
            .setColor('#85dbfc')
            .setAuthor('Sekai ＊ 世界', client.user.displayAvatarURL(), 'https://top.gg/bot/772460495949135893')
            .setTitle('Upvote Sekai')
            .addFields(
              { name: 'Bot Invite', value: 'https://top.gg/bot/772460495949135893/invite', inline: true },
              { name: 'Voted', value: `${voted ? 'Yes' : 'No'}`, inline: true})
            .setTimestamp()
            .setFooter(`Requested by: ${author.tag}`, author.displayAvatarURL())],
          allowed_mentions: []
        }
      }}))
    .catch(console.error);
  }
};

module.exports = {
  help, commands, info, invite, vote
};
