document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('login-form');
  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');
  const togglePasswordBtn = document.querySelector('.toggle-password');
  const messageEl = document.getElementById('login-msg');
  const rememberButton = document.getElementById('remember');

  if (togglePasswordBtn && passwordInput) {
    togglePasswordBtn.addEventListener('click', () => {
      const isPasswordVisible = passwordInput.type === 'text';
      passwordInput.type = isPasswordVisible ? 'password' : 'text';

      togglePasswordBtn.classList.toggle('fa-eye', isPasswordVisible);
      togglePasswordBtn.classList.toggle('fa-eye-slash', !isPasswordVisible);
    });
  }

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

  function validateLoginForm() {
    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();

    if (!email || !password) {
      showMessage('Please enter both email and password.');
      if (!email) emailInput.focus();
      else passwordInput.focus();
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

    clearMessage();
    return true;
  }

  if (loginForm) {
    loginForm.addEventListener('submit', async (event) => {
      event.preventDefault();

      if (!validateLoginForm()) {
        return;
      }

      const payload = {
        email: emailInput.value.trim(),
        password: passwordInput.value.trim(),
      };

      try {
        clearMessage();

        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });

        const data = await response.json();

        if (!response.ok) {
          const errorMessage = data?.error || data?.message || 'Login failed. Please try again.';
          showMessage(errorMessage);
          return;
        }

        if (data.accessToken) {
          document.cookie = `accessToken=${encodeURIComponent(data.accessToken)}; path=/; ${rememberButton.checked ? `max-age=${10 * 24 * 60 * 60}` : ``}; SameSite=Lax`;
        }

        showMessage('Login successful. Redirecting...', 'success');
        window.location.href = '/dashboard';
      } catch (error) {
        console.error('Login error:', error);
        showMessage('Something went wrong. Please try again later.');
      }
    });
  }
});
