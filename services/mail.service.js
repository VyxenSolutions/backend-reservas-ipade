const mailgun = require('mailgun-js');

const mg = mailgun({
  apiKey: '7ef7139dde7b9e190bc7df6816a1771e-a908eefc-1f95e5fb',
  domain: 'mail.xyxen-solutions.com'
});

exports.sendEmail = ({ to, subject, text, html }) => {
  const data = {
    from: 'Hey! Open <noreply@heyopen.mx>',
    to,
    subject,
    text,
    html
  };

  return mg.messages().send(data);
};
