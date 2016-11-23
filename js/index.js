---
layout: original
---
var allMenuTree = {
    index:[{
        text: "轮播图分类",
        leaf: true,
        url: "pic_turn_cat_mgr.html",
        tabId: "10",
        permission: "menu_pic_turn_cat"
    },{
        text: "轮播图",
        leaf: true,
        url: "pic_turn_mgr.html",
        tabId: "11",
        permission: "menu_pic_turn"
    },{
        text: "推荐游戏分类",
        leaf: true,
        url: "recommend_game_cat_mgr.html",
        tabId: "12",
        permission: "menu_recommend_game_cat"
    },{
        text: "推荐游戏",
        leaf: true,
        url: "recommend_game_mgr.html",
        tabId: "13",
        permission: "menu_recommend_game"
    },{
        text: "文章管理",
        leaf: true,
        url: "article_mgr.html",
        tabId: "15",
        permission: "menu_article"
    }],
    game:[ {
        text: "区服管理",
        leaf: true,
        url: "server_mgr.html",
        tabId: "20",
        permission: "menu_server"
    }, {
        text: "游戏类型",
        leaf: true,
        url: "game_cat_mgr.html",
        tabId: "21",
        permission: "menu_game_cat"
    }, {
        text: "游戏列表",
        leaf: true,
        url: "game_mgr.html",
        tabId: "22",
        permission: "menu_game"
    }, {
        text: "礼包分类",
        leaf: true,
        url: "activation_code_cat.html",
        tabId: "23",
        permission: "menu_activation_code_cat"
    }, {
        text: "礼包列表",
        leaf: true,
        url: "activation_code.html",
        tabId: "24",
        permission: "menu_activation_code"
    }, {
        text: "游戏升级任务",
        leaf: true,
        url: "gametask.html",
        tabId: "25",
        permission: "menu_gametask"
    }, {
        text: "内置任务",
        leaf: true,
        url: "innertask.html",
        tabId: "26",
        permission: "menu_innertask"
    }, {
        text: "游戏首充任务",
        leaf: true,
        url: "firstpaytask.html",
        tabId: "27",
        permission: "menu_firstpaytask"
    }],
    user:[{
        text: "权限管理",
        leaf: true,
        url: "permission_mgr.html",
        tabId: "31",
        permission: "menu_permission"
    }, {
        text: "授权中心",
        leaf: true,
        url: "user_auth.html",
        tabId: "32",
        permission: "menu_auth"
    },{
        text:"订单管理",
        leaf:true,
        tabId: "33",
        url:"order_mgr.html",
        permission:"menu_order"
    }]
};

var tabpanel;
Ext.onReady(function () {
    delayInit(100);
});

function delayInit(delay){
    if(GlobalUtil.isSuperAdmin()==undefined){
        setTimeout(delayInit,delay);
    }else {
        init();
    }
}

