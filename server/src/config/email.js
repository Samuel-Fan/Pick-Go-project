var nodemailer = require("nodemailer");

var transporter = nodemailer.createTransport({
  service: "gmail",
  logger: true,
  debug: true,
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS,
  },
});

var mailOptions = {
  from: process.env.GMAIL_USER,
  to: "smallwarxxx1@gmail.com",
  subject: "Sending Email using Node.js",
  text: "That was easy!",
};

transporter.sendMail(mailOptions, function (error, info) {
  if (error) {
    console.log(error);
  } else {
    console.log("Email sent: " + info.response);
  }
});
