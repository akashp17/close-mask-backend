var nodemailer = require("nodemailer");
var hbs = require('nodemailer-express-handlebars');
var async = require('async');
var mailConfig = require("../config/mailer.json");


var transporter;
// if (process.env.NODE_ENV == "production")
transporter = nodemailer.createTransport({
  pool: true,
  service: 'gmail',
  auth: {
    user: ' no-reply@closecheckout.com',
    pass: 'closecheckout@123'
  }
});
// else
//     transporter = nodemailer.createTransport({
//         host: "smtp.mailtrap.io",
//         port: 2525,
//         pool: true,
//         auth: {
//             user: "61b91721f3b6ae",
//             pass: "67b920f44d37f3"
//         }
//     });

transporter.verify(function (error, success) {
  if (error) {
    console.log("Failed to connect to SMTP server")
    console.log(error);
  } else {
    console.log('Connected to SMTP server!');
  }
});
var optionsTemp = {
  viewEngine: {
    extname: '.hbs',
    layoutsDir: 'views/',
    defaultLayout: 'admin-email',
    partialsDir: 'views/partials/'
  },
  viewPath: 'views',
  extName: '.hbs'
};
transporter.use('compile', hbs(optionsTemp));

const sendEmail = (to, subject, msg) => new Promise((resolve, reject) => {
  const mailOptions = {
    from: mailConfig.from,
    to: to,
    subject: subject,
    template: 'admin-email',
    context: {
      message: msg
    }
  };
  transporter.sendMail(mailOptions, function (err, info) {
    if (err) {
      return reject(err);
    }
    resolve(info);
  });
});

const sendBulkEmail = (list, subject, msg) => {
  async.eachLimit(list, mailConfig.PARALLEL_BULK_LIMIT, function (email, cb) {
    sendEmail(email, subject, msg).then(() => cb())
      .catch(err => {
        console.log(err);
        cb();
      });
  },
    function (err) {
      if (err) {
        console.log("err : ", err);
        throw err;
      }
    }
  );
}


module.exports.sendEmail = sendEmail;
module.exports.sendBulkEmail = sendBulkEmail;