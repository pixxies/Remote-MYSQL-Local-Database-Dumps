const fetch = require('node-fetch')
const mysqldump = require('mysqldump')
var cron = require('node-cron')
var fs = require('fs')
const config = require("./config.json")

console.log("[START]  Database backup manager started!")

try {

    cron.schedule('0 00 11 * * *', () => {
        // Running backups daily at 11 am UTC

        var n = new Date();
        var d = n.getUTCDate();
        var m = n.getUTCMonth();
        var y = n.getUTCFullYear();

        var D = d
        if(D < 10) D = '0' + D

        var M = m + 1
        if(M < 10) M = '0' + M
        
        var date = y + '_' + M + '_' + D


        // MYSQL

        console.log(`[BACKUP] Creating backup "${config.backup_filename_prefix}-${date}.sql.gz"...`)
        
        mysqldump({
            
            connection: {
                host: config.mysql.host,
                user: config.mysql.user,
                password: config.mysql.password,
                database: config.mysql.database
            },
            dumpToFile: __dirname + '/backups/' + config.backup_filename_prefix + '-' + date + '.sql.gz',
            compressFile: true,

        }).then(res => { 

            console.log(`[DONE]   Backup \"${config.backup_filename_prefix}-${date}.sql.gz\" created!`)

            var message = {
                "embed": {
                    "title": ":information_source: Backup complete!",
                    "description": `<:greentick:678397805454295079> Backup \`${config.backup_filename_prefix}-${date}.sql.gz\` created!`,
                    "color": 14561896
                }
            }

            // Send to #database-backups channel
            fetch(config.discord.webhook, {
                method: 'POST',
                headers: 
                    {
                        'Content-Type': 'application/json'
                    },
                body: JSON.stringify({"username": config.discord.username, "content": "<@"+config.discord.owner_id+">", "embeds": [ message.embed ]})
            })

            // Delete old backup
            var old_n = new Date();
            old_n.setDate(old_n.getDate() - config.days_to_keep);

            var old_d = old_n.getUTCDate();
            var old_m = old_n.getUTCMonth();
            var old_y = old_n.getUTCFullYear();
    
            var old_D = old_d
            if(old_D < 10) old_D = '0' + old_D
    
            var old_M = old_m + 1
            if(old_M < 10) old_M = '0' + old_M
            
            var old_date = old_y + '_' + old_M + '_' + old_D

            var oldFile = __dirname + '/backups/' + config.backup_filename_prefix + '-' + old_date + '.sql.gz'

            fs.unlink(oldFile, (err) => {

                if (err) return console.error(err)
              
                // Old backup removed
                console.log(`[DELETE] Backup \"${config.backup_filename_prefix}-${old_date}.sql.gz\" deleted!`)

            })

        });

    }, {
        scheduled: true,
        timezone: "UTC"
    });

} catch (err) {

    console.error(err)

    var message = {
        "embed": {
            "title": ":warning: Backup failed!",
            "description": `<:redtick:678397805458620461> Backup \`${config.backup_filename_prefix}-${date}.sql.gz\` failed!\n\n\`\`\`\n${err}\`\`\``,
            "color": 14561896
        }
    }

    // Send to #database-backups channel
    fetch(config.discord.webhook, {
        method: 'POST',
        headers: 
            {
                'Content-Type': 'application/json'
            },
        body: JSON.stringify({"username": config.discord.username, "content": "<@"+config.discord.owner_id+">", "embeds": [ message.embed ]})
    })

}