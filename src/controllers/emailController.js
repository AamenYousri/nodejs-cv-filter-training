const axios = require('axios');

const emailHtml = (user) => `
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
    <p style="font-size: 16px; color: #363535; text-align:center;">This code will expire in 5 minutes.</p>
  </div>
`;

const sendOTPEmail = async (user) => {
  const serviceId = process.env.EMAILJS_SERVICE_ID;
  const templateId = process.env.EMAILJS_TEMPLATE_ID;
  const publicKey = process.env.EMAILJS_PUBLIC_KEY;
  const privateKey = process.env.EMAILJS_PRIVATE_KEY;

  if (!serviceId || !templateId || !publicKey || !privateKey) {
    console.log(`OTP for ${user.email}: ${user.otp_code}`);
    return;
  }

  try {
    await axios.post(
      'https://api.emailjs.com/api/v1.0/email/send',
      {
        service_id: serviceId,
        template_id: templateId,
        user_id: publicKey,
        accessToken: privateKey,
        template_params: {
          to_email: user.email,
          to_name: user.name,
          otp_code: user.otp_code,
        },
      }
    );

    console.log(`OTP email sent to ${user.email}`);
  } catch (error) {
    console.error('EmailJS delivery failed, falling back to console OTP:', error.response?.data || error.message);
    console.log(`OTP for ${user.email}: ${user.otp_code}`);
  }
};

module.exports = { sendOTPEmail };