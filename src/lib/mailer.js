const nodemailer = require('nodemailer')

module.exports = nodemailer.createTransport({
    host: "smtp.mailtrap.io",
    port: 2525,
    auth: {
      user: "541bcf7fa62ae2",
      pass: "03b48273ada38b"
    }
})