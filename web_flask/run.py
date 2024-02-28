#!/usr/bin/python3
"""
init app
"""

import os
from flask import Flask
from flask_cors import CORS
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
app.secret_key = os.getenv('SECRET_KEY')
CORS(app)

from views import app_views
app.register_blueprint(app_views)

if __name__ == "__main__":
    app.run(debug=True)
