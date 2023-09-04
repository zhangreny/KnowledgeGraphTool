var Current_DB_index = -1;
var Current_Domain_index = -1;

window.onpageshow = function () {
    Getdatabase();
}

function Getdatabase() {
    document.getElementById("loading-navbar").getElementsByTagName('button')[0].style.display = "none"
    document.getElementById("loading-navbar").getElementsByTagName('div')[0].classList.remove('hidden')
    $.get("/api/databaseinfo",
        function (res) {
            console.log(res)
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
                        var addstr = '<div id="' + res.resultdata[i].id + '" onclick="ClickDatabase(\'' + res.resultdata[i].id + '\')" class="marginbottom-10 cursor-pointer flex-row align-center bg-white width-100per hover-bg-lightgrey" style="min-height:70px;border-radius: 0px 6px 6px 0px;"><div onclick="ExpandandCollapse_database(\'' + res.resultdata[i].id + '\', event)" class="cursor-pointer bg-hover-blueimage-right"></div><img src="/static/global/images/database.png" class="img-26 cursor-pointer"><div class="marginleft-10 flex-column cursor-pointer" style="width:calc(100% - 148px)"><span class="marginbottom-5 fontweight-600 overflow-ellipsis cursor-pointer">' + res.resultdata[i].unique_dbname + '</span><span class="fontsize-12 overflow-ellipsis" style="color:#a8a8ae;">' + res.resultdata[i].uri + '</span></div>'
                        if (res.resultdata[i].status == "active") {
                            addstr += '<div class="" style="width:82px"><div class="flex-row align-center"><div style="width:16px;height:16px;background-image: url(/static/global/images/greendot.png); background-position: center; background-size: 200%;"></div><span class="fontsize-12 fontweight-600" style="margin-bottom: 1px;color:#59cd59">连接正常</span></div></div></div>'
                        } else {
                            addstr += '<div class="" style="width:82px"><div class="flex-row align-center"><div style="width:16px;height:16px;background-image: url(/static/global/images/reddot.png); background-position: center; background-size: 200%;"></div><span class="fontsize-12 fontweight-600" style="margin-bottom: 1px;color:#d81e06">连接异常</span></div></div></div>'
                        }
                        $(addstr).appendTo(navbar);

                        // add domain if there are 
                        if (res.resultdata[i].status != "active") {
                            $('<div id="' + res.resultdata[i].id + '_domain_no" class="hidden marginbottom-10 flex-row align-center width-100per hover-bg-lightred" style="min-height:30px;border-radius: 0px 6px 6px 0px;"><img src="/static/global/images/domain-red.png" class="img-20" style="margin-left: 30px;"><div class="marginleft-5 flex-column" style="width:calc(100% - 148px)"><span class="fontsize-10 overflow-ellipsis cursor-pointer" style="color:#ef6170;">连接异常 领域获取失败</span></div></div>').appendTo(navbar)
                        } else {
                            if (res.resultdata[i].domains.length == 0) {
                                $('<div id="' + res.resultdata[i].id + '_domain_no" class="hidden marginbottom-10 flex-row align-center width-100per hover-bg-lightgrey" style="min-height:30px;border-radius: 0px 6px 6px 0px;"><img src="/static/global/images/no-domain.png" class="img-20" style="margin-left: 30px;"><div class="marginleft-5 flex-column" style="width:calc(100% - 148px)"><span class="fontsize-10 overflow-ellipsis cursor-pointer" style="color:#a8a8ae;">数据库中未发现任何领域</span></div></div>').appendTo(navbar)
                            } else {
                                for (var j = 0; j < res.resultdata[i].domains.length; j++) {
                                    $('<div onclick="ClickDomain(\'' + res.resultdata[i].domains[j].domainindex + '\')" id="' + res.resultdata[i].domains[j].domainindex + '" class="hidden marginbottom-10 flex-row align-center width-100per hover-bg-lightgrey" style="min-height:30px;border-radius: 0px 6px 6px 0px;"><img src="/static/global/images/domain.png" class="img-20" style="margin-left: 30px;"><div class="marginleft-5 flex-column" style="width:calc(100% - 148px)"><span class="fontsize-10 overflow-ellipsis cursor-pointer" style="color:#4b4b4b;">' + res.resultdata[i].domains[j].domainname + '</span></div></div>').appendTo(navbar)
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
    console.log(pagename);
}

function OpenPopup(divid) {
    document.getElementById('popup-content').classList.remove("hidden")
    document.getElementById(divid).classList.remove("hidden")
    document.getElementById('popup').classList.remove("hidden")
    document.getElementById('popup-content').classList.add("layui-anim-up")
}

function ClosePopup() {
    // 隐藏所有的子界面
    const parentElement = document.getElementById('popup');
    const idDivs = parentElement.querySelectorAll('div[id]');
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
    const span_element = element.getElementsByTagName("span")[0]
    span_element.innerHTML = errmsg
    setTimeout(function () { span_element.innerHTML = "" }, 1500);
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
    document.getElementById("name-db-content").innerHTML = database_json[Current_DB_index].unique_dbname

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
        showtaskmsg_loading("移除数据库 "+dbname)
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
                var divs = navbar.querySelectorAll('div[id^="db_'+Current_DB_index.toString()+'"]');
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

}

function ClickDB_fromDomain() {
    ClickDatabase("db_"+Current_DB_index.toString())
}

function ChangeView(tobehiddenid, tobeunhiddenid) {
    document.getElementById(tobehiddenid).classList.add("hidden")
    document.getElementById(tobeunhiddenid).classList.remove("hidden")
    document.getElementById(tobehiddenid+"_tab").classList.remove("graph-tab-clicked")
    document.getElementById(tobehiddenid+"_tab").classList.add("graph-tab-unclicked")
    document.getElementById(tobeunhiddenid+"_tab").classList.remove("graph-tab-unclicked")
    document.getElementById(tobeunhiddenid+"_tab").classList.add("graph-tab-clicked")
}