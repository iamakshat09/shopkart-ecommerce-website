(() => {
  'use strict';

  const $ = (selector, parent = document) => parent.querySelector(selector);
  const $$ = (selector, parent = document) => [...parent.querySelectorAll(selector)];

  const loginTab = $('#loginTab');
  const signupTab = $('#signupTab');
  const loginForm = $('#loginForm');
  const signupForm = $('#signupForm');
  const formTitle = $('#formTitle');
  const formSubtitle = $('#formSubtitle');
  const switchPrompt = $('#switchPrompt');
  const formPanel = $('.form-panel');
  const toast = $('#toast');

  let currentMode = 'login';
  let toastTimer;

  function showToast(message) {
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 3200);
  }

  function clearErrors() {
    $$('.field-error').forEach((element) => {
      element.textContent = '';
    });
    $$('.input-wrap').forEach((element) => {
      element.classList.remove('has-error');
    });
  }

  function setError(input, message) {
    const wrap = input.closest('.input-wrap');
    const error = $(`#${input.id}Error`);
    if (wrap) wrap.classList.toggle('has-error', Boolean(message));
    if (error) error.textContent = message || '';
  }

  function validEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }

  function setMode(mode) {
    currentMode = mode;
    const login = mode === 'login';

    if (loginTab && signupTab) {
      loginTab.classList.toggle('is-active', login);
      signupTab.classList.toggle('is-active', !login);
      loginTab.setAttribute('aria-selected', String(login));
      signupTab.setAttribute('aria-selected', String(!login));
    }

    loginForm.classList.toggle('is-visible', login);
    signupForm.classList.toggle('is-visible', !login);

    formTitle.textContent = login ? 'Welcome Back' : 'Create your account';
    formSubtitle.textContent = login
      ? 'Login to continue shopping.'
      : 'Join Shopora and start shopping today.';

    switchPrompt.innerHTML = login
      ? `Don't have an account? <button type="button" class="text-link" data-switch="signup">Create one</button>`
      : `Already have an account? <button type="button" class="text-link" data-switch="login">Login</button>`;

    formPanel.classList.remove('is-switching-login', 'is-switching-signup');
    void formPanel.offsetWidth;
    formPanel.classList.add(login ? 'is-switching-login' : 'is-switching-signup');
    clearErrors();
  }

  if (loginTab && signupTab) {
    loginTab.addEventListener('click', () => setMode('login'));
    signupTab.addEventListener('click', () => setMode('signup'));
  }

  switchPrompt.addEventListener('click', (event) => {
    const button = event.target.closest('[data-switch]');
    if (button) setMode(button.dataset.switch);
  });

  loginForm.addEventListener('submit', (event) => {
    event.preventDefault();
    clearErrors();

    const email = $('#loginEmail');
    const password = $('#loginPassword');
    let valid = true;

    if (!validEmail(email.value.trim())) {
      setError(email, 'Please enter a valid email address.');
      valid = false;
    }
    if (password.value.length < 6) {
      setError(password, 'Password must be at least 6 characters.');
      valid = false;
    }

    if (!valid) return;

    if ($('#rememberMe').checked) {
      localStorage.setItem('shoporaRememberedEmail', email.value.trim());
    } else {
      localStorage.removeItem('shoporaRememberedEmail');
    }

    showToast('Login details are valid. Connect your authentication API to sign in.');
  });

  signupForm.addEventListener('submit', (event) => {
    event.preventDefault();
    clearErrors();

    const name = $('#signupName');
    const email = $('#signupEmail');
    const password = $('#signupPassword');
    const terms = $('#terms');
    let valid = true;

    if (name.value.trim().length < 2) {
      setError(name, 'Please enter your full name.');
      valid = false;
    }
    if (!validEmail(email.value.trim())) {
      setError(email, 'Please enter a valid email address.');
      valid = false;
    }
    if (password.value.length < 8) {
      setError(password, 'Password must be at least 8 characters.');
      valid = false;
    }
    if (!terms.checked) {
      $('#termsError').textContent = 'Please accept the terms to continue.';
      valid = false;
    }

    if (!valid) return;

    showToast('Account form is valid. Connect your signup API to create the account.');
  });

  $$('.password-toggle').forEach((button) => {
    button.addEventListener('click', () => {
      const input = $(`#${button.dataset.target}`);
      const isVisible = input.type === 'text';
      input.type = isVisible ? 'password' : 'text';
      button.textContent = isVisible ? 'Show' : 'Hide';
      button.setAttribute('aria-label', isVisible ? 'Show password' : 'Hide password');
    });
  });

  const signupPassword = $('#signupPassword');
  const strengthBar = $('.password-strength');
  const strengthText = $('#strengthText');

  signupPassword.addEventListener('input', () => {
    const value = signupPassword.value;
    if (!value) {
      strengthBar.removeAttribute('data-level');
      strengthText.textContent = '';
      return;
    }

    let score = 0;
    if (value.length >= 8) score++;
    if (/[a-z]/.test(value) && /[A-Z]/.test(value)) score++;
    if (/\d/.test(value)) score++;
    if (/[^A-Za-z0-9]/.test(value)) score++;

    strengthBar.dataset.level = String(Math.max(1, score));
    strengthText.textContent = ['Very weak', 'Weak', 'Good', 'Strong'][Math.max(0, score - 1)];
  });

  $('#forgotPassword').addEventListener('click', () => {
    const email = $('#loginEmail').value.trim();
    if (!validEmail(email)) {
      setError($('#loginEmail'), 'Enter your email first, then request a reset.');
      $('#loginEmail').focus();
      return;
    }
    showToast(`Password reset link would be sent to ${email}.`);
  });

  $$('.social-btn').forEach((button) => {
    button.addEventListener('click', () => {
      showToast(`${button.dataset.provider} authentication needs to be connected to your OAuth provider.`);
    });
  });

  const rememberedEmail = localStorage.getItem('shoporaRememberedEmail');
  if (rememberedEmail) {
    $('#loginEmail').value = rememberedEmail;
    $('#rememberMe').checked = true;
  }
})();
