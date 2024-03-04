#!/usr/bin/python3
"""
init views
"""
from flask import Blueprint

app_views = Blueprint('app_views', __name__)

from .admin import *
from .shop import *
from .shop_auth import *
from .shop_user import *
