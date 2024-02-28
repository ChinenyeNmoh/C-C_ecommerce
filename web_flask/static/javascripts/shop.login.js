$(() => {
  $('#success-message').hide();
  $('#failure-message').hide();
  $('#login-form').submit(function (event) {
    event.preventDefault();
    const email = $('#login-email').val();
    const password = $('#login-password').val();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

    $('#email-error').toggleClass('hidden', emailRegex.test(email));
    $('#password-error').toggleClass('hidden', passwordRegex.test(password));

    if (emailRegex.test(email) && passwordRegex.test(password)) {
      $.ajax({
        type: 'POST',
        url: 'http://localhost:5000/login',
        contentType: 'application/json',
        data: JSON.stringify({ email, password }),
        success: handleLogin,
        error: handleLoginError
      });
    }
  });

  function handleLogin (response) {
    const token = response;
    console.log(token);

    // window.location.href = '/profile';
  }

  function handleLoginError (error) {
    console.error('Login failed:', error);
  }
});
