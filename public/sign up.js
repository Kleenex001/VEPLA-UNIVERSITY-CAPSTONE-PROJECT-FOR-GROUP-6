// sign up.js
import { endpoints, apiRequest } from './api.js';

const signupForm = document.getElementById('signupForm');
signupForm.addEventListener('submit', async function (e) {
  e.preventDefault();

  // Get form elements
  const firstName = document.getElementById('firstName');
  const lastName = document.getElementById('lastName');
  const bName = document.getElementById('bName');
  const email = document.getElementById('email');
  const phoneNumber = document.getElementById('phoneNumber');
  const password = document.getElementById('pWord');
  const cPassword = document.getElementById('cPassword');
  const terms = document.getElementById('terms');

  // Get error elements
  const firstNameError = document.getElementById('firstNameError');
  const lastNameError = document.getElementById('lastNameError');
  const bNameError = document.getElementById('BnameError');
  const emailError = document.getElementById('emailError');
  const phoneError = document.getElementById('phoneError');
  const pwordError = document.getElementById('pwordError');
  const cPasswordError = document.getElementById('cPasswordError');
  const termsError = document.getElementById('termsError');

  let valid = true;

  // First name validation
  if (firstName.value.trim() === '' || firstName.value.length < 2) {
    firstNameError.textContent = 'First name is required and must be at least 2 characters.';
    firstNameError.style.display = 'block';
    firstName.classList.add('input-error');
    valid = false;
  } else {
    firstNameError.textContent = '';
    firstNameError.style.display = 'none';
    firstName.classList.remove('input-error');
  }

  // Last name validation
  if (lastName.value.trim() === '' || lastName.value.length < 2) {
    lastNameError.textContent = 'Last name is required and must be at least 2 characters.';
    lastNameError.style.display = 'block';
    lastName.classList.add('input-error');
    valid = false;
  } else {
    lastNameError.textContent = '';
    lastNameError.style.display = 'none';
    lastName.classList.remove('input-error');
  }

  // Business name validation
  if (bName.value.trim() === '' || bName.value.length < 2) {
    bNameError.textContent = 'Business name is required and must be at least 2 characters.';
    bNameError.style.display = 'block';
    bName.classList.add('input-error');
    valid = false;
  } else {
    bNameError.textContent = '';
    bNameError.style.display = 'none';
    bName.classList.remove('input-error');
  }

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.value.trim())) {
    emailError.textContent = 'Valid email is required (e.g., user@example.com).';
    emailError.style.display = 'block';
    email.classList.add('input-error');
    valid = false;
  } else {
    emailError.textContent = '';
    emailError.style.display = 'none';
    email.classList.remove('input-error');
  }

  // Phone number validation (WAT/Nigeria format)
  const phoneRegex = /^\+?\d{10,14}$/;
  if (!phoneRegex.test(phoneNumber.value.trim())) {
    phoneError.textContent = 'Phone number must be 10-14 digits (e.g., +2341234567890 or 08123456789).';
    phoneError.style.display = 'block';
    phoneNumber.classList.add('input-error');
    valid = false;
  } else {
    phoneError.textContent = '';
    phoneError.style.display = 'none';
    phoneNumber.classList.remove('input-error');
  }

  // Password validation
  if (password.value.trim() === '' || password.value.length < 6) {
    pwordError.textContent = 'Password is required and must be at least 6 characters.';
    pwordError.style.display = 'block';
    password.classList.add('input-error');
    valid = false;
  } else {
    pwordError.textContent = '';
    pwordError.style.display = 'none';
    password.classList.remove('input-error');
  }

  // Confirm password validation
  if (password.value !== cPassword.value) {
    cPasswordError.textContent = 'Passwords do not match.';
    cPasswordError.style.display = 'block';
    cPassword.classList.add('input-error');
    valid = false;
  } else {
    cPasswordError.textContent = '';
    cPasswordError.style.display = 'none';
    cPassword.classList.remove('input-error');
  }

  // Terms validation
  if (!terms.checked) {
    termsError.textContent = 'You must accept the terms and conditions.';
    termsError.style.display = 'block';
    terms.classList.add('input-error');
    valid = false;
  } else {
    termsError.textContent = '';
    termsError.style.display = 'none';
    terms.classList.remove('input-error');
  }

  if (valid) {
    try {
      const payload = {
        firstName: firstName.value.trim(),
        lastName: lastName.value.trim(),
        businessName: bName.value.trim(),
        email: email.value.trim(),
        phoneNumber: phoneNumber.value.trim(),
        password: password.value.trim(),
      };
      const response = await apiRequest(`${endpoints.auth}/signup`, 'POST', payload);
      console.log('Signup response:', response);
      firstNameError.textContent = 'Signup successful! Redirecting to login...';
      firstNameError.style.display = 'block';
      firstNameError.classList.remove('input-error');
      signupForm.reset();
      setTimeout(() => {
        window.location.href = 'sign in.html';
      }, 2000);
    } catch (error) {
      firstNameError.textContent = `Signup failed: ${error.message}`;
      firstNameError.style.display = 'block';
      firstNameError.classList.add('input-error');
      console.error('Signup error:', error);
    }
  }
});
