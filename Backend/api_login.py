# 127.0.0.1:8000/login
# pages/login.html

from flask import Blueprint
from flask import request
from flask import current_app
from hashlib import sha256
from json import dumps

api_login = Blueprint('api_login', __name__, static_folder='../Frontend')

@api_login.route("/login")
def get_login():
    return api_login.send_static_file("pages/login.html")

@api_login.route("/api/register", methods=['POST'], strict_slashes=False)
def api_login_post_register():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        confirmpassword = request.form['confirmpassword']
        if password != confirmpassword:
            return dumps({'status':'fail3','resultdata':'两次密码输入不一致'})
        if " " in username or " " in password or " " in confirmpassword:
            return dumps({'status':'fail','resultdata':'用户名和密码不可包含空格'})
        if username == "" or password == "" or confirmpassword == "":
            return dumps({'status':'fail','resultdata':'用户名和密码不可为空'})
        try:
            if username not in current_app.config["System_Auth_dict"]:
                passwd = str(sha256(password.encode("utf-8")).hexdigest())
                current_app.config["System_Auth_dict"][username] = [passwd, 'user']
                with open(current_app.config["System_Passwd_file"], 'a', encoding='utf-8') as userlistfileobj:
                    userlistfileobj.write(str(username)+" "+str(passwd)+" user"+'\n')
                return dumps({'status':'success','resultdata':'注册成功！'})
            else:
                return dumps({'status':'fail1','resultdata':'用户名已经存在了哦，换一个吧'})
        except:
            return dumps({'status':'fail','resultdata':'用户注册出现bug了'})

@api_login.route("/api/login", methods=['POST'], strict_slashes=False)
def api_login_post_login():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        try:
            if username == "" or password == "":
                return dumps({'status':'fail','resultdata':'用户名和密码不可为空'})
            if username not in current_app.config["System_Auth_dict"]:
                return dumps({'status':'fail1','resultdata':'用户名不存在哦'})
            else:
                if current_app.config["System_Auth_dict"][username][0] != str(sha256(password.encode("utf-8")).hexdigest()):
                    return dumps({'status':'fail2','resultdata':'密码输入错误哦'})
                else:
                    return dumps({'status':'success','resultdata':'登录成功'})
        except:
            return dumps({'status':'fail','resultdata':'用户登录出现bug了'})