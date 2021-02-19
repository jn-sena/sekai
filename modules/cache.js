const { default_guild_doc, default_user_doc } = require('./essentials.js');

class Cache {
  static db = null;
  static guildDataCaches = {};
  static userDataCaches = {};

  static loadDatabase(database) {
    db = database;
  }

  static cacheGuildData(guildId) {
    return new Promise(async (resolve, reject) => {
      let documentSnapshot = await db.collection('guilds').doc(guildId).get();
      if (!documentSnapshot.exists) db.collection('guilds').doc(guildId).set(default_guild_doc)
        .then(() => {
          this.guildDataCaches[guildId] = default_guild_doc;
          resolve(default_guild_doc)
        })
        .catch(reject);
      else {
        let data = documentSnapshot.data();
        this.guildDataCaches[guildId] = data;
        resolve(data);
      }
    });
  }

  static cacheUserData(userId) {
    return new Promise(async (resolve, reject) => {
      let documentSnapshot = await db.collection('users').doc(userId).get();
      if (!documentSnapshot.exists) db.collection('users').doc(userId).set(default_user_doc)
        .then(() => {
          this.userDataCaches[userId] = default_user_doc;
          resolve(default_user_doc)
        })
        .catch(reject);
      else {
        let data = documentSnapshot.data();
        this.userDataCaches[userId] = data;
        resolve(data);
      }
    });
  }

  static getGuildData(guildId) {
    return new Promise(async (resolve, reject) => {
      if (this.guildDataCaches.hasOwnProperty(guildId)) resolve(this.guildDataCaches[guildId]);
      else {
        let documentSnapshot = await db.collection('guilds').doc(guildId).get();
        if (!documentSnapshot.exists) db.collection('guilds').doc(guildId).set(default_guild_doc)
          .then(() => {
            this.guildDataCaches[guildId] = default_guild_doc;
            resolve(default_guild_doc)
          })
          .catch(reject)
        else {
          let data = documentSnapshot.data();
          this.guildDataCaches[guildId] = data;
          resolve(data);
        }
      }
    });
  }

  static getUserData(userId) {
    return new Promise(async (resolve, reject) => {
      if (this.userDataCaches.hasOwnProperty(userId)) resolve(this.userDataCaches[userId]);
      else {
        let documentSnapshot = await db.collection('users').doc(userId).get();
        if (!documentSnapshot.exists) db.collection('users').doc(userId).set(default_user_doc)
          .then(() => {
            this.userDataCaches[userId] = default_user_doc;
            resolve(default_user_doc)
          })
          .catch(reject)
        else {
          let data = documentSnapshot.data();
          this.userDataCaches[userId] = data;
          resolve(data);
        }
      }
    });
  }
}

module.exports = Cache;
