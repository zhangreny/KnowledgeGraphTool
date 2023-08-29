# 127.0.0.1:8000/index
# pages/index.html

from flask import Blueprint
from flask import request
from flask import current_app
from hashlib import sha256
from json import dumps

api_index = Blueprint('api_index', __name__, static_folder='../Frontend')

@api_index.route("/index")
def get_index():
    return api_index.send_static_file("pages/index.html")