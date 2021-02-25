const clear = (message, _client, args, _api, _db) => {
  if (!message.guild) message.channel.send('This command can only be run in a server!')
    .catch(console.error);
  else if (!message.member.hasPermission('MANAGE_MESSAGES')) message.channel.send('You need `Manage Messages` permission to run this command!')
    .catch(console.error);
  else if (args.length < 1) message.channel.send('Please provide the number of messages to delete!')
    .catch(console.error);
  else {
    let num = parseInt(args[0]);
    if (num <= 0 || isNan(num)) message.channel.send('The number of messages to delete must be greater than 0!')
      .catch(console.error);
    else message.delete()
      .then(() => message.channel.messages.fetch({ limit: num })
        .then(fetched => message.channel.bulkDelete(fetched)
          .then(messages => message.channel.send(`Successfully deleted ${messages.size} messages.`)
            .then(m => setTimeout(() => m.delete(), 5e3))
            .catch(console.error))
          .catch(() => message.channel.send('Couldn\'t delete the messages!')
            .catch(console.error))))
      .catch(() => message.channel.send('Couldn\'t delete the messages!')
        .catch(console.error));
  }
}

module.exports = {
  clear
};
