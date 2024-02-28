$(() => {
  $('#success-message').hide();
  $('#failure-message').hide();
  $('#login-form input').keydown(function (event) {
    if (event.keyCode === 13) {
      event.preventDefault();
    }
  });

  // Function to generate days dynamically based on selected month and year
  function generateDays (month, year) {
    const daySelect = $('#register-day');
    daySelect.empty().append('<option value="" disabled selected>Day</option>');
    const daysInMonth = new Date(year, month, 0).getDate();
    for (let i = 1; i <= daysInMonth; i++) {
      daySelect.append(`<option value="${i}">${i}</option>`);
    }
  }

  // Function to generate months dynamically
  function generateMonths () {
    const monthSelect = $('#register-month');
    monthSelect.empty().append('<option value="" disabled selected>Month</option>');
    const monthsInYear = [
      'January', 'February', 'March',
      'April', 'May', 'June',
      'July', 'August', 'September',
      'October', 'November', 'December'
    ];
    monthsInYear.forEach((month, index) => monthSelect.append(`<option value="${index + 1}">${month}</option>`));
  }

  // Function to generate years dynamically
  function generateYears () {
    const yearSelect = $('#register-year');
    yearSelect.empty().append('<option value="" disabled selected>Year</option>');
    const currentYear = new Date().getFullYear();
    const minYear = currentYear - 18;
    const maxYear = currentYear - 100;
    for (let i = minYear; i >= maxYear; i--) {
      yearSelect.append(`<option value="${i}">${i}</option>`);
    }
  }

  // Call the functions to generate options initially
  generateMonths();
  generateYears();

  // Event handler for month and year selection
  $('#register-month, #register-year').on('change', function () {
    const selectedMonth = parseInt($('#register-month').val());
    const selectedYear = parseInt($('#register-year').val());
    if (selectedMonth && selectedYear) {
      generateDays(selectedMonth, selectedYear);
    }
  });

  // Event handler for email input validation
  $('#register-email').on('input', function () {
    const email = $(this).val();
    if (!validateEmail(email)) {
      $(this).removeClass('valid').addClass('invalid');
      $('#email-error').text('Please enter a valid email address.').removeClass('hidden');
    } else {
      $(this).removeClass('invalid').addClass('valid');
      $('#email-error').addClass('hidden');
    }
  });

  // Event handler for name input validation
  $('#register-firstName, #register-lastName').on('input', function () {
    const name = $(this).val();
    if (!validateName(name)) {
      $(this).removeClass('valid').addClass('invalid');
      $('#name-error').text('Please enter a valid name.').removeClass('hidden');
    } else {
      $(this).removeClass('invalid').addClass('valid');
      $('#name-error').addClass('hidden');
    }
  });

  $('#register-password').on('input', function () {
    const password = $(this).val();
    if (!validatePassword(password)) {
      $(this).removeClass('valid').addClass('invalid');
      $('#password-error').removeClass('hidden');
    } else {
      $(this).removeClass('invalid').addClass('valid');
      $('#password-error').addClass('hidden');
    }
  });

  $('#confirm-password').on('input', function () {
    const password = $(this).val();
    if (password !== $('#register-password').val()) {
      $('#register-password, #confirm-password').removeClass('valid').addClass('invalid');
      $('#password-error').text('Passwords do not match.').removeClass('hidden');
      $('#confirm-password-error').text('Passwords do not match.').removeClass('hidden');
      isValid = false;
    } else {
      $('#register-password, #confirm-password').removeClass('invalid').addClass('valid');
      $('#password-error, #confirm-password-error').addClass('hidden');
    }
  });

  // Event handler for form submission
  $('#submit-register-form').click(function (event) {
    event.preventDefault(); // Prevent the form from submitting normally

    // Validate form fields
    const email = $('#register-email').val();
    const firstName = $('#register-firstName').val();
    const lastName = $('#register-lastName').val();
    const password = $('#register-password').val();
    const confirmPassword = $('#confirm-password').val();
    const day = $('#register-day').val();
    const month = $('#register-month').val();
    const year = $('#register-year').val();

    let isValid = true;

    // Check if all fields are valid
    if (!validateEmail(email)) {
      $('#register-email').removeClass('valid').addClass('invalid');
      $('#email-error').text('Please enter a valid email address.').removeClass('hidden');
      isValid = false;
    } else {
      $('#register-email').removeClass('invalid').addClass('valid');
      $('#email-error').addClass('hidden');
    }

    if (!validateName(firstName) || !validateName(lastName)) {
      $('#register-firstName, #register-lastName').removeClass('valid').addClass('invalid');
      $('#name-error').text('Please enter a valid name.').removeClass('hidden');
      isValid = false;
    } else {
      $('#register-firstName, #register-lastName').removeClass('invalid').addClass('valid');
      $('#name-error').addClass('hidden');
    }

    if (password !== confirmPassword) {
      $('#register-password, #confirm-password').removeClass('valid').addClass('invalid');
      $('#password-error').removeClass('hidden');
      $('#confirm-password-error').removeClass('hidden');
      isValid = false;
    } else {
      $('#register-password, #confirm-password').removeClass('invalid').addClass('valid');
      $('#password-error').addClass('hidden');
    }

    if (!validatePassword(password)) {
      $('#register-password').removeClass('valid').addClass('invalid');
      $('#password-error').removeClass('hidden');
      isValid = false;
    } else {
      $('#register-password').removeClass('invalid').addClass('valid');
      $('#password-error').addClass('hidden');
    }

    if (!validateDateOfBirth(day, month, year)) {
      console.log(day, month, year);
      $('#register-day').removeClass('valid').addClass('invalid');
      $('#register-month').removeClass('valid').addClass('invalid');
      $('#register-year').removeClass('valid').addClass('invalid');
      isValid = false;
    } else {
      $('#register-day').removeClass('invalid').addClass('valid');
      $('#register-month').removeClass('invalid').addClass('valid');
      $('#register-year').removeClass('invalid').addClass('valid');
    }

    const dateOfBirth = `${year}-${month}-${day}`;

    if (isValid) {
      $.ajax({
        type: 'POST',
        url: 'http://localhost:5000/register',
        data: JSON.stringify({
          email,
          firstName,
          lastName,
          password,
          dateOfBirth
        }),
        contentType: 'application/json',
        success: function (response) {
          $('#success-message').text('Created successfully').removeClass('hidden');
          $('#success-message').slideDown();
          setTimeout(function () {
            $('#success-message').slideUp().addClass('hidden');
            window.location.href = '/verify-email';
          }, 3000);
        },
        error: function (xhr, status, error) {
          if (xhr.status === 400) {
            $('#failure-message').text('Email already exist').removeClass('hidden');
            $('#failure-message').slideDown();
            setTimeout(function () {
              $('#failure-message').slideUp();
            }, 3000);
            setTimeout(function () {
              $('#failure-message').addClass('hidden');
            }, 4000);
          } else {
            $('#failure-message').text('server error').removeClass('hidden');
            $('#failure-message').slideDown();
            setTimeout(function () {
              $('#failure-message').slideUp();
            }, 3000);
            setTimeout(function () {
              $('#failure-message').addClass('hidden');
            }, 4000);
          }
        }
      });
    }
  });
});

// Validation functions
function validateEmail (email) {
  const emailRegex = /.+@.+\..+/;
  return emailRegex.test(email);
}

function validateName (name) {
  const nameRegex = /^\S.*$/;
  return nameRegex.test(name);
}

function validatePassword (password) {
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password);
}

function validateDateOfBirth (day, month, year) {
  const isValidDay = Number.isInteger(parseInt(day));
  const monthInt = parseInt(month);
  const isValidMonth = Number.isInteger(monthInt) &&
        monthInt >= 1 && monthInt <= 12;
  const isValidYear = Number.isInteger(parseInt(year));

  return isValidDay && isValidMonth && isValidYear;
}
