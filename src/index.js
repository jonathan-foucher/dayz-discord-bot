const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const mailService = require('./mail-service');
const discordBot = require('./discord-bot');
const apiService = require('./api-service');
const logger = require('./common/logger');

function refreshIzurviveLink() {
    apiService.requestIzurviveLoginEmail()
        .then(() => {
            setTimeout(() => {
            mailService.getIzurviveLoginLink()
                .then(izurviveLoginLink => {
                    if (izurviveLoginLink) {
                        logger.info(`New link received : ${izurviveLoginLink}`);
                        discordBot.sendMessage(`New IZurvive map link : ${izurviveLoginLink}`);
                    } else {
                        logger.error('No login email found.');
                    }
                });
            }, 1000*10);
        })
        .catch(err => logger.error(err));
}

refreshIzurviveLink();
setInterval(refreshIzurviveLink, 1000 * 60 * 60 * 12);
