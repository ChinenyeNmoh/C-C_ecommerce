#!/usr/bin/python3
"""
shop views
"""
from flask import render_template, request, session
from . import app_views


@app_views.route('/', strict_slashes=False)
def shop_index():
    """ admin """
    user = session.get('user')
    if user:
        user = user.get('user')
    return render_template('shop/index.html', user=user )

@app_views.route('/products', strict_slashes=False)
def products():
    """ admin """
    return render_template('shop/products.html')

@app_views.route('/products/details', strict_slashes=False)
def products_details():
    """ admin """
    return render_template('shop/products.details.html')
