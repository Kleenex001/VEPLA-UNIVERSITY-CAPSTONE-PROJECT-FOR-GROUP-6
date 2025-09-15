// signup.js
import { endpoints, apiRequest } from "./api.js";

/* ---------------- Username Workaround Helpers ---------------- */
function sanitizeForUsername(str) {
  return String(str || "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "") // only letters and numbers
    .slice(0, 20);
}

function makeUsername(base, suffix) {
  return suffix ? `${base}-${suffix}` : base;
}

function randomSuffix() {
  return (
    Math.random().toString(16).slice(2, 6) +
    String(Date.now()).slice(-4)
  );
}

async function trySignupWithUniqueUsername(payload, maxRetries = 5) {
  const baseCandidate =
    sanitizeForUsername(payload.businessName) ||
    sanitizeForUsername(payload.firstName + payload.lastName) ||
    "user";

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    const suffix = attempt === 0 ? "" : randomSuffix();
    const username = makeUsername(baseCandidate, suffix);

    const tryPayload = { ...payload, username };

    try {
      const res = await apiRequest(`${endpoints.auth}/signup`, "POST", tryPayload);
      return res; // success
    } catch (err) {
      const msg = (err && err.message) ? err.message.toLowerCase() : "";
      if (msg.includes("duplicate") && msg.includes("username")) {
        console.warn(`Duplicate username '${username}', retrying...`);
        continue; // try again with new suffix
      }
      throw err; // other error (e.g. email exists)
    }
  }

  throw new Error("Unable to generate a unique username. Please try again later.");
}

/* ---------------- Form Handling ---------------- */
const signupForm = document.getElementById("signupForm");

signupForm.addEventListener("submit", async function (e) {
  e.preventDefault();

  // Inputs
  const firstName = document.getElementById("firstName");
  const lastName = document.getElementById("lastName");
  const bName = document.getElementById("bName");
  const email = document.getElementById("email");
  const phoneNumber = document.getElementById("phoneNumber");
  const password = document.getElementById("pWord");
  const cPassword = document.getElementById("cPassword");
  const terms = document.getElementById("terms");

  // Error elements
  const firstNameError = document.getElementById("firstNameError");
  const lastNameError = document.getElementById("lastNameError");
  const bNameError = document.getElementById("BnameError");
  const emailError = document.getElementById("emailError");
  const phoneError = document.getElementById("phoneError");
  const pwordError = document.getElementById("pwordError");
  const cPasswordError = document.getElementById("cPasswordError");
  const termsError = document.getElementById("termsError");

  let valid = true;

  /* ---------------- Validations ---------------- */
  if (firstName.value.trim() === "" || firstName.value.length < 2) {
    firstNameError.textContent = "First name must be at least 2 characters.";
    firstNameError.style.display = "block";
    valid = false;
  } else firstNameError.style.display = "none";

  if (lastName.value.trim() === "" || lastName.value.length < 2) {
    lastNameError.textContent = "Last name must be at least 2 characters.";
    lastNameError.style.display = "block";
    valid = false;
  } else lastNameError.style.display = "none";

  if (bName.value.trim() === "" || bName.value.length < 2) {
    bNameError.textContent = "Business name must be at least 2 characters.";
    bNameError.style.display = "block";
    valid = false;
  } else bNameError.style.display = "none";

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.value.trim())) {
    emailError.textContent = "Enter a valid email (e.g. user@example.com).";
    emailError.style.display = "block";
    valid = false;
  } else emailError.style.display = "none";

  const phoneRegex = /^\+?\d{10,14}$/;
  if (!phoneRegex.test(phoneNumber.value.trim())) {
    phoneError.textContent =
      "Phone must be 10-14 digits (e.g. +2348012345678 or 08123456789).";
    phoneError.style.display = "block";
    valid = false;
  } else phoneError.style.display = "none";

  if (password.value.trim() === "" || password.value.length < 6) {
    pwordError.textContent = "Password must be at least 6 characters.";
    pwordError.style.display = "block";
    valid = false;
  } else pwordError.style.display = "none";

  if (password.value !== cPassword.value) {
    cPasswordError.textContent = "Passwords do not match.";
    cPasswordError.style.display = "block";
    valid = false;
  } else cPasswordError.style.display = "none";

  if (!terms.checked) {
    termsError.textContent = "You must accept the terms.";
    termsError.style.display = "block";
    valid = false;
  } else termsError.style.display = "none";

  if (!valid) return;

  /* ---------------- API Request ---------------- */
  const payload = {
    firstName: firstName.value.trim(),
    lastName: lastName.value.trim(),
    businessName: bName.value.trim(),
    email: email.value.trim(),
    phoneNumber: phoneNumber.value.trim(),
    password: password.value.trim(),
  };

  try {
    const response = await trySignupWithUniqueUsername(payload, 6);
    console.log("Signup success:", response);

    alert("✅ Signup successful! Redirecting to login...");
    signupForm.reset();

    setTimeout(() => {
      window.location.href = "sign in.html";
    }, 1500);
  } catch (err) {
    console.error("Signup error:", err);
    alert(`❌ Signup failed: ${err.message}`);
  }
});

