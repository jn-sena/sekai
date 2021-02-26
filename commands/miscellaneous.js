const Discord = require('discord.js');
const Cache = require('../modules/cache');

const help = {
  data: {
    name: 'help',
    description: 'Shows the help text for Sekai.',
    options: [{
      name: 'scope',
      description: 'The scope of the help text.',
      type: 3,
      required: false,
      choices: [{
        name: 'General',
        value: 'help'
      }, {
        name: 'Command List',
        value: 'commands'
      }]
    }]
  },
  exec: (interaction, client, args, _api, _db) => {
    let scope = 'help'
    if (args) scope = args[0].value;
    let author = new Discord.User(client, interaction.member ? interaction.member.user : interaction.user);

    let embed = new Discord.MessageEmbed()
      .setColor('#85dbfc')
      .setAuthor('Sekai ＊ 世界', client.user.displayAvatarURL(), 'https://top.gg/bot/772460495949135893')
      .setTitle(`Sekai Help | ${scope === 'help' ? 'General' : 'Commands'}`)
      .setDescription('Hi! This is **Sekai**. I am a multipurpose Discord bot to serve you. よろしくおねがいします！')
      .setTimestamp()
      .setFooter(`Requested by: ${author.tag}`, author.displayAvatarURL());
    if (scope === 'help') embed.addFields(
      { name: 'Usage', value: '`/<command> [options]`', inline: true },
      { name: 'Example', value: '`/help`', inline: false },
      { name: 'Commands', value: '**See **`/help scope:Commands List`** for commands!**', inline: true });
    else if (scope === 'commands') embed.addFields(
      { name: 'Miscellaneous', value: '**/help** `[scope]`\n\
=> Shows the help text for Sekai.\n\
=> Scope can be one of these: `Help`, `Command List`.\n\
\n\
**/info user** `[@user]`\n\
=> Shows information about the user.\n\
\n\
**/info server**\n\
=> Shows information about the current server.\n\
\n\
**/info bot**\n\
=> Shows information about Sekai.', inline: true });

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
  }, exec: async (interaction, client, args, api, _db) => {
    let subcommand = 'user';
    if (args) subcommand = args[0].name;
    let author = new Discord.User(client, interaction.member ? interaction.member.user : interaction.user);

    if (subcommand === 'user') {
      let user = author;
      if (args[0].options) user = await client.users.fetch(args[0].options[0].value);
      Cache.getUserData(user.id)
        .then(data => api.hasVoted(user.id)
          .then(async voted => {
            let guild = await client.guilds.fetch(interaction.guild_id);
            let embed = new Discord.MessageEmbed()
              .setColor('#85dbfc')
              .setAuthor('Sekai ＊ 世界', client.user.displayAvatarURL(), 'https://top.gg/bot/772460495949135893')
              .setTitle(`${user.tag} User Information`)
              .addFields(
                { name: 'User ID', value: user.id, inline: true },
                { name: 'Discord Join Timestamp', value: user.createdAt.toUTCString(), inline: false})
              .setTimestamp()
              .setFooter(`Requested by: ${author.tag}`, author.displayAvatarURL());
            if (interaction.guild_id && author == user) embed.addField('Server Join Timestamp', guild.member(user).joinedAt.toUTCString(), false);
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
        type: 4,
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
    } else if (subcommand === 'bot') api.getStats(client.user.id)
      .then(stats => client.api.interactions(interaction.id, interaction.token).callback.post({data: {
        type: 4,
        data: {
          tts: false,
          embeds: [],
          allowed_mentions: [new Discord.MessageEmbed()
            .setColor('#85dbfc')
            .setAuthor('Sekai ＊ 世界', client.user.displayAvatarURL(), 'https://top.gg/bot/772460495949135893')
            .setTitle('Sekai Bot Information')
            .addFields(
              { name: 'API Latency', value: `**${client.ws.ping}** ms`, inline: true },
              { name: 'Server Count', value: `**${stats.serverCount}** Servers`, inline: true },
              { name: 'Shard Count', value: `**${stats.shardCount}** Shards`, inline: true })
            .setTimestamp()
            .setFooter(`Requested by: ${author.tag}`, author.displayAvatarURL())]
        }
      }}))
      .catch(console.error);
  }
};

module.exports = {
  help, info
};
