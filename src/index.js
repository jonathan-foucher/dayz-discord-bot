require('dotenv').config();
const mailService = require('./mail-service');
const logger = require("./common/logger");

logger.info(mailService.getEmails());
