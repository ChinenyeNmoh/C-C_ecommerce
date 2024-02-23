$(() => {
  function generateDays () {
    const daySelect = $('#register-day');
    daySelect.empty();
    daySelect.append('<option value="" disabled selected>Day</option>');
    const daysInMonth = 31;
    for (let i = 1; i <= daysInMonth; i++) {
      daySelect.append(`<option value="${i}">${i}</option>`);
    }
  }

  function generateMonths () {
    const monthSelect = $('#register-month');
    monthSelect.empty();
    monthSelect.append('<option value="" disabled selected>Month</option>');
    const monthsInYear = [
      'January', 'February', 'March',
      'April', 'May', 'June',
      'July', 'August', 'September',
      'October', 'November', 'December'
    ];
    for (const i of monthsInYear) {
      monthSelect.append(`<option value="${i}">${i}</option>`);
    }
  }

  function generateYears () {
    const yearSelect = $('#register-year');
    yearSelect.empty();
    yearSelect.append('<option value="" disabled selected>Year</option>');
    const currentYear = new Date().getFullYear();
    const minYear = currentYear - 18;
    const maxYear = currentYear - 100;
    for (let i = minYear; i >= maxYear; i--) {
      yearSelect.append(`<option value="${i}">${i}</option>`);
    }
  }

  // Call the functions to generate options initially
  generateDays();
  generateMonths();
  generateYears();
});
