$(() => {
  const nameRegex = /^[a-zA-Z]{2,}$/;
  const mobileRegex = /^\d{11}$/;
  const addressRegex = /.+/;

  function validateInputs () {
    const firstName = $('#address-firstName').val();
    const lastName = $('#address-LastName').val();
    const mobile = $('#address-mobile').val();
    const address = $('#edit-address').val();

    if (!nameRegex.test(firstName)) {
      $('#address-firstName-error').removeClass('hidden');
      return false;
    }
    if (!nameRegex.test(lastName)) {
      $('#address-LastName-error').removeClass('hidden');
      return false;
    }
    if (!mobileRegex.test(mobile)) {
      $('#address-mobile-error').removeClass('hidden');
      return false;
    }
    if (!addressRegex.test(address)) {
      $('#add-address-error').removeClass('hidden');
      return false;
    }

    return true;
  }

  $('#save-address-changes').click(function (event) {
    event.preventDefault();

    if (!validateInputs()) {
      return;
    }

    const firstName = $('#address-firstName').val();
    const lastName = $('#address-LastName').val();
    const mobile = $('#address-mobile').val();
    const address = $('#add-address').val();

    const addressData = {
      firstName,
      lastName,
      mobile,
      address
    };

    $.ajax({
      type: 'POST',
      url: '/add_address',
      contentType: 'application/json',
      data: JSON.stringify(addressData),
      success: function (data) {
        console.log('Address added successfully:', data);
      },
      error: function (xhr, status, error) {
        console.error('Failed to add address:', error);
      }
    });
  });

  $('input, textarea').focus(function () {
    $(this).next('.error').addClass('hidden');
  });
});
