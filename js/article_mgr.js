/**
 * Created by 李朝(Li.Zhao) on 2016/4/12.
 */

Ext.require(['Ext.grid.*', 'Ext.data.*', 'Ext.ux.RowExpander', 'Ext.selection.CheckboxModel']);

/**
 *文章管理
 */
Ext.QuickTips.init();
// ##########################################################
// 数据源存储块 开始
// ##########################################################


//文章分类
var articleTreeStore = new Ext.data.Store({
    //defaultRootProperty:"data",
    fields: ['cname', 'ename', 'gid'],
    proxy: {
        type: "jsonp",
        url: URLS.MISC.ARTICLE_CAT_LIST,
        callbackKey: "function",
        reader: {
            type: 'json',
            root: 'data'
        }
    }
});

// 文章列表存储块
var articleStore = Ext.create(
    "Ext.data.Store",
    {
        autoLoad: false,
        fields: ["aid", "title", "author", "state", "cDate", "uDate", "gid","sequence"],
        pageSize: 20,
        proxy: {
            type: "jsonp",
            url: URLS.MISC.ARTICLE_LIST,
            callbackKey: "function",
            pageParam: "pagenum",
            limitParam: "pagesize",
            reader: {
                type: 'json',
                root: 'data.data',
                totalProperty: "data.total",
                //readRecordsOnFailure: false,
                successProperty: "status"
            }
        },
        listeners: {
            prefetch: function (this_, operation, eOpts) {
                alert(operation);
            },
            load: function (_this, records, successful, eOpts) {
                var status = _this.proxy.reader.jsonData.status;
                GlobalUtil.status(status);
            }

        }
    });
