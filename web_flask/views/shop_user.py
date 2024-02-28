#!/usr/bin/python3
"""
shop views
"""
from flask import (
        render_template,
        request, session,
        url_for, redirect,
        jsonify
        )
import requests
from . import app_views


@app_views.route('/register', strict_slashes=False, methods=['GET', 'POST'])
def register():
    """ register user """
    if request.method == 'POST':
        url = 'http://localhost:5001/api/v2/users'
        data = request.get_json()
        headers = {'Content-Type': 'application/json'}
        response = requests.post(url, headers=headers, json=data)

        if response.status_code == 201:
            user_data = response.json()
            user_id = user_data.get('userId')
            session['user_id'] = user_id
            return jsonify({ 'status': 'success' }), 200

    return render_template('shop/register.html')

@app_views.route('/verify-email', strict_slashes=False)
def verify_email():
    """ verify email """
    return render_template('shop/verify-email.html')

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
