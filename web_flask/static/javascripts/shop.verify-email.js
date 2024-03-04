$(() => {
  $('#verify-email').on('input', function () {
    const otp = $(this).val();
    if (!validateOtp(otp)) {
      $('#verify-email-error').removeClass('hidden');
    } else {
      $('#verify-email-error').addClass('hidden');
    }
  });

  $('#verify-email-form').submit(function (event) {
    event.preventDefault();
    const otp = $('#verify-email').val();

    if (!validateOtp(otp)) {
      console.log('invalid');
      $('#verify-email').removeClass('valid').addClass('invalid');
      $('#verify-email-error').removeClass('hidden');
      return;
    }

    console.log(otp);
    $.ajax({
      type: 'POST',
      url: 'http://localhost:5000/verify-email',
      data: JSON.stringify({ otp }),
      contentType: 'application/json',
      success: function (response) {
        $('#success-message')
          .text('Email verified successfully')
          .removeClass('hidden');
        $('#success-message').slideDown();
        setTimeout(function () {
          $('#success-message').slideUp();
          window.location.href = '/login';
        }, 3000);
        setTimeout(function () {
          $('#success-message').addClass('hidden');
        }, 4000);
      },
      error: function (response) {
        console.log('error', response);
        $('#failure-message')
          .text('Email verification failed')
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
  });

  $('#resend-otp').click(function () {
    console.log('resend');
    $.ajax({
      type: 'POST',
      url: '/verify-email/resend',
      success: function (response) {
        $('#success-message')
          .text('OTP resent to your email')
          .removeClass('hidden');
        $('#success-message').slideDown();
        setTimeout(function () {
          $('#success-message').slideUp();
        }, 3000);
        setTimeout(function () {
          $('#success-message').addClass('hidden');
        }, 4000);
      },
      error: function (xhr, status, error) {
        $('#failure-message')
          .text('Failed to send OTP. Try again.')
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
  });
});

function validateOtp (otp) {
  const otpInt = parseInt(otp);
  const isValidOtp = Number.isInteger(otpInt) && otp.length === 6;

  return isValidOtp;
}
