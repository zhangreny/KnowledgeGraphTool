from termcolor import colored
from flask import Flask
from flask import redirect
from datetime import timedelta
from api_login import api_login
from api_index import api_index
from loadsystem import load_password_file

port = 8000

app = Flask(
    __name__,
    static_folder='../Frontend',
    static_url_path='/static'
)
app.register_blueprint(api_login)
app.register_blueprint(api_index)


app.config['SEND_FILE_MAX_AGE_DEFAULT'] = timedelta(seconds=1) 
app.config['PERMANENT_SESSION_LIFETIME'] = timedelta(seconds=1) 
app.config['System_Auth_dict'] = {}
app.config['System_Passwd_file'] = '../Data/auth.txt'         

@app.route("/")
def get_default():
    return redirect('/login')

if __name__ == '__main__':
    print("======================= [init] =======================")
    error_msg = colored("Failed!", "red")
    success_msg = colored("Success!", "green")

    print("1. Loading authentication File...", end=" ")
    app.config['System_Auth_dict'] = load_password_file(app.config['System_Passwd_file'])
    print(error_msg if app.config['System_Auth_dict']=="Failed!" else success_msg)
    app.run(host='127.0.0.1', port=port)

