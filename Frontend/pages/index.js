var Current_DB_index = -1;
var Current_Domain_index = -1;
var openmapslide = true; // 用于判断用户是否开启了滚动查看父子节点
var uplevel = 1;
var downlevel = 2;
var numlimit = 90;

var former_jishu_nodeid = -1;



window.onpageshow = function () {
    Getdatabase();
}

function Getdatabase() {
    document.getElementById("loading-navbar").getElementsByTagName('button')[0].style.display = "none"
    document.getElementById("loading-navbar").getElementsByTagName('div')[0].classList.remove('hidden')
    $.get("/api/databaseinfo",
        function (res) {
            console.log("Database List:", res)
            // close loading
            if (res.status == "success") {
                document.getElementById("loading-navbar").classList.add("hidden");
                document.getElementById("kgdb-navbar").classList.add("hidden");
                document.getElementById("nodb-navbar").classList.add("hidden");
                document.getElementById("adddb-navbar").classList.add("hidden");
                if (res.resultdata.length == 0) {
                    document.getElementById("nodb-navbar").classList.remove("hidden");
                }
                else {
                    sessionStorage.setItem("database", JSON.stringify(res.resultdata));
                    document.getElementById("kgdb-navbar").classList.remove("hidden");
                    document.getElementById("adddb-navbar").classList.remove("hidden");
                    const navbar = $("div#kgdb-navbar").empty();
                    for (var i = 0; i < res.resultdata.length; i++) {
                        // add bar of database
                        var addstr = '<div id="' + res.resultdata[i].id + '" onclick="ClickDatabase(\'' + res.resultdata[i].id + '\')" class="marginbottom-5 cursor-pointer flex-row align-center bg-white width-100per hover-bg-lightgrey" style="min-height:70px;border-radius: 0px 6px 6px 0px;"><div onclick="ExpandandCollapse_database(\'' + res.resultdata[i].id + '\', event)" class="cursor-pointer bg-hover-blueimage-right"></div><img src="/static/global/images/database.png" class="img-26 cursor-pointer"><div class="marginleft-10 flex-column cursor-pointer" style="width:calc(100% - 148px)"><span class="marginbottom-5 fontweight-600 overflow-ellipsis cursor-pointer">' + res.resultdata[i].unique_dbname + '</span><span class="fontsize-12 overflow-ellipsis" style="color:#a8a8ae;">' + res.resultdata[i].uri + '</span></div>'
                        if (res.resultdata[i].status == "active") {
                            addstr += '<div class="" style="width:82px"><div class="flex-row align-center"><div style="width:16px;height:16px;background-image: url(/static/global/images/greendot.png); background-position: center; background-size: 200%;"></div><span class="fontsize-12 fontweight-600" style="margin-bottom: 1px;color:#59cd59">连接正常</span></div></div></div>'
                        } else {
                            addstr += '<div class="" style="width:82px"><div class="flex-row align-center"><div style="width:16px;height:16px;background-image: url(/static/global/images/reddot.png); background-position: center; background-size: 200%;"></div><span class="fontsize-12 fontweight-600" style="margin-bottom: 1px;color:#d81e06">连接异常</span></div></div></div>'
                        }
                        $(addstr).appendTo(navbar);

                        // add domain if there are 
                        if (res.resultdata[i].status != "active") {
                            $('<div id="' + res.resultdata[i].id + '_domain_no" class="hidden marginbottom-5 flex-row align-center width-100per hover-bg-lightred" style="min-height:30px;border-radius: 0px 6px 6px 0px;"><img src="/static/global/images/domain-red.png" class="img-20" style="margin-left: 30px;"><div class="marginleft-5 flex-column" style="width:calc(100% - 69px)"><span class="fontsize-10 overflow-ellipsis cursor-pointer" style="color:#ef6170;">连接异常 领域获取失败</span></div></div>').appendTo(navbar)
                        } else {
                            if (res.resultdata[i].domains.length == 0) {
                                $('<div id="' + res.resultdata[i].id + '_domain_no" class="hidden marginbottom-5 flex-row align-center width-100per hover-bg-lightgrey" style="min-height:30px;border-radius: 0px 6px 6px 0px;"><img src="/static/global/images/no-domain.png" class="img-20" style="margin-left: 30px;"><div class="marginleft-5 flex-column" style="width:calc(100% - 69px)"><span class="fontsize-10 overflow-ellipsis cursor-pointer" style="color:#a8a8ae;">数据库中未发现任何领域</span></div></div>').appendTo(navbar)
                            } else {
                                for (var j = 0; j < res.resultdata[i].domains.length; j++) {
                                    $('<div onclick="ClickDomain(\'' + res.resultdata[i].domains[j].domainindex + '\')" id="' + res.resultdata[i].domains[j].domainindex + '" class="hidden marginbottom-5 flex-row align-center width-100per hover-bg-lightgrey" style="min-height:30px;border-radius: 0px 6px 6px 0px;"><img src="/static/global/images/domain.png" class="img-20" style="margin-left: 30px;"><div class="marginleft-5 flex-column" style="width:calc(100% - 69px)"><span class="fontsize-10 overflow-ellipsis cursor-pointer" style="color:#4b4b4b;">' + res.resultdata[i].domains[j].domainname + '</span></div></div>').appendTo(navbar)
                                }
                            }
                        }
                    }

                    // click the first
                    ClickDatabase("db_0")
                }
            }
            else {
                showtaskmsg_fail("获取数据库列表失败")
            }
            document.getElementById("loading-navbar").getElementsByTagName('div')[0].classList.add('hidden')
            document.getElementById("loading-navbar").getElementsByTagName('button')[0].style.display = ""
        }, "json");

}

function ChangePage(pagename) {
    console.log(pagename)
}

function OpenPopup(divid) {
    document.getElementById('popup-content').classList.remove("hidden")
    document.getElementById(divid).classList.remove("hidden")
    document.getElementById('popup').classList.remove("hidden")
    document.getElementById('popup-content').classList.add("layui-anim-up")

    if (divid == "addjishu-popup") {
        var storage_nodes = JSON.parse(sessionStorage.getItem('nodes'))
        var node = storage_nodes.filter(function(item) {
            return item.id.toString() == former_jishu_nodeid.toString()
        })[0];
        const container = document.getElementById(divid)
        const spans = container.getElementsByTagName("span")
        spans[0].innerHTML = node.name
        if (node.label == "领域名") {
            spans[1].innerHTML = "领域名"
        } else if (node.label == "技术"){
            spans[1].innerHTML = node.level + " 级" + node.label
        }
    }
    else if (divid == "adddomain-popup") {
        const container = document.getElementById(divid)
        const spans = container.getElementsByTagName("span")
        var database_json = JSON.parse(sessionStorage.getItem('database'))
        spans[0].innerHTML = database_json[Current_DB_index].unique_dbname
        spans[1].innerHTML = database_json[Current_DB_index].uri
    }
}

