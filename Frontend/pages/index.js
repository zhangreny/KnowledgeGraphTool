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
    var parentElement = document.getElementById('popup');
    var idDivs = parentElement.querySelectorAll('div[id]');
    idDivs.forEach(function(div) {
        div.classList.add("hidden")
    });
    // 隐藏弹出层
    document.getElementById('popup-content').classList.remove("layui-anim-up")
    parentElement.classList.add("hidden")
}

function AddNewDBConnection() {
    var elements = document.getElementsByTagName("input")

}