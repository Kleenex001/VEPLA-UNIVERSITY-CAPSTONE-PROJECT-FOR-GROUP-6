// signup.js
import { endpoints, apiRequest } from './api.js';

// === Generate unique username (based on email + random string) ===
function generateUsername(email) {
  const base = email.split('@')[0].replace(/[^a-z0-9]/gi, '').toLowerCase();
  const rand = Math.random().toString(36).substring(2, 6);
  return `${base}_${rand}`;
}

const signupForm = document.getElementById('signupForm');

// === Validation Helpers ===
const showError = (input, errorElement, message) => {
  errorElement.textContent = message;
  errorElement.style.display = 'block';
  input.classList.add('input-error');
};

const clearError = (input, errorElement) => {
  errorElement.textContent = '';
  errorElement.style.display = 'none';
  input.classList.remove('input-error');
};

// === Main Submit Handler ===
signupForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  // Collect input fields
  const fields = {
    firstName: document.getElementById('firstName'),
    lastName: document.getElementById('lastName'),
    businessName: document.getElementById('bName'),
    email: document.getElementById('email'),
    phoneNumber: document.getElementById('phoneNumber'),
    password: document.getElementById('pWord'),
    confirmPassword: document.getElementById('cPassword'),
    terms: document.getElementById('terms'),
    successMsg: document.getElementById('successMsg'),
  };

  // Collect error fields
  const errors = {
    firstName: document.getElementById('firstNameError'),
    lastName: document.getElementById('lastNameError'),
    businessName: document.getElementById('BnameError'),
    email: document.getElementById('emailError'),
    phoneNumber: document.getElementById('phoneError'),
    password: document.getElementById('pwordError'),
    confirmPassword: document.getElementById('cPasswordError'),
    terms: document.getElementById('termsError'),
    successMsg: document.getElementById('successMsg'),
  };

  let valid = true;

  // === Field Validations ===
  if (fields.firstName.value.trim().length < 2) {
    showError(fields.firstName, errors.firstName, 'First name must be at least 2 characters.');
    valid = false;
  } else clearError(fields.firstName, errors.firstName);

  if (fields.lastName.value.trim().length < 2) {
    showError(fields.lastName, errors.lastName, 'Last name must be at least 2 characters.');
    valid = false;
  } else clearError(fields.lastName, errors.lastName);

  if (fields.businessName.value.trim().length < 2) {
    showError(fields.businessName, errors.businessName, 'Business name must be at least 2 characters.');
    valid = false;
  } else clearError(fields.businessName, errors.businessName);

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(fields.email.value.trim())) {
    showError(fields.email, errors.email, 'Enter a valid email (e.g., user@example.com).');
    valid = false;
  } else clearError(fields.email, errors.email);

  const phoneRegex = /^\+?\d{10,14}$/;
  if (!phoneRegex.test(fields.phoneNumber.value.trim())) {
    showError(fields.phoneNumber, errors.phoneNumber, 'Phone must be 10–14 digits (e.g., +2341234567890).');
    valid = false;
  } else clearError(fields.phoneNumber, errors.phoneNumber);

  if (fields.password.value.length < 6) {
    showError(fields.password, errors.password, 'Password must be at least 6 characters.');
    valid = false;
  } else clearError(fields.password, errors.password);

  if (fields.password.value !== fields.confirmPassword.value) {
    showError(fields.confirmPassword, errors.confirmPassword, 'Passwords do not match.');
    valid = false;
  } else clearError(fields.confirmPassword, errors.confirmPassword);

  if (!fields.terms.checked) {
    showError(fields.terms, errors.terms, 'You must accept the terms and conditions.');
    valid = false;
  } else clearError(fields.terms, errors.terms);

  // === Stop if invalid ===
  if (!valid) return;

  try {
    // Build base payload
    const payload = {
      firstName: fields.firstName.value.trim(),
      lastName: fields.lastName.value.trim(),
      businessName: fields.businessName.value.trim(),
      email: fields.email.value.trim(),
      phoneNumber: fields.phoneNumber.value.trim(),
      password: fields.password.value.trim(),
      username: generateUsername(fields.email.value.trim()), // initial username
    };

    let response;
    let retries = 3; // try up to 3 times in case of duplicate username

    while (retries > 0) {
      try {
        response = await apiRequest(`${endpoints.auth}/signup`, 'POST', payload);
        break; // success, exit loop
      } catch (err) {
        if (err.message.includes('duplicate key error') && retries > 1) {
          console.warn('Duplicate username detected, retrying...');
          payload.username = generateUsername(fields.email.value.trim()); // regenerate username
          retries--;
        } else {
          throw err; // rethrow other errors
        }
      }
    }

    console.log('Signup response:', response);

    // Success message
    errors.successMsg.textContent = '✅ Signup successful! Redirecting to login...';
    errors.successMsg.style.display = 'block';
    errors.successMsg.classList.remove('input-error');

    signupForm.reset();

    setTimeout(() => {
      window.location.href = 'sign in.html';
    }, 2000);

  } catch (error) {
    console.error('Signup error:', error);
    errors.successMsg.textContent = `❌ Signup failed: ${error.message}`;
    errors.successMsg.style.display = 'block';
    errors.successMsg.classList.add('input-error');
  }
});
