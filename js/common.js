URLS.SELF=location.href;

URLS.USER = {
    LOGIN: URLS.USER_BASE + "/login.html?_surl=" + URLS.SELF,
    LOGOUT: URLS.USER_BASE + "/user/login/go2out?surl=" + URLS.USER_BASE + "/login.html?_surl=" + URLS.SELF,
    PERMISSION_LIST: URLS.USER_BASE + "/user/pms/listbygame",
    ADD_PERMISSION: URLS.USER_BASE + "/user/pms/additem",
    UPDATE_PERMISSION: URLS.USER_BASE + "/user/pms/updateitem",
    CURRENT_USER: URLS.USER_BASE + "/user/info/base",       //当前登录用户
    CURRENT_USER_PERMISSION: URLS.USER_BASE + "/user/info/pms",//当前用户权限
    USER_PERMISSION: URLS.USER_BASE + "/user/pms/listuserpms",//用户权限
    SET_USER_AUTH: URLS.USER_BASE + "/user/pms/adduserpms",//用户授权
    QUERY_USER: URLS.USER_BASE + "/user/pms/searchuserbynickname"//用户查询
};
URLS.GAME_INFO = {
    GAME_LIST: URLS.GAME_INFO_BASE + "/gameinfo/game/allgamelist",
    GAME_PAGE_LIST: URLS.GAME_INFO_BASE + "/gameinfo/game/pagegamelist",
    ADD_GAME: URLS.GAME_INFO_BASE + "/gameinfo/game/add",
    UPDATE_GAME: URLS.GAME_INFO_BASE + "/gameinfo/game/update",

    SERVER_LIST: URLS.GAME_INFO_BASE + "/gameinfo/server/allserverlist",
    ADD_SERVER: URLS.GAME_INFO_BASE + "/gameinfo/server/add",
    UPDATE_SERVER: URLS.GAME_INFO_BASE + "/gameinfo/server/update",
    DELETE_SERVER: URLS.GAME_INFO_BASE + "/gameinfo/server/delete",

    GAME_CAT_ADD: URLS.GAME_INFO_BASE + "/gameinfo/gamecat/add",
    GAME_CAT_DELETE: URLS.GAME_INFO_BASE + "/gameinfo/gamecat/delete",
    GAME_CAT_UPDATE: URLS.GAME_INFO_BASE + "/gameinfo/gamecat/update",
    GAME_CAT_LIST: URLS.GAME_INFO_BASE + "/gameinfo/gamecat/list"
};
URLS.MISC = {
    ARTICLE_LIST: URLS.MISC_BASE + "/misc/article/pageallbygid",//文章列表
    ARTICLE_DETAIL: URLS.MISC_BASE + "/misc/article/findbyid",//文章详情
    ARTICLE_ADD: URLS.MISC_BASE + "/misc/article/addnew",//文章发布
    ARTICLE_UPDATE: URLS.MISC_BASE + "/misc/article/updatenew",//文章修改
    ARTICLE_DELETE: URLS.MISC_BASE + "/misc/article/delete",//文章修改
    ARTICLE_CAT_ADD: URLS.MISC_BASE + "/misc/articlecat/add",//文章分类添加
    ARTICLE_CAT_UPDATE: URLS.MISC_BASE + "/misc/articlecat/update",//文章分类添加
    ARTICLE_CAT_LIST: URLS.MISC_BASE + "/misc/articlecat/list",//文章分类列表

    FILE_UPLOAD: URLS.MISC_BASE + "/misc/attachment/upload", //文件上传,

    COMMON_CONFIG_ADD: URLS.MISC_BASE + "/misc/commonconfig/add", //通用配置添加（轮播图等）
    COMMON_CONFIG_UPDATE: URLS.MISC_BASE + "/misc/commonconfig/update", //通用配置修改（轮播图等）
    COMMON_CONFIG_DELETE: URLS.MISC_BASE + "/misc/commonconfig/delete", //通用配置删除（轮播图等）
    COMMON_CONFIG_LIST: URLS.MISC_BASE + "/misc/commonconfig/list",//通用配置列表（轮播图等）

    COMMON_CONFIG_CAT_LIST: URLS.MISC_BASE + "/misc/commonconfigcat/list",//通用配置列表（轮播图等）
    COMMON_CONFIG_CAT_DELETE: URLS.MISC_BASE + "/misc/commonconfigcat/delete",//通用配置列表（轮播图等）
    COMMON_CONFIG_CAT_UPDATE: URLS.MISC_BASE + "/misc/commonconfigcat/update",//通用配置列表（轮播图等）
    COMMON_CONFIG_CAT_ADD: URLS.MISC_BASE + "/misc/commonconfigcat/add"//通用配置列表（轮播图等）
};

SUPER_ADMIN_UID = "ef8af187-d37b-4ad2-96d0-6a88a9c8fa46";

var COMMON_CONFIG = {
    PIC_TURN_TYPE: "pic_turn_type",
    RECOMMEND_GAME_TYPE: "recommend_game_type",
    QUALITY_GAME_TYPE:"quality_game_type"
};

var PLATFORM_IDENTIFIER = 0;
var COMMON_PERMISSION_IDENTIFIER = -1;