function init(){

    // 标签panel
    tabpanel = Ext.create("Ext.tab.Panel", {
        layout: "fit",
        resizeTabs: true,
        enableTabScroll: true,
        width: 600,
        height: 250,
        activeTab: 0,
        defaults: {
            autoScroll: true
        },
        items: [{
            title: "信息面板",
            id: "tab_dashboard",
            closable: false,
            html: "欢迎进入管理平台！！！",
            listeners: {
                activate: function (tab) {
                    Ext.getCmp("content-panel").setTitle("当前位置：基础管理平台->信息面板");
                }
            }
        }]
    });


    // 树的panel
    var indexStore = new Ext.data.TreeStore({
        root:{
            expanded: true,
            noClick: true,
            children:[]
        }
    });
    var gameStore = new Ext.data.TreeStore({
        root:{
            expanded: true,
            noClick: true,
            children:[]
        }
    });
    var userStore = new Ext.data.TreeStore({
        root:{
            expanded: true,
            noClick: true,
            children:[]
        }
    });

    var storeMap = {index:indexStore,game:gameStore,user:userStore};


    if (GlobalUtil.isSuperAdmin()) {
        for(var i in allMenuTree){
            var e = allMenuTree[i];
            if(e.constructor!=Array){
                continue;
            }
            storeMap[i].getRootNode().appendChild(e);
        }
    } else {
        Ext.data.JsonP.request({
            url: URLS.USER.CURRENT_USER_PERMISSION,
            callbackKey: 'function',
            params: {gid: 0},
            // scope: 'this',
            success: function (res) {
                if (res && res.status == 1) {
                    var pms = res.data || [];
                    var pmsMap = {};
                    for (var i = 0; i < pms.length; i++) {
                        pmsMap[pms[i]] = true;
                    }
                    for (var i in allMenuTree) {
                        var m = allMenuTree[i];
                        if(m.constructor!=Array){
                            continue;
                        }
                        for(var j=0;j< m.length;j++){
                            if (pmsMap[m[j].permission]) {
                                storeMap[i].getRootNode().appendChild(m[j]);
                            }
                        }
                    }
                } else {
                    Ext.MessageBox.alert("提示", "获取权限数据失败");
                }
            },
            failure: function (response) {
                Ext.MessageBox.alert("提示", "获取权限数据失败");
            }
        });
    }

    // 树的panel
    var indexPanel = new Ext.tree.Panel({
        rootVisible: false,
        title:"首页管理",
        store: indexStore,
        listeners: {
            itemclick: function (node, record) {
                if (record.raw.noClick) {
                    return;
                } else {
                    addTab(record.raw.text,
                        record.raw.tabId, record.raw.url,
                        record.raw.iconCls);
                }
            }
        }
    });

    var gamePanel = new Ext.tree.Panel({
        rootVisible: false,
        title:"游戏中心管理",
        store: gameStore,
        listeners: {
            itemclick: function (node, record) {
                if (record.raw.noClick) {
                    return;
                } else {
                    addTab(record.raw.text,
                        record.raw.tabId, record.raw.url,
                        record.raw.iconCls);
                }
            }
        }
    });

    var userPanel = new Ext.tree.Panel({
        rootVisible: false,
        title:"用户中心管理",
        store: userStore,
        listeners: {
            itemclick: function (node, record) {
                if (record.raw.noClick) {
                    return;
                } else {
                    addTab(record.raw.text,
                        record.raw.tabId, record.raw.url,
                        record.raw.iconCls);
                }
            }
        }
    });

//	// 主要的布局
    Ext.create("Ext.container.Viewport", {
        layout: "border",
        items: [new Ext.panel.Panel({
            region: "north",
            contentEl: "north",
            border: false,
            title: "基础管理平台",
            layout: "fit",
            height: 85
        }), {
            layout: "fit",
            region: "south",
            html: "基础管理平台 - V.1.0.0"
        }, {
            collapsible: true,
            region: "west",
            width: 160,
            maxWidth: 300,
            title: "系统导航",
            layout : "accordion",
            layoutConfig : {
                animate : true,
                activeOnTop : true
            },
            items: [indexPanel,gamePanel,userPanel]
        }, {
            id: "content-panel",
            region: "center",
            layout: "fit",
            title: "当前位置：基础管理平台->用户信息",
            items: [tabpanel]
        }],
        renderTo: Ext.getBody()
    });


    // 关闭
    var closeButton = new Ext.Button({
        iconCls: "cancel_25_25Icon",
        iconAlign: "left",
        scale: "medium",
        autoWidth: true,
        tooltip: "<span style='font-size:12px'>注销用户</span>",
        pressed: true,
        arrowAlign: "right",
        renderTo: "closeDiv",
        handler: function () {
            logout();
        }
    });

    /**
     * 创建节点
     *
     * @param {}
     *            closable
     */
    function addTab(title, tabId, url, iconCls) {
        var tab = tabpanel.getComponent(tabId);
        if (tab) {
            reloadCurrentTab({
                id: tabId
            });
        }
        if (!tab) {
            if (Ext.isEmpty(iconCls)) {
                iconCls = "";
            }
            tabpanel.add({
                title: title,
                id: tabId,
                iconCls: iconCls,
                closable: true,
                layout: "fit",
                listeners: {
                    activate: function (tab) {
                        Ext.getCmp("content-panel").setTitle("当前位置：基础管理平台->" + tab.title)
                    },
                    close: function (tab, eOpts) {
                        var actTab = tabpanel.getActiveTab();
                        if (actTab.id != tab.id) {
                            return;
                        }
                        tabpanel.setActiveTab(tab.previousSibling());
                    }
                },
                html: "<iframe id='"
                + iframeId(tabId)
                + "' scrolling='auto' frameborder='0' width='100%' height='100%' src="
                + url + "?_v={{site.version}}></iframe>"
            }).show();
        }
        tabpanel.setActiveTab(tab);
    }

    /**
     * 注销用户
     */
    function logout() {
        location.href = URLS.USER.LOGOUT;
    }

    /**
     * 生成IframeId
     * @param tabId
     * @returns {string}
     */
    function iframeId(tabId) {
        return "mokylin_" + tabId;
    }

    /**
     * 刷新当前tab
     */
    function reloadCurrentTab(currentItem) {
        var frameName = iframeId(currentItem.id);
        var url = Ext.get(frameName).getAttribute("src");
        Ext.get(frameName).set({src: url});
    }

}
