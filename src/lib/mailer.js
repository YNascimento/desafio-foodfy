const nodemailer = require('nodemailer')

module.exports = nodemailer.createTransport({
    host: "smtp.mailtrap.io",
    port: 2525,
    auth: {
      user: "46a19798f6f46b",
      pass: "ab8eb5e340a200"
    }
})