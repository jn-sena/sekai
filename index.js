const Discord = require('discord.js');
const Topgg = require('@top-gg/sdk');
const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

const Cache = require('./modules/cache');
const Logger = require('./modules/logger');

// FIXME: Create a file named './tokens.json' and fill it. See README.md.
const tokensObject = require('./tokens.json');
const clientToken = tokensObject.clientToken;
const topggToken = tokensObject.topggToken;
const firebaseCredentials = tokensObject.firebaseCredentials;

const client = new Discord.Client();
const api = new Topgg.Api(topggToken);
if (!tokensObject.nightly) setInterval(() => api.postStats({
  serverCount: client.guilds.cache.size,
  shardCount: client.options.shardCount
}), 30 * 60e3);

admin.initializeApp({
  credential: admin.credential.cert(firebaseCredentials)
});
const db = admin.firestore();
Cache.loadDatabase(db);
Logger.loadCache(Cache);
Logger.loadDatabase(db);

const act_types = ['LISTENING', 'WATCHING', 'PLAYING', 'STREAMING', 'COMPETING'];
const setActivity = () => {
    let type = act_types[Math.floor(Math.random() * act_types.length)];
    // Masterpiece by Some1CP on YouTube.
    client.user.setActivity(`世界 ＊ /help`, { type: type, url: 'https://youtu.be/moZtoMP7HAA' })
      .catch(console.error);
}

let commandModules = [];

client.on('ready', () => {
  console.log(' => Bot authenticated successfully.');
  setActivity();
  setInterval(setActivity, 600e3);

  let commandsPath = path.join(`${__dirname}/commands`);
  fs.readdirSync(commandsPath).forEach(file => commandModules.push(require(`${commandsPath}/${file}`)));
  commandModules.forEach(module => Object.keys(module).forEach(command => {
    if (!tokensObject.nightly) client.api.applications(client.user.id).commands.post({
      data: module[command].data
    });
    else client.api.applications(client.user.id).guilds(tokensObject.nightlyServer).commands.post({
      data: module[command].data
    });
  }));

  client.ws.on('INTERACTION_CREATE', interaction => {
    const command = interaction.data.name.toLowerCase();
    const args = interaction.data.options;

    for (const i of commandModules) if (i[command]) {
      i[command].exec(interaction, client, api, db);
      break;
    }
  });
});

client.on('guildCreate', guild => Cache.cacheGuildData(guild.id).catch(console.error));

client.on('channelCreate', channel => Logger.log(channel.guild, {
  description: `Channel created: <#${channel.id}> (#${channel.name}).`,
  footer: `channelCreate・${channel.id}`
}, false));

client.on('channelDelete', channel => Logger.log(channel.guild, {
  description: `Channel deleted: <#${channel.id}> (#${channel.name}).`,
  footer: `channelDelete・${channel.id}`
}, false));

client.on('channelUpdate', (oldCh, newCh) => {
  if (oldCh) Logger.log(newCh.guild, {
    description: `Channel updated: <#${newCh.id}> (${newCh.name}).`,
    footer: `channelUpdate・${newCh.id}`,
    fields: [{ name: 'Old', value: `Name: ${oldCh.name}\nType: ${oldCh.type}`, inline: true },
      { name: 'New', value: `Name: ${newCh.name}\nType: ${newCh.type}`, inline: true }]
  }, false);
});

client.on('emojiCreate', emoji => Logger.log(emoji.guild, {
  description: `Emoji created: ${emoji} (${emoji.id}).`,
  footer: `emojiCreate・${emoji.id}`
}, false));

client.on('emojiDelete', emoji => Logger.log(emoji.guild, {
  description: `Emoji deleted: ${emoji} (${emoji.id}).`,
  footer: `emojiDelete・${emoji.id}`
}, false));

client.on('emojiUpdate', (oldEm, newEm) => {
  if (oldEm) Logger.log(newEm.guild, {
    description: `Emoji updated: ${emoji} (${emoji.id}).`,
    footer: `emojiUpdate・${emoji.id}`,
    fields: [{ name: 'Old', value: `Name: ${oldEm.name}\nEmoji: ${oldEm}`, inline: true },
      { name: 'New', value: `Name: ${newEm.name}\nEmoji: ${newEm}`, inline: true }]
  }, false);
});

client.on('guildBanAdd', (guild, user) => Logger.log(guild, {
  description: `Member banned: <@${user.id}> (${user.id}).`,
  footer: `guildBanAdd・${user.id}`
}, false));

client.on('guildBanRemove', (guild, user) => Logger.log(guild, {
  description: `Member unbanned: <@${user.id}> (${user.id}).`,
  footer: `guildBanRemove・${user.id}`
}, false));