function ClosePopup() {
    // 隐藏所有的子界面
    const parentElement = document.getElementById('popup');
    const idDivs = parentElement.querySelectorAll('div[id$="-popup"]');
    const popupContent = document.getElementById('popup-content')
    popupContent.classList.remove("layui-anim-up");
    popupContent.style.animation = "slideOutDown 0.3s ease-out";

    // 等待动画结束后隐藏元素
    setTimeout(function () {
        idDivs.forEach(function (div) {
            div.classList.add("hidden")
        });
        parentElement.classList.add("hidden")
        popupContent.style.animation = "";
    }, 250);
}

function AddNewDBConnection() {
    const element = document.getElementById("kgdb-popup")
    const inputs = element.getElementsByTagName("input")
    const textlist = ["请创建数据库名称", "数据库uri为空", "数据库用户名为空", "数据库密码为空"]
    if (textlist.length != inputs.length) {
        layui.layer.msg("怎么错误信息和input框数量不一样呢")
    }
    for (var i = 0; i < textlist.length; i++) {
        if (inputs[i].value == "") {
            ShowErrorinPopup("kgdb-popup", textlist[i])
            inputs[i].style.border = "2px solid red"
            setTimeout(function () { inputs[i].style.border = "1px solid #dadada" }, 1500);
            return;
        }
    }
    // show loading
    var icon = element.getElementsByTagName("button")[1].getElementsByTagName("i")[0]
    icon.style.display = ""
    element.getElementsByTagName("button")[1].style.backgroundColor = "#87CEFA";
    element.getElementsByTagName("button")[0].disabled = true;
    element.getElementsByTagName("button")[1].disabled = true;

    const mydbname = inputs[0].value
    const uri = inputs[1].value
    const username = inputs[2].value
    const password = inputs[3].value

    var formFile = new FormData()
    formFile.append("mydbname", mydbname)
    formFile.append("uri", uri)
    formFile.append("username", username)
    formFile.append("password", password)
    var data = formFile;
    $.ajax({
        url: "/api/addconnectiondb",
        data: data,
        type: "POST",
        dataType: "json",
        cache: false,
        processData: false,
        contentType: false,
        success: function (res) {
            // close loading
            icon.style.display = "none"
            element.getElementsByTagName("button")[1].style.backgroundColor = ""
            element.getElementsByTagName("button")[0].disabled = false
            element.getElementsByTagName("button")[1].disabled = false
            if (res.status == "success") {
                // popup success
                showtaskmsg_success(res.resultdata)
                // leave popup
                ClosePopup()
                // clear user input
                for (var i = 0; i < inputs.length; i++) {
                    inputs[i].value = "";
                }
                // update tasks

                // update navbar
                Getdatabase()
            } else if (res.status == "fail") {
                ShowErrorinPopup("kgdb-popup", res.resultdata)
            } else if (res.status == "notuniquename") {
                ShowErrorinPopup("kgdb-popup", res.resultdata)
                inputs[0].style.border = "2px solid red"
                setTimeout(function () { inputs[0].style.border = "1px solid #dadada" }, 3000);
            } else if (res.status == "notuniquedb") {
                ShowErrorinPopup("kgdb-popup", res.resultdata)
                inputs[1].style.border = "2px solid red"
                setTimeout(function () { inputs[1].style.border = "1px solid #dadada" }, 3000);
            }
        },
    })
}

function ShowErrorinPopup(containerid, errmsg) {
    const element = document.getElementById(containerid)
    const spans = element.getElementsByTagName("span")
    const span_element = spans[spans.length-1]
    span_element.innerHTML = errmsg
    setTimeout(function () { span_element.innerHTML = "" }, 2400);
}

function showtaskmsg_success(msg) {
    layui.layer.msg(msg, {
        skin: 'success-class',
        offset: '80px',
        icon: 1,
        time: 1500,
    });
}

function showtaskmsg_fail(msg) {
    layui.layer.msg(msg, {
        skin: 'fail-class',
        offset: '80px',
        icon: 1
    });
}

function showtaskmsg_loading(msg) {
    layui.layer.msg(msg, {
        skin: 'loading-class',
        offset: '80px',
        icon: 1
    });
}

function ExpandandCollapse_database(divid, event) {
    event.stopPropagation()
    const fatherdiv = document.getElementById(divid)
    const divelement = fatherdiv.getElementsByTagName("div")[0]
    if (divelement.classList.contains("bg-hover-blueimage-right")) {
        divelement.classList.remove("bg-hover-blueimage-right")
        divelement.classList.add("bg-hover-blueimage-down")
        const elements = document.querySelectorAll('div[id^="' + divid + '_domain"]');
        elements.forEach(div => {
            div.classList.remove('hidden')
            div.classList.add("layui-anim")
            div.classList.add("layui-anim-downbit")
        });
    } else {
        divelement.classList.remove("bg-hover-blueimage-down")
        divelement.classList.add("bg-hover-blueimage-right")
        const elements = document.querySelectorAll('div[id^="' + divid + '_domain"]');
        elements.forEach(div => {
            div.classList.add('hidden');
            div.classList.remove("layui-anim")
            div.classList.remove("layui-anim-downbit")
        });
    }
}

function ClickDatabase(divid) {
    // if current div not clicked, operate
    const currentdiv = document.getElementById(divid)
    if (currentdiv.classList.contains("clicked-dbordomain")) {
        return
    }
    var database_json = JSON.parse(sessionStorage.getItem('database'))
    Current_DB_index = parseInt(divid.split("_")[1]);
    document.getElementById("name-db-content").getElementsByTagName("span")[0].innerHTML = database_json[Current_DB_index].unique_dbname

    // change css
    const navbar = document.getElementById("kgdb-navbar")
    const divElements = navbar.querySelectorAll('div.clicked-dbordomain');
    divElements.forEach(div => {
        div.classList.remove("clicked-dbordomain")
    });
    currentdiv.classList.add("clicked-dbordomain")

    // conceal other contents, show content-db
    const elements = document.getElementById("content").querySelectorAll('div[id^="content-"]');
    elements.forEach(div => {
        div.classList.add('hidden')
    });
    document.getElementById("content-kgdb").classList.remove("hidden")

    ClickTab_DB('kgdb_gailan', 0)
}

