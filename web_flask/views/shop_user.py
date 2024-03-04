#!/usr/bin/python3
"""
shop views
"""
from datetime import datetime
from flask import (
        render_template,
        request, session,
        url_for, redirect,
        jsonify
        )
import requests
from . import app_views
from utils import login_required


@app_views.route('/register', strict_slashes=False, methods=['GET', 'POST'])
def register():
    """ register user """
    if request.method == 'POST':
        url = 'http://localhost:5001/api/v2/users'
        data = request.get_json()
        headers = {'Content-Type': 'application/json'}
        response = requests.post(url, headers=headers, json=data)

        print('status_code: ', response.status_code)
        if response.status_code == 201:
            user_data = response.json()
            email = user_data.get('email')
            print('email: ', email)
            session['username'] = email
            print('register email: ', session.get('username'))
            return jsonify({ 'status': 'success' }), 200
        return jsonify({ 'error': 'failed' }), response.status_code

    return render_template('shop/register.html')


@app_views.route('/verify-email', strict_slashes=False, methods=['GET', 'POST'])
def verify_email():
    """ verify email """
    email = session.get('username')
    if request.method == 'POST':
        if not email:
            return jsonify({ 'error': 'User ID not found in session' }), 400

        url = 'http://localhost:5001/api/v2/users/verify'
        data = request.get_json()
        print(data)
        data['email'] = email
        print(data)
        headers = {'Content-Type': 'application/json'}
        response = requests.post(url, headers=headers, json=data)

        if response.status_code == 200:
            return jsonify({ 'status': 'success' }), 200
        return jsonify({ 'error': 'Invalid OTP' }), response.status_code

    return render_template('shop/verify-email.html', email=email)


@app_views.route('/verify-email/resend', methods=['POST'])
def resend_otp():
    """ resend otp for email verification """
    email = session.get('username')
    if request.method == 'POST':
        if not email:
            return jsonify({ 'error': 'User ID not found in session' }), 400

        url = 'http://localhost:5001/api/v2/users/resend-otp'
        data = {'email': email}
        headers = {'Content-Type': 'application/json'}
        response = requests.post(url, headers=headers, json=data)

        if response.status_code == 200:
            return jsonify({ 'status': 'success' }), 200
        return jsonify({ 'error': 'unable to resend OTP' }), response.status_code

    return render_template('shop/verify-email.html')


@app_views.route('/reset-password', strict_slashes=False, methods=['GET', 'POST'])
def reset_password():
    """ reset password """
    if request.method == 'POST':

        url = 'http://localhost:5001/api/v2/users/reset-password'
        data = request.get_json()
        data['email'] = session.get('reset_password_email')
        headers = {'Content-Type': 'application/json'}
        response = requests.post(url, headers=headers, json=data)
        print(data)
        if response.status_code == 200:
            session.clear()
            return jsonify({ 'status': 'success' }), 200
        return jsonify({ 'error': 'Password reset failed' }), response.status_code
    return render_template('shop/reset-password.html')


@app_views.route('/my-account', strict_slashes=False)
@login_required
def my_account():
    """ my account routes """
    user = session.get('user').get('user')

    return render_template('shop/my-account.html', user=user)


@app_views.route('/my-account/orders', strict_slashes=False)
@login_required
def my_orders():
    """ admin """
    return render_template('shop/my-account.orders.html')


@app_views.route('/my-account/details', strict_slashes=False)
@login_required
def my_details():
    """ account details """
    user = session.get('user').get('user')
    dob = user.get('dateOfBirth')

    d = datetime.strptime(dob, '%Y-%m-%dT%H:%M:%S.%fZ')
    day, month, year = d.day, d.strftime('%B'), d.year

    return render_template(
            'shop/my-account.details.html',
            user=user, day=day,
            month=month, year=year
            )


@app_views.route('/my-account/address', strict_slashes=False)
@login_required
def address():
    """ address """
    user = session.get('user').get('user')

    return render_template('shop/my-account.address.html', user=user)


@app_views.route('/my-account/payment-methods', strict_slashes=False)
@login_required
def payment_methods():
    """ admin """
    return render_template('shop/my-account.payment.html')
