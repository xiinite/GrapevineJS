var nodemailer = require('nodemailer');
var smtpTransport = require('nodemailer-smtp-transport');
var config = require("../config/configuration.js");

// create reusable transporter object using SMTP transport 
var smtpTransport = nodemailer.createTransport(({
    service: 'gmail',
    auth: config.email.gmail
}));

module.exports = {
    "sendmail": function(to, subject, text){
        var mailOptions = {
            from: 'nachtkronieken@gmail.com', // sender address
            to: to, // list of receivers
            subject: subject, // Subject line
            text: text // plaintext body
            //html: 'test' // html body
        };

        // send mail with defined transport object
        smtpTransport.sendMail(mailOptions, function(error, info){
            if(error){
                console.log(error);
            }else{
                console.log('E-mail sent: ' + info.response);
            }
        });
    }
}