# Remote MYSQL Local Database Dumps
## Does automated daily dumps of your remote MYSQL database to your local machine and pings you on Discord

### Features
- Dumps your remote MYSQL database into the `backups` directory.
- Sends you notifications in a Discord channel through a webhook.
- Automatically deletes old backups after a certain number of days to clear space on your local disk.

### System requirements
- Node.js v16 or higher.
- The modified version of [mysqldump](https://github.com/bradzacher/mysqldump) in our `node_modules` directory to work with node v16 and above.
- Recommended: PM2 to run the process.

**Note:** This does require your local machine being turned on, the process to be running and a stable internet connection to work. If the backup fails at the pre-defined backup time, it won't run again until the following day.

### Installation
```
git clone https://github.com/pixxies/Remote-MYSQL-Local-Database-Dumps.git
npm install
```

Change the values in `config_sample.json` to your details and rename the file to `config.json`.
```js
{
    "backup_filename_prefix": "bot_name_here",
    "mysql":
        {
            "host": "db.host.tld",
            "user": "db_user",
            "password": "db_pass",
            "database": "db_name"
        },
    "discord": 
        { 
            "webhook": "https://discord.com/api/webhooks/CHANNEL_ID/WEBHOOK",
            "username": "Webhook Name",
            "owner_id": "bot_owner_discord_id"
        },
    "days_to_keep": 1
}
```
You'll need to create a Discord webhook in a channel and paste the link into the config file above.

The `owner_id` is the Discord ID of the person the webhook will ping for notifications. You can make the webhook ping a role instead by prefixing a role ID with `&`, for example `&761916863847333928`.

Set the number of days to keep old dumps with the `days_to_keep` value in your `config.json` file.

### Startup

1. Open a new terminal window in your project directory.
2. Run `pm2 startup index.js --name mysql_backup --time`.
3. You'll recieve confirmation of startup and all events in the logs. Run `pm2 logs mysql_backup` to see the logs.
