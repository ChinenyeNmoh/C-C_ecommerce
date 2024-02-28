#!/usr/bin/python3
"""
shop views
"""
import base64
from flask import (
        render_template,
        request, session,
        redirect, url_for,
        jsonify
        )
import requests
from . import app_views


@app_views.route('/login', strict_slashes=False, methods=['GET', 'POST'])
def login():
    """ login user """
    if request.method == 'POST':
        url = 'http://localhost:5001/api/v2/connect'
        data = request.get_json()
        credentials = base64.b64encode(
                f"{data['email']}:{data['password']}".encode()
                ).decode()
        headers = {'Authorization': f'Basic {credentials}'}
        response = requests.get(url, headers=headers)

        if response.status_code == 200:
            token = response.json().get('token')
            session['token'] = token
            print(session['token'])
            url = 'http://localhost:5001/api/v2/users/me'
            headers = {'X-Token': token}
            res = requests.get(url, headers=headers)
            session['user'] = res.json()
            print(session.get('user'))
            return jsonify({'status': 'ok'}), 200
        return jsonify({'error': 'unsuccessful'}), response.status_code

    return render_template('shop/login.html')


@app_views.route('/logout', strict_slashes=False)
def logout():
    """ logout user """
    url = 'http://localhost:5001/api/v2/disconnect'
    headers = {'X-Token': session['token']}
    response = requests.get(url, headers=headers)
    print(headers)
    print(response)
    if response.status_code == 204:
        print('sucess')
    session.clear()
    return redirect(url_for('app_views.shop_index'))
