#!/usr/bin/python3
"""
admin views
"""
from flask import render_template
from . import app_views


@app_views.route('/admin', strict_slashes=False)
def admin():
    """ admin """
    return render_template('admin/index.html')
