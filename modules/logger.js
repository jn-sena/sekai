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
    if (guild !== null) this.Cache.getGuildData(guild.id)
      .then(data => {
        let channelId = moderation ? data.moderation_logs_channel : data.logs_channel;
        if (channelId) {
          let embed = new Discord.MessageEmbed()
            .setColor('#85dbfc')
            .setTimestamp()
            .setAuthor(embedData.author ? embedData.author.tag : guild.name, embedData.author ? embedData.author.displayAvatarURL() : guild.iconURL())
            .setFooter(embedData.footer ? embedData.footer : 'log');
          if (embedData.fields) embed.addFields(embedData.fields);
          guild.channels.get(channelId).send(embed)
            .catch(console.error);
        }
      })
      .catch(console.error);
  }

  static registerCase(guildId, moderationData) {
    return new Promise((resolve, reject) => this.Cache.getModerationCases(guildId)
      .then(data => {
        let keys = Object.keys(data).sort((a, b) => (a - b));
        let newId = keys[keys.length - 1] + 1;
        this.db.collection('guilds').doc(guildId).collection('cases').doc(newId).set(moderationData)
          .then(() => resolve(newId)
          .catch(reject));
      })
      .catch(reject));
  }
}

module.exports = Logger;
