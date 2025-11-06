const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS
  }
});

exports.sendMail = async (to, subject, text) => {
  await transporter.sendMail({
    from: process.env.MAIL_USER,
    to,
    subject,
    text
  });
};

const { sendMail } = require('../utils/mailer');
const io = req.app.get('io');

// Notify responder (email + socket)
sendMail(theirSlot.owner.email, 'New Swap Request', `${req.user.name} wants to swap ${theirSlot.title}.`);
io.to(String(theirSlot.owner)).emit('swap:incoming', created);
// Notify both parties on response      
sendMail(swap.requester.email, 'Swap Request Update', `Your swap request for ${swap.theirSlot.title} has been ${accept ? 'accepted' : 'rejected'}.`);
io.to(String(swap.requester._id)).emit('swap:updated', populated);
io.to(String(swap.responder._id)).emit('swap:updated', populated);      