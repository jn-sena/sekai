const Discord = require('discord.js');
const Logger = require('../modules/logger.js');
const Cache = require('../modules/cache.js');

const registerCase = (guildId, db, moderationData) => new Promise((resolve, reject) => Cache.getModerationCases(guildId)
  .then(data => {
    let date = new Date();
    let keys = Object.keys(data).sort((a, b) => (a - b));
    let newId = (parseInt(keys[keys.length - 1]) + 1).toString();
    moderationData.date = date.toISOString();
    db.collection('guilds').doc(guildId).collection('cases').doc(newId.toString()).set(moderationData)
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
      if (!guild.member(author).hasPermission('MANAGE_MESSAGES')) client.api.interactions(interaction.id, interaction.token).callback.post({data: {
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
      if (!guild.member(author).hasPermission('KICK_MEMBERS')) client.api.interactions(interaction.id, interaction.token).callback.post({data: {
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
        member.kick(reason)
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
  clear, kick
};
