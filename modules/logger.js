const Discord = require('discord.js');

class Logger {
  static Cache = null;

  static loadCache(Cache) {
    this.Cache = Cache;
  }

  static log(guild, embedData) {
    if (guild !== null) Cache.getGuildData(guild.id)
      .then(data => {
        if (data.logs_channel) {
          let embed = new Discord.MessageEmbed()
            .setColor('#85dbfc')
            .setTimestamp()
            .setAuthor(embedData.author ? embedData.author.tag : guild.name, embedData.author ? embedData.author.displayAvatarURL() : guild.iconURL())
            .setFooter(embedData.footer ? embedData.footer : 'log');
          if (embedData.fields) embed.addFields(embedData.fields);
          guild.channels.get(data.logs_channel).send(embed)
            .catch(console.error);
        }
      })
      .catch(console.error);
  }
}

module.exports = Logger;
