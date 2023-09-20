from datetime import datetime
from time import mktime
from time import strptime
from time import strftime
from time import localtime
from hashlib import sha256

def getdatenow_string():
    return str(datetime.now()).split(".")[0]

# 将 2022-11-14 16:38:30 转换为
def datestring2unixtime_int(dt):
    return int(mktime(strptime(dt, '%Y-%m-%d %H:%M:%S'))*10)

# 将 16685031000 转化为 2022-11-15 17:05:00
def unixtime2date_string(timeint):
    return strftime("%Y-%m-%d %H:%M:%S", localtime(timeint*0.1))

# 将 2022-11-14 16:38:30 转换为
def timestampsha256():
    dt = getdatenow_string()
    timestr = str(int(mktime(strptime(dt, '%Y-%m-%d %H:%M:%S'))*10))
    return sha256(timestr.encode("utf-8")).hexdigest() 