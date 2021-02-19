const Discord = require('discord.js');

const help = (message, client, _args, _db, _cache) => {
  let embed = new Discord.MessageEmbed()
    .setColor('#85dbfc')
    .setAuthor('Sekai ＊ 世界', client.user.displayAvatarURL(), 'https://top.gg/bot/772460495949135893')
    .setTitle('Help')
    .setDescription('Hi! This is **Sekai**. I am a multipurpose Discord bot to serve you. よろしくおねがいします！')
    .addFields(
      { name: 'Usage', value: '`&<command> [options]`', inline: true },
      { name: 'Example', value: '`&help`', inline: true },
      { name: 'Commands', value: '**See **`&commands`** for commands!**', inline: true })
    .setTimestamp()
    .setFooter(`Requested by: ${message.author.tag}`, message.author.displayAvatarURL());
  message.author.send(embed)
    .then(() => message.react('📜'))
    .catch(() => message.channel.send(embed));
}

const commands = (message, client, _args, _db, _cache) => {
  let embed = new Discord.MessageEmbed()
    .setColor('#85dbfc')
    .setAuthor('Sekai ＊ 世界', client.user.displayAvatarURL(), 'https://top.gg/bot/772460495949135893')
    .setTitle('Commands')
    .setDescription('The following commands are the things I can do.')
    .addFields(
      { name: 'Miscellaneous', value: '`&help` **=>** Shows the help text.\n\
  `&commands` **=>** Shows this text.', inline: true },
      { name: 'osu!', value: '`&profile <osuUserId | @user>` **=>** Shows osu! profile of user.\n\
  `&setprofile <osuUserId>` **=>** Sets the osu! user ID of yourself in Sekai database.', inline: true })
    .setTimestamp()
    .setFooter(`Requested by: ${message.author.tag}`, message.author.displayAvatarURL());
  message.author.send(embed)
    .then(() => message.react('📜'))
    .catch(() => message.channel.send(embed));
}

module.exports = {
  help, commands
};