client.on('guildMemberAdd', member => Cache.getGuildData(member.guild.id)
  .then(data => {
    Logger.log(member.guild, {
      description: `Member joined: <@${member.id}> (${member.id}).`,
      footer: `guildMemberAdd・${member.id}`
    }, false);
    if (data.autoroles.length >= 1) data.autoroles.forEach(element => member.roles.add(member.guild.roles.cache.get(element))
      .catch(console.error));
  })
  .catch(console.error));

client.on('guildMemberRemove', member => Logger.log(guild, {
  description: `Member left: <@${member.id}> (${member.id}).`,
  footer: `guildMemberRemove・${member.id}`
}, false));

client.on('guildMemberUpdate', (oldMe, newMe) => {
  if (oldMe) Logger.log(newMe.guild, {
    description: `Member updated: <@${newMe.id}> (${newMe.id}).`,
    footer: `guildMemberUpdate・${newMe.id}`,
    fields: [{ name: 'Old', value: `Name: ${oldMe.user.tag}\nNickname: ${oldMe.nickname}`, inline: true },
      { name: 'New', value: `Name: ${newMe.user.tag}\nNickname: ${newMe.nickname}`, inline: true }]
  }, false);
});

client.on('guildUpdate', (oldGu, newGu) => {
  if (oldGu) Logger.log(newGu, {
    description: `Guild updated: ${newGu.name} (${newGu.id}).`,
    footer: `guildUpdate・${newGu.id}`,
    fields: [{ name: 'Old', value: `Name: ${oldGu.name}`, inline: true },
      { name: 'New', value: `Name: ${newGu.name}`, inline: true }]
  }, false);
});

client.on('inviteCreate', invite => Logger.log(invite.guild, {
  description: `Invite created: ${invite.code} at <#${invite.channel.id}>.`,
  footer: `inviteCreate・${invite.code}`
}, false));

client.on('inviteDelete', invite => Logger.log(invite.guild, {
  description: `Invite deleted: ${invite.code} at <#${invite.channel.id}>.`,
  footer: `inviteDelete・${invite.code}`
}, false));

client.on('messageDelete', message => {
  if (!message.author.bot) Logger.log(message.guild, {
    description: `Message deleted: ${message.id}.`,
    footer: `messageDelete・${message.id}`,
    fields: [{ name: 'Content', value: `${message.content}`, inline: true },
      { name: 'Info', value: `Channel: <#${message.channel.id}> (${message.channel.id})\n\
Author: <@${message.author.id}> (${message.author.id})`, inline: true }]
  }, false);
});

client.on('messageDeleteBulk', messages => {
  if (messages.first()) Logger.log(messages.first().guild, {
    description: `Messages deleted in bulk: ${Array.from(messages.values()).length} messages.`,
    footer: `messageDeleteBulk・${Array.from(messages.values()).length}`,
    fields: [{ name: 'Info', value: `Channel: <#${messages.first().channel.id}> (${messages.first().channel.id})`, inline: true }]
  }, false);
});

client.on('messageUpdate', (oldMe, newMe) => {
  if (oldMe && !oldMe.author.bot) Logger.log(newMe.guild, {
    description: `Message updated: ${newMe.id}.`,
    footer: `messageUpdate・${newMe.id}`,
    fields: [{ name: 'Old', value: `${oldMe.content}`, inline: true },
      { name: 'New', value: `${newMe.content}`, inline: true },
      { name: 'Info', value: `Channel: <#${newMe.channel.id}> (${newMe.channel.id})\n\
Author: <@${newMe.author.id}> (${newMe.author.id})`, inline: true }]
  }, false);
});

client.on('roleCreate', role => Logger.log(role.guild, {
  description: `Role created: <@&${role.id}> (${role.id})`,
  footer: `roleCreate・${role.id}`
}, false));

client.on('roleDelete', role => Logger.log(role.guild, {
  description: `Role deleted: <@&${role.id}> (${role.id})`,
  footer: `roleDelete・${role.id}`
}, false));

client.on('roleUpdate', (oldRo, newRo) => {
  if (oldRo) Logger.log(newRo.guild, {
    description: `Role updated: <@&${newRo.id}> (${newRo.id})`,
    footer: `roleUpdate・${newRo.id}`,
    fields: [{ name: 'Old', value: `Name: ${oldRo.name}`, inline: true },
      { name: 'New', value: `Name: ${newRo.name}`, inline: true }]
  }, false);
});

client.on('rateLimit', console.error);
client.on('invalidated', () => process.kill(process.pid, 'SIGTERM'));
client.login(clientToken);
