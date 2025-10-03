
import { IContact } from './contact.interface';
import nodemailer from 'nodemailer';
import config from '../../../config'; // <--- ai file import kora hoise
import { Contact } from './contact.module';

const createContactToDB = async (payload: IContact) => {
  // Save contact in DB
  const result = await Contact.create(payload);

  // Send email to admin using config
  const transporter = nodemailer.createTransport({
    host: config.email.host,
    port: Number(config.email.port),
    secure: false, // use true if port is 465
    auth: {
      user: config.email.user,
      pass: config.email.pass,
    },
  });

  await transporter.sendMail({
    from: `"Website Contact" <${config.email.user}>`,
    to: config.admin.email,
    subject: `New Contact Message: ${payload.subject}`,
    text: `
Name: ${payload.firstName} ${payload.lastName}
Email: ${payload.email}
Phone: ${payload.phone}
Subject: ${payload.subject}
Message: ${payload.description}
    `,
  });

  const message = 'Contact message sent successfully';
  return { message, result };
};

export const ContactService = {
  createContactToDB,
};
