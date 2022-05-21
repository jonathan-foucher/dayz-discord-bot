const { Client, Intents } = require('discord.js');
const logger = require('./common/logger');

const botToken = process.env.DISCORD_BOT_TOKEN;
const channelId = process.env.IZURVIVE_LOGIN_CHANNEL_ID;

const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MEMBERS] });

client.on('ready', () => {
    logger.info(`Logged in as ${client.user.tag}!`);
});

client.login(botToken);

sendMessage = (message) => {
    if (client.isReady()) {
        client.channels.fetch(channelId)
            .then(channel => channel.send(message))
            .catch(logger.error);
    }
}

module.exports = { sendMessage };
