from termcolor import colored
from flask import Flask
from flask import redirect
from datetime import timedelta
from api_login import api_login
from api_index import api_index
from api_kgdb import api_kgdb
from loadsystem import load_password_file
from loadsystem import load_db_file
from loadsystem import load_config_file
from loadsystem import load_dbdriver
import threading
from timefunctions import getdatenow_string
from timefunctions import datestring2unixtime_int

port = 8000


# app
app = Flask(
    __name__,
    static_folder='../Frontend',
    static_url_path='/static'
)
app.register_blueprint(api_login)
app.register_blueprint(api_index)
app.register_blueprint(api_kgdb)

app.config['SEND_FILE_MAX_AGE_DEFAULT'] = timedelta(seconds=1) 
app.config['PERMANENT_SESSION_LIFETIME'] = timedelta(seconds=1) 
app.config['System_Auth_dict'] = {}
app.config['System_Config_dict'] = {}
app.config['System_Database_list'] = []
app.config['System_Dbdriver_list'] = []
app.config['Lock_Database_Driver'] = threading.Lock()
app.config['System_Data_folder'] = '../Data/Databases/'
app.config['Lock_Data_folder'] = threading.Lock()
app.config['System_Passwd_file'] = '../Data/auth.txt'
app.config['System_Database_file'] = '../Data/db.json'
app.config['System_Config_file'] = '../Data/config.json'
app.config['USERNAME_TOKEN_ENDTIME'] = {}
app.config['Lock_User_Token'] = threading.Lock()

@app.route("/")
def get_default():
    return redirect('/login')


# apscheduler
from apscheduler.schedulers.background import BackgroundScheduler
scheduler = BackgroundScheduler()

def ClearOutdatedToken():
    timestr = getdatenow_string()
    info_msg = colored("["+timestr+"]Interval Job Executed: ClearOutdatedToken", "cyan")
    print(info_msg)
    timenow = datestring2unixtime_int(timestr)
    keystodelete = []
    for key, value in app.config['USERNAME_TOKEN_ENDTIME'].items():
        if value[1] < timenow:
            keystodelete.append(key)
    with app.config['Lock_User_Token']: 
        for key in keystodelete:
            del app.config['USERNAME_TOKEN_ENDTIME'][key]
    return

def ClearNonExistDatabaseAndDomainFolder():
    pass


# main
if __name__ == '__main__':
    print("======================= [init] =======================")
    error_msg = colored("Failed!", "red")
    success_msg = colored("Success!", "green")

    print("1. Loading authentication File...", end=" ")
    app.config['System_Auth_dict'] = load_password_file(app.config['System_Passwd_file'])
    if app.config['System_Auth_dict']=="Failed!":
        print(error_msg)
        exit()
    print(success_msg)

    print("2. Loading Database Info Storage...", end=" ")
    app.config['System_Database_list'] = load_db_file(app.config['System_Database_file'])
    if app.config['System_Database_list']=="Failed!":
        print(error_msg)
        exit()
    print(success_msg)

    print("3. Loading System Config File...", end=" ")
    app.config['System_Config_dict'] = load_config_file(app.config['System_Config_file'])
    if app.config['System_Config_dict']=="Failed!":
        print(error_msg)
        exit()
    print(success_msg)

    print("4. Creating Database Drivers...", end=" ")
    app.config['System_Dbdriver_list'], activedrivernum = load_dbdriver(app.config['System_Database_list'])
    print(success_msg, "Active", activedrivernum, "/ All", len(app.config['System_Dbdriver_list']))

    print("5. Starting interval jobs...", end=" ")
    try:
        scheduler.add_job(ClearOutdatedToken, 'interval', hours=int(app.config['System_Config_dict']['auth']['token_validtime_hours'])//3+1)    
        scheduler.start()
        print(success_msg)
    except:
        print(error_msg)
        exit()

    app.run(host='127.0.0.1', port=port)


