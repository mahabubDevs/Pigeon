// // email.helper.ts
// import nodemailer from 'nodemailer';
// import { logger, errorLogger } from '../shared/logger';

// // SMTP Configuration
// const transporter = nodemailer.createTransport({
//   host: 'server-624725.thepigeonhub.com', // mail server host
//   port: 465,                                    // SSL port
//   secure: true,                                 // true for SSL
//   auth: {
//     user: process.env.SMTP_USER || 'info@thepigeonhub.com',
//     pass: process.env.SMTP_PASS || 'Daalstraat16',
//   },
//   tls: {
//     rejectUnauthorized: false,                 // fallback for SSL hostname mismatch
//   },
//   logger: true,
//   debug: true,
// });

// // Verify SMTP connection at startup
// transporter.verify((err, success) => {
//   if (err) {
//     console.error('SMTP verification failed:', err.message);
//   } else {
//     console.log('SMTP verification successful!');
//   }
// });

// // Interface for email input
// interface ISendEmail {
//   to: string;
//   subject: string;
//   html: string;
// }

// // Function to send email
// const sendEmail = async ({ to, subject, html }: ISendEmail) => {
//   try {
//     const info = await transporter.sendMail({
//       from: `"Pigeon Hub" <info@thepigeonhub.com>`, // mailbox name must match
//       to,
//       subject,
//       html,
//     });

//     logger.info('Email sent successfully to:', to);
//     return { success: true, info };
//   } catch (error: any) {
//     errorLogger.error('Email sending failed:', error);
//     return { success: false, error: error.message };
//   }
// };

// // Export helper
// export const emailHelper = {
//   sendEmail,
// };

// // ===== Example usage in registration flow =====
// // import { emailHelper } from './email.helper';
// // const verificationLink = `https://yourdomain.com/verify?token=${token}`;
// // await emailHelper.sendEmail({
// //   to: newUser.email,
// //   subject: 'Verify your account',
// //   html: `<p>Hello ${newUser.name},</p>
// //          <p>Click <a href="${verificationLink}">here</a> to verify your email.</p>`,
// // });




import nodemailer from 'nodemailer';
import config from '../config';
import { errorLogger, logger } from '../shared/logger';
import { ISendEmail } from '../types/email';

const transporter = nodemailer.createTransport({
    host: config.email.host,
    port: Number(config.email.port),
    secure: true,
    auth: {
        user: config.email.user,
        pass: config.email.pass
    },
});

const sendEmail = async (values: ISendEmail) => {
    console.log("email function");
    try {
        const info = await transporter.sendMail({
            from: `"ThePigeonHub.com" ${config.email.from}`,
            to: values.to,
            subject: values.subject,
            html: values.html,
        });
  
        logger.info('Mail send successfully', info.accepted);
    } catch (error) {
        errorLogger.error('Email', error);
    }
};

export const emailHelper = {
    sendEmail
};