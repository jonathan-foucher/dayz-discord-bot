const path = require('path');
require('dotenv').config({path: path.resolve(__dirname, '../.env')});

const mailService = require('./mail-service');
const discordBot = require('./discord-bot');
const apiService = require('./api-service');
const logger = require('./common/logger');
const {getTweetIds} = require('./twitter-api-service');

const izurviveChannelId = process.env.IZURVIVE_LOGIN_CHANNEL_ID;
const twitterChannelId = process.env.TWITTER_CHANNEL_ID;

function refreshIzurviveLink() {
    apiService.requestIzurviveLoginEmail()
        .then(() => {
            setTimeout(() => {
                mailService.getIzurviveLoginLink()
                    .then(izurviveLoginLink => {
                        if (izurviveLoginLink) {
                            logger.info(`New link received : ${izurviveLoginLink}`);
                            discordBot.sendMessage(`New IZurvive map link : ${izurviveLoginLink}`, izurviveChannelId);
                        } else {
                            logger.error('No login email found.');
                        }
                    });
            }, 1000 * 10);
        })
        .catch(err => logger.error(err));
}

function refreshDayzTweets() {
    discordBot.getChannelBotMessages(twitterChannelId)
        .then(messages => {
            const tweetMessages = messages.filter(message => message && message.content.match(/^https:\/\/twitter\.com\/DayZ\/status\/\d+$/));

            let lastTweetId;
            if (tweetMessages && tweetMessages.length) {
                const mostRecentMessage = tweetMessages.reduce(function (prev, current) {
                    if (current.createdTimestamp > prev.createdTimestamp) {
                        return current;
                    } else {
                        return prev;
                    }
                });
                lastTweetId = mostRecentMessage.content.substring(mostRecentMessage.content.lastIndexOf('/') + 1);
            }

            getTweetIds(lastTweetId).then(tweetIds =>
                tweetIds.forEach(tweetId =>
                    discordBot.sendMessage(`https://twitter.com/DayZ/status/${tweetId}`, twitterChannelId)
                ));
        });
}

refreshIzurviveLink();
setInterval(refreshIzurviveLink, 1000 * 60 * 60 * 12);

setTimeout(() => refreshDayzTweets(), 5000);
setInterval(refreshDayzTweets, 1000 * 60 * 15);
