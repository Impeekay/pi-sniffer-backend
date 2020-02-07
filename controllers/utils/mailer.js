"use strict";

const helper = require("sendgrid").mail;
const { sendGrid } = require("../../configs/config");

function sendInvitation(mail) {
  return new Promise(function(resolve, reject) {
    try {
      const fromEmail = new helper.Email("no-reply@piDev");
      const toEmail = new helper.Email(mail.toEmail);
      const subject = mail.subject;
      const content = new helper.Content("text/plain", mail.content);
      const newMail = new helper.Mail(fromEmail, subject, toEmail, content);

      const sg = require("sendgrid")(sendGrid); //get the key from gitignored config
      const request = sg.emptyRequest({
        method: "POST",
        path: "/v3/mail/send",
        body: newMail.toJSON()
      });

      sg.API(request, function(error, response) {
        if (error) {
          console.log("Error response received");
          reject(error);
        }
        console.log(response.statusCode);
        console.log(response.body);
        console.log(response.headers);
        resolve(response);
      });
    } catch (e) {
      console.log(e);
      reject(e);
    }
  });
}

module.exports = { sendInvitation };
