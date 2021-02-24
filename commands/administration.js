const Cache = require('../modules/cache');

const prefix = (message, _client, args, _api, db) => {
  if (!message.guild) message.channel.send('This command can only be run in a server!')
    .catch(console.error);
  else if (!message.member.hasPermission('MANAGE_MESSAGES')) message.channel.send('You need `Manage Messages` permission to run this command!')
    .catch(console.error);
  else if (args.length < 1) message.channel.send('Please provide a prefix!')
    .catch(console.error);
  else db.collection('guilds').doc(message.guild.id).set({
    prefix: args[0]
  }, { merge: true })
    .then(() => Cache.cacheGuildData(message.guild.id))
    .then(() => message.channel.send(`Successfully set server prefix as \`${args[0]}\`.`)
      .catch(console.error))
    .catch(console.error);
}

const autorole = (message, _client, _args, _api, db) => {
  if (!message.guild) message.channel.send('This command can only be run in a server!')
    .catch(console.error);
  else if (!message.member.hasPermission('MANAGE_ROLES')) message.channel.send('You need `Manage Roles` permission to run this command!')
    .catch(console.error);
  else if (!message.mentions.roles.first()) message.channel.send('Please mention a role!')
    .catch(console.error);
  else Cache.getGuildData(message.guild.id)
    .then(data => {
      let roles = data.autoroles;
      let addition = true;
      if (roles.includes(message.mentions.roles.first().id)) {
        roles.splice(roles.indexOf(message.mentions.roles.first().id), 1);
        addition = false;
      }
      else roles.push(message.mentions.roles.first().id);
      db.collection('guilds').doc(message.guild.id).set({
        autoroles: roles
      }, { merge: true })
        .then(() => Cache.cacheGuildData(message.guild.id))
        .then(() => message.channel.send(`Successfully ${addition ? 'added' : 'removed'} <@&${message.mentions.roles.first().id}> ${addition ? 'to': 'from'} autoroles.`)
          .catch(console.error))
        .catch(console.error);
    })
    .catch(console.error);
}

module.exports = {
  prefix, autorole
};
