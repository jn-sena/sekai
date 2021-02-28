const Discord = require('discord.js');

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

module.exports = {
  clear
};
