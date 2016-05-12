/**
 * Created by 李朝(Li.Zhao) on 2016/4/12.
 */

Ext.require(['Ext.grid.*', 'Ext.data.*', 'Ext.ux.RowExpander',
    'Ext.selection.CheckboxModel']);

/**
 *文章管理
 */

Ext.QuickTips.init();
// ##########################################################
// 数据源存储块 开始
// ##########################################################


var gameStore = Ext.create('Ext.data.Store', {
    autoLoad: true,
    fields: ['gname', 'gid'],
    proxy: {
        type: "jsonp",
        url: URLS.GAME_INFO.GAME_LIST,
        callbackKey: "function",
        reader: {
            type: 'json',
            root: 'data'
        }
    }
});

// 权限列表存储块
var articleStore = Ext
    .create(
    "Ext.data.Store",
    {
        autoLoad: false,
        fields: ["aid", "title", "author", "state", "cDate", "uDate","gid"],
        pageSize: 20,
        proxy: {
            type: "jsonp",
            url: URLS.MISC.ARTICLE_LIST,
            callbackKey: "function",
            pageParam: "pagenum",
            limitParam: "pageSize",
            reader: {
                type: 'json',
                root: 'data.data',
                totalProperty: "data.total",
                readRecordsOnFailure: false,
                successProperty: "status"
            }
        },
        listeners: {
            load: function (_this, records, successful, eOpts) {
                var status = _this.proxy.reader.jsonData.status;
                GlobalUtil.status(status);
            }

        }
    });
