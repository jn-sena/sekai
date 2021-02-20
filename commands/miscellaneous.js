const Discord = require('discord.js');

const help = (message, client, _args, _api, _db, _cache) => {
  let embed = new Discord.MessageEmbed()
    .setColor('#85dbfc')
    .setAuthor('Sekai ＊ 世界', client.user.displayAvatarURL(), 'https://top.gg/bot/772460495949135893')
    .setTitle('Sekai Help')
    .setDescription('Hi! This is **Sekai**. I am a multipurpose Discord bot to serve you. よろしくおねがいします！')
    .addFields(
      { name: 'Usage', value: '`&<command> [options]`', inline: true },
      { name: 'Example', value: '`&help`', inline: true },
      { name: 'Commands', value: '**See **`&commands`** for commands!**', inline: true })
    .setTimestamp()
    .setFooter(`Requested by: ${message.author.tag}`, message.author.displayAvatarURL());
  message.author.send(embed)
    .then(() => message.react('📜'))
    .catch(() => message.channel.send(embed)
    .catch(console.error));
}

const commands = (message, client, _args, _api, _db, _cache) => {
  let embed = new Discord.MessageEmbed()
    .setColor('#85dbfc')
    .setAuthor('Sekai ＊ 世界', client.user.displayAvatarURL(), 'https://top.gg/bot/772460495949135893')
    .setTitle('Sekai Commands')
    .setDescription('The following commands are the things I can do.')
    .addFields(
      { name: 'Miscellaneous', value: '`&help` **=>** Shows the help text.\n\
`&commands` **=>** Shows this text.\n\
`&info` **=>** Shows information about the Sekai bot.\n\
`&user [@user]` **=>** Shows information about the user.\n\
`&server` **=>** Shows information about the server.\n\
`&avatar [@user]` **=>** Shows the avatar of the user.\n\
`&vote` **=>** Shows the vote link and status.', inline: true },
      { name: 'osu!', value: '`&profile <osuUserId | @user>` **=>** Shows osu! profile of user.\n\
`&setprofile <osuUserId>` **=>** Sets the osu! user ID of yourself in Sekai database.', inline: true })
    .setTimestamp()
    .setFooter(`Requested by: ${message.author.tag}`, message.author.displayAvatarURL());
  message.author.send(embed)
    .then(() => message.react('📜'))
    .catch(() => message.channel.send(embed)
    .catch(console.error));
}

const info = (message, client, _args, api, _db, _cache) => api.getStats(client.user.id)
  .then(stats => message.channel.send(new Discord.MessageEmbed()
    .setColor('#85dbfc')
    .setAuthor('Sekai ＊ 世界', client.user.displayAvatarURL(), 'https://top.gg/bot/772460495949135893')
    .setTitle('Sekai Bot Information')
    .addFields(
      { name: 'API Latency', value: `**${client.ws.ping}** ms`, inline: true },
      { name: 'Server Count', value: `**${stats.serverCount}** Servers`, inline: true },
      { name: 'Shard Count', value: `**${stats.shardCount}** Shards`, inline: true })
    .setTimestamp()
    .setFooter(`Requested by: ${message.author.tag}`, message.author.displayAvatarURL()))
    .catch(console.error))
  .catch(console.error);

const user = (message, client, _args, api, _db, cache) => {
  let iuser = message.author;
  if (message.mentions.users.first()) iuser = message.mentions.users.first();
  cache.getUserData(iuser.id)
    .then(data => api.hasVoted(iuser.id)
      .then(voted => {
        let embed = new Discord.MessageEmbed()
          .setColor('#85dbfc')
          .setAuthor('Sekai ＊ 世界', client.user.displayAvatarURL(), 'https://top.gg/bot/772460495949135893')
          .setTitle(`${iuser.tag} User Information`)
          .addFields(
            { name: 'User ID', value: iuser.id, inline: true },
            { name: 'Discord Join Timestamp', value: iuser.createdAt.toUTCString(), inline: true})
          .setTimestamp()
          .setFooter(`Requested by: ${message.author.tag}`, message.author.displayAvatarURL());
        if (message.guild) embed.addField('Server Join Timestamp', message.guild.member(iuser).joinedAt.toUTCString(), false);
        if (message.author == iuser) embed.addField('User Latency', `**${Date.now() - message.createdTimestamp}** ms`, true);
        embed.addFields(
          { name: 'Voted', value: `${voted ? 'Yes' : 'No'}`, inline: true },
          { name: 'osu! ID', value: `${data.osu_profile ? data.osu_profile : 'Not Provided'}`, inline: true});
        message.channel.send(embed)
          .catch(console.error);
      })
      .catch(console.error))
    .catch(console.error);
}