function ClickDomain(domainid) {
    // if current div not clicked, operate
    const currentdiv = document.getElementById(domainid)
    if (currentdiv.classList.contains("clicked-dbordomain")) {
        return
    }

    Current_DB_index = parseInt(domainid.split("_domain_")[0].split("_")[1]);
    Current_Domain_index = parseInt(domainid.split("_domain_")[1]);
    var database_json = JSON.parse(sessionStorage.getItem('database'))
    document.getElementById("name-db-domain-content").innerHTML = database_json[Current_DB_index].unique_dbname
    document.getElementById("name-domain-domain-content").innerHTML = database_json[Current_DB_index].domains[Current_Domain_index].domainname

    // change css
    const navbar = document.getElementById("kgdb-navbar")
    const divElements = navbar.querySelectorAll('div.clicked-dbordomain');
    divElements.forEach(div => {
        div.classList.remove("clicked-dbordomain")
    });
    currentdiv.classList.add("clicked-dbordomain")

    // conceal other contents, show content-domain
    const elements = document.getElementById("content").querySelectorAll('div[id^="content-"]');
    elements.forEach(div => {
        div.classList.add('hidden')
    });
    document.getElementById("content-domain").classList.remove("hidden")

    ClickTab_Domain('domain_gailan', 0)
}

function ClickTab_DB(contentdivid, index) {
    // check current tab bar
    const tabbars = document.getElementById("tabbar-kgdb").getElementsByTagName("div")
    const currentdiv = tabbars[index]
    if (currentdiv.classList.contains("tab-clicked")) {
        return
    }

    // change css
    for (var i = 0; i < tabbars.length; i++) {
        tabbars[i].classList.remove("tab-clicked")
        tabbars[i].classList.add("tab-unclicked")
        if (i == 4) {
            tabbars[i].classList.remove("tab-img-clicked")
            tabbars[i].classList.add("tab-img-notclicked")
        }
    }
    currentdiv.classList.add("tab-clicked")
    if (index == 4) {
        tabbars[index].classList.remove("tab-img-notclicked")
        tabbars[index].classList.add("tab-img-clicked")
    }

    // change content show
    const tabcontents = document.getElementById("tabcontent-kgdb").querySelectorAll('div[id^="kgdb_"]');
    tabcontents.forEach(ele => {
        ele.classList.add('hidden')
    });
    tabcontents[index].classList.remove("hidden")

    // get elements
    var database_json = JSON.parse(sessionStorage.getItem('database'))
    if (index == 0) {

    } else if (index == 1) {

    } else if (index == 2) {

    } else if (index == 3) {

    } else if (index == 4) {
        document.getElementById("dbsetting_0").getElementsByTagName("input")[0].value = database_json[Current_DB_index].unique_dbname
        document.getElementById("dbsetting_1").getElementsByTagName("input")[0].value = database_json[Current_DB_index].uri
    }
}

function ClickTab_DB_setting(index) {
    // check current tab bar
    const tabbars = document.getElementById("shezhi_navbar").getElementsByClassName("cursor-pointer")
    const currentdiv = tabbars[index]
    if (currentdiv.classList.contains("content-tab-clicked")) {
        return
    }

    // change css
    for (var i = 0; i < tabbars.length; i++) {
        tabbars[i].classList.remove("content-tab-clicked")
        tabbars[i].classList.add("content-tab-unclicked")
    }
    currentdiv.classList.add("content-tab-clicked")

    // change content show
    const tabcontents = document.getElementById("shezhi_content").querySelectorAll('div[id^="dbsetting_"]');
    tabcontents.forEach(ele => {
        ele.classList.add('hidden')
    });
    tabcontents[index].classList.remove("hidden")

}

function DB_Setting_savename(input_divcontainer_id) {
    const inputs = document.getElementById(input_divcontainer_id).getElementsByTagName("input")
}

function Confirm_DeleteDB() {
    var database_json = JSON.parse(sessionStorage.getItem('database'))
    var dbname = database_json[Current_DB_index].unique_dbname
    layer.confirm('确认移除数据库 ' + dbname + " 吗", {
        title: ['移除数据库', 'font-size:20px;font-weight:600'],
        skin: 'confirm-delete',
        btn: ['删除', '取消']
    }, function (index) {
        layer.close(index);
        showtaskmsg_loading("移除数据库 " + dbname)
        DeleteDBConnection(dbname)
    });
}

function DeleteDBConnection(dbname) {
    var formFile = new FormData()
    formFile.append("dbname", dbname)
    var data = formFile;
    $.ajax({
        url: "/api/deleteconnectiondb",
        data: data,
        type: "POST",
        dataType: "json",
        cache: false,
        processData: false,
        contentType: false,
        success: function (res) {
            if (res.status == "success") {
                // popup success
                showtaskmsg_success(res.resultdata)
                // delete certain record first, 以免等待
                document.getElementById("content-kgdb").classList.add("hidden")
                document.getElementById("content-loading").classList.remove("hidden")
                const navbar = document.getElementById("kgdb-navbar")
                var divs = navbar.querySelectorAll('div[id^="db_' + Current_DB_index.toString() + '"]');
                for (var i = 0; i < divs.length; i++) {
                    divs[i].parentNode.removeChild(divs[i]);
                }
                Current_DB_index = -1
                // refresh page
                Getdatabase()
            } else {
                showtaskmsg_fail(res.resultdata)
            }
        },
    })
}

function ClickTab_Domain(contentdivid, index) {
    // check current tab bar
    const tabbars = document.getElementById("tabbar-domain").getElementsByTagName("div")
    const currentdiv = tabbars[index]
    if (currentdiv.classList.contains("tab-clicked")) {
        return
    }

    // change css
    for (var i = 0; i < tabbars.length; i++) {
        tabbars[i].classList.remove("tab-clicked")
        tabbars[i].classList.add("tab-unclicked")
        if (i == 7) {
            tabbars[i].classList.remove("tab-img-clicked")
            tabbars[i].classList.add("tab-img-notclicked")
        }
    }
    currentdiv.classList.add("tab-clicked")
    if (index == 7) {
        tabbars[index].classList.remove("tab-img-notclicked")
        tabbars[index].classList.add("tab-img-clicked")
    }

    // change content show
    const tabcontents = document.getElementById("tabcontent-domain").querySelectorAll('div[id^="domain_"]');
    tabcontents.forEach(ele => {
        ele.classList.add('hidden')
    });
    tabcontents[index].classList.remove("hidden")

    // get elements
    var database_json = JSON.parse(sessionStorage.getItem('database'))
    if (index == 0) {

    } else if (index == 1) {
        // 判断目前是拓扑还是表格
        if (document.getElementById("jishu_tuopu_tab").classList.contains("graph-tab-clicked")) {
            GetTechnologyGraph(database_json[Current_DB_index].unique_dbname, database_json[Current_DB_index].domains[Current_Domain_index].domainid)
        } else if (document.getElementById("jishu_biaoge_tab").classList.contains("graph-tab-clicked")) {
            GetTechnologyForm()
        }
    } else if (index == 2) {

    } else if (index == 3) {

    } else if (index == 4) {

    }

}

