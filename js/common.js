var self_url = location.protocol + '//' + location.host;

var user_url = "https://user-dev.36b.me";
var gameinfo_url = "https://gameinfo-dev.36b.me";
var login_url = "https://user-dev.36b.me/login.html?_surl=" + self_url;

var logout_url = user_url + "/user/login/go2out?surl=" + user_url + "/login.html?_surl=" + self_url;
var permission_list_url = user_url + "/user/pms/listbygame";
var addpermission_url = user_url + "/user/pms/additem";
var updatepermission_url = user_url + "/user/pms/updateitem";
var currentuser_utl = user_url + "/user/info/base";


var currentpermission_url = user_url + "/user/info/pms";
var userpermission_url = user_url + "/user/pms/listuserpms";
//用户授权
var setuserauth_url = user_url + "/user/pms/adduserpms";

// var queryuser_url="http://localhost:8002/user.json";//user_url+"/user/pms/updateitem";
var queryuser_url = user_url + "/user/pms/searchuserbynickname";

var gamelist_url = gameinfo_url + "/gameinfo/gamelist";
var addgame_url = gameinfo_url + "/gameinfo/alter/addgame";
var updategame_url = gameinfo_url + "/gameinfo/alter/addgame";


var serverlist_url = gameinfo_url + "/gameinfo/allserverlist";
var addserver_url = gameinfo_url + "/gameinfo/alter/addserver";
var deleteserver_url = gameinfo_url + "/gameinfo/alter/deleteserver";

Ext.onReady(function () {
    Ext.data.JsonP.request({
        url: currentuser_utl,
        callbackKey: 'function',
        // scope: 'this',
        success: function (res) {
            if (res && res.status == 1) {
                return
            }
            Ext.MessageBox.alert("提示", "未登录", function () {

                location = login_url;
            });
        },
        failure: function (response) {
            Ext.MessageBox.alert("提示", "未登录", function () {
                location = login_url;
            });
        }
    });
});