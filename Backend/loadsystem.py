import json
from neo4j import GraphDatabase
from json import dumps
import concurrent.futures

def load_password_file(file_path):
    result_dict = {}
    try:
        with open(file_path, 'r', encoding="utf-8") as file:
            for line in file:
                line = line.strip()
                if line:
                    elements = line.split(' ')
                    tmp = []
                    key = elements[0]
                    for i in range(1, len(elements)):
                        tmp.append(elements[i])
                    result_dict[key] = tmp
        return result_dict
    except:
        return "Failed!"
    
def load_db_file(file_path):
    try:
        with open(file_path, 'r', encoding="utf-8") as json_file:
            data = json.load(json_file)
        return data
    except:
        return "Failed!"
    
def load_config_file(file_path):
    try:
        with open(file_path, 'r', encoding="utf-8") as json_file:
            data = json.load(json_file)
        return data
    except:
        return "Failed!"

def connect_db(dbinfo):
    try:
        driver = GraphDatabase.driver(dbinfo['uri'], auth=(dbinfo['username'], dbinfo['password']))
        with driver.session() as session:
            session.run("MATCH (x) RETURN x limit 1")
        return driver
    except:
        return "driver failed!"
    
# 可能会定时调用
def load_dbdriver(dbinfolist):
    res = []
    success = 0
    with concurrent.futures.ThreadPoolExecutor() as executor:
        results = executor.map(connect_db, dbinfolist)
        for result in results:
            if result != "driver failed!":
                res.append(result)
                success += 1
            else:
                res.append(result)
    return res, success