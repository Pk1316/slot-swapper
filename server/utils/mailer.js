export async function sendMail(to, subject, text) {
  // Simple stub mailer for development. Replace with real implementation.
  console.log(`(mailer stub) To: ${to} | Subject: ${subject} | Text: ${text}`);
  return Promise.resolve();
}