const avatar = (message, client, _args, _api, _db, _cache) => {
  let user = message.author;
  if (message.mentions.users.first()) user = message.mentions.users.first();
  message.channel.send(new Discord.MessageEmbed()
    .setColor('#85dbfc')
    .setAuthor('Sekai ＊ 世界', client.user.displayAvatarURL(), 'https://top.gg/bot/772460495949135893')
    .setTitle(`${user.tag}'s Avatar`)
    .setImage(user.displayAvatarURL())
    .setTimestamp()
    .setFooter(`Requested by: ${message.author.tag}`, message.author.displayAvatarURL()))
    .catch(console.error);
}

const server = guild = (message, client, _args, _api, _db, cache) => {
  if (!message.guild) message.channel.send('This command can only be run in a server!')
    .catch(console.error);
  else cache.getGuildData(message.guild.id)
    .then(data => message.channel.send(new Discord.MessageEmbed()
      .setColor('#85dbfc')
      .setAuthor('Sekai ＊ 世界', client.user.displayAvatarURL(), 'https://top.gg/bot/772460495949135893')
      .setTitle(`${message.guild.name} Server Information`)
      .addFields(
        { name: 'Server ID', value: message.guild.id, inline: true },
        { name: 'Server Create Timestamp', value: message.guild.createdAt.toUTCString(), inline: true },
        { name: 'Owner', value: `<@${message.guild.owner.user.id}>`, inline: true },
        { name: 'Sekai Prefix', value: data.prefix, inline: true })
      .setTimestamp()
      .setFooter(`Requested by: ${message.author.tag}`, message.author.displayAvatarURL()))
      .catch(console.error))
    .catch(console.error);
}

const vote = (message, client, _args, api, _db, _cache) => api.hasVoted(message.author.id)
  .then(voted => message.channel.send(new Discord.MessageEmbed()
    .setColor('#85dbfc')
    .setAuthor('Sekai ＊ 世界', client.user.displayAvatarURL(), 'https://top.gg/bot/772460495949135893')
    .setTitle(`Vote Sekai Bot`)
    .setDescription('You can support our project by voting our bot! \nYou can only vote once every 12 hours.')
    .addFields(
      { name: 'Vote', value: 'You can vote from the following link. \nhttps://top.gg/bot/772460495949135893/vote', inline: true },
      { name: 'Voted', value: `${voted ? 'Yes' : 'No'}`, inline: true })
    .setTimestamp()
    .setFooter(`Requested by: ${message.author.tag}`, message.author.displayAvatarURL()))
    .catch(console.error))
  .catch(console.error);

const invite = (message, client, _args, api, _db, _cache) => api.getStats(client.user.id)
  .then(stats => message.channel.send(new Discord.MessageEmbed()
    .setColor('#85dbfc')
    .setAuthor('Sekai ＊ 世界', client.user.displayAvatarURL(), 'https://top.gg/bot/772460495949135893')
    .setTitle('Invite Sekai to your Server')
    .addFields(
      { name: 'Invite Link', value: `https://top.gg/bot/772460495949135893/invite`, inline: true },
      { name: 'Server Count', value: `**${stats.serverCount}** Servers`, inline: true })
    .setTimestamp()
    .setFooter(`Requested by: ${message.author.tag}`, message.author.displayAvatarURL()))
    .catch(console.error))
  .catch(console.error)

module.exports = {
  help, commands,
  info, user, avatar,
  guild, server,
  vote, invite
};
