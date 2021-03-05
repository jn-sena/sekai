const Discord = require('discord.js');
const Cache = require('../modules/cache');

const autoroles = {
  data: {
    name: 'autoroles',
    description: 'Toggles autorole for role in current server.\nRole should be lower than the Sekai role.',
    options: [{
      name: 'role',
      description: 'The role to toggle autorole for.',
      type: 8,
      required: true
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
      if (!authorMember.hasPermission('MANAGE_ROLES')) client.api.interactions(interaction.id, interaction.token).callback.post({data: {
        type: 2,
        data: {
          tts: false,
          content: 'You need `Manage Roles` permission to run this command!',
          embeds: [],
          allowed_mentions: [],
          flags: 1 << 6
        }
      }});
      else Cache.getGuildData(interaction.guild_id)
        .then(data => {
          let roles = data.autoroles;
          let addition = true;
          if (roles.includes(args.role)) {
            roles.splice(roles.indexOf(args.role), 1);
            addition = false;
          }
          else roles.push(args.role);
          db.collection('guilds').doc(interaction.guild_id).set({
            autoroles: roles
          }, { merge: true })
            .then(() => Cache.cacheGuildData(interaction.guild_id))
            .then(() => client.api.interactions(interaction.id, interaction.token).callback.post({data: {
              type: 2,
              data: {
                tts: false,
                content: `Successfully ${addition ? 'added' : 'removed'} <@&${args.role}> ${addition ? 'to': 'from'} autoroles.`,
                embeds: [],
                allowed_mentions: [],
                flags: 1 << 6
              }
            }}))
            .catch(console.error);
        })
        .catch(console.error);
    }
  }
};

const logs = {
  data: {
    name: 'logs',
    description: 'Sets the specified action to log in specified channel.',
    options: [{
      name: 'scope',
      description: 'The action to log about.',
      type: 3,
      required: true,
      choices: [{
        name: 'General Logs',
        value: 'logs'
      }, {
        name: 'Moderation Logs',
        value: 'moderation_logs'
      }]
    }, {
      name: 'channel',
      description: 'The channel to log actions in.',
      type: 7,
      required: true
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
      if (!authorMember.hasPermission('MANAGE_GUILD')) client.api.interactions(interaction.id, interaction.token).callback.post({data: {
        type: 2,
        data: {
          tts: false,
          content: 'You need `Manage Guild` permission to run this command!',
          embeds: [],
          allowed_mentions: [],
          flags: 1 << 6
        }
      }});
      else {
        let obj = {};
        obj[(args.scope === 'logs') ? 'logs_channel' : 'moderation_logs_channel'] = args.channel;
        db.collection('guilds').doc(interaction.guild_id).set(obj, { merge: true })
          .then(() => Cache.cacheGuildData(interaction.guild_id))
          .then(() => client.api.interactions(interaction.id, interaction.token).callback.post({data: {
            type: 2,
            data: {
              tts: false,
              content: `Successfully set ${(args.scope === 'logs') ? 'General Logs' : 'Moderation Logs'} channel to <#${args.channel}>.`,
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
  autoroles, logs
};
