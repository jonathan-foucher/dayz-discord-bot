const axios = require('axios');

const EMAIL_ADDRESS = process.env.EMAIL_ADDRESS;
const IZURVIVE_LOGIN_REQUEST_URL = 'https://api.izurvive.com/auth/login';

requestIzurviveLoginEmail = async () => {
    return axios.post(IZURVIVE_LOGIN_REQUEST_URL, {
        email: EMAIL_ADDRESS
    });
}

module.exports = { requestIzurviveLoginEmail };
