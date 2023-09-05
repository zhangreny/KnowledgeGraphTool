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
    formFile.append("downlevel", 2)
    formFile.append("uplevel", 1)
    formFile.append("numlimit", 120)
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
                const svg = d3.select("#jishu_tuopu")
                    .append("svg")
                    .attr("viewBox", [0, 0, width, height])
                    .call(zoom);
                var g = svg.append('g');

                const simulation = d3.forceSimulation();
                simulation.nodes(nodes);
                simulation.force("link", d3.forceLink(links).distance(100))
                simulation.force("charge", d3.forceManyBody().strength(-2000))
                simulation.force("center", d3.forceCenter(width / 2, height / 2))
                simulation.force("x", d3.forceX().strength(0.1))
                simulation.force("y", d3.forceY().strength(0.25))
                simulation.force("radial", d3.forceRadial(width / 4, height / 4, width / 2))
                simulation.alphaDecay(0.12); 
                simulation.force("collide", d3.forceCollide().radius(50))
                simulation.tick(15);

                // 边长
                const link = g.append("g").selectAll(".link")
                    .data(links)
                    .enter()
                    .append("path")
                    .attr("class", "link")
                    .attr("marker-end", "url(#direction)")
                    .attr("id", d => d.source.id + "_" + d.relaname + "_" + d.target.id)
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
                        "xlink:href", d => "#" + d.source.id + "_" + d.relaname + "_" + d.target.id
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
                    .attr("id", d => "Node" + d.id.toString())
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
                    .on("click", function (d) {
                        ClickNode_KG_Graph(d.id, nodes, links);
                    })
                    .on("dblclick", function (d) {
                        GetRelatedofChosenNode(d.id, parseInt(document.getElementById("view-kg-relationmaxnum").value))
                    });
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
                            return -39
                        }
                        return -28;
                    })
                    .attr("y", function (d) {
                        if (d.id == parseInt(res.nodeid)) {
                            return -39
                        }
                        return -28;
                    })
                    .attr("width", function (d) {
                        if (d.id == parseInt(res.nodeid)) {
                            return 78
                        }
                        return 56
                    })
                    .attr("height", function (d) {
                        if (d.id == parseInt(res.nodeid)) {
                            return 78
                        }
                        return 56
                    })
                    .append("xhtml:div")
                    .attr("class", "flex-row align-center justify-center")
                    .on("click", function (d) {
                        ClickNode_KG_Graph(d.id, nodes, links);
                    })
                    .on("dblclick", function (d) {

                        GetRelatedofChosenNode(d.id, parseInt(document.getElementById("view-kg-relationmaxnum").value))
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

            } else {
                showtaskmsg_fail(res.resultdata)
            }
        },
    })
}