document.addEventListener('DOMContentLoaded', () => {
  const registerForm = document.getElementById('register-form');
  const firstNameInput = document.getElementById('first-name');
  const lastNameInput = document.getElementById('last-name');
  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');
  const confirmPasswordInput = document.getElementById('confirm-password');
  const messageEl = document.getElementById('register-msg');
  const toggleButtons = document.querySelectorAll('.toggle-password');

  function showMessage(text, type = 'error') {
    if (!messageEl) return;

    messageEl.textContent = text;
    messageEl.classList.remove('hidden', 'error', 'success');
    messageEl.classList.add(type);
  }

  function clearMessage() {
    if (!messageEl) return;
    messageEl.textContent = '';
    messageEl.classList.add('hidden');
    messageEl.classList.remove('error', 'success');
  }

  toggleButtons.forEach((toggleBtn) => {
    const targetInput = toggleBtn.parentElement.querySelector('input');
    if (!targetInput) return;

    toggleBtn.addEventListener('click', () => {
      const isVisible = targetInput.type === 'text';
      targetInput.type = isVisible ? 'password' : 'text';

      toggleBtn.classList.toggle('fa-eye', isVisible);
      toggleBtn.classList.toggle('fa-eye-slash', !isVisible);
    });
  });

  function validateRegisterForm() {
    const firstName = firstNameInput.value.trim();
    const lastName = lastNameInput.value.trim();
    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();
    const confirmPassword = confirmPasswordInput.value.trim();

    if (!firstName || !lastName || !email || !password || !confirmPassword) {
      showMessage('Please fill in all fields.');
      if (!firstName) firstNameInput.focus();
      else if (!lastName) lastNameInput.focus();
      else if (!email) emailInput.focus();
      else if (!password) passwordInput.focus();
      else confirmPasswordInput.focus();
      return false;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
      showMessage('Please enter a valid email address.');
      emailInput.focus();
      return false;
    }

    if (password.length < 6) {
      showMessage('Password must be at least 6 characters long.');
      passwordInput.focus();
      return false;
    }

    if (password !== confirmPassword) {
      showMessage('Passwords do not match.');
      confirmPasswordInput.focus();
      return false;
    }

    clearMessage();
    return true;
  }

  if (registerForm) {
    registerForm.addEventListener('submit', async (event) => {
      event.preventDefault();

      if (!validateRegisterForm()) {
        return;
      }

      const payload = {
        name: `${firstNameInput.value.trim()} ${lastNameInput.value.trim()}`.trim(),
        email: emailInput.value.trim(),
        password: passwordInput.value.trim(),
      };

      try {
        clearMessage();

        const response = await fetch('/api/auth/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });

        const data = await response.json();

        if (!response.ok) {
          const errorMessage = data?.error || data?.message || 'Registration failed. Please try again.';
          showMessage(errorMessage, 'error');
          return;
        }

        if (data.token) {
          document.cookie = `accessToken=${encodeURIComponent(data.token)}; path=/; max-age=${10 * 24 * 60 * 60}; SameSite=Lax`;
        }

        showMessage('Registration successful. Please check your email for OTP verification.', 'success');
        registerForm.reset();
        setTimeout(() => {
          window.location.href = '/otp-verification';
        }, 1200);
      } catch (error) {
        console.error('Registration error:', error);
        showMessage('Something went wrong. Please try again later.');
      }
    });
  }
});