Ext.Loader.setConfig({
    enabled: true,
    paths: {
        'Ext.ux': 'js/extjs/ux'
    }
});
var isLogin = false;
Ext.data.JsonP.request({
    url: URLS.USER.CURRENT_USER,
    callbackKey: 'function',
    // scope: 'this',
    success: function (res) {
        // alert(JSON.stringify(res));
        if (res && res.status == 1) {
            isLogin = true;
            GlobalUtil.superAdmin = res.data && res.data.uid == SUPER_ADMIN_UID;
            var userDiv = document.getElementById("userDiv");
            if (userDiv) {
                userDiv.innerHTML = "当前用户:" + res.data.nickname;
            }
            return
        }
        parent.toLogin();
        //Ext.MessageBox.alert("提示", "未登录", function () {
        //
        //});
    },
    failure: function (response) {
        parent.toLogin();
        //location.href = URLS.USER.LOGIN;
        //Ext.MessageBox.alert("提示", "未登录", function () {
        //});
    }
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
            case 0:
            {
                Ext.MessageBox.alert("提示", "操作失败", function () {
                    callback && callback();
                });
                break;
            }
            case 2:
            {
                Ext.MessageBox.alert("提示", "IP限定", function () {
                    callback && callback();
                });
                break;
            }
            case 3:
            {
                Ext.MessageBox.alert("提示", "需要登录", function () {
                    callback && callback();
                });
                break;
            }
            case 4:
            {
                Ext.MessageBox.alert("提示", "没有权限", function () {
                    callback && callback();
                });
                break;
            }
            case 5:
            {
                Ext.MessageBox.alert("提示", "系统错误", function () {
                    callback && callback();
                });
                break;
            }
            case 6:
            {
                Ext.MessageBox.alert("提示", "没有权限", function () {
                    callback && callback();
                });
                break;
            }
            case 7:
            {
                Ext.MessageBox.alert("提示", "密码错误", function () {
                    callback && callback();
                });
                break;
            }
            case 8:
            {
                Ext.MessageBox.alert("提示", "用户名已经存在", function () {
                    callback && callback();
                });
                break;
            }
            case 9:
            {
                Ext.MessageBox.alert("提示", "已经过期", function () {
                    callback && callback();
                });
                break;
            }
            case 15:
            {
                Ext.MessageBox.alert("提示", "用户被禁", function () {
                    callback && callback();
                });
                break;
            }
            case 16:
            {
                Ext.MessageBox.alert("提示", "会话不存在", function () {
                    callback && callback();
                });
                break;
            }
            case 20007:
            {
                Ext.MessageBox.alert("提示", "重复添加", function () {
                    callback && callback();
                });
                break;
            }
            default:
            {
                Ext.MessageBox.alert("提示", "未知错误", function () {
                    callback && callback();
                });
                break;
            }
        }
        return false;
    },
    superAdmin:undefined,
    isSuperAdmin: function () {
        return GlobalUtil.superAdmin;
    },
    stringToJson: function (s) {
        return JSON.parse(s);
    },
    jsonToString: function (json) {
        return JSON.stringify(json);
    }
};


var CrossDomain = function () {
    var data_ = {},
        ifraLoadFn_ = null,
        iframe_ = null,
        status_ = 0,
        document_ = null,
        inited_ = false;
    return {
        form: null,
        fields: {},
        reloadIframe: function () {
            var _this = this;
            status_ = 0;
            iframe_ = document_.createElement('iframe');
            ifraLoadFn_ = function () {
                if (status_ == 1) {
                    iframe_.contentWindow.location = "blank.html";
                    status_ = 2;
                } else if (status_ == 2) {
                    data_.callbackFn(iframe_.contentWindow.name);
                    _this.clear();
                }
            };
            iframe_.style.display = "none";
            document_.body.appendChild(iframe_);
            if (iframe_.attachEvent) {
                iframe_.attachEvent('onload', ifraLoadFn_);
            } else {
                iframe_.onload = ifraLoadFn_;
            }
            var fdoc = iframe_.contentWindow.document;
            var form = _this.form;
            if (!form) {
                var data = data_.data;
                form = _this.form = fdoc.createElement("form");
                form.enctype = "multipart/form-data";
                form.action = data_.url;
                form.method = "post";
                if (data.constructor == Object) {
                    function appendFormField(doc, form, name, value, type) {
                        var ipt = doc.createElement("input");
                        ipt.name = name;
                        ipt.value = value;
                        ipt.type = type || "text";
                        form.appendChild(ipt);
                        _this.fields[name] = ipt;
                    }

                    for (var i in data) {
                        var value = data[i];
                        var type;
                        if (typeof value == "object") {
                            value = data[i].value;
                            type = data[i].type;
                        }
                        appendFormField(fdoc, form, i, value, type);
                    }
                }
            }
            fdoc.body.appendChild(form);
        },
        /**
         * 跨域请求，post form提交
         * @param url 跨域URL
         * @param data 请求参数,json对象
         * @param callbackFn 回调方法
         */
        init: function (url, data, callbackFn) {
            var _this = this;
            data_ = {url: url, data: data, callbackFn: callbackFn};
            document_ = document;
            _this.reloadIframe();
            inited_ = true;
            return _this;
        },
        clear: function () {
            iframe_.contentWindow.document.write('');
            iframe_.contentWindow.close();
            document.body.removeChild(iframe_);
        },
        submit: function () {
            var _this = this;
            if (!inited_) {
                throw "crossdomain未初始化";
            }
            if (status_ == 2) {
                _this.reloadIframe();
            }
            if (this.form) {
                status_ = 1;
                this.form.submit();
            }
        }
    }
};

function toLogin() {
    if (parent == window) {
        login && login();
        return;
    }
    parent.toLogin();
}

var loginInvoker = 0;
function login() {
    if (loginInvoker == 1) {
        return;
    }
    loginInvoker = 1;
    location.href = URLS.USER.LOGIN
}


if (!!window.ActiveXObject || "ActiveXObject" in window) {
    alert("不支持IE浏览器，请下载其他浏览器，推荐谷歌浏览器");
    location = "http://rj.baidu.com/soft/detail/14744.html"
}