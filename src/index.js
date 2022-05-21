require('dotenv').config();
const mailService = require('./mail-service');
const discordBot = require('./discord-bot');
const apiService = require('./api-service');
const logger = require('./common/logger');

function refreshIzurviveLink() {
    apiService.requestIzurviveLoginEmail()
        .then(response => {
            logger.info(response);
            mailService.getIzurviveLoginLink()
                .then(izurviveLoginLink => {
                    if (izurviveLoginLink) {
                        logger.log(`New link received : ${izurviveLoginLink}`);
                        discordBot.sendMessage(`New IZurvive map link : ${izurviveLoginLink}`);
                    } else {
                        logger.error('No login email found.');
                    }
                });
        })
        .catch(err => logger.error(err));
}

refreshIzurviveLink();
setInterval(refreshIzurviveLink, 1000 * 60 * 60 * 12);
