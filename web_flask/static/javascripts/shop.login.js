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
    $('#success-message')
      .text('Login successful')
      .removeClass('hidden');
    $('#success-message').slideDown();
    setTimeout(function () {
      $('#success-message').slideUp();
      window.location.href = '/';
    }, 3000);
    setTimeout(function () {
      $('#success-message').addClass('hidden');
    }, 4000);
  }

  function handleLoginError (error) {
    $('#failure-message')
      .text('email or password incorrect')
      .removeClass('hidden');
    $('#failure-message').slideDown();
    setTimeout(function () {
      $('#failure-message').slideUp();
    }, 3000);
    setTimeout(function () {
      $('#failure-message').addClass('hidden');
    }, 4000);
  }
});
