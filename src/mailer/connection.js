import nodemailer from 'nodemailer'
import logger from '../lib/logger.js'
import mailConfig from '../config/mail.js'

const transporter = nodemailer.createTransport(mailConfig[process.env.NODE_ENV])

transporter.verify((error, success) => {
  if (error) {
    logger.error('Error connecting to SMTP server:', error)
  } else {
    logger.info('👻 SMTP server is ready', success)
  }
})

export default transporter
