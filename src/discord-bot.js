const {Client, Intents} = require('discord.js');
const logger = require('./common/logger');

const botToken = process.env.DISCORD_BOT_TOKEN;

const client = new Client({intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MEMBERS]});

client.on('ready', () => {
    logger.info(`Logged in as ${client.user.tag}!`);
});

client.login(botToken);

sendMessage = (message, channelId) => {
    if (client.isReady()) {
        client.channels.fetch(channelId)
            .then(channel => channel.send(message))
            .catch(logger.error);
    }
}

getChannelBotMessages = async (channelId) => {
    if (client.isReady()) {
        const channel = await client.channels.fetch(channelId);
        const messagesMap = await channel.messages.fetch();
        const botMessages = Array.from(messagesMap.values())
            .filter(message => message.author.id === client.user.id);
        return Promise.resolve(botMessages);
    }
}

module.exports = {sendMessage, getChannelBotMessages};