function ClickDB_fromDomain() {
    ClickDatabase("db_" + Current_DB_index.toString())
}

function ChangeView(tobehiddenid, tobeunhiddenid) {
    document.getElementById(tobehiddenid).classList.add("hidden")
    document.getElementById(tobeunhiddenid).classList.remove("hidden")
    document.getElementById(tobehiddenid + "_tab").classList.remove("graph-tab-clicked")
    document.getElementById(tobehiddenid + "_tab").classList.add("graph-tab-unclicked")
    document.getElementById(tobeunhiddenid + "_tab").classList.remove("graph-tab-unclicked")
    document.getElementById(tobeunhiddenid + "_tab").classList.add("graph-tab-clicked")
}

function GetTechnologyGraph(dbname, domainnodeid) {
    const jishugraph = $("div#jishu_tuopu").empty();
    $('<img src="/static/global/images/loading.gif" class="img-20"><span style="color:#1C86EE;font-size: 16px;margin-left: 10px;">获取技术节点中...</span>').appendTo(jishugraph)

    var formFile = new FormData()
    formFile.append("dbname", dbname)
    formFile.append("nodeid", domainnodeid)
    formFile.append("nodetype", "技术")
    formFile.append("downlevel", downlevel)
    formFile.append("uplevel", uplevel)
    formFile.append("numlimit", numlimit)
    var data = formFile;
    $.ajax({
        url: "/api/gettechnologygraph",
        data: data,
        type: "POST",
        dataType: "json",
        cache: false,
        processData: false,
        contentType: false,
        success: function (res) {
            console.log("Domain Node List:", res)
            if (res.status == "success") {
                d3.select("#jishu_tuopu").selectAll('*').remove();

				var alllabels = [];
				var numsinlabel = [];
				Array.from(res.resultdata.nodes).forEach(function (record, i){
					var tmp = ''
					if(record.label != "领域名"){
						tmp = record.level + "级" + record.label
					}
					else{
						tmp = record.label
					}
					if(alllabels.indexOf(tmp) == -1){
						alllabels.push(tmp);
						numsinlabel.push(1);
					}
					else{
						numsinlabel[alllabels.indexOf(tmp)] += 1;
					}
				})

                var colors = d3.scaleOrdinal()
					.domain(d3.range(alllabels.length))
					.range(d3.schemeCategory10);
                    
                $('<div id="tuli-jishu" class="fontsize-14" style="position: absolute; top: 10px; left: 10px; padding: 5px; background-color: #ffffff; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">图例</div>').appendTo(jishugraph)
                const tuli = $("div#tuli-jishu");
                Array.from(alllabels).forEach(function (record, index) {
					$('<div class="flex-row align-center paddingtop-5"><div class="marginright-5" style="width:10px;height:10px;border-radius:5px;background-color:'+colors(index)+';margin-top:1px;"></div><div class="fontsize-12">'+record+'</div></div>').appendTo(tuli);
				})

                $('<div onclick="GraphViewSetting(`jishu`)" class="cursor-pointer fontsize-12 borderradius-6 color-white fontweight-600 flex-row align-center" style="height:34px;position: absolute; bottom: 10px; left: 10px; padding: 8px; background-color: #1c86ee;"><img src="/static/global/images/setting-white.png" class="img-16 marginright-5"><text style="margin-bottom:2px;">查看设置</text></div>').appendTo(jishugraph)
                $('<div id="chakanshezhi-jishu" class="layui-anim hidden fontsize-12 borderradius-6 color-lightblack" style="position: absolute; bottom: 44px; left: 10px; padding: 8px; background-color: #ffffff; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);height:220px;width:400px"><div class="flex-row align-center width-100per" style="height:40px;"><div class="" style="width:300px;">共同展示中心节点的子节点层数</div><div style="width:100px;"><input type="text" class="borderradius-6 inputfocus-blue padding-10" style="width:100px;height:30px;border: 1px solid #dadada"></div></div><div class="flex-row align-center width-100per" style="height:40px;"><div class="" style="width:300px;">共同展示中心节点的父节点层数</div><div style="width:100px;"><input type="text" class="borderradius-6 inputfocus-blue padding-10" style="width:100px;height:30px;border: 1px solid #dadada"></div></div><div class="flex-row align-center width-100per" style="height:40px;"><div class="" style="width:300px;">开启地图查看模式（滚轮操作查看父子节点）</div><div style="width:100px;"><input type="checkbox" class="borderradius-6 inputfocus-blue padding-10" style="width:15px;height:15px;border: 1px solid #eaeaea"></div></div><div class="flex-row align-center width-100per" style="height:40px;"><div class="" style="width:300px;">图可展示最大节点数</div><div style="width:100px;"><input type="text" class="borderradius-6 inputfocus-blue padding-10" style="width:100px;height:30px;border: 1px solid #dadada"></div></div><div class="width-100per flex-row align-center justify-between margintop-5 paddingtop-5" style="border-top:1px solid #dadada;height:45px;"><span class="color-red"></span><div class="flex-row"><button onclick="CancelGraphViewSetting(`jishu`)" type="button" class="layui-btn layui-btn-primary" style="width:70px;border-radius:6px;font-weight:600;">取消</button><button onclick="SaveGraphViewSetting(`jishu`)" type="button" class="layui-btn layui-btn-normal" style="width:70px;border-radius:6px;font-weight:600;">保存</button></div></div></div></div>').appendTo(jishugraph)
                $('<div id="jishu-showbox-title" class="overflowy-auto color-lightblack bg-grey paddingbottom-5 layui-anim"style="border-radius:6px 6px 0px 0px;box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);width:450px;min-height:100px;max-height:95px;position: absolute; top: 10px; right: 10px;"><div class="width-100per"style="height:95px;border-radius: 6px 6px 0px 0px;padding: 12px;"><div class="flex-row justify-between align-center width-100per paddingbottom-5"><span class="fontsize-18 fontweight-600"style="width: calc(100% - 30px)">Node Name</span><div onclick="CloseShowBox(`jishu`)"class="flex-row cursor-pointer align-center justify-center"style="width:16px;height:16px;border-radius: 50%;background-color: #4b4b4b;"><i class="layui-icon layui-icon-close"style="font-size:8px; color:#fff;"></i></div></div><div class="flex-row align-center width-100per borderradius-6 fontsize-12"style="background-color:rgb(246,250,254);height:40px;margin-top:3px;border:1px solid #dadada"><div class="flex-row align-center marginleft-5 padding-5 hover-bg-blue borderradius-6 cursor-pointer"style="color:#1C86EE"><img src="/static/global/images/edit.png"class="marginright-5 img-14">编辑</div><div class="flex-row align-center marginleft-5 padding-5 hover-bg-lightred color-red borderradius-6 cursor-pointer"><img src="/static/global/images/delete.png"class="marginright-5 img-14">删除</div></div></div></div><div id="jishu-showbox" class="overflowy-auto color-lightblack bg-grey paddingbottom-5 layui-anim"style="border-radius:0px 0px 6px 6px;box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);width:450px;min-height:100px;max-height:calc(100% - 115px);position: absolute; top: 106px; right: 10px;"><div class="padding-10" style="min-height:0px;max-height:calc(100% - 115px);border-radius: 0px 0px 6px 6px;border-top:1px solid #dadada;padding: 8px;"><div class="fontweight-600 color-darkgrey fontsize-14 padding-5">基本信息</div><div id="jishu-showbox-basic" class="borderradius-6 bg-white margin-5 padding-15 fontsize-12"style="border:1px solid #dadada"><div class="paddingbottom-10 paddingtop-10 color-grey border-bottom-grey flex-row align-center justify-between"><text style="width: 105px;">节点名</text><span class="color-lightblack"style="width: calc(100% - 110px);">Node Name</span></div><div class="paddingbottom-10 paddingtop-10 color-grey border-bottom-grey flex-row align-center justify-between"><text style="width: 105px;">节点类型</text><span class="color-lightblack"style="width: calc(100% - 110px);">Node Label</span></div><div class="paddingbottom-10 paddingtop-10 color-grey border-bottom-grey flex-row align-center justify-between"><text style="width: 105px;">节点层级</text><span class="color-lightblack"style="width: calc(100% - 110px);">1</span></div><div class="paddingbottom-10 paddingtop-10 color-grey flex-row align-center justify-between"><text style="width: 105px;">所属领域</text><span class="color-lightblack"style="width: calc(100% - 110px);">Domain Name</span></div></div><div class="fontweight-600 color-darkgrey fontsize-14 padding-5 margintop-15">其它属性</div><div id="jishu-showbox-other" class="borderradius-6 bg-white margin-5 padding-15 fontsize-12"style="border:1px solid #dadada"><div class="paddingbottom-10 paddingtop-10 color-grey border-bottom-grey flex-row align-center justify-between"><text style="width: 105px;">key1</text><span class="color-lightblack"style="width: calc(100% - 110px);">value1</span></div><div class="paddingbottom-10 paddingtop-10 color-grey border-bottom-grey flex-row align-center justify-between"><text style="width: 105px;">key1</text><span class="color-lightblack"style="width: calc(100% - 110px);">value1</span></div><div class="paddingbottom-10 paddingtop-10 color-grey border-bottom-grey flex-row align-center justify-between"><text style="width: 105px;">key1</text><span class="color-lightblack"style="width: calc(100% - 110px);">value1</span></div><div class="paddingbottom-10 paddingtop-10 color-grey border-bottom-grey flex-row align-center justify-between"><text style="width: 105px;">key1</text><span class="color-lightblack"style="width: calc(100% - 110px);">value1</span></div><div class="paddingbottom-10 paddingtop-10 color-grey border-bottom-grey flex-row align-center justify-between"><text style="width: 105px;">key1</text><span class="color-lightblack"style="width: calc(100% - 110px);">value1</span></div><div class="paddingbottom-10 paddingtop-10 color-grey border-bottom-grey flex-row align-center justify-between"><text style="width: 105px;">key1</text><span class="color-lightblack"style="width: calc(100% - 110px);">value1</span></div><div class="paddingbottom-10 paddingtop-10 color-grey border-bottom-grey flex-row align-center justify-between"><text style="width: 105px;">key1</text><span class="color-lightblack"style="width: calc(100% - 110px);">value1</span></div><div class="paddingbottom-10 paddingtop-10 color-grey border-bottom-grey flex-row align-center justify-between"><text style="width: 105px;">key1</text><span class="color-lightblack"style="width: calc(100% - 110px);">value1</span></div><div class="paddingbottom-10 paddingtop-10 color-grey border-bottom-grey flex-row align-center justify-between"><text style="width: 105px;">key1</text><span class="color-lightblack"style="width: calc(100% - 110px);">value1</span></div><div class="paddingbottom-10 paddingtop-10 color-grey border-bottom-grey flex-row align-center justify-between"><text style="width: 105px;">key1</text><span class="color-lightblack"style="width: calc(100% - 110px);">value1</span></div><div class="paddingbottom-10 paddingtop-10 color-grey border-bottom-grey flex-row align-center justify-between"><text style="width: 105px;">key1</text><span class="color-lightblack"style="width: calc(100% - 110px);">value1</span></div><div class="paddingbottom-10 paddingtop-10 color-grey flex-row align-center justify-between"><text style="width: 105px;">key2</text><span class="color-lightblack"style="width: calc(100% - 110px);">value2</span></div></div><div class="fontweight-600 color-darkgrey fontsize-14 padding-5 margintop-15">其他类型节点相连情况</div><div id="jishu-showbox-connection" class="borderradius-6 bg-white margin-5 padding-15 fontsize-12"style="border:1px solid #dadada"><div class="paddingbottom-10 paddingtop-10 color-grey border-bottom-grey flex-row align-center justify-between"><text style="width: 105px;">key1</text><span class="color-lightblack"style="width: calc(100% - 110px);">value1</span></div><div class="paddingbottom-10 paddingtop-10 color-grey flex-row align-center justify-between"><text style="width: 105px;">key2</text><span class="color-lightblack"style="width: calc(100% - 110px);">value2</span></div></div></div></div>').appendTo(jishugraph)

                const links = res.resultdata.links;
                const nodes = res.resultdata.nodes;
                const width = document.getElementById("jishu_tuopu").getBoundingClientRect().width - 2;
                const height = document.getElementById("jishu_tuopu").getBoundingClientRect().height - 2;
                const zoom = d3.zoom().scaleExtent([0.1, 10])
                    .on("zoom", function () {
                        g.attr("transform", d3.event.transform)
                    })
                    .filter(function () {
                        return !d3.event.button && d3.event.type !== "dblclick";
                    })
                    // 0.3 2.5
                const svg = d3.select("#jishu_tuopu")
                    .append("svg")
                    .attr("viewBox", [0, 0, width, height])
                    .call(zoom)
                    .on("click", handleMapClick);
                var g = svg.append('g');

                function handleMapClick() {
                    CloseShowBox("jishu")
                }

                const simulation = d3.forceSimulation();
                simulation.nodes(nodes);
                simulation.force("link", d3.forceLink(links).distance(100))
                simulation.force("charge", d3.forceManyBody().strength(-2000))
                simulation.force("center", d3.forceCenter(width / 2, height / 2))
                simulation.force("x", d3.forceX().strength(0.1))
                simulation.force("y", d3.forceY().strength(0.25))
                simulation.force("radial", d3.forceRadial(width / 4, height / 4, width / 2))
                simulation.alphaDecay(0.15); 
                simulation.force("collide", d3.forceCollide().radius(50))
                simulation.tick(25);

                // 边长
                const link = g.append("g").selectAll(".link")
                    .data(links)
                    .enter()
                    .append("path")
                    .attr("class", "link")
                    .attr("marker-end", "url(#direction)")
                    .attr("id", d => "jishu" + d.source.id + "_" + d.relaname + "_" + d.target.id)
                // 边上的箭头,分正反两种
                const positiveMarker = svg.append("marker")
                    .attr("id", "positiveMarker")
                    .attr("orient", "auto")
                    .attr("stroke-width", 2)
                    .attr("markerUnits", "strokeWidth")
                    .attr("markerUnits", "userSpaceOnUse")
                    .attr("viewBox", "0 -5 10 10")
                    .attr("refX", 56)
                    .attr("refY", 0)
                    .attr("markerWidth", 9)
                    .attr("markerHeight", 9)
                    .append("path")
                    .attr("d", "M 0 -5 L 10 0 L 0 5")
                    .attr('fill', '#999')
                    .attr("stroke-opacity", 0.6);
                const negativeMarker = svg.append("marker")
                    .attr("id", "negativeMarker")
                    .attr("orient", "auto")
                    .attr("stroke-width", 2)
                    .attr("markerUnits", "strokeWidth")
                    .attr("markerUnits", "userSpaceOnUse")
                    .attr("viewBox", "0 -5 10 10")
                    .attr("refX", -46)
                    .attr("refY", 0)
                    .attr("markerWidth", 9)
                    .attr("markerHeight", 9)
                    .append("path")
                    .attr("d", "M 10 -5 L 0 0 L 10 5")
                    .attr('fill', '#999')
                    .attr("stroke-opacity", 0.6);
                // 边上的关系名
                const relanametest = g.append("g").selectAll("text")
                    .data(links)
                    .enter()
                    .append("text")
                    .attr("dy", "-2")
                    .attr("class", "relaname")
                    .append('textPath')
                    .attr(
                        "xlink:href", d => "#jishu" + d.source.id + "_" + d.relaname + "_" + d.target.id
                    )
                    .attr("startOffset", "50%")
                    .attr("class", "relatest")
                    .text(function (d) {
                        if (d.relaname.length > 10) {
                            return d.relaname.slice(0, 10) + "..."
                        }
                        return d.relaname
                    })
                    .on("click", function (d) {

                    })

                // 节点
                const node = g.append("g").selectAll(".node")
                    .data(nodes)
                    .enter()
                    .append("circle")
                    .attr("class", "node")
                    .attr("r", function(d) {
                        if (d.id == parseInt(res.nodeid)) {
                            return 60
                        }
                        return 42
                    })
                    .attr("id", d => "jishuNode" + d.id.toString())
                    .attr("fill", function (d) {
                        var tmp = ''
                        if (d.label != "领域名") {
                            tmp = d.level + "级" + d.label
                        }
                        else {
                            tmp = d.label
                        }
                        return colors(alllabels.indexOf(tmp))
                    })
                    .call(
                        d3.drag()//相当于移动端的拖拽手势  分以下三个阶段
                            .on('start', start)
                            .on('drag', drag)
                            .on('end', end)
                    )
                function start(d) {
                    if (!d3.event.active) {
                        //这里就是drag的过程中
                        simulation.alphaTarget(0.3).restart();//设置衰减系数，对节点位置移动过程的模拟，数值越高移动越快，数值范围[0，1]
                    }
                    d.fx = d.x;
                    d.fy = d.y;
                }
                function drag(d) {
                    d.fx = d3.event.x;
                    d.fy = d3.event.y;
                }
                function end(d) {
                    if (!d3.event.active) {
                        simulation.alphaTarget(0);
                    }
                    d.fx = null;
                    d.fy = null;
                }

                // 节点名称
                const nodetest = g.append("g").selectAll("foreignObject")
                    .data(nodes)
                    .enter()
                    .append("g")

                // 节点和边动起来
                simulation.on("tick", function () {
                    // 边设置
                    link.attr("d", function (d) {
                        if (d.source.x < d.target.x) {
                            return "M " + d.source.x + " " + d.source.y + " L " + d.target.x + " " + d.target.y
                        }
                        else {
                            return "M " + d.target.x + " " + d.target.y + " L " + d.source.x + " " + d.source.y
                        }
                    })
                        .attr("marker-end", function (d) {
                            if (d.source.x < d.target.x) {
                                return "url(#positiveMarker)"
                            }
                            else {
                                return null
                            }
                        })
                        .attr("marker-start", function (d) {
                            if (d.source.x < d.target.x) {
                                return null
                            }
                            else {
                                return "url(#negativeMarker)"
                            }
                        })
                    node
                        .attr("transform", d => `translate(${d.x},${d.y})`);
                    nodetest
                        .attr("transform", d => `translate(${d.x},${d.y})`);
                });
                nodetest
                    .append("foreignObject")
                    .attr("class", "cursor-pointer")
                    .attr("x", function (d) {
                        if (d.id == parseInt(res.nodeid)) {
                            return -41
                        }
                        return -31;
                    })
                    .attr("y", function (d) {
                        if (d.id == parseInt(res.nodeid)) {
                            return -41
                        }
                        return -31;
                    })
                    .attr("width", function (d) {
                        if (d.id == parseInt(res.nodeid)) {
                            return 82
                        }
                        return 62
                    })
                    .attr("height", function (d) {
                        if (d.id == parseInt(res.nodeid)) {
                            return 82
                        }
                        return 62
                    })
                    .append("xhtml:div")
                    .attr("class", "flex-row align-center justify-center")
                    .on("click", function (d) {
                        ClickNode_jishu_Graph(d.id, nodes, links);
                        d3.event.stopPropagation();
                    })
                    .on("dblclick", function (d) {
                        GetRelatedofChosenNode(d.id)
                        d3.event.stopPropagation();
                    })
                    .style("width", "100%")
                    .style("height", "100%")
                    .style("color", "white")
                    .style("font-size", "8px")
                    .style("padding", "3px")
                    .style("overflow-wrap", "break-word")
                    .style("word-break", "break-all")
                    .style("text-align", "middle")
                    .style("overflow", "hidden")
                    .text(d => d.name);

                former_jishu_nodeid = -1
                ClickNode_jishu_Graph(res.nodeid, nodes, links);
                CloseShowBox("jishu")
                sessionStorage.setItem("nodes", JSON.stringify(nodes))
                sessionStorage.setItem("links", JSON.stringify(links))
            } else {
                showtaskmsg_fail(res.resultdata)
            }
        },
    })
}

