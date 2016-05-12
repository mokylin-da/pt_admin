var URLS = {
    USER_BASE: "https://user-dev.36b.me",
    GAME_INFO_BASE: "https://gameinfo-dev.36b.me",
    MISC_BASE: "https://misc-dev.36b.me",
    SELF: location.protocol + '//' + location.host
};

URLS.USER = {
    LOGIN: URLS.USER_BASE + "/login.html?_surl=" + URLS.SELF,
    LOGOUT: URLS.USER_BASE + "/user/login/go2out?surl=" + URLS.USER_BASE + "/login.html?_surl=" + URLS.SELF,
    PERMISSION_LIST: URLS.USER_BASE + "/user/pms/listbygame",
    ADD_PERMISSION: URLS.USER_BASE + "/user/pms/additem",
    UPDATE_PERMISSION: URLS.USER_BASE + "/user/pms/updateitem",
    CURRENT_USER: URLS.USER_BASE + "/user/info/base",//当前登录用户
    CURRENT_USER_PERMISSION: URLS.USER_BASE + "/user/info/pms",//当前用户权限
    USER_PERMISSION: URLS.USER_BASE + "/user/pms/listuserpms",//用户权限
    SET_USER_AUTH: URLS.USER_BASE + "/user/pms/adduserpms",//用户授权
    QUERY_USER: URLS.USER_BASE + "/user/pms/searchuserbynickname"//用户查询
};
URLS.GAME_INFO = {
    GAME_LIST: URLS.GAME_INFO_BASE + "/gameinfo/allgamelist",
    ADD_GAME: URLS.GAME_INFO_BASE + "/gameinfo/alter/addgame",
    UPDATE_GAME: URLS.GAME_INFO_BASE + "/gameinfo/alter/addgame",
    SERVER_LIST: URLS.GAME_INFO_BASE + "/gameinfo/allserverlist",
    ADD_SERVER: URLS.GAME_INFO_BASE + "/gameinfo/alter/addserver",
    DELETE_SERVER: URLS.GAME_INFO_BASE + "/gameinfo/alter/deleteserver"
};
URLS.MISC = {
    ARTICLE_LIST: URLS.MISC_BASE + "/misc/article/pagebygid",//文章列表
    ARTICLE_DETAIL: URLS.MISC_BASE + "/misc/article/findbyid",//文章详情
    ARTICLE_ADD: URLS.MISC_BASE + "/misc/article/add",//文章发布
    ARTICLE_UPDATE: URLS.MISC_BASE + "/misc/article/update"//文章修改
};

var platform_identifier = 0;

Ext.Loader.setConfig({
    enabled: true,
    paths: {
        'Ext.ux': 'js/extjs/ux'
    }
});

Ext.onReady(function () {
    Ext.data.JsonP.request({
        url: URLS.USER.CURRENT_USER,
        callbackKey: 'function',
        // scope: 'this',
        success: function (res) {
            if (res && res.status == 1) {
                return
            }
            Ext.MessageBox.alert("提示", "未登录", function () {

                location = URLS.USER.LOGIN;
            });
        },
        failure: function (response) {
            Ext.MessageBox.alert("提示", "未登录", function () {
                location = URLS.USER.LOGIN;
            });
        }
    });
});

/**
 * 工具类
 */
GlobalUtil = {
    status: function (e, callback) {
        switch (e) {
            case 1:
            {
                return true;
            }
            case 5:
            {
                Ext.MessageBox.alert("提示", "系统错误", callback && callback());
                break;
            }
            case 6:
            {
                Ext.MessageBox.alert("提示", "没有权限", callback && callback());
                break;
            }
        }
        return false;
    }
};