<p align="center">
  <h1 align="center">Sekai ＊ 世界</h1>
  <h4 align="center">A multipurpose Discord bot.</h4>

  <h6 align="center">
    <a href="https://github.com/jn-sena/sekai">
      <img src="https://img.shields.io/github/license/jn-sena/sekai?style=for-the-badge" alt="License" /></a>
    <a href="https://github.com/jn-sena/sekai/commits/main">
      <img src="https://img.shields.io/maintenance/yes/2021?style=for-the-badge" alt="Maintenance" /></a>
    <br/>
  </h6>

  <h2 align="center">
    this project was discontinued in 2021 and archived in 2024.
  </h2>
</p>

## Usage

* You can execute commands by putting `/` at the beginning.
* Example: `/info user @acedron#5561`
* See `/help` for more information.
* See `/commands` for available commands.

## Command Syntax Guide

| Syntax  | Meaning | Example | Example Usage |
| ------- | ------- | ------- | ------------- |
| /command | Base of the command. | **/help** | **/help** |
| <> | Required argument. | /osu profile get `<profile_id>` `[mode]` | /osu profile get `profile_id: 10734834` |
| \[\] | Optional argument. | /info user `[@user]` | /info user `user: @acedron#5561` |
| argument | Any argument. | /osu profile set `<profile_id>` | /osu profile set `profile_id: 0` |
| @argument | Mention user. | /osu profile user `[@user]` `[mode]` | /osu profile user `user: @acedron#5561` |
| @&argument | Mention role. | /autorole `<@&role>` | /autorole `role: @role` |
| #argument | Mention channel. | /logs `<scope>` `<#channel>` | /logs `scope: General Logs` `channel: #logs` |

## Installation for Development

* You can install the bot locally and develop it further.
* You need to have `node`, `git` and `npm` installed.

```bash
$ git clone https://github.com/jn-sena/sekai.git
$ cd sekai
$ npm i
```

* Create a file named `tokens.json` in the directory and fill in like following.
* You can download the `firebaseCredentials` from Firebase as a JSON file.

```json
{
  "nightly": false,
  "nightlyServer": "Server ID that Nightly is in if Present",
  "clientToken": "Client Token",
  "clientId": "Client ID to Use with APIs.",
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
  },
  "osu": {
    "clientId": 0,
    "clientSecret": "osu! API Client Secret"
  }
}
```

You can start the bot with the following command.

```bash
$ npm start
```