function ClickNode_jishu_Graph(id, nodes, links) {
    // 修改节点样式
	const node = document.getElementById("jishuNode"+id.toString());
	if(former_jishu_nodeid != -1){
		const formernode = document.getElementById("jishuNode"+former_jishu_nodeid.toString());
		formernode.classList.remove("chosen");
	}
	node.classList.add("chosen");

    // 写好属性
    const originalObject = nodes.filter(function(item) {
        return item.id.toString() == id.toString()
    })[0];
    console.log("Clicked Node:", originalObject)
    const nodeinfo = Object.assign({}, originalObject);
    // 基本属性
    document.getElementById("jishu-showbox-title").getElementsByTagName("span")[0].innerHTML = nodeinfo.name
    const basic = document.getElementById("jishu-showbox-basic")
    var spans = basic.getElementsByTagName("span")
    spans[0].innerHTML = nodeinfo.name
    spans[1].innerHTML = nodeinfo.label
    spans[2].innerHTML = nodeinfo.level
    spans[3].innerHTML = nodeinfo.domain
    // 其他属性
    const notinlabels = ['formerpath','domain','id','index','label','level','name','vx','vy','cx','cy','dx','dy','x','y','fx','fy']
    for (var i = 0; i < notinlabels.length; i++) {
        var key = notinlabels[i];
        if (nodeinfo.hasOwnProperty(key)) {
            delete nodeinfo[key];
        }
    }
    var keys = Object.keys(nodeinfo);
    const other = $("div#jishu-showbox-other").empty();
    if (keys.length > 0) {
        var lastKeyIndex = keys.length - 1;
        for (var key in nodeinfo) {
            if (key != keys[lastKeyIndex]) {
                $('<div class="paddingbottom-10 paddingtop-10 color-grey border-bottom-grey flex-row align-center justify-between"><text style="width: 105px;">'+key.toString()+'</text><span class="color-lightblack" style="width: calc(100% - 110px);">'+nodeinfo[key].toString()+'</span></div>').appendTo(other)
            } else {
                $('<div class="paddingbottom-10 paddingtop-10 color-grey flex-row align-center justify-between"><text style="width: 105px;">'+key.toString()+'</text><span class="color-lightblack" style="width: calc(100% - 110px);">'+nodeinfo[key].toString()+'</span></div>').appendTo(other)
            }
        }
    } else {
        $('<div class="paddingbottom-10 paddingtop-10 color-grey flex-row align-center justify-center"><text style="width: 105px;">暂无其他属性</text></div>').appendTo(other)
    }
    


    // 展示属性框
    const showbox = document.getElementById("jishu-showbox")
    showbox.classList.remove("hidden")
    showbox.classList.add("layui-anim-downbit")
    const showboxtitle = document.getElementById("jishu-showbox-title")
    showboxtitle.classList.remove("hidden")
    showboxtitle.classList.add("layui-anim-downbit")

    former_jishu_nodeid = id;
}

