import nodemailer from "nodemailer";
import htmlToText from "html-to-text";
import { devConfig } from "../../config/env/development";

// export const sendEmail = (options) => {
//   return new Promise((resolve, reject) => {
//     const transpoter = nodemailer.createTransport({
//       host: devConfig.ethereal.host,
//       port: devConfig.ethereal.port,
//       auth: {
//         user: devConfig.ethereal.username,
//         pass: devConfig.ethereal.password,
//       },
//     });
//     const text = htmlToText.fromString(options.html, {
//       wordwrap: 130,
//     });
//     const mailOptions = {
//       from: '"Max"<noreplay@fulltsackhour.com>',
//       to: options.email,
//       subject: options.subject,
//       text,
//       html: options.html,
//     };
//     transpoter.sendMail(mailOptions, (error, info) => {
//       if (error) {
//         return reject(error);
//       }
//       console.log("Message id ", info.messageId);
//       console.log("Preview URL ", nodemailer.getTestMessageUrl(info));
//       return resolve({ message: "Reset Email has sent to your inbox" });
//     });
//   });
// };

export const sendEmail = (options) =>
  new Promise((resolve, reject) => {
    const transpoter = nodemailer.createTransport({
      host: devConfig.ethereal.host,
      port: devConfig.ethereal.port,
      auth: {
        user: devConfig.ethereal.username,
        pass: devConfig.ethereal.password,
      },
    });
    const text = htmlToText.fromString(options.html, {
      wordwrap: 130,
    });
    const mailOptions = {
      from: '"Max 👻" <noreplay@fulltsackhour.com>',
      to: options.email,
      subject: options.subject,
      text,
      html: options.html,
    };
    
    transpoter.sendMail(mailOptions, (error, info) => {
      if (error) {
        return reject(error);
      }
      console.log('Message id ', info.messageId);
      console.log('Preview URL ', nodemailer.getTestMessageUrl(info));
      return resolve({ message: 'Reset Email has sent to your inbox' });
    });
  });