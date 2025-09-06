const form = document.getElementById('resetForm');
const emailError = document.getElementById('emailError');
const newPasswordError = document.getElementById('newPasswordError');
const confirmPasswordError = document.getElementById('confirmPasswordError');

form.addEventListener('submit', function(event) {
    event.preventDefault();

    // Clear previous error messages
    emailError.textContent = '';
    newPasswordError.textContent = '';
    confirmPasswordError.textContent = '';

    // Validate email
    const email = document.getElementById('email').value;
    if (!email || !email.includes('@') || !email.includes('.com')) {
        emailError.textContent = 'Enter a valid email';
    }

    // Validate new password
    const newPassword = document.getElementById('newPassword').value;
    if (!newPassword || newPassword.length < 6) {
        newPasswordError.textContent = 'Enter a new password with at least 6 characters';
    }

    // Validate confirm password
    const confirmPassword = document.getElementById('confirmPassword').value;
    if (confirmPassword !== newPassword) {
        confirmPasswordError.textContent = 'Passwords do not match';
    }

    // If there are no errors, submit the form
    if (!emailError.textContent && !newPasswordError.textContent && !confirmPasswordError.textContent) {
        form.submit();
        form.reset();
    }

});