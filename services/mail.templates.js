exports.getVerifyEmailTemplate = (name, link) => ({
  subject: "Verifica tu correo - Hey! Open",
  text: `Hola ${name}, verifica tu correo con el siguiente enlace: ${link}`,
  html: `<p>Hola <strong>${name}</strong>,</p><p>Haz clic en el siguiente enlace para verificar tu correo:</p><a href="${link}">${link}</a>`,
});

exports.getResetPasswordTemplate = (resetLink) => ({
  subject: "Recupera tu contraseña - Hey! Open",
  text: `Haz clic para restablecer tu contraseña: ${resetLink}`,
  html: `
      <p>Hola,</p>
      <p>Haz clic en el siguiente enlace para restablecer tu contraseña:</p>
      <a href="${resetLink}">${resetLink}</a>
      <p>Este enlace expirará en 30 minutos.</p>
    `,
});

exports.getNotificationTemplate = (title, body) => ({
  subject: title,
  text: body,
  html: `<p>${body}</p>`,
});

exports.getReservationCreatedTemplate = (user, date, startTime, courtName) => ({
  subject: 'Reserva generada – Hey! Open',
  text: `Hola ${user.name}, has creado o sido agregado a una reserva para el ${date} a las ${startTime} en la cancha ${courtName}.`,
  html: `<p>Hola <strong>${user.name}</strong>,</p><p>Tienes una reserva para el <strong>${date}</strong> a las <strong>${startTime}</strong> en <strong>${courtName}</strong>.</p>`
});

exports.getReservationConfirmedTemplate = (user, date, courtName) => ({
  subject: 'Asistencia confirmada – Hey! Open',
  text: `Hola ${user.name}, confirmamos tu asistencia a la reserva del ${date} en la cancha ${courtName}.`,
  html: `<p>Hola <strong>${user.name}</strong>,</p><p>Tu asistencia a la reserva del <strong>${date}</strong> en <strong>${courtName}</strong> ha sido confirmada.</p>`
});
