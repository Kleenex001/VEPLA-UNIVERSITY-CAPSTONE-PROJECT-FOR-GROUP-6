const signinForm = document.getElementById("signinForm");
signinForm.addEventListener("submit", function (e) {
    e.preventDefault(); // stop default submit

    // get form values
    const email = document.getElementById("email");
    const password = document.getElementById("password");

    // errors
    const emailError = document.getElementById("emailError");
    const passwordError = document.getElementById("passwordError");

    let valid = true;

    // email validation
    if (email.value.includes("@") && email.value.includes(".com")) {
        emailError.textContent = "";
        emailError.style.display = "none";
        email.classList.remove("input-error");
    } else {
        emailError.textContent = "Valid email is required.";
        emailError.style.display = "block";
        email.classList.add("input-error");
        valid = false;
    } 

    // password validation
    if (password.value.trim() === "" || password.value.length < 6) {
        passwordError.textContent = "Password is required and must be at least 6 characters.";
        passwordError.style.display = "block";
        password.classList.add("input-error");
        valid = false;
    } else {
        passwordError.textContent = "";
        passwordError.style.display = "none";
        password.classList.remove("input-error");
    }

    if (valid) {
        // submit the form
        signinForm.submit();
        signinForm.reset();
        fetch('success.html').then(response => {
            if (response.ok) {
                window.location.href = 'dashboard.html'; // redirect to dashboard
            } else {
                alert('invalid email or password. Please try again.');
            }
        }).catch(error => {
            console.error('Error:', error);
            alert('invalid email or password. Please try again.');
        });
    }
});
