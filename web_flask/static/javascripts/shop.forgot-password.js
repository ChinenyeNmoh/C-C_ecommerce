console.log('forgot_password');
$(() => {
  $('#success-message').hide();
  $('#failure-message').hide();
  $('#forgot-password-form').submit(function (event) {
    event.preventDefault();
    const email = $('#forgot-password-email').val();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    $('#forgot-password-email-error').toggleClass('hidden', emailRegex.test(email));

    if (emailRegex.test(email)) {
      $.ajax({
        type: 'POST',
        url: 'http://localhost:5000/forgot-password',
        contentType: 'application/json',
        data: JSON.stringify({ email }),
        success: handleLogin,
        error: handleLoginError
      });
    }
  });

  function handleLogin () {
    $('#success-message')
      .text('OTP sent to your email address')
      .removeClass('hidden');
    $('#success-message').slideDown();
    setTimeout(function () {
      $('#success-message').slideUp();
      window.location.href = '/reset-password';
    }, 3000);
    setTimeout(function () {
      $('#success-message').addClass('hidden');
    }, 4000);
  }

  function handleLoginError (response) {
    response.status === 404
      ? msg = 'Email not found'
      : msg = 'Unable to send OTP';
    $('#failure-message').text(msg)
      .removeClass('hidden')
      .slideDown();
    setTimeout(function () {
      $('#failure-message').slideUp();
    }, 3000);
    setTimeout(function () {
      $('#failure-message').addClass('hidden');
    }, 4000);
  }
});
