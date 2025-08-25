const signupForm = document.getElementById("signupForm");
            signupForm.addEventListener("submit", function (e) {
                e.preventDefault(); // stop default submit


  // get form values
  const firstName = document.getElementById("firstName")
  const lastName = document.getElementById("lastName")
  const bName = document.getElementById("bName")
  const email = document.getElementById("email")
  const phoneNumber = document.getElementById("phoneNumber")
  const password = document.getElementById("pWord")
  const cPassword = document.getElementById("cPassword")
  const terms = document.getElementById("terms")

//errors
const firstNameError = document.getElementById("firstNameError");
const lastNameError = document.getElementById("lastNameError");
const bNameError = document.getElementById("BnameError");
const emailError = document.getElementById("emailError");
const phoneError = document.getElementById("phoneError");
const pwordError = document.getElementById("pwordError");
const cPasswordError = document.getElementById("cPasswordError");
const termsError = document.getElementById("termsError");

 let valid = true;
 //first name validation
    if (firstName.value.trim() === "" || firstName.value.length < 2) {
        firstNameError.textContent = "First name is required and must be at least 2 characters.";
        firstNameError.style.display = "block";
        firstName.classList.add("input-error");
        valid = false;
    } else {
        firstNameError.textContent = "";
        firstNameError.style.display = "none";
        firstName.classList.remove("input-error");
    }
    // last name validation
    if (lastName.value.trim() === "" || lastName.value.length < 2) {
        lastNameError.textContent = "Last name is required and must be at least 2 characters.";
        lastNameError.style.display = "block";
        lastName.classList.add("input-error");
        valid = false;
    } else {
        lastNameError.textContent = "";
        lastNameError.style.display = "none";
        lastName.classList.remove("input-error");
    }
    // business name validation
    if (bName.value.trim() === "" || bName.value.length < 2) {
        bNameError.textContent = "Business name is required and must be at least 2 characters.";
        bNameError.style.display = "block";
        bName.classList.add("input-error");
        valid = false;
    } else {
        bNameError.textContent = "";
        bNameError.style.display = "none";
        bName.classList.remove("input-error");
    }

    // email validation
    if (email.value.includes("@") && email.value.includes(".com")) {
         emailError.textContent = "";
        emailError.style.display = "none";
        email.classList.remove("input-error");
    
        valid = false;
    } else {
        emailError.textContent = "Valid email is required.";
        emailError.style.display = "block";
        email.classList.add("input-error");
    }
    // phone number validation
    if (phoneNumber.value.length === 11) {
        phoneError.textContent = "";
        phoneError.style.display = "none";
        phoneNumber.classList.remove("input-error");
       
    } else {
        phoneError.textContent = "";
        phoneError.style.display = "block";
        phoneNumber.classList.add("input-error");
         valid = false;
    }
    // password validation
    if (password.value.trim() === "" || password.value.length < 6) {
        pwordError.textContent = "Password is required and must be at least 6 characters.";
        pwordError.style.display = "block";
        password.classList.add("input-error");
        valid = false;
    } else {
        pwordError.textContent = "";
        pwordError.style.display = "none";
        password.classList.remove("input-error");
    }
    // confirm password validation
    if (password.value !== cPassword.value) {
        cPasswordError.textContent = "password does not match.";
        cPasswordError.style.display = "block";
        cPassword.classList.add("input-error");
        valid = false;
    } else {
        cPasswordError.textContent = "";
        cPasswordError.style.display = "none";
        cPassword.classList.remove("input-error");
    }
    // terms validation
    if (!terms.checked) {
        termsError.textContent = "You must accept the terms and conditions.";
        termsError.style.display = "block";
        terms.classList.add("input-error");
        valid = false;
    } else {
        termsError.textContent = "";
        termsError.style.display = "none";
        terms.classList.remove("input-error");
    }

    if (valid) {
        // submit the form
        signupForm.submit();
        signupForm.reset();
        fetch('success.html').then(response => {
            if (response.ok) {
                window.location.href = 'success.html'; // redirect to success page
            } else {
                alert('Error submitting form. Please try again.');
            }
        }).catch(error => {
            console.error('Error:', error);
            alert('Error submitting form. Please try again.');
        });
    }
});
