import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: process.env.emailid,
    pass: process.env.emailpassword
  }
});

export const sendmail = (async (email,mailsubject,contents) => {

  let info = await transporter.sendMail({
    from: `"real estetics 회원인증 링크" <${process.env.emailid}>`,
    to: email,

    subject: mailsubject,
    text: contents,
  });

  console.log(`Message sent: ${info.messageId}`);
  return;
});
