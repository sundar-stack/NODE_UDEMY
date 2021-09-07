const nodemailer = require('nodemailer');
const pug = require('pug');
const htmlToText = require('html-to-text');

////email handler using class

// new emailHandler(user , url)

module.exports = class Email {
  constructor(user, url) {
    this.to = user.email;
    this.userName = user.userName;
    this.url = url;
    this.from = `Sundar Potlacheruvu <sundercheery422@gmail.com>`;

    // console.log(this);
  }

  newTransport() {
    ////CREATE A TRANSPORT FOR NODEMAILER

    if (process.env.NODE_ENV === 'production') {
      return nodemailer.createTransport({
        service: 'SendGrid',
        auth: {
          user: process.env.SENDGRID_USERNAME,
          pass: process.env.SENDGRID_PASSWORD,
        },
      });
    }

    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }

  async send(template, subject) {
    ///SEND THE ACTUAL EMAILS
    // const html = pug.renderFile(`${__dirname}/../views/${template}.pug`, {
    //   userName: this.userName,
    //   url: this.url,
    //   subject,
    // });

    const mailOptions = {
      from: this.from,
      to: this.to,
      subject: template,
      text: subject,
      // html,
      // text: htmlToText.fromString(html),
      // text: 'testing',
    };

    await this.newTransport().sendMail(mailOptions);
  }

  async sendWelcome() {
    //send arg to send function  // 1. template file that you want to render // 2. subject that you want to send in email
    await this.send('welcome', 'Welcome to the Natours Family!');
    // console.log(this, 'this>>>>>');
  }

  async sendResetPassword() {
    await this.send(
      'resetPassword',
      `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to: ${this.url}.\nIf you didn't forget your password, please ignore this email!`
    );
  }
};
