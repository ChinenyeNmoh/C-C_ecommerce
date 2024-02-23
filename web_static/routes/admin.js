const express = require('express');
const router = express.Router();

router.get('/', function (req, res, next) {
  console.log(encodeURIComponent(req.originalUrl));
  console.log('2', req.xhr);
  params = {
    title: 'Expressing',
    profilePic: 'Pics',
    current_user: 'Chidiadi',
    header: 'Dashoard'
  };
  res.render('admin/index', params);
});

router.get('/products', function (req, res, next) {
  // if (!req.xhr) res.redirect('/admin');
  params = {
    title: 'Admin Page',
    current_user: 'Chidiadi',
    header: 'Products'
  };
  res.render('admin/products', params);
});

router.get('/customers', function (req, res, next) {
  if (!req.xhr) res.redirect('/admin');
  params = {
    title: 'Admin Page',
    current_user: 'Chidiadi',
    header: 'Customers'
  };
  res.render('admin/customers', params);
});

router.get('/orders', function (req, res, next) {
  if (!req.xhr) res.redirect('/admin');
  params = {
    title: 'Admin Page',
    current_user: 'Chidiadi',
    header: 'Orders'
  };
  res.render('admin/orders', params);
});

module.exports = router;