function CloseShowBox(dimension) {
    const showbox = document.getElementById(dimension+"-showbox")
    showbox.classList.add("hidden")
    showbox.classList.remove("layui-anim-downbit")
    const showboxtitle = document.getElementById(dimension+"-showbox-title")
    showboxtitle.classList.add("hidden")
    showboxtitle.classList.remove("layui-anim-downbit")
}

function GraphViewSetting(dimension) {
    var container = document.getElementById("chakanshezhi-"+dimension)
    const inputs = container.getElementsByTagName("input")
    inputs[0].value = downlevel
    inputs[1].value = uplevel
    inputs[3].value = numlimit
    if (openmapslide) {
        inputs[2].checked = true
    } else {
        inputs[2].checked = false
    }
    container.classList.remove("hidden");
}

function isNumeric(str) {
    return /^\d+$/.test(str);
  }

function SaveGraphViewSetting(dimension) {
    var container = document.getElementById("chakanshezhi-"+dimension)
    const inputs = container.getElementsByTagName("input")
    const span_element = container.getElementsByTagName("span")[0]
    if (isNumeric(inputs[0].value) && isNumeric(inputs[1].value) && isNumeric(inputs[3].value)) {
        downlevel = inputs[0].value
        uplevel = inputs[1].value
        if (inputs[2].checked) {
            openmapslide = true
        } else {
            openmapslide = false
        }
        numlimit = inputs[3].value
    } else {
        if (!isNumeric(inputs[0].value)) {
            span_element.innerHTML = "请输入数字"
            setTimeout(function () { span_element.innerHTML = "" }, 1500);
            inputs[0].style.border = "2px solid red"
            setTimeout(function () { inputs[0].style.border = "1px solid #dadada" }, 3000);
            return;
        }
        if (!isNumeric(inputs[1].value)) {
            span_element.innerHTML = "请输入数字"
            setTimeout(function () { span_element.innerHTML = "" }, 1500);
            inputs[1].style.border = "2px solid red"
            setTimeout(function () { inputs[1].style.border = "1px solid #dadada" }, 3000);
            return;
        }
        if (!isNumeric(inputs[3].value)) {
            span_element.innerHTML = "请输入数字"
            setTimeout(function () { span_element.innerHTML = "" }, 1500);
            inputs[3].style.border = "2px solid red"
            setTimeout(function () { inputs[3].style.border = "1px solid #dadada" }, 3000);
            return;
        }
    }
    container.classList.add("hidden")

    var database_json = JSON.parse(sessionStorage.getItem('database'))
    GetTechnologyGraph(database_json[Current_DB_index].unique_dbname, database_json[Current_DB_index].domains[Current_Domain_index].domainid)
}

