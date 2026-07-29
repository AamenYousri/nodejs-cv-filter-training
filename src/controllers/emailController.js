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
  "noreply@test-ywj2lpnp7oqg7oqz.mlsender.net",
  "CV Filter"
);

const emailRecipient = (email, name) => {
  return [new Recipient(email, name)];
};

const sendOTPEmail = async (user) => {
  console.log(user)
    const html =`
    <div style="font-family: Helvetica, sans-serif; text-align: center; padding: 20px; background-color: #4c76bf; border-radius: 10px; border-bottom: 5px solid #2c3e50; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);">
    <img style="
        max-width: 300px;
        height: auto;
        object-fit: contain;
        filter: brightness(0) invert(1);"
      src="https://cdn.all-for-one.com/corporate-media/company/pr-und-news/bildarchiv/all-for-one-group-se-de-100424.png" 
      alt="All For One Group Logo" 
      class="brand-logo"
    />
    <h1 style="font-size: 32px; color: #000; font-spacing: 2;">TalentGrid</h1>
    </div>
    <div>
    <h2 style="font-size: 24px; color: #000; text-align:center;">Welcome, ${user.name}!</h2>
    <p style="font-size: 16px; color: #000; text-align:center;">Your OTP code is: <strong>${user.otp_code}</strong></p>
    <p style="font-size: 16px; color: #363535; text-align:center;">This code will expire in 10 minutes.</p>
    </div>
    `

  const emailParams = new EmailParams()
  .setFrom(sentFrom)
  .setTo(emailRecipient(user.email, user.name))
  .setSubject("TalentGrid - OTP Verification")
  .setHtml(html)
  .setText(`Your OTP code is: ${user.otp_code}`);

try {
    const response = await mailerSend.email.send(emailParams);
    console.log("OTP email sent successfully:", response);
} catch (error) {
    console.error(error);
}
}

module.exports = { sendOTPEmail };