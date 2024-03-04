// $(document).ready(function () {
//   // Sample data (replace with your actual data)
//   const products = [
//     { id: 1, name: 'Product 1', category: 'Category 1', subcategory: 'Subcategory A' },
//     { id: 2, name: 'Product 2', category: 'Category 2', subcategory: 'Subcategory B' }
//     // Add more products here
//   ];

//   // Function to populate category select options
//   function populateCategories () {
//     const categories = [...new Set(products.map(product => product.category))];
//     const categorySelect = $('#category-select');
//     categorySelect.empty();
//     categorySelect.append($('<option value="all">All Categories</option>'));
//     categories.forEach(category => {
//       categorySelect.append($('<option></option>').val(category).text(category));
//     });
//   }

//   // Function to populate subcategory select options based on selected category
//   function populateSubcategories (selectedCategory) {
//     const subcategories = [...new Set(products.filter(product => product.category === selectedCategory).map(product => product.subcategory))];
//     const subcategorySelect = $('#subcategory-select');
//     subcategorySelect.empty();
//     subcategorySelect.append($('<option value="all">All Subcategories</option>'));
//     subcategories.forEach(subcategory => {
//       subcategorySelect.append($('<option></option>').val(subcategory).text(subcategory));
//     });
//   }

//   // Function to filter products based on selected category and subcategory
//   function filterProducts () {
//     const category = $('#category-select').val();
//     const subcategory = $('#subcategory-select').val();
//     const filteredProducts = products.filter(product => (category === 'all' || product.category === category) && (subcategory === 'all' || product.subcategory === subcategory));
//     displayProducts(filteredProducts);
//   }

//   // Function to display filtered products
//   function displayProducts (filteredProducts) {
//     const productsContainer = $('.products');
//     productsContainer.empty();
//     filteredProducts.forEach(product => {
//       const productCard = $('<div class="product-card"></div>');
//       productCard.html(`
//                 <h3>${product.name}</h3>
//                 <p>Category: ${product.category}</p>
//                 <p>Subcategory: ${product.subcategory}</p>
//             `);
//       productsContainer.append(productCard);
//     });
//   }

//   // Populate category select options on page load
//   populateCategories();

//   // Event listeners for category and subcategory select change
//   $('#category-select').on('change', function () {
//     const selectedCategory = $(this).val();
//     populateSubcategories(selectedCategory);
//     filterProducts();
//   });

//   $('#subcategory-select').on('change', function () {
//     filterProducts();
//   });

//   // Initial filter based on selected category and subcategory
//   filterProducts();
// });
$(document).ready(function () {
  console.log('products page');
  let page = 1;
  const limit = 10; // Number of products to load per request
  let loading = false; // Flag to prevent multiple simultaneous requests

  // Function to check if the user has scrolled to the bottom of the page
  function isBottomOfPage () {
    return $(window).scrollTop() + $(window).height() >= $(document).height();
  }

  // Function to fetch more products from the API
  function fetchMoreProducts () {
    if (!loading) {
      loading = true;
      $.ajax({
        url: `/api/products?page=${page}&limit=${limit}`, // Replace with your API endpoint
        method: 'GET',
        success: function (data) {
          if (data.length > 0) {
            // Append the new products to the products container
            data.forEach(product => {
              $('#products-container').append(`<div class="product">${product.name}</div>`);
            });
            page++;
            loading = false;
          }
        },
        error: function (xhr, status, error) {
          console.error('Error fetching products:', error);
          loading = false;
        }
      });
    }
  }

  // Event listener for scroll events
  $(window).scroll(function () {
    if (isBottomOfPage()) {
      console.log('reached end');
      // fetchMoreProducts();
    }
  });

  // Initial fetch of products
  // fetchMoreProducts();
});

// Function to generate star ratings for products
function generateStarRating () {
  $('.rating').each(function () {
    // Get the rating value from the "data-rating" attribute
    const rating = parseFloat($(this).attr('data-rating'));

    // Round the rating to the nearest 0.5
    const roundedRating = Math.round(rating * 2) / 2;

    // Clear the contents of the rating element
    $(this).empty();

    // Create spans for each star
    for (let i = 0; i < 5; i++) {
      const starSpan = $('<span></span>');

      // If the index is less than the rounded rating, add a filled star
      if (i < roundedRating) {
        starSpan.text('\u2605'); // Filled star
      } else {
        starSpan.text('\u2606'); // Empty star
      }

      // Append the star span to the rating element
      $(this).append(starSpan);
    }
  });
}

// Call the function to generate star ratings on document ready
$(document).ready(function () {
  generateStarRating();
});
