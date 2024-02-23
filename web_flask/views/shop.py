#!/usr/bin/python3
"""
admin views
"""
from flask import render_template
from . import app_views


@app_views.route('/', strict_slashes=False)
def shop_index():
    """ admin """
    return render_template('shop/index.html')

@app_views.route('/products', strict_slashes=False)
def products():
    """ admin """
    return render_template('shop/products.html')

@app_views.route('/products/details', strict_slashes=False)
def products_details():
    """ admin """
    return render_template('shop/products.details.html')

@app_views.route('/register', strict_slashes=False)
def register():
    """ admin """
    return render_template('shop/register.html')

@app_views.route('/login', strict_slashes=False)
def login():
    """ admin """
    return render_template('shop/login.html')

@app_views.route('/reset-password', strict_slashes=False)
def reset_password():
    """ admin """
    return render_template('shop/reset-password.html')

@app_views.route('/my-account', strict_slashes=False)
def my_account():
    """ admin """
    return render_template('shop/my-account.html')

@app_views.route('/my-account/orders', strict_slashes=False)
def my_orders():
    """ admin """
    return render_template('shop/my-account.orders.html')

@app_views.route('/my-account/details', strict_slashes=False)
def my_details():
    """ admin """
    return render_template('shop/my-account.details.html')

@app_views.route('/my-account/address', strict_slashes=False)
def address():
    """ admin """
    return render_template('shop/my-account.address.html')

@app_views.route('/my-account/payment-methods', strict_slashes=False)
def payment_methods():
    """ admin """
    return render_template('shop/my-account.payment.html')
