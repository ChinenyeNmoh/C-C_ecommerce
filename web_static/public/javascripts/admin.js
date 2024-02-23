/** ******************* Aside **********************/
$(() => {
  $('aside ul li:first').addClass('bg-blue-600 text-white');

  const $liBtns = $('aside ul li a');

  $liBtns.on({
    mouseenter: function () {
      !$(this).closest('li').hasClass('bg-blue-600 text-white') &&
            $(this).closest('li').addClass('bg-neutral-100');
    },
    mouseleave: function () {
      $(this).closest('li').removeClass('bg-neutral-100');
    },
    click: function () {
      $('aside ul li').removeClass('bg-blue-600 text-white');
      $(this).closest('li').removeClass('bg-neutral-100');
      $(this).closest('li').addClass('bg-blue-600 text-white');
    }
  });
});

/** ******************* Products **********************/
$(document).ready(function () {
  // Function to load content dynamically from a specified URL
  function loadPage (url, header) {
    $.get(url, function (data) {
      $('#adminMainContent').html(data);
      $('#adminHeader').text(header);
    });
  }

  // Event listener for navigation links
  // $('aside a').click(function (event) {
  //   event.preventDefault();
  //   const url = $(this).attr('href');
  //   const header = $(this).attr('name');
  //   url !== '#' && loadPage(url, header);
  // });
});
