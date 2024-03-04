#!/usr/bin/python3
"""
init app
"""

import os
from datetime import timedelta
from flask import Flask, session
from flask_cors import CORS
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)

app.secret_key = os.getenv('SECRET_KEY')
app.config['PERMANENT_SESSION_LIFETIME'] = timedelta(days=1)
CORS(app)

@app.before_request
def init_session():
    """ init session """
    session.permanent = True

from views import app_views
app.register_blueprint(app_views)

if __name__ == "__main__":
    app.run(debug=True)
