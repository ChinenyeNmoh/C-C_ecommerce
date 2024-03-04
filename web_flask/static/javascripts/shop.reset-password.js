console.log('reset_password');
$(() => {
  $('#success-message').hide();
  $('#failure-message').hide();

  $('#reset-password-form').submit(function (event) {
    event.preventDefault();
    const otp = $('#reset-otp').val();
    const password = $('#reset-password').val();
    const confirmPassword = $('#reset-confirm-password').val();

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

    if (!validateOtp(otp)) {
      $('#reset-otp-error').removeClass('hidden');
      return;
    } else {
      $('#reset-otp-error').addClass('hidden');
    }

    $('#reset-password-error').toggleClass('hidden', passwordRegex.test(password));

    if (password !== confirmPassword) {
      $('#reset-confirm-password-error').removeClass('hidden');
      return;
    } else {
      $('#reset-confirm-password-error').addClass('hidden');
    }

    if (passwordRegex.test(password)) {
      $.ajax({
        type: 'POST',
        url: 'http://localhost:5000/reset-password',
        contentType: 'application/json',
        data: JSON.stringify({ otp, password }),
        success: handleLogin,
        error: handleLoginError
      });
    }
  });

  function handleLogin (response) {
    $('#success-message')
      .text('Password updated successfully')
      .removeClass('hidden');
    $('#success-message').slideDown();
    setTimeout(function () {
      $('#success-message').slideUp();
      window.location.href = '/login';
    }, 3000);
    setTimeout(function () {
      $('#success-message').addClass('hidden');
    }, 4000);
  }

  function handleLoginError (error) {
    $('#failure-message')
      .text('Not successful')
      .removeClass('hidden');
    $('#failure-message').slideDown();
    setTimeout(function () {
      $('#failure-message').slideUp();
    }, 3000);
    setTimeout(function () {
      $('#failure-message').addClass('hidden');
    }, 4000);
  }

  function validateOtp (otp) {
    const otpInt = parseInt(otp);
    const isValidOtp = Number.isInteger(otpInt) && otp.length === 6;

    return isValidOtp;
  }
});