Ext.onReady(function () {

    var permissionGrid = new Ext.grid.Panel(
        {
            layout: "fit",
            //renderTo: Ext.getBody(),
            multiSelect: true,// 支持多选
            selType: 'rowmodel',// 设置为单元格选择模式Ext.selection.RowModel
            id: "authGridId",
            store: articleStore,
            loadMask: {
                msg: "正在加载数据,请稍等..."
            },
            viewConfig:{
                stripeRows:true,//在表格中显示斑马线
                enableTextSelection:true //可以复制单元格文字
            },
            columns: [
                Ext.create("Ext.grid.RowNumberer"),
                {
                    text: "标题",
                    width: 200,
                    dataIndex: "title"
                },
                {
                    text: "作者",
                    width: 100,
                    dataIndex: "author"
                },
                {
                    text: "状态",
                    width: 80,
                    dataIndex: "state",
                    renderer:function(v){
                        switch (v){
                            case 0:return "草稿";
                            case 1:return "等待发布";
                            case 2:return "已发布";
                        }
                        return "未知"
                    }
                },
                {
                    text: "创建时间",
                    width: 150,
                    dataIndex: "cDate",
                    renderer:function(v){
                        return new Date(v).toLocaleString();
                    }
                },
                {
                    text: "修改时间",
                    width: 150,
                    dataIndex: "uDate",
                    renderer:function(v){
                        return new Date(v).toLocaleString();
                    }
                },
                {
                    header: "操作",
                    width: 50,
                    align: 'center',
                    xtype: 'templatecolumn',
                    tpl: '<tpl>'
                    + '<a style="text-decoration:none;margin-right:5px;" href="javascript:updateArticle(\'{aid}\',\'{gid}\');"><img src="js/extjs/resources/icons/pencil.png"  title="修改" alt="修改" class="actionColumnImg" />&nbsp;</a>'
                        //+ '<a style="text-decoration:none;margin-right:5px;" href="javascript:deletePermission(\'{id}\');"><img src="js/extjs/resources/icons/delete.png"  title="删除" alt="删除" class="actionColumnImg" />&nbsp;</a>'
                    + '</tpl>'
                }

            ],
            dockedItems: [{
                id: "pagingToolbarID",
                xtype: 'pagingtoolbar',
                store: articleStore,   // same store GridPanel is using
                dock: 'bottom',
                displayInfo: true
            }, {
                xtype: "toolbar",
                items: [
                    {
                        id: "gameCombo",
                        xtype: 'combo',
                        triggerAction: 'all',
                        forceSelection: true,
                        editable: false,
                        fieldLabel: '游戏名称',
                        name: 'gid',
                        displayField: 'gname',
                        valueField: 'gid',
                        emptyText: "--请选择--",
                        store: gameStore,
                        listeners: {
                            change: function (_this, newValue, oldValue, eOpts) {
                                if (newValue) {
                                    Ext.getCmp("addArticleId").enable();
                                } else {
                                    Ext.getCmp("addArticleId").disable();
                                }
                                articleStore.getProxy().extraParams = {"gid": newValue};//游戏改变的时候重新加载权限数据
                                articleStore.load();
                            }
                            ,
                            afterrender: function (_this, eOpts) {//数据加载后自动选择第一个游戏加载数据
                                var data = gameStore.getAt(0);
                                //防止组件加载完后store还未接收到数据的情况，100ms获取一次
                                (function sleepFn() {
                                    setTimeout(function () {
                                        data = gameStore.getAt(0);
                                        if (!data) {
                                            sleepFn();
                                        } else {
                                            var gid = data.get("gid");
                                            //默认加载第一个游戏的权限列表
                                            _this.setValue(gid);
                                        }
                                    }, 200);
                                })();
                            }
                        }
                    },
                    "-",
                    {
                        id: "addArticleId",
                        disabled: true,
                        text: "发布文章",
                        icon: "js/extjs/resources/icons/add.png",
                        handler: function () {
                            addArticle();
                        }
                    }]
            }]

        });

    /**
      * 布局
      */
    new Ext.Viewport({
         layout: "fit",
         items: [permissionGrid],
         renderTo: Ext.getBody()
    });


});
var addDataWindow = new Ext.Window({
    title: "发布文章",
    width: 500,
    height: 500,
    resizable: false,
    modal: true,
    autoShow: false,
    closable: false,
    layout: 'fit',
    defaults: {
        labelStyle: 'padding-left:4px;'
    },
    listeners: {
        beforeshow: function (_this, eOpts) {
            Ext.getCmp("addSubmitBtn").enable();
        }
    },
    items: [
        new Ext.form.Panel({
                id: "articleForm",
                fieldDefurlaults: {
                    labelAlign: 'right',
                    labelWidth: 60,
                    anchor: '100%'
                },
                frame: false,
                bodyStyle: 'padding:10 10',
                items: [
                    {
                        id: "titleField",
                        xtype: "textfield",
                        fieldLabel: "标题",
                        name: "title",
                        width:400,
                        allowBlank: false
                    }, {
                        id: "stateField",
                        fieldLabel: "状态",
                        name: "state",
                        allowBlank: false,
                        xtype: 'radiogroup',
                        cls: 'x-check-group-alt',
                        items: [
                            {boxLabel: '草稿', name: 'state', inputValue: 0, checked: true},
                            {boxLabel: '等待发布', name: 'state', inputValue: 1},
                            {boxLabel: '已发布', name: 'state', inputValue: 2}
                        ]
                    }, {
                        id: "contentField",
                        xtype: "textareafield",
                        fieldLabel: "内容",
                        name: "content",
                        width:400,
                        height:300,
                        allowBlank: false
                    }, {
                        id: "aidField",
                        xtype: "hiddenfield",
                        name: "aid"
                    }, {
                        id: "gidField",
                        xtype: "hiddenfield",
                        name: "gid"
                    }],
                listeners: {
                    beforeaction: function (_this, action, eOpts) {
                        Ext.getCmp("gidField").setValue(Ext.getCmp("gameCombo").getValue());
                        Ext.data.JsonP.request({
                            params: _this.getValues(), // values from form fields..
                            url: Ext.getCmp("articleForm").url,
                            callbackKey: 'function',
                            success: function (res) {
                                if (res && res.status == 1) {
                                    Ext.MessageBox.alert("提示", Ext.getCmp("articleForm").operate + "成功");
                                    articleStore.reload();
                                    addDataWindow.hide();
                                    return;
                                }
                                GlobalUtil.status(res.status, function () {
                                    addDataWindow.hide();
                                });
                            },
                            failure: function (response) {
                                Ext.MessageBox.alert("提示", Ext.getCmp("articleForm").operate + "失败");
                            }
                        });
                        return false;
                    }
                },
                buttons: [{
                    text: '确定',
                    id: "addSubmitBtn",
                    handler: function (v) {
                        v.disable();
                        v.up("form").submit();
                    }
                }, {
                    text: '取消',
                    handler: function (v) {
                        v.up("window").hide();
                    }
                }]
            }
        )]
});
function addArticle() {
    addDataWindow.setTitle("发布文章");
    Ext.getCmp("articleForm").getForm().reset();
    Ext.getCmp("articleForm").url = URLS.MISC.ARTICLE_ADD;
    Ext.getCmp("articleForm").operate = "发布";
    addDataWindow.show();
}
function updateArticle(aid, gid) {
    Ext.data.JsonP.request({
        params: {aid:aid,gid:gid}, // values from form fields..
        url:URLS.MISC.ARTICLE_DETAIL,
        callbackKey: 'function',
        success: function (res) {
            if (res && res.status == 1) {
                var data = res.data;
                addDataWindow.setTitle("修改文章");
                Ext.getCmp("articleForm").operate = "修改";
                Ext.getCmp("articleForm").getForm().reset();
                Ext.getCmp("articleForm").url = URLS.MISC.ARTICLE_UPDATE;
                Ext.getCmp("aidField").setValue(aid);
                Ext.getCmp("titleField").setValue(data.title);
                Ext.getCmp("stateField").setValue({"state":data.state});
                Ext.getCmp("contentField").setValue(data.content);
                addDataWindow.show();
                return;
            }
            GlobalUtil.status(res.status);
        },
        failure: function (response) {
            Ext.MessageBox.alert("提示", "数据加载失败");
        }
    });
}

function deletePermission(id) {
    Ext.MessageBox.confirm("删除确认", "是否要删除文章：", function (res) {
        if (res == "yes") {
            alert(res);
        }
    });
}

