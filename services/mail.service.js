const mailgun = require('mailgun-js');

let mg;
function initMailer() {
  if (!mg) {
    mg = mailgun({
      apiKey: process.env.MAILGUN_API_KEY,
      domain: process.env.MAILGUN_DOMAIN
    });
  }
  return mg;
}

exports.sendEmail = ({ to, subject, text, html }) => {
  const mailer = initMailer();

  const data = {
    from: 'Hey! Open <noreply@heyopen.mx>',
    to,
    subject,
    text,
    html
  };

  return mailer.messages().send(data);
};
