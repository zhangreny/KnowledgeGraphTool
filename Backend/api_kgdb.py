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
        with current_app.config['Lock_Database_Driver']:
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
                for i in range(len(current_app.config['System_Database_list'])):
                    dict_item = current_app.config['System_Database_list'][i]
                    if dict_item['unique_dbname'] == dbname:
                        ind = i
                        break
                tmp = [dict_item for dict_item in current_app.config['System_Database_list'] if dict_item['unique_dbname'] != dbname]  
                current_app.config['System_Database_list'] = tmp
                tmpdriver = [current_app.config['System_Dbdriver_list'][i] for i in range(len(current_app.config['System_Dbdriver_list'])) if i != ind]
                current_app.config['System_Dbdriver_list'] = tmpdriver
                with open(current_app.config['System_Database_file'], 'w') as json_file:
                    dump(current_app.config['System_Database_list'], json_file, indent=4)
            return dumps({'status':'success', 'resultdata':'移除数据库 ' + dbname + ' 成功！'})  
        except:
            return dumps({'status':'fail', 'resultdata':'移除数据库 ' + dbname + ' 失败'})  

@api_kgdb.route("/api/gettechnologygraph", methods=['POST'], strict_slashes=False)     
def api_index_post_gettechnologygraph():
    if request.method == 'POST':
        dbname = request.form['dbname']
        nodeid = request.form['nodeid']
        nodetype = request.form['nodetype']
        downlevel = request.form['downlevel']
        uplevel = request.form['uplevel']
        numlimit = request.form['numlimit']
        #try: 
        with current_app.config['Lock_Database_Driver']:
            for i in range(len(current_app.config['System_Database_list'])):
                dict_item = current_app.config['System_Database_list'][i]
                if dict_item['unique_dbname'] == dbname:
                    ind = i
                    break
            driver = current_app.config['System_Dbdriver_list'][ind]
        res = {}
        res['nodes'] = []
        res['links'] = []
        # get center node first
        with driver.session() as session:
            tmpres = list(session.run("MATCH (n) where id(n)=" + str(nodeid) + " "
                                        "RETURN properties(n) AS Properties, n.name as Name, labels(n) as Label"))[0]
        node = tmpres['Properties']
        node['id'] = int(nodeid)
        node['label'] = tmpres['Label'][0]
        res['nodes'].append(node)
        centerlevel = tmpres['Properties']['level']
        domainname = tmpres['Properties']['domain']

        # get outer link node
        subids = []
        subids.append(nodeid)
        for i in range(int(downlevel)):
            tmpsubids = []
            for sub_id in subids:
                with driver.session() as session:
                    result = list(session.run("MATCH p=(s)-[r:"+nodetype+"细分]->(o:"+nodetype+") "
                                        "where s.domain=$domainname "
                                        "and o.domain=$domainname "
                                        "and id(s)="+str(sub_id)+" "
                                        "RETURN properties(s) AS subproperties, ID(s) as subid, labels(s) as sublabel, "
                                        "properties(o) AS objproperties, ID(o) as objid, labels(o) as objlabel, "
                                        "properties(r) AS properties, type(r) as type "
                                        "LIMIT $numlimit"
                                        ,domainname=domainname
                                        ,numlimit=int(numlimit)-len(res['nodes'])
                                        ))
                for record in result:
                    subnode = record['subproperties']
                    subnode['id'] = record['subid']
                    subnode['label'] = record['sublabel'][0]
                    try: 
                        subindex = res['nodes'].index(subnode)
                    except ValueError:
                        res['nodes'].append(subnode)
                        subindex = len(res['nodes'])-1
                        
                    objnode = record['objproperties']
                    objnode['id'] = record['objid']
                    tmpsubids.append(record['objid'])
                    objnode['label'] = record['objlabel'][0]
                    try: 
                        objindex = res['nodes'].index(objnode)
                    except ValueError:
                        res['nodes'].append(objnode)
                        objindex = len(res['nodes'])-1   
                        
                    relation = record['properties']
                    relation['relaname'] = record['type']
                    relation['source'] = subindex
                    relation['target'] = objindex    
                    if relation not in res['links']:
                        res['links'].append(relation)   

                    if len(res['nodes']) >= int(numlimit):
                        return dumps({'status':'success','resultdata':res,'nodeid':nodeid})    
            subids = tmpsubids

        # get upper link node
        objids = []
        objids.append(nodeid)
        for i in range(int(downlevel)):
            tmpobjids = []
            for obj_id in objids:
                with driver.session() as session:
                    result = list(session.run("MATCH p=(s)-[r:"+nodetype+"细分]->(o:"+nodetype+") "
                                        "where s.domain=$domainname "
                                        "and o.domain=$domainname "
                                        "and id(o)="+str(obj_id)+" "
                                        "RETURN properties(s) AS subproperties, ID(s) as subid, labels(s) as sublabel, "
                                        "properties(o) AS objproperties, ID(o) as objid, labels(o) as objlabel, "
                                        "properties(r) AS properties, type(r) as type "
                                        "LIMIT $numlimit"
                                        ,domainname=domainname
                                        ,numlimit=int(numlimit)-len(res['nodes'])
                                        ))
                for record in result:
                    subnode = record['subproperties']
                    subnode['id'] = record['subid']
                    tmpobjids.append(record['objid'])
                    subnode['label'] = record['sublabel'][0]
                    try: 
                        subindex = res['nodes'].index(subnode)
                    except ValueError:
                        res['nodes'].append(subnode)
                        subindex = len(res['nodes'])-1
                        
                    objnode = record['objproperties']
                    objnode['id'] = record['objid']
                    objnode['label'] = record['objlabel'][0]
                    try: 
                        objindex = res['nodes'].index(objnode)
                    except ValueError:
                        res['nodes'].append(objnode)
                        objindex = len(res['nodes'])-1   
                        
                    relation = record['properties']
                    relation['relaname'] = record['type']
                    relation['source'] = subindex
                    relation['target'] = objindex    
                    if relation not in res['links']:
                        res['links'].append(relation)   

                    if len(res['nodes']) >= int(numlimit):
                        return dumps({'status':'success','resultdata':res,'nodeid':nodeid})        
            objids = tmpobjids

        return dumps({'status':'success','resultdata':res,'nodeid':nodeid})

            
        #except:
         #   return dumps({'status':'fail', 'resultdata':'获取领域 ' + dbname + ' 技术节点失败'})  
