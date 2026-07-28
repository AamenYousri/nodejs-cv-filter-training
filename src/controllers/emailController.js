const {
  MailerSend,
  EmailParams,
  Sender,
  Recipient
} = require("mailersend");

const mailerSend = new MailerSend({
  apiKey: process.env.MAILER_SEND,
});

const sentFrom = new Sender(
  "test-ywj2lpnp7oqg7oqz.mlsender.net",
  "CV Filter"
);

const emailRecipient = (email, name) => {
  return [new Recipient(email, name)];
};

const sendOTPEmail = async (user) => {

    const html =`<p>Your OTP code is: <strong>${user.OTP_CODE}</strong></p>`

  const emailParams = new EmailParams()
    .setFrom(sentFrom)
    .setRecipients(emailRecipient(user.email, user.name))
    .setSubject("Your OTP Code")
    .setHtml(`${html}`);

    try {
        const response = await mailerSend.send(emailParams);
        console.log("OTP email sent successfully:", response);
    } catch (error) {
        console.error("Error sending OTP email:", error);
    }
}

module.exports = { sendOTPEmail };