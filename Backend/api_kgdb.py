# 127.0.0.1:8000/login
# pages/index.html

from flask import Blueprint
from flask import request
from flask import current_app
from json import dumps, dump
from neo4j import GraphDatabase

api_kgdb = Blueprint('api_kgdb', __name__, static_folder='../Frontend')

def uniquedbname(dblist, dbname):
    for db in dblist:
        if db['unique-dbname'] == dbname:
            return True
    return False

def uniquedbauth(dblist, uri):
    for db in dblist:
        if db['uri'] == uri:
            return True
    return False

@api_kgdb.route("/api/addconnectiondb", methods=['POST'], strict_slashes=False)
def api_index_post_addconnectiondb():
    if request.method == 'POST':
        mydbname = request.form['mydbname']
        uri = request.form['uri']
        username = request.form['username']
        password = request.form['password']
        if mydbname == "" or uri == "" or username == "" or password == "":
            return dumps({'status':'fail','resultdata':'存在为空的字段'})
        if uniquedbname(current_app.config['System_Database_list'], mydbname):
            return dumps({'status':'notuniquename', 'resultdata':'已存在同名数据库'})  
        if uniquedbauth(current_app.config['System_Database_list'], uri):
            return dumps({'status':'notuniquedb', 'resultdata':'已和同一个数据库建立过连接'})  
        dbinfo = {
            "unique-dbname": mydbname,
            "category": "neo4j",
            "uri": uri,
            "username": username,
            "password": password
        }
        try: 
            driver = GraphDatabase.driver(uri, auth=(username,password))
            with driver.session() as session:
                session.run("MATCH (x) RETURN x limit 1")

            with current_app.config['Lock_Database_Driver']:
                current_app.config['System_Database_list'].append(dbinfo)
                with open(current_app.config['System_Database_file'], 'w') as json_file:
                    dump(current_app.config['System_Database_list'], json_file, indent=4)
            return dumps({'status':'success', 'resultdata':'添加数据库连接成功！'})  
        except:
            return dumps({'status':'fail', 'resultdata':'连接失败，请检查鉴权信息以及数据库状态'})  
