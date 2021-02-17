<p align="center">
  <h1 align="center">Sekai ＊ 世界</h1>
  <h4 align="center">A multipurpose Discord bot.</h4>

  <h6 align="center">
    <a href="https://github.com/acedron/sekai">
      <img src="https://img.shields.io/github/license/acedron/sekai?style=for-the-badge" alt="License"></a>
    <a href="https://github.com/acedron/sekai/commits/master">
      <img src="https://img.shields.io/maintenance/yes/2021?style=for-the-badge" alt="Maintenance"></a>
    <a href="https://github.com/acedron/sekai/commit/master">
      <img src="https://img.shields.io/github/last-commit/acedron/sekai?style=for-the-badge" alt="Last Commit"></a>
    <a href="https://github.com/acedron/sekai/actions">
      <img src="https://img.shields.io/github/workflow/status/acedron/sekai/Node.js%20CI?style=for-the-badge" alt="Continuous Integration"></a><br/>
    <a href="https://www.heroku.com">
      <img src="https://img.shields.io/badge/Running%20On-Heroku-blueviolet?style=for-the-badge" alt="Running On"></a>
    <a href="https://discord.js.org">
      <img src="https://img.shields.io/badge/Powered%20By-discord.js-blue?style=for-the-badge" alt="Powered By"></a>
    <a href="https://firebase.google.com">
      <img src="https://img.shields.io/badge/Powered%20By-Firebase-orange?style=for-the-badge" alt="Powered By"></a>
  </h6>

  <h3 align="center">
    <a href="https://top.gg/bot/772460495949135893/invite">
        Invite to Your Server!</a>
  </h3>

  <h4 align="center">
    This project is still a work in progress!
  </h4>
</p>

## Usage

* Prefix: `&`
* See `&help` command on Discord for more information.

## Installation for Development

* You can install the bot locally and develop it further.
* You need to have `node`, `git` and `npm` installed.

```bash
$ git clone https://github.com/acedron/sekai.git
$ cd sekai
$ npm i
```

* Create a file named `tokens.json` in the directory and fill in like this.
* You can download the `firebaseCredentials` from Firebase as a JSON file.

```json
{
  "clientToken": "Client Token",
  "topggToken": "top.gg API Token",
  "firebaseCredentials": {
    "type": "service_account",
    "project_id": "Firebase Project ID",
    "private_key_id": "Firebase Private Key ID",
    "private_key": "Firebase Private Key",
    "client_email": "Firebase Client E-Mail",
    "client_id": "Firebase Client ID",
    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
    "token_uri": "https://oauth2.googleapis.com/token",
    "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
    "client_x509_cert_url": "Firebase Client Cert URL"
  }
}
```

```bash
$ npm start
```
