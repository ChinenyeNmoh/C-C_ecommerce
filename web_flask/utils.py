#!/usr/bin/python3
"""
utilities
"""

from functools import wraps
from flask import session, redirect, url_for


def login_required(f):
    """
    Decorator to enforce login requirement.

    Ensures that the user is logged in by checking for a 'session_id' in the session data.
    Redirects to the login page if the user is not logged in.

    Args:
        f (function): The function to be decorated.

    Returns:
        function: Decorated function with login enforcement.
    """
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'session_id' not in session:
            return redirect(url_for('login'))
        return f(*args, **kwargs)
    return decorated_function
