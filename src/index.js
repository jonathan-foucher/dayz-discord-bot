require('dotenv').config();
const mailService = require('./mail-service');
const discordBot = require('./discord-bot');
const logger = require("./common/logger");

function refreshIzurviveLink() {
    mailService.getIzurviveLoginLink()
        .then(izurviveLoginLink => {
            if (izurviveLoginLink) {
                logger.log(`New link received : ${izurviveLoginLink}`);
                discordBot.sendMessage(`New IZurvive map link : ${izurviveLoginLink}`);
            } else {
                logger.error('No login email found.');
            }
        });
}

refreshIzurviveLink();
setInterval(refreshIzurviveLink, 1000*30);