function CancelGraphViewSetting(dimension) {
    var container = document.getElementById("chakanshezhi-"+dimension)
    container.classList.add("hidden")
}

function getSize(size) {
	if (size >= 1024 * 1024 * 1024) {
		size = (size / 1024 / 1024 / 1024).toFixed(2) + ' GB';
	}
	else if (size >= 1024 * 1024) {
		size = (size / 1024 / 1024).toFixed(2) + ' MB';
	} 
	else if(size >= 1024){
		size = (size / 1024).toFixed(2) + ' KB';
	} 
	else if (size < 1024){
		size = size.toFixed(2) + ' Bytes';
	}
	return size;
}

function UploadFormattedFile(){
	var fileObj = document.getElementById("newdomain-formattedfile").files[0];
	if(typeof(fileObj) == "undefined"){
		document.getElementsByName("newdomain-formattedfile-content")[1].getElementsByTagName("pre")[0].innerHTML = "";
		document.getElementById("newdomain-formattedfile-filesize").innerHTML = '0 KB';
		return;
	}
	if(fileObj.size <= 0){
		document.getElementById("newdomain-formattedfile").value = '';
		swal("Server Response", "请选择非空文件后再提交", "error");
		return;
	}
	// 首先读取文件的内容，大小，和行数
	const reader = new FileReader()
	reader.readAsText(fileObj,'utf8')
	reader.onload = ()=>{
		// 把文件内容显示在pre组件里面
		var containers = document.getElementsByName("newdomain-formattedfile-content");
		containers[0].classList.add("hidden");
		containers[1].classList.remove("hidden");
		var pre = containers[1].getElementsByTagName("pre");
		pre[0].innerHTML = reader.result;
	}
	// 将文件大小填写至对应的位置
	document.getElementById("newdomain-formattedfile-filesize").innerHTML = getSize(fileObj.size);
}

