 const logger = require('./common/logger')

const Imap = require('imap');
const {simpleParser} = require('mailparser');

const imapConfig = {
    user: process.env.EMAIL_ADDRESS,
    password: process.env.EMAIL_PASSWORD,
    host: 'outlook.office365.com',
    port: 993,
    tls: true,
};

const izurvive = {
    name: 'iZurvive',
    loginEmailAddress: 'noreply@izurvive.com',
    loginEmailSubject: 'iZurvive Login Email',
};

getEmails = () => {
    let izurviveLoginLink;
    try {
        const imap = new Imap(imapConfig);
        imap.once('ready', () => {
            imap.openBox('INBOX', false, () => {
                imap.search(['UNSEEN', ['SINCE', new Date()]], (err, results) => {
                    const f = imap.fetch(results, {bodies: ''});
                    f.on('message', msg => {
                        msg.on('body', stream => {
                            simpleParser(stream, async (err, parsed) => {
                                const {from, subject, text} = parsed;
                                const regExLink = /https:\/\/izurvive\.com\/users\/log_in\/[^\s]{2,}/g;

                                if (from.value[0].name === izurvive.name && from.value[0].address === izurvive.loginEmailAddress && subject === izurvive.loginEmailSubject) {
                                    izurviveLoginLink = regExLink.exec(text)[0];
                                }
                            });
                        });
                        msg.once('attributes', attrs => {
                            const {uid} = attrs;
                            imap.addFlags(uid, ['\\Seen'], () => {
                                // Mark the email as read after reading it
                            });
                        });
                    });
                    f.once('error', ex => {
                        return Promise.reject(ex);
                    });
                    f.once('end', () => {
                        if (izurviveLoginLink) {
                            logger.log(`New link received : ${izurviveLoginLink}`);
                        } else {
                            logger.error('No login email found.');
                        }
                        imap.end();
                    });
                });
            });
        });

        imap.connect();

        return izurviveLoginLink;
    } catch (ex) {
        logger.error('Error while reading emails :');
        logger.error(ex);
    }
};

module.exports = { getEmails }
