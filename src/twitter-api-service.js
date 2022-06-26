const axios = require('axios');

const logger = require('./common/logger');

const clientId = process.env.TWITTER_API_KEY;
const clientSecret = process.env.TWITTER_API_KEY_SECRET;
const TWITTER_AUTH_URL = 'https://api.twitter.com/oauth2/token?grant_type=client_credentials';
const GET_TWEETS_API_URL = 'https://api.twitter.com/2/users/550528636/tweets?max_results=100&exclude=retweets,replies';

let bearerToken = '';

getAuthToken = async () => {
    logger.info('Refreshing twitter token');
    let buffer = new Buffer.from(`${clientId}:${clientSecret}`);
    let b64Credentials = buffer.toString('base64');

    const headers = {
        'Authorization': `Basic ${b64Credentials}`
    };

    const response = await axios.post(TWITTER_AUTH_URL, null, {
        headers: headers
    });

    return response.data.access_token;
}

getNextPage = async (sinceTweetId, paginationToken) => {
    logger.info('Get tweets page');
    const url = `${GET_TWEETS_API_URL}${sinceTweetId ? '&since_id=' + sinceTweetId : ''}${paginationToken ? '&pagination_token=' + paginationToken : ''}`;

    const headers = {
        'Authorization': `Bearer ${bearerToken}`
    };

    try {
        return await axios.get(url, {
            headers: headers
        });
    } catch (e) {
        if (e.response.status === 401) {
            bearerToken = await getAuthToken();
            return await getNextPage(sinceTweetId, paginationToken);
        } else {
            logger.error(e);
        }
    }
}

getTweetIds = async (sinceTweetId) => {
    const tweetIds = [];
    const firstPage = await getNextPage(sinceTweetId, null);
    if (firstPage.data.meta.result_count === 0) {
        return Promise.resolve([]);
    }
    firstPage.data.data.forEach(tweet => tweetIds.push(tweet.id));
    let paginationToken = firstPage.data.meta.next_token;
    while (paginationToken) {
        const nextPage = await getNextPage(sinceTweetId, paginationToken);
        nextPage.data.data.forEach(tweet => tweetIds.push(tweet.id));
        paginationToken = nextPage.data.meta.next_token;
    }
    return Promise.resolve(tweetIds.reverse());
}

module.exports = {getTweetIds};
