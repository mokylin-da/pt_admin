
var allMenuTree = [{
    text: "权限管理",
    leaf: true,
    url: "permission_mgr.html",
    tabId: "0",
    permission:"menu_permission"
}, {
    text: "授权中心",
    leaf: true,
    url: "user_auth.html",
    tabId: "1",
    permission:"menu_auth"
}, {
    text: "区服管理",
    leaf: true,
    url: "server_mgr.html",
    tabId: "2",
    permission:"menu_server"
}, {
    text: "游戏管理",
    leaf: true,
    url: "game_mgr.html",
    tabId: "3",
    permission:"menu_game"
}, {
    text: "文章管理",
    leaf: true,
    url: "article_mgr.html",
    tabId: "4",
    permission:"menu_article"
}];

var tabpanel;
Ext.onReady(function () {
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
    var treeStore = new Ext.data.TreeStore();


    Ext.data.JsonP.request({
        url: URLS.USER.CURRENT_USER_PERMISSION,
        callbackKey: 'function',
        params:{gid:0},
        // scope: 'this',
        success: function (res) {
            if (res && res.status == 1) {
                var pms = res.data;

                var menuTree=[];

                var rootNodes =  {
                            text: "菜单",
                            expanded: true,
                            noClick: true,
                            children: menuTree
                };
                var pmsMap ={};
                for(var i=0;i<pms.length;i++){
                    pmsMap[pms[i]]=true;
                }
                for(var i=0;i<allMenuTree.length;i++){
                    if(pmsMap[allMenuTree[i].permission]){
                        menuTree.push(allMenuTree[i])
                    }
                }

                treeStore.setRootNode(rootNodes);
            } else {
                Ext.MessageBox.alert("提示","获取权限数据失败");
            }
        },
        failure: function (response) {
            Ext.MessageBox.alert("提示","获取权限数据失败");
        }
    });

    // 树的panel
    var treePanel = new Ext.tree.Panel({
        rootVisible:false,
        store: treeStore,
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
        },{
            collapsible: true,
            region: "west",
            width: 160,
            maxWidth: 300,
            title: "系统导航",
            layout: "fit",
            items: [treePanel]
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
                        Ext.getCmp("content-panel").setTitle( "当前位置：基础管理平台->"+tab.title)
                    },
                    close: function (tab, eOpts) {
                        var actTab = tabpanel.getActiveTab();
                        if(actTab.id!=tab.id){
                            return;
                        }
                        tabpanel.setActiveTab(tab.previousSibling());
                    }
                },
                html: "<iframe id='"
                + iframeId(tabId)
                + "' scrolling='auto' frameborder='0' width='100%' height='100%' src="
                + url + "></iframe>"
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
    function iframeId(tabId){
        return "mokylin_"+tabId;
    }
    /**
     * 刷新当前tab
     */
    function reloadCurrentTab(currentItem) {
        var frameName = iframeId(currentItem.id);
        var url = Ext.get(frameName).getAttribute("src");
        Ext.get(frameName).set({src: url});
    }

});


