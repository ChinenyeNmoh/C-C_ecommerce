$(() => {
  console.log('hello');
  $('#verify-email-form').submit(function (event) {
    event.preventDefault();

    const formData = $(this).serialize();

    $.ajax({
      type: 'POST',
      url: '/verify-email',
      data: formData,
      success: function (response) {
        $('#verificationMessage').html(response.message);
      },
      error: function (xhr, status, error) {
        const errorMessage = JSON.parse(xhr.responseText).error;
        $('#verificationMessage').html(errorMessage);
      }
    });
  });
});
