const nodemailer = require('nodemailer');

const createTransporter = () => {
    return nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        },
        tls: {
            rejectUnauthorized: false
        }
    });
};
const sendMail = async (to, subject, html) => {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: to,
        subject: subject,
        html: html,
    };

    const transporter = createTransporter();

    try {
        await transporter.sendMail(mailOptions);
        return true;
    } catch (err) {
        console.error(err);
        return false;
    }
};


const generateEmailHTML = (headerText, contentText, hasButton = false, buttonText = '', buttonUrl = '') => {
    const buttonHTML = hasButton ? `<a href="${buttonUrl}">${buttonText}</a>` : '';

    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
            body {
                font-family: "Roboto", sans-serif;
                background-color: #f4f4f4;
                margin: 0;
                padding: 0;
                color: #333333;
            }
            .container {
                max-width: 600px;
                margin: 20px auto;
                background-color: #ffffff;
                padding: 20px;
                border-radius: 8px;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
            .header {
                text-align: center;
                padding: 10px 0;
                background-color: #333333;
                color: #ffffff;
                border-radius: 8px 8px 0 0;
            }
            .header h1 {
                margin: 0;
                font-size: 24px;
            }
            .content {
                padding: 20px;
                text-align: center;
            }
            .content p {
                font-size: 16px;
                margin: 10px;
            }
            .content h3 {
                margin: 10px;
                font-size: 20px;
                color: #333333;
            }
            .content a {
                display: inline-block;
                padding: 10px 20px;
                background-color: #333333;
                color: #ffffff;
                text-decoration: none;
                border-radius: 5px;
            }
            .footer {
                text-align: center;
                padding: 10px 0;
                font-size: 12px;
                color: #888888;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>${headerText}</h1>
            </div>
            <div class="content">
                ${contentText}
                ${buttonHTML}
            </div>
            <div class="footer">
                <p>If you did not request this, please ignore this email.</p>
            </div>
        </div>
    </body>
    </html>
    `;
};

module.exports = { sendMail, generateEmailHTML };