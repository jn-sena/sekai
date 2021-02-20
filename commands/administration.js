const prefix = (message, _client, args, _api, db, cache) => {
  if (!message.guild) message.channel.send('This command can only be run in a server!')
    .catch(console.error);
  else if (!message.member.hasPermission('MANAGE_MESSAGES')) message.channel.send('You need `Manage Messages` permission to run this command!')
    .catch(console.error);
  else if (args.length < 1) message.channel.send('Please provide a prefix!')
    .catch(console.error);
  else db.collection('guilds').doc(message.guild.id).set({
    prefix: args[0]
  }, { merge: true })
    .then(() => cache.cacheGuildData(message.guild.id))
    .then(() => message.channel.send(`Successfully set server prefix as \`${args[0]}\`.`)
      .catch(console.error))
    .catch(console.error);
}

module.exports = {
  prefix
};
