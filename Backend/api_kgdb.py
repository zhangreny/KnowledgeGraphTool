# 127.0.0.1:8000/login
# pages/index.html

from flask import Blueprint
from flask import request
from flask import current_app
from json import dumps, dump
from neo4j import GraphDatabase
from loadsystem import load_dbdriver

api_kgdb = Blueprint('api_kgdb', __name__, static_folder='../Frontend')

def uniquedbname(dblist, dbname):
    for db in dblist:
        if db['unique_dbname'] == dbname:
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
            "unique_dbname": mydbname,
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
        
        # 添加任务日志

@api_kgdb.route("/api/databaseinfo")
def api_index_get_databaseinfo():
    try: 
        ans = []
        # 等自动更新数据库状态写好之后，这里就不再手动去连接一次了，直接获取状态就行（或者出于稳定也还是连接一次）
        dbdriverlist, activedrivernum = load_dbdriver(current_app.config['System_Database_list'])
        dblist = current_app.config['System_Database_list'].copy()
        for i in range(len(dbdriverlist)):
            tmp = {
                "id": "",
                "status": "down",
                "unique_dbname": "",
                "uri": "",
                "domains": []
            }
            tmp['id'] = "db_"+str(i)
            tmp['status'] = "active" if dbdriverlist[i] != "driver failed!" else "down"
            tmp['unique_dbname'] = dblist[i]['unique_dbname']
            tmp['uri'] = dblist[i]['uri']
            if dbdriverlist[i] != "driver failed!":
                with dbdriverlist[i].session() as session:
                    results = list(session.run("MATCH (n:领域名) RETURN n.name AS NAME, id(n) as ID"))
                for j in range(len(results)):
                    tmp['domains'].append({"domainindex": tmp['id']+"_domain_"+str(j),"domainid": results[j]['ID'], "domainname": results[j]['NAME']})
            ans.append(tmp)
        current_app.config['System_Dbdriver_list'] = dbdriverlist
        return dumps({'status':'success', 'resultdata':ans})  
    except:
        return dumps({'status':'fail', 'resultdata':'获取数据库列表失败'})  

@api_kgdb.route("/api/deleteconnectiondb", methods=['POST'], strict_slashes=False)
def api_index_post_deleteconnectiondb():
    if request.method == 'POST':
        dbname = request.form['dbname']
        try: 
            with current_app.config['Lock_Database_Driver']:
                tmp = [dict_item for dict_item in current_app.config['System_Database_list'] if dict_item['unique_dbname'] != dbname]  
                current_app.config['System_Database_list'] = tmp
                with open(current_app.config['System_Database_file'], 'w') as json_file:
                    dump(current_app.config['System_Database_list'], json_file, indent=4)
            return dumps({'status':'success', 'resultdata':'移除数据库 ' + dbname + ' 成功！'})  
        except:
            return dumps({'status':'fail', 'resultdata':'移除数据库 ' + dbname + ' 失败'})  
        
