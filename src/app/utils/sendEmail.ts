import nodemailer from 'nodemailer';
import config from '../config';

export const sendEmail = async (to: string, html: string) => {
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com.',
    port: 587,
    secure: config.NODE_ENV === 'production',
    auth: {
      user: 'fsd.whatislamsays@gmail.com',
      pass: config.email_app_password,
    },
  });

  await transporter.sendMail({
    from: 'fsd.whatislamsays@gmail.com', // sender address
    to, // to whom email is to be sent
    subject: 'Bloomhub : Reset your password within 5 mins!', // Subject line
    text: 'test by awal', // plain text body
    html, // html body
  });
};
