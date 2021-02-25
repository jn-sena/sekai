const Discord = require('discord.js');
const Cache = require('../modules/cache');

const help = {
  data: {
    name: 'help',
    description: 'Shows the help text for Sekai.',
    options: [{
      name: 'scope',
      description: 'The type of the help.',
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
      { name: 'Miscellaneous', value: '**/help** `[scope:3]`\n\
=> Shows the help text for Sekai.\n\
=> Scope can be one of these: `Help`, `Command List`.', inline: true });

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

module.exports = {
  help
};
