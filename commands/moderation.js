const Discord = require('discord.js');
const Logger = require('../modules/logger.js');
const Cache = require('../modules/cache.js');

const registerCase = (guildId, db, moderationData) => new Promise((resolve, reject) => Cache.getModerationCases(guildId)
  .then(data => {
    let date = new Date();
    let newId = '0';
    if (data && Object.keys(data).length >= 1) {
      let keys = Object.keys(data).sort((a, b) => (a - b));
      newId = (parseInt(keys[keys.length - 1]) + 1).toString();
    }
    moderationData.date = date.toISOString();
    db.collection('guilds').doc(guildId).collection('cases').doc(newId).set(moderationData)
      .then(() => Cache.cacheModerationCases(guildId))
      .then(() => resolve(newId))
      .catch(reject);
  })
  .catch(reject));

const clear = {
  data: {
    name: 'clear',
    description: 'Deletes specified amount of messages in current channel.',
    options: [{
      name: 'count',
      description: 'The message count to delete.',
      type: 4,
      required: true
    }]
  }, exec: async (interaction, client, _api, _db) => {
    let author = new Discord.User(client, interaction.member ? interaction.member.user : interaction.user);
    let args = {};
    if (interaction.data.options) interaction.data.options.forEach(e => {
      args[e.name] = e.value;
    });

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
      let authorMember = await guild.members.fetch(author.id);
      if (!authorMember.hasPermission('MANAGE_MESSAGES')) client.api.interactions(interaction.id, interaction.token).callback.post({data: {
        type: 2,
        data: {
          tts: false,
          content: 'You need `Manage Messages` permission to run this command!',
          embeds: [],
          allowed_mentions: [],
          flags: 1 << 6
        }
      }});
      else {
        if (args.count <= 0 || isNaN(args.count)) client.api.interactions(interaction.id, interaction.token).callback.post({data: {
          type: 2,
          data: {
            tts: false,
            content: 'Please provide the number of messages to delete!',
            embeds: [],
            allowed_mentions: [],
            flags: 1 << 6
          }
        }});
        else {
          let channel = guild.channels.cache.get(interaction.channel_id);
          channel.messages.fetch({ limit: args.count })
            .then(fetched => channel.bulkDelete(fetched)
              .then(messages => client.api.interactions(interaction.id, interaction.token).callback.post({data: {
                type: 2,
                data: {
                  tts: false,
                  content: `Successfully deleted ${messages.size} messages.`,
                  embeds: [],
                  allowed_mentions: [],
                  flags: 1 << 6
                }
              }}))
              .catch(() => client.api.interactions(interaction.id, interaction.token).callback.post({data: {
                type: 2,
                data: {
                  tts: false,
                  content: 'Couldn\'t delete the messages!',
                  embeds: [],
                  allowed_mentions: [],
                  flags: 1 << 6
                }
              }})));
        }
      }
    }
  }
};

