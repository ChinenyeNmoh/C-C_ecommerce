#!/usr/bin/python3
"""
utilities
"""

from functools import wraps
from flask import session, redirect, url_for
from views import app_views


def login_required(f):
    """
    Decorator to enforce login requirement.
    """
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'token' not in session:
            return redirect(url_for('app_views.login'))
        return f(*args, **kwargs)
    return decorated_function