Ext.onReady(function () {

    var articleGrid = new Ext.grid.Panel(
        {
            region: 'center',
            title: "文章列表",
            //renderTo: Ext.getBody(),
            multiSelect: true,// 支持多选
            selType: 'rowmodel',// 设置为单元格选择模式Ext.selection.RowModel
            id: "articleGridId",
            store: articleStore,
            loadMask: {
                msg: "正在加载数据,请稍等..."
            },
            viewConfig: {
                stripeRows: true,//在表格中显示斑马线
                enableTextSelection: true //可以复制单元格文字
            },
            columns: [
                Ext.create("Ext.grid.RowNumberer"),
                {
                    text: "标题",
                    width: 200,
                    dataIndex: "title"
                },
                {
                    text: "权重",
                    width: 50,
                    dataIndex: "sequence"
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
                    renderer: function (v) {
                        switch (v) {
                            case 0:
                                return "草稿";
                            case 1:
                                return "等待发布";
                            case 2:
                                return "已发布";
                        }
                        return "未知"
                    }
                },
                {
                    text: "创建时间",
                    width: 150,
                    dataIndex: "cDate",
                    renderer: function (v) {
                        return new Date(v).toLocaleString();
                    }
                },
                {
                    text: "修改时间",
                    width: 150,
                    dataIndex: "uDate",
                    renderer: function (v) {
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
                    + '<a style="text-decoration:none;margin-right:5px;" href="javascript:deleteArticle(\'{aid}\');"><img src="js/extjs/resources/icons/delete.png"  title="删除" alt="删除" class="actionColumnImg" />&nbsp;</a>'
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
                items: [{
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


    // 树的panel
    var articleTreePanel = new Ext.grid.Panel({
        //title:"分类",
        tbar: [{
            id: 'articleCatAddBtn',
            text: "添加分类",
            disabled: true,
            icon: "js/extjs/resources/icons/add.png",
            handler: function () {
                addArticleCat();
            }
        }],
        region: 'west',
        //rootVisible: false,
        store: articleTreeStore,
        columns: [{
            text: "中文名",
            width: 100,
            dataIndex: "cname"
        },
            {
                text: "英文名",
                width: 50,
                dataIndex: "ename"
            },
            {
                text: "操作",
                width: 50,
                xtype: 'templatecolumn',
                tpl: '<tpl>'
                + '<a style="text-decoration:none;margin-right:5px;" href="javascript:updateArticleCat({id:\'{id}\',cname:\'{cname}\',ename:\'{ename}\',gid:\'{gid}\'});"><img src="js/extjs/resources/icons/pencil.png"  title="修改" alt="修改" class="actionColumnImg" />&nbsp;</a>'
                + '</tpl>'
            }],
        listeners: {
            itemclick: function (_this, record, item, index, e, eOpts) {
                var gid = Ext.getCmp("gameCombo").getValue();
                var ename = record.get("ename");
                articleStore.getProxy().extraParams = {"gid": gid, catename: ename};//游戏改变的时候重新加载权限数据
                articleStore.load();
                addDataWindow.ename = ename;//添加文章窗口
                Ext.getCmp("addArticleId").enable();//发布文章按钮可用
            }
        }
    });

    //Ext.require("Ext.moux.GameCombo");
    /**
     * 布局
     */
    new Ext.Viewport({
        layout: 'border',
        tbar: [],
        items: [
            {
                region: "north",
                //height:
                layout: "hbox",
                items: [
                    Ext.create("Ext.moux.GameCombo",{
                        id: "gameCombo",
                        extraItems:{gid: PLATFORM_IDENTIFIER, gname: "官网管理平台"},
                        listeners: {
                            select: function (_this, records, eOpts) {
                                articleTreeStore.getProxy().extraParams = {"gid": records[0].get('gid')};
                                articleTreeStore.load();
                                articleStore.removeAll();
                                Ext.getCmp("addArticleId").disable();
                            },
                            afterrender: function (_this, eOpts) {//数据加载后自动选择第一个游戏加载数据
                                var gameStore =  _this.store;
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
                                            articleTreeStore.getProxy().extraParams = {"gid": gid};
                                            articleTreeStore.load();
                                            articleStore.removeAll();
                                            Ext.getCmp('articleCatAddBtn').enable();
                                        }
                                    }, 200);
                                })();
                            }
                        }
                    })]
            }, {
                collapsible: true,
                region: "west",
                title: "文章分类",
                width: 200,
                maxWidth: 300,
                layout: "fit",
                items: [articleTreePanel]
            }, {
                id: "content-panel",
                region: "center",
                layout: "fit",
                items: [articleGrid]
            }],
        renderTo: Ext.getBody()
    });


});
/**
 * 分类添加修改
 * @type {Ext.window.Window}
 */
var addCatDataWindow = new Ext.Window({
    title: "添加分类",
    width: 300,
    height: 200,
    //resizable: false,
    modal: true,
    autoShow: false,
    closable: false,
    layout: 'fit',
    defaults: {
        labelStyle: 'padding-left:4px;'
    },
    listeners: {
        beforeshow: function (_this, eOpts) {
            Ext.getCmp("addCatSubmitBtn").enable();
        }
    },
    items: [
        new Ext.form.Panel({
                id: "articleCatForm",
                fieldDefurlaults: {
                    labelAlign: 'right',
                    labelWidth: 60,
                    anchor: '100%'
                },
                frame: false,
                bodyStyle: 'padding:10 10',
                items: [
                    {
                        id: "enameField",
                        xtype: "textfield",
                        fieldLabel: "英文名字",
                        name: "ename",
                        width: 200,
                        allowBlank: false
                    }, {
                        id: "cnameField",
                        xtype: "textfield",
                        fieldLabel: "中文名字",
                        name: "cname",
                        width: 200,
                        allowBlank: false
                    }, {
                        id: "catIdField",
                        xtype: "hiddenfield",
                        name: "id"
                    }, {
                        id: "gidCatField",
                        xtype: "hiddenfield",
                        name: "gid"
                    }],
                listeners: {
                    beforeaction: function (_this, action, eOpts) {
                        Ext.getCmp("gidCatField").setValue(Ext.getCmp("gameCombo").getValue());
                        Ext.data.JsonP.request({
                            params: _this.getValues(), // values from form fields..
                            url: Ext.getCmp("articleCatForm").url,
                            callbackKey: 'function',
                            success: function (res) {
                                if (res && res.status == "1") {
                                    GlobalUtil.tipMsg("提示", Ext.getCmp("articleCatForm").operate + "成功");
                                    articleTreeStore.reload();
                                    addCatDataWindow.hide();
                                    return;
                                }
                                GlobalUtil.status(res.status, function () {
                                    addCatDataWindow.hide();
                                });
                            },
                            failure: function (response) {
                                Ext.MessageBox.alert("提示", Ext.getCmp("articleCatForm").operate + "失败");
                            }
                        });
                        return false;
                    }
                },
                buttons: [{
                    text: '确定',
                    id: "addCatSubmitBtn",
                    handler: function (v) {
                        var form = v.up("form").getForm();
                        if (v.up("form").isValid()) {
                            v.disable();
                            form.submit();
                        }
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
function addArticleCat() {
    addCatDataWindow.setTitle("发布文章");
    Ext.getCmp("articleCatForm").getForm().reset();
    Ext.getCmp("articleCatForm").url = URLS.MISC.ARTICLE_CAT_ADD;
    Ext.getCmp("articleCatForm").operate = "添加";
    addCatDataWindow.show();
}
function updateArticleCat(data) {
    addCatDataWindow.setTitle("修改文章");
    Ext.getCmp("articleCatForm").getForm().reset();
    Ext.getCmp("articleCatForm").url = URLS.MISC.ARTICLE_CAT_UPDATE;
    Ext.getCmp("articleCatForm").operate = "修改";
    Ext.getCmp("articleCatForm").getForm().setValues(data);
    addCatDataWindow.show();
}
var addDataWindow = new Ext.Window({
    title: "发布文章",
    width: 700,
    //height: 500,
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
                        width: 400,
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
                            //{boxLabel: '等待发布', name: 'state', inputValue: 1},
                            {boxLabel: '发布', name: 'state', inputValue: 2}
                        ]
                    }, {
                        id: "sequenceField",
                        xtype: "textfield",
                        fieldLabel: "权重",
                        name: "sequence",
                        allowBlank: false
                    }, {
                        id: "typeField",
                        fieldLabel: "内/外部新闻",
                        name: "type",
                        allowBlank: false,
                        xtype: 'radiogroup',
                        cls: 'x-check-group-alt',
                        items: [
                            {boxLabel: '内部新闻', name: 'type', inputValue: 0, checked: true},
                            {boxLabel: '外部新闻', name: 'type', inputValue: 1}
                        ], listeners: {
                            change: function (_this, newValue, oldValue, eOpts) {
                                if (newValue.type == 0) {
                                    Ext.getCmp("linkField").disable();
                                    Ext.getCmp("linkField").hide();
                                    Ext.getCmp("contentField").enable();
                                    Ext.getCmp("contentField").show();
                                } else {
                                    Ext.getCmp("contentField").disable();
                                    Ext.getCmp("contentField").hide();
                                    Ext.getCmp("linkField").enable();
                                    Ext.getCmp("linkField").show();
                                }
                            }
                        }
                    }, {
                        id: "linkField",
                        xtype: "textfield",
                        fieldLabel: "外部链接",
                        hidden: true,
                        disabled: true,
                        name: "link",
                        width: 400,
                        allowBlank: false
                    }, Ext.create("Ext.moux.MoHtmlEditor", {
                        id: "contentField",
                        fieldLabel: "内容",
                        name: "content",
                        url: URLS.MISC.FILE_UPLOAD,
                        maxLength: 3294967295,
                        //width:,
                        height: 300,
                        allowBlank: false,
                        listeners: {
                            change: function (editor, newValue, oldValue) {
                                if (newValue && (newValue.length > editor.maxLength)) {
                                    Ext.MessageBox.alert("提示", "内容长度超过3294967295", function () {
                                        Ext.getCmp("addSubmitBtn").enable();
                                    });
                                    editor.setValue("");
                                    editor.insertAtCursor(oldValue);
                                    editor.clearInvalid();
                                }
                            }
                        }
                    }), {
                        id: "aidField",
                        xtype: "hiddenfield",
                        name: "aid"
                    }, {
                        id: "gidField",
                        xtype: "hiddenfield",
                        name: "gid"
                    }, {
                        id: "catenameField",
                        xtype: "hiddenfield",
                        name: "catename"
                    }],
                listeners: {
                    beforeaction: function (_this, action, eOpts) {
                        Ext.getCmp("gidField").setValue(Ext.getCmp("gameCombo").getValue());
                        Ext.getCmp("catenameField").setValue(addDataWindow.ename);
                        var values = _this.getValues();
                        if (values.content && (values.content.length > 1294967295)) {
                            Ext.MessageBox.alert("提示", "内容长度超过1294967295", function () {
                                Ext.getCmp("addSubmitBtn").enable();
                            });
                            return;
                        }
                        var crossDomain = new CrossDomain();
                        crossDomain.init(Ext.getCmp("articleForm").url, values, function (v) {
                            if (v == 1) {
                                GlobalUtil.tipMsg("提示", Ext.getCmp("articleForm").operate + "成功");
                                articleStore.reload();
                                addDataWindow.hide();
                                return;
                            }
                            GlobalUtil.status(parseInt(v), function () {
                                Ext.getCmp("addSubmitBtn").enable();
                            });
                        });
                        crossDomain.submit();
                        return false;
                    }
                },
                buttons: [{
                    text: '确定',
                    id: "addSubmitBtn",
                    handler: function (v) {
                        var form = v.up("form").getForm();
                        if (v.up("form").isValid()) {
                            var values = form.getValues();
                            if (values.type == 0) {
                                Ext.getCmp("linkField").setValue('');
                            } else {
                                Ext.getCmp("contentField").setValue();
                            }
                            v.disable();
                            form.submit();
                        }
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
        params: {aid: aid, gid: gid}, // values from form fields..
        url: URLS.MISC.ARTICLE_DETAIL,
        callbackKey: 'function',
        success: function (res) {
            if (res && res.status == 1) {
                var data = res.data;
                addDataWindow.setTitle("修改文章");
                Ext.getCmp("articleForm").operate = "修改";
                Ext.getCmp("articleForm").getForm().reset();
                Ext.getCmp("articleForm").url = URLS.MISC.ARTICLE_UPDATE;
                Ext.getCmp("articleForm").getForm().setValues(data);
                Ext.getCmp("stateField").setValue({"state": data.state});
                Ext.getCmp("stateField").setValue({"type": data.type});
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

function deleteArticle(aid) {
    Ext.MessageBox.confirm("删除确认", "是否要删除文章：", function (res) {
        if (res == "yes") {
            Ext.data.JsonP.request({
                url: URLS.MISC.ARTICLE_DELETE,
                params: {
                    aid: aid,
                    gid: Ext.getCmp("gameCombo").getValue()
                },
                callbackKey: 'function',
                // scope: 'this',
                success: function (res) {
                    if (res && res.status == 1) {
                        GlobalUtil.tipMsg("提示", "删除成功");
                        articleStore.reload();
                        return;
                    }
                    if (!res) {
                        Ext.MessageBox.alert("提示", "删除失败");
                    }
                    GlobalUtil.status(parseInt(res.status), function () {
                    });
                },
                failure: function (response) {
                    Ext.MessageBox.alert("提示", "删除失败");
                }
            });
        }
    });


}