const cases = {
  data: {
    name: 'cases',
    description: 'Shows the cases about the specified member.',
    options: [{
      name: 'member',
      description: 'The member to show cases about.',
      type: 6,
      required: false
    }]
  }, exec: (interaction, client, _api, _db) => {
    let author = new Discord.User(client, interaction.member ? interaction.member.user : interaction.user);
    let args = {};
    if (interaction.data.options) interaction.data.options.forEach(e => {
      args[e.name] = e.value;
    });

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
    else Cache.getModerationCases(interaction.guild_id)
      .then(async data => {
        let fields = [];
        let id = args.member ? args.member : author.id;
        let user = await client.users.fetch(id);
        if (user.bot) client.api.interactions(interaction.id, interaction.token).callback.post({data: {
          type: 2,
          data: {
            tts: false,
            content: 'Please mention a member!',
            embeds: [],
            allowed_mentions: [],
            flags: 1 << 6
          }
        }});
        else {
          for (let key in data) if (data.hasOwnProperty(key) && data[key].effected === id) fields.push({
            name: `Case ${key}`,
            value: ` => **Issued by:** <@${data[key].by}>\n\
   => **Issued on:** ${new Date(data[key].date).toUTCString()}\n\
   => **Reason:** ${data[key].reason ? data[key].reason : 'Not provided.'}\n\
   => **Case Type:** \`${data[key].type}\``, inline: true
          });

          client.api.interactions(interaction.id, interaction.token).callback.post({data: {
            type: 4,
            data: {
              tts: false,
              content: '',
              embeds: [new Discord.MessageEmbed()
                .setColor('#85dbfc')
                .setAuthor('Sekai ＊ 世界', client.user.displayAvatarURL(), 'https://top.gg/bot/772460495949135893')
                .setTitle(`Moderation Cases About @${user.tag}`)
                .setDescription(`<@${user.id}> (${user.id})\n\n\
      ${fields.length < 1 ? '***No moderation cases recorded.***' : ''}`)
                .setTimestamp()
                .setFooter(`Requested by: ${author.tag}`, author.displayAvatarURL())
                .addFields(fields)],
              allowed_mentions: []
            }
          }});
        }
      })
      .catch(() => client.api.interactions(interaction.id, interaction.token).callback.post({data: {
        type: 2,
        data: {
          tts: false,
          content: 'Couldn\'t get moderation case data!',
          embeds: [],
          allowed_mentions: [],
          flags: 1 << 6
        }
      }}))
  }
};

const kick = {
  data: {
    name: 'kick',
    description: 'Kicks the specified member from current server.',
    options: [{
      name: 'member',
      description: 'The member to kick.',
      type: 6,
      required: true
    }, {
      name: 'reason',
      description: 'The reason to kick.',
      type: 3,
      required: false
    }]
  }, exec: async (interaction, client, _api, db) => {
    let author = new Discord.User(client, interaction.member ? interaction.member.user : interaction.user);
    let args = {};
    if (interaction.data.options) interaction.data.options.forEach(e => {
      args[e.name] = e.value;
    });

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
      let authorMember = await guild.members.fetch(author.id);
      if (!authorMember.hasPermission('KICK_MEMBERS')) client.api.interactions(interaction.id, interaction.token).callback.post({data: {
        type: 2,
        data: {
          tts: false,
          content: 'You need `Kick Members` permission to run this command!',
          embeds: [],
          allowed_mentions: [],
          flags: 1 << 6
        }
      }});
      else {
        let reason = args.reason ? args.reason : null;
        let member = await guild.members.fetch(args.member);
        if (member.user.bot) client.api.interactions(interaction.id, interaction.token).callback.post({data: {
          type: 2,
          data: {
            tts: false,
            content: 'Please mention a member!',
            embeds: [],
            allowed_mentions: [],
            flags: 1 << 6
          }
        }});
        else member.kick(reason)
          .then(() => registerCase(interaction.guild_id, db, {
            type: 'kick',
            by: author.id,
            effected: args.member,
            reason: reason
          })
            .then(newId => {
              client.api.interactions(interaction.id, interaction.token).callback.post({data: {
                type: 2,
                data: {
                  tts: false,
                  content: `Successfully kicked <@${args.member}>.`,
                  embeds: [],
                  allowed_mentions: [],
                  flags: 1 << 6
                }
              }});
              Logger.log(guild, {
                description: `Kicked member: <@${args.member}> (${member.user.tag}).`,
                author: author,
                footer: `kick・${args.member}`,
                fields: [{name: 'Case Information', value: `Issued by: <@${author.id}> \
  (${author.tag})\nCase ID: ${newId}`, inline: true},
                  {name: 'Reason', value: `${reason ? reason : 'Not provided.'}`, inline: true}]
              }, true);
            })
          .catch(console.error));
      }
    }
  }
};

module.exports = {
  clear, cases, kick
};