function AddNewTechnology() {
    var fileObj = document.getElementById("newdomain-formattedfile").files[0];
    if (typeof (fileObj) == "undefined" || fileObj.size <= 0) {
        ShowErrorinPopup("addjishu-popup", "请选择文件后再提交")
        return;
    }

    // show loading
    var element = document.getElementById("addjishu-popup")
    var icon = element.getElementsByTagName("button")[1].getElementsByTagName("i")[0]
    icon.style.display = ""
    element.getElementsByTagName("button")[1].style.backgroundColor = "#87CEFA";
    element.getElementsByTagName("button")[0].disabled = true;
    element.getElementsByTagName("button")[1].disabled = true;


    var database_json = JSON.parse(sessionStorage.getItem('database'))
    var dbname = database_json[Current_DB_index].unique_dbname
    var formFile = new FormData()
    formFile.append("dbname", dbname)
    formFile.append("nodeid", former_jishu_nodeid)		
    formFile.append("file", fileObj);
    var data = formFile;

    $.ajax({
        url: "/api/addtechnology",
        data: data,
        type: "POST",
        dataType: "json",
        cache: false,
        processData: false,
        contentType: false,
        success: function (res) {
            icon.style.display = "none"
            element.getElementsByTagName("button")[1].style.backgroundColor = ""
            element.getElementsByTagName("button")[0].disabled = false
            element.getElementsByTagName("button")[1].disabled = false
            if (res.status == "success") {
                // popup success
                showtaskmsg_success(res.resultdata)
                // leave popup
                ClosePopup()
                // clear user input
                var fileObj = document.getElementById("newdomain-formattedfile").files[0];
                document.getElementsByName("newdomain-formattedfile-content")[1].getElementsByTagName("pre")[0].innerHTML = "";
                document.getElementById("newdomain-formattedfile-filesize").innerHTML = '0 KB';
                document.getElementById("newdomain-formattedfile").value = '';
                // update tasks

                // update navbar
                GetTechnologyGraph(database_json[Current_DB_index].unique_dbname, database_json[Current_DB_index].domains[Current_Domain_index].domainid)
            } else if (res.status == "fail") {
                ShowErrorinPopup("addjishu-popup", res.resultdata)
            }
        }
    })
}

function AddNewDomain() {
    const element = document.getElementById("adddomain-popup")
    const inputs = element.getElementsByTagName("input")
    if (inputs[0].value == "") {
        ShowErrorinPopup("adddomain-popup", "请填写领域名")
        inputs[0].style.border = "2px solid red"
        setTimeout(function () { inputs[0].style.border = "1px solid #dadada" }, 1500);
        return;
    }
    // show loading
    var icon = element.getElementsByTagName("button")[1].getElementsByTagName("i")[0]
    icon.style.display = ""
    element.getElementsByTagName("button")[1].style.backgroundColor = "#87CEFA";
    element.getElementsByTagName("button")[0].disabled = true;
    element.getElementsByTagName("button")[1].disabled = true;

    const mydbname = element.getElementsByTagName("span")[0].innerHTML
    const domainname = inputs[0].value
    const description = element.getElementsByTagName("textarea")[0].value

    var formFile = new FormData()
    formFile.append("dbname", mydbname)
    formFile.append("domainname", domainname)
    formFile.append("description", description)
    var data = formFile;
    $.ajax({
        url: "/api/adddomain",
        data: data,
        type: "POST",
        dataType: "json",
        cache: false,
        processData: false,
        contentType: false,
        success: function (res) {
            // close loading
            icon.style.display = "none"
            element.getElementsByTagName("button")[1].style.backgroundColor = ""
            element.getElementsByTagName("button")[0].disabled = false
            element.getElementsByTagName("button")[1].disabled = false
            if (res.status == "success") {
                // popup success
                showtaskmsg_success(res.resultdata)
                // leave popup
                ClosePopup()
                // clear user input
                inputs[0].value = ""
                element.getElementsByTagName("textarea")[0].value = ""
                // update tasks
                
                // update navbar
                Getdatabase()
                KeepExpandingUntilSuccess(mydbname, domainname, 0)
            } else if (res.status == "fail") {
                ShowErrorinPopup("adddomain-popup", res.resultdata)
            } else if (res.status == "notuniquename") {
                ShowErrorinPopup("adddomain-popup", res.resultdata)
                inputs[0].style.border = "2px solid red"
                setTimeout(function () { inputs[0].style.border = "1px solid #dadada" }, 3000);
            }
        },
    })
}

function KeepExpandingUntilSuccess(dbname, domainname, times) {  
    if (times == 100) {  
        return  
    }
    var flag = false  
    var database_json = JSON.parse(sessionStorage.getItem('database'))  
    var thisdb = database_json.filter(function(item) {  
        return item.unique_dbname == dbname  
    })  
    if (thisdb.length != 0) {  
        var domains = thisdb[0].domains  
        var thisdomain = domains.filter(function(item) {  
            return item.domainname == domainname  
        })  
        if (thisdomain.length > 0){  
            flag = true  
            var ele = document.getElementById("db_"+thisdomain[0].domainindex.split('_')[1])
            ele.getElementsByTagName("div")[0].click()
            document.getElementById(thisdomain[0].domainindex).click()
        }  
    }  
  
    if (flag == false) {  
        return setTimeout(function() {  
            return KeepExpandingUntilSuccess(dbname, domainname, times+1)  
        }, 300);
    }  
    else {
        return   
    }  
}

function Setting_PageView() {
    const showbox = document.getElementById("pageview-setting")
    if (showbox.classList.contains("hidden")) {
        showbox.classList.remove("hidden")
        showbox.classList.add("layui-anim-downbit")
        document.addEventListener("mousedown", function(event) {
            if (showbox && !showbox.contains(event.target)) {
                showbox.classList.add("hidden");
                showbox.classList.remove("layui-anim-downbit");
            }
        });
    }
}

function ExpandandConcealNavbar() {
    var ele = document.getElementById("pageview-setting").getElementsByTagName("input")[0]
    if (ele.checked) {
        document.getElementById("navbar").classList.add("hidden")
    } else {
        document.getElementById("navbar").classList.remove("hidden")
    }
}