$(() => {
  $('#success-message').hide();
  $('#failure-message').hide();
  $('#m-nav').hide();
  $('#m-search-div').hide();
  $('.profile-drop-down').hide();
  $('#nav-btn').click(function () {
    // $('#m-nav').stop().slideToggle('medium');
    $('#m-nav').stop().animate({ width: 'toggle' }, 300);
    $(this).toggleClass('fa-xmark fa-bars');
    $(this).toggleClass('clicked');
    setTimeout(function () {
      $('#nav-btn').removeClass('clicked');
    }, 100);
  });

  $('#m-search-btn').click(function (event) {
    event.stopPropagation();
    $('#m-search-div').stop().slideToggle('medium');
  });
  $('#nav-profile-btn').hover(function (event) {
    event.stopPropagation();
    $('.profile-drop-down').slideDown('medium');
  });
  $(document).click(function (event) {
    if (!$(event.target).closest('#m-search-div').length) {
      $('#m-search-div').slideUp('medium');
    }
    if (!$(event.target).closest('.profile-drop-down').length) {
      $('.profile-drop-down').slideUp('medium');
    }
  });
  $('#close-profile-drop-down').click(function () {
    $('.profile-drop-down').slideUp('medium');
  });
  $('.profile-drop-down').mouseleave(function () {
    $('.profile-drop-down').slideUp('medium');
  });
});
