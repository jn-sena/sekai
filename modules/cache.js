const { default_guild_doc, default_user_doc } = require('./essentials');

class Cache {
  static db = null;
  static guildDataCaches = {};
  static userDataCaches = {};
  static moderationCaseCaches = {};

  static loadDatabase(database) {
    this.db = database;
  }

  static cacheGuildData(guildId) {
    return new Promise((resolve, reject) => this.db.collection('guilds').doc(guildId).get()
      .then(documentSnapshot => {
        if (!documentSnapshot.exists) this.db.collection('guilds').doc(guildId).set(default_guild_doc)
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
      })
      .catch(reject));
  }

  static cacheModerationCases(guildId) {
    return new Promise((resolve, reject) => this.db.collection('guilds').doc(guildId).collection('cases').get()
      .then(querySnapshot => {
        if (!this.moderationCaseCaches[guildId]) this.moderationCaseCaches[guildId] = {};
        if (!querySnapshot.empty) querySnapshot.forEach(documentSnapshot => {
          let data = documentSnapshot.data();
          this.moderationCaseCaches[guildId][documentSnapshot.id] = data;
        });
        resolve(this.moderationCaseCaches[guildId]);
      })
      .catch(reject));
  }

  static cacheUserData(userId) {
    return new Promise((resolve, reject) => this.db.collection('users').doc(userId).get()
      .then(documentSnapshot => {
        if (!documentSnapshot.exists) this.db.collection('users').doc(userId).set(default_user_doc)
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
      })
      .catch(reject));
  }

  static getGuildData(guildId) {
    return new Promise((resolve, reject) => {
      if (this.guildDataCaches.hasOwnProperty(guildId)) resolve(this.guildDataCaches[guildId]);
      else this.db.collection('guilds').doc(guildId).get()
        .then(documentSnapshot => {
          if (!documentSnapshot.exists) this.db.collection('guilds').doc(guildId).set(default_guild_doc)
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
        })
        .catch(reject)
    });
  }

  static getModerationCases(guildId) {
    return new Promise((resolve, reject) => {
      if (!this.moderationCaseCaches[guildId]) this.db.collection('guilds').doc(guildId).collection('cases').get()
        .then(querySnapshot => {
          if (!this.moderationCaseCaches[guildId]) this.moderationCaseCaches[guildId] = {};
          if (!querySnapshot.empty) querySnapshot.forEach(documentSnapshot => {
            let data = documentSnapshot.data();
            this.moderationCaseCaches[guildId][documentSnapshot.id] = data;
          })
          resolve(this.moderationCaseCaches[guildId]);
        })
        .catch(reject);
      else resolve({});
    });
  }

  static getUserData(userId) {
    return new Promise((resolve, reject) => {
      if (this.userDataCaches.hasOwnProperty(userId)) resolve(this.userDataCaches[userId]);
      else this.db.collection('users').doc(userId).get()
        .then(documentSnapshot => {
          if (!documentSnapshot.exists) this.db.collection('users').doc(userId).set(default_user_doc)
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
        })
        .catch(reject);
    });
  }
}

module.exports = Cache;
