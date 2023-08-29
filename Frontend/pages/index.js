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
        idDivs.forEach(function(div) {
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
    for(var i=0; i<textlist.length; i++) {
        if (inputs[i].value == "") {
            ShowErrorinPopup("kgdb-popup", textlist[i])
            inputs[i].style.border = "2px solid red"
            setTimeout(function() {inputs[i].style.border = "1px solid #dadada"}, 1500);
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
                for (var i=0;i<inputs.length; i++) {
                    inputs[i].value = "";
                }

                // update tasks

                // update navbar
            } else if (res.status == "fail") {
                ShowErrorinPopup("kgdb-popup", res.resultdata)
            } else if (res.status == "notuniquename"){
                ShowErrorinPopup("kgdb-popup", res.resultdata)
                inputs[0].style.border = "2px solid red"
                setTimeout(function() {inputs[0].style.border = "1px solid #dadada"}, 1500);
            }
            
        },
    })
}

function ShowErrorinPopup(containerid, errmsg) {
    const element = document.getElementById(containerid)
    const span_element = element.getElementsByTagName("span")[0]
    span_element.innerHTML = errmsg
    setTimeout(function() {span_element.innerHTML = ""}, 1500);
}

function showtaskmsg_success(msg) {
    layui.layer.msg(msg,{
        skin:'success-class',
        offset: '80px',
        icon: 1
    });
}

