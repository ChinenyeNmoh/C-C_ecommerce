#!/usr/bin/python3
"""
init app
"""

from flask import Flask, render_template

app = Flask(__name__)


from views import app_views
app.register_blueprint(app_views)

if __name__ == "__main__":
    app.run(debug=True)
