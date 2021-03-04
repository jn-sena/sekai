const Discord = require('discord.js');

class Logger {
  static Cache = null;
  static db = null;

  static loadCache(Cache) {
    this.Cache = Cache;
  }

  static loadDatabase(db) {
    this.db = db;
  }

  static log(guild, embedData, moderation = false) {
    return new Promise((resolve, reject) => {
      if (guild !== null) this.Cache.getGuildData(guild.id)
        .then(data => {
          let channelId = moderation ? data.moderation_logs_channel : data.logs_channel;
          if (channelId) {
            let embed = new Discord.MessageEmbed()
              .setColor('#85dbfc')
              .setTimestamp()
              .setDescription(embedData.description ? embedData.description : 'Not provided.')
              .setAuthor(embedData.author ? embedData.author.tag : guild.name, embedData.author ? embedData.author.displayAvatarURL() : guild.iconURL())
              .setFooter(embedData.footer ? embedData.footer : 'log');
            if (embedData.fields) embed.addFields(embedData.fields);
            guild.channels.resolve(channelId).send(embed)
              .then(resolve)
              .catch(() => {});
          } else resolve();
        })
        .catch(reject);
    });
  }
}

module.exports = Logger;
