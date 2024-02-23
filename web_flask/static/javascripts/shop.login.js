$(() => {
  $('#login-form').submit(function (event) {
    event.preventDefault();
    const email = $('#login-email').val();
    const password = $('#login-password').val();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

    if (!emailRegex.test(email)) {
      $('#email-error').removeClass('hidden');
    } else {
      $('#email-error').addClass('hidden');
    }

    if (!passwordRegex.test(password)) {
      $('#password-error').removeClass('hidden');
    } else {
      $('#password-error').addClass('hidden');
    }

    if (emailRegex.test(email) && passwordRegex.test(password)) {
      // Optionally, you can perform AJAX request here
      console.log('Form submitted');
    }
  });
});
