import * as nodemailer from 'nodemailer';

import EmailOptions from 'interfaces/email.interface';

const sendEmail = async (options: EmailOptions) => {
  // 1) Create Transporter
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    secure: true,
    port: 465,

    auth: {
      user: process.env.SMTP_EMAIL,
      pass: process.env.SMTP_PASSWORD,
    },
  });

  // 2) Define Options
  const mailOptions = {
    from: `QN Search cedard686@gmail.com`,
    to: options.to,
    subject: options.subject,
    text: options.text,
    attachments: options.attachments ? options.attachments : null,
    html: options.html ? options.html : null,
  };
  // 3) Send Email
  await transporter.sendMail(mailOptions);
};

export default sendEmail;
