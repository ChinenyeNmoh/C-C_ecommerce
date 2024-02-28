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
      url: '/verify-email',
      data: otp,
      contentType: 'application/json',
      success: function (response) {
        $('#success-message')
          .text('Email verified successfully')
          .removeClass('hidden');
        $('#success-message').slideDown();
        setTimeout(function () {
          $('#success-message').slideUp();
          // window.location.href = '/verify-email';
        }, 3000);
        setTimeout(function () {
          $('#success-message').addClass('hidden');
        }, 4000);
      },
      error: function () {
        console.log('failed');
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
        // Handle success, e.g., display a message to the user
        alert(response.message);
      },
      error: function (xhr, status, error) {
        // Handle error, e.g., display an error message
        const errorMessage = JSON.parse(xhr.responseText).error;
        alert(errorMessage);
      }
    });
  });
});

function validateOtp (otp) {
  const otpInt = parseInt(otp);
  const isValidOtp = Number.isInteger(otpInt) && otp.length === 6;

  return isValidOtp;
}
