document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('forgot-password-form');
  const emailInput = document.getElementById('email');
  const resetFields = document.getElementById('reset-fields');
  const sendCodeButton = document.getElementById('send-code-button');
  const resetPasswordButton = document.getElementById('reset-password-button');
  const resetCodeInput = document.getElementById('reset-code');
  const newPasswordInput = document.getElementById('new-password');
  const confirmPasswordInput = document.getElementById('confirm-password');
  const title = document.getElementById('form-title');
  const subtitle = document.getElementById('form-subtitle');
  const message = document.getElementById('login-msg');
  let resetEmail = '';

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  function showMessage(text, type = 'error') {
    message.textContent = text;
    message.classList.remove('hidden', 'error', 'success');
    message.classList.add(type);
  }

  function setResetStep(email) {
    resetEmail = email;
    emailInput.value = email;
    emailInput.readOnly = true;
    resetFields.classList.remove('hidden');
    sendCodeButton.textContent = 'Send a New Code';
    title.textContent = 'Reset your password';
    subtitle.textContent = `Enter the code sent to ${email} and choose a new password.`;
    resetCodeInput.focus();
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const email = emailInput.value.trim().toLowerCase();

    if (!emailPattern.test(email)) {
      showMessage('Please enter a valid email address.');
      emailInput.focus();
      return;
    }

    sendCodeButton.disabled = true;
    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();

      if (!response.ok) {
        showMessage(data?.error || 'Unable to send a reset code. Please try again.');
        return;
      }

      setResetStep(email);
      showMessage(data?.message || 'If the email is registered, a reset code has been sent.', 'success');
    } catch (error) {
      console.error('Forgot password error:', error);
      showMessage('Something went wrong. Please try again later.');
    } finally {
      sendCodeButton.disabled = false;
    }
  });

  resetPasswordButton.addEventListener('click', async () => {
    const email = resetEmail;
    const resetCode = resetCodeInput.value.trim();
    const newPassword = newPasswordInput.value;
    const confirmPassword = confirmPasswordInput.value;

    if (!email || !/^\d{6}$/.test(resetCode)) {
      showMessage('Please enter the 6-digit reset code.');
      resetCodeInput.focus();
      return;
    }
    if (newPassword.length < 6) {
      showMessage('Password must be at least 6 characters long.');
      newPasswordInput.focus();
      return;
    }
    if (newPassword !== confirmPassword) {
      showMessage('Passwords do not match.');
      confirmPasswordInput.focus();
      return;
    }

    resetPasswordButton.disabled = true;
    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, resetCode, newPassword }),
      });
      const data = await response.json();

      if (!response.ok) {
        showMessage(data?.error || 'Unable to reset your password.');
        return;
      }

      showMessage('Password reset successfully. Redirecting to login...', 'success');
      setTimeout(() => { window.location.href = '/login'; }, 1200);
    } catch (error) {
      console.error('Reset password error:', error);
      showMessage('Something went wrong. Please try again later.');
    } finally {
      resetPasswordButton.disabled = false;
    }
  });
});
