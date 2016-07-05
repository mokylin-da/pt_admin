/**
 * Created by 李朝(Li.Zhao) on 2016/4/15.
 */
Ext.require(['Ext.grid.*', 'Ext.data.*', 'Ext.selection.CheckboxModel']);

/**
 *权限管理
 */

Ext.QuickTips.init();
// ##########################################################
// 数据源存储块 开始
// ##########################################################


var gameStore = Ext.create('Ext.data.Store', {
    autoLoad: true,
    fields: ['gname', 'gid', 'gurl', 'gtag', 'picture', 'catids', 'sequence', 'state', 'recharge_plat', 'serverurl', 'cuser', 'opentime', 'addtime'],
    pageSize: 20,
    proxy: {
        type: "jsonp",
        url: URLS.GAME_INFO.GAME_PAGE_LIST,
        callbackKey: "function",
        pageParam: "pagenum",
        limitParam: "pagesize",
        reader: {
            type: 'json',
            root: 'data.data',
            totalProperty: "data.total",
            successProperty: "status"
        }
    }
});

var gameCatItems = [];
Ext.data.JsonP.request({
    url: URLS.GAME_INFO.GAME_CAT_LIST,
    params: {
        gid: PLATFORM_IDENTIFIER
    },
    callbackKey: 'function',
    success: function (res) {
        if (res && res.status == 1) {
            var data = res.data;
            if (!data || data.constructor != Array) {
                return;
            }
            for (var i = 0; i < data.length; i++) {
                gameCatItems.push({boxLabel: data[i].name, name: 'catids', inputValue: data[i].id});
            }
            Ext.getCmp("catCheckBoxGroup").add(gameCatItems);
            return;
        }
        Ext.MessageBox.alert("提示", "读取游戏分类失败");
    },
    failure: function (response) {
        Ext.MessageBox.alert("提示", "读取游戏分类失败");
    }
});

//var gameCatStore = Ext.create('Ext.data.Store', {
//    autoLoad: true,
//    fields: ['id', 'name', 'sequence', 'state', 'cuser', 'uuser', 'cdate', 'udate'],
//    proxy: {
//        type: "jsonp",
//        url: URLS.GAME_INFO.GAME_CAT_LIST,
//        callbackKey: "function",
//        reader: {
//            type: 'json',
//            root: 'data'
//        }
//    },
//    listeners: {
//        load: function (_this, records, successful, eOpts) {
//            gameCatStore.add({id: '', name: '全部', sequence: '-1'});
//        }
//    }
//});
//gameCatStore.sort('sequence', 'ASC');

Ext.onReady(function () {

    var gameGrid = new Ext.grid.Panel(
        {
            multiSelect: true,// 支持多选
            selType: 'rowmodel',// 设置为单元格选择模式Ext.selection.RowModel
            id: "authGridId",
            store: gameStore,
            viewConfig: {
                stripeRows: true,//在表格中显示斑马线
                enableTextSelection: true //可以复制单元格文字
            },
            loadMask: {
                msg: "正在加载数据,请稍等..."
            },
            columns: [
                Ext.create("Ext.grid.RowNumberer"),
                {
                    text: "游戏图片",
                    width: 100,
                    dataIndex: "picture",
                    renderer: function (v) {
                        return "<img src='" + v + "' style='height:100px;'/>";
                    }
                },
                {
                    text: "游戏ID",
                    width: 80,
                    dataIndex: "gid"
                },
                {
                    text: "游戏名称",
                    width: 100,
                    dataIndex: "gname"
                }, {
                    text: "是否显示",
                    width: 100,
                    dataIndex: "state",
                    renderer: function (v) {
                        var val = 1;
                        return (v & val) == val ? '显示' : '不显示';
                    }
                }, {
                    text: "最新开服设置",
                    width: 100,
                    dataIndex: "state",
                    renderer: function (v) {
                        var val = 2;
                        return (v & val) == val ? '显示' : '不显示';
                    }
                }, {
                    text: "开服预告设置",
                    width: 100,
                    dataIndex: "state",
                    renderer: function (v) {
                        var val = 4;
                        return (v & val) == val ? '显示' : '不显示';
                    }
                },
                {
                    text: "开服时间",
                    width: 100,
                    dataIndex: "opentime"
                },
                {
                    text: "排行设置",
                    width: 100,
                    dataIndex: "sequence"
                }
                ,
                {
                    header: "操作",
                    width: 50,
                    //dataIndex: "sequence",
                    renderer: function (val, metaData, record, rowIndex, store, view) {
                        //return  '<a style="text-decoration:none;margin-right:5px;" href="javascript:updateGame({#},{gid:\'{gid}\',gname:\'{gname}\',gurl:\'{gurl}\',login_token:\'{login_token}\',serverurl:\'{serverurl}\',opentime:{opentime},state:\'{state}\',sequence:\'{sequence}\',picture:\'{picture}\',catids:\'{catids}\',recharge_ratio:\'{recharge_ratio}\'});"><img src="js/extjs/resources/icons/pencil.png"  title="修改" alt="修改" class="actionColumnImg" />&nbsp;</a>'


                        var value = record.raw;
                        //value.opentime =  Ext.Date.parse(value.opentime, "Y-m-d H:i:s.0");
                        value.opentime = value.opentime.replace(/\..*$/, "");
                        var records = JSON.stringify(value).replace(/"/g, '\"');
                        return '<a style="text-decoration:none;margin-right:5px;" href=\'javascript:updateGame(' + records + ');\'><img src="js/extjs/resources/icons/pencil.png"  title="修改" alt="修改" class="actionColumnImg" />&nbsp;</a>';

                    }
                }

            ],
            tbar: [
                {
                    xtype: 'button',
                    text: "添加游戏",
                    icon: "js/extjs/resources/icons/add.png",
                    handler: function () {
                        addGame();
                    }
                }
            ],
            dockedItems: [{
                id: "pagingToolbarID",
                xtype: 'pagingtoolbar',
                store: gameStore,   // same store GridPanel is using
                dock: 'bottom',
                displayInfo: true
            }, {
                xtype: "toolbar",
                items: [{
                    xtype: 'form',
                    fieldDefaults: {
                        labelAlign: 'left',
                        labelWidth: 100,
                        anchor: '150%'
                    },
                    frame: false,
                    border: false,
                    bodyStyle: 'padding:10 10 10 10 ',
                    layout: 'hbox',
                    items: [
                        //    {
                        //    xtype: 'combobox',
                        //    fieldLabel: '游戏分类',
                        //    displayField: 'name',
                        //    valueField: 'id',
                        //    store: gameCatStore,
                        //    editable: false,
                        //    name: 'catid',
                        //    value: ''
                        //},
                        {
                            xtype: 'textfield',
                            fieldLabel: '游戏名称',
                            name: 'gname'
                        }],
                    dockedItems: [{
                        xtype: 'toolbar',
                        dock: 'right',
                        layout: 'hbox',
                        border: false,
                        items: [{
                            text: "搜索",
                            icon: "js/extjs/resources/icons/search.png",
                            formBind: true,
                            handler: function (v) {
                                v.up("form").submit({
                                    submitEmptyText: false
                                });
                            }
                        }, {
                            text: '重置',
                            handler: function (v) {
                                v.up("form").getForm().reset()
                            }
                        }]
                    }],
                    listeners: {
                        beforeaction: function (form, action, options) {
                            gameStore.getProxy().extraParams = action.getParams();
                            gameStore.reload();
                            return false;
                        }
                    }
                }]
            }]

        });

    /**
     * 布局
     */
    new Ext.Viewport({
        layout: "fit",
        items: [gameGrid],
        renderTo: Ext.getBody()
    });


});
var addDataWindow = new Ext.Window({
    title: "添加游戏",
    width: 300,
    //height: 500,
    resizable: true,
    modal: true,
    autoShow: false,
    closable: false,
    layout: 'fit',
    listeners: {
        beforeshow: function (_this, eOpts) {
            Ext.getCmp("addSubmitBtn").enable();
        }
    },
    items: [
        new Ext.form.Panel({
                id: "dataForm",
                fieldDefurlaults: {
                    labelAlign: 'right',
                    labelWidth: 150,
                    anchor: '150%'
                },
                frame: false,
                width: '100%',
                bodyStyle: 'padding:10 10',
                items: [{
                    id: 'catCheckBoxGroup',
                    xtype: 'checkboxgroup',
                    fieldLabel: '游戏分类',
                    name: 'catids',
                    height: 150,
                    autoScroll: true,
                    items: [],
                    allowBlank: false,
                    blankText: '必须选择一个分类',
                    layout: {
                        type: 'vbox',
                        align: 'left'
                    },
                    listeners: {
                        validitychange: function (_this, valid, eOpts) {
                            if (!valid) {
                                Ext.MessageBox.alert("提示", "必须选择一个分类");
                            }
                        }
                    }
                }, {
                    id: "gidField",
                    xtype: "textfield",
                    fieldLabel: "游戏ID",
                    name: "gid",
                    allowBlank: false
                }, {
                    id: "gtagField",
                    xtype: "textfield",
                    fieldLabel: "游戏标识",
                    name: "gtag",
                    allowBlank: false
                }, {
                    id: "gnameField",
                    xtype: "textfield",
                    fieldLabel: "游戏名称",
                    name: "gname",
                    allowBlank: false
                }, {
                    id: "sequenceField",
                    xtype: "textfield",
                    fieldLabel: "游戏排行",
                    name: "sequence",
                    allowBlank: false
                }, {
                    id: "gurlField",
                    xtype: "textfield",
                    fieldLabel: "游戏链接地址",
                    name: "gurl",
                    allowBlank: false
                }, {
                    id: "serverurlField",
                    xtype: "textfield",
                    fieldLabel: "游戏区服地址",
                    name: "serverurl",
                    allowBlank: false
                }, {
                    id: "recharge_ratioField",
                    xtype: "numberfield",
                    fieldLabel: "游戏充值比率",
                    name: "recharge_ratio",
                    allowBlank: false
                }, {
                    id: "recharge_tokenField",
                    xtype: "textfield",
                    fieldLabel: "充值token",
                    name: "recharge_token",
                    allowBlank: false
                }, {
                    id: "login_tokenField",
                    xtype: "textfield",
                    fieldLabel: "游戏登录token",
                    name: "login_token",
                    allowBlank: false
                }, Ext.create('Ext.ux.form.DateTimeField', {
                    id: "opentimeField",
                    // xtype: "datetimefield",
                    fieldLabel: "游戏开始时间",
                    name: "opentime",
                    value: new Date(),
                    format: 'Y-m-d H:i:s',
                    allowBlank: false
                }), {
                    xtype: 'radiogroup',
                    items: [{boxLabel: "显示", name: 'display', inputValue: 1, checked: true}, {
                        boxLabel: "不显示",
                        name: 'display',
                        inputValue: 0
                    }],
                    fieldLabel: "是否显示",
                    name: "display"
                }, {
                    xtype: 'radiogroup',
                    items: [{boxLabel: "显示", name: 'newServer', inputValue: 2}, {
                        boxLabel: "不显示",
                        name: 'newServer',
                        inputValue: 0,
                        checked: true
                    }],
                    fieldLabel: "最新开服设置",
                    name: "newServer"
                }, {
                    xtype: 'radiogroup',
                    items: [{boxLabel: "显示", name: 'noticeSetting', inputValue: 4, checked: true}, {
                        boxLabel: "不显示",
                        name: 'noticeSetting',
                        inputValue: 0
                    }],
                    fieldLabel: "开服预告设置",
                    name: "noticeSetting"
                },
                    Ext.create("Ext.ux.form.MoUploader", {
                        fieldLabel: '游戏图片',
                        name: "picture",
                        allowBlank: false
                    }), {
                        id: "recharge_platField",
                        xtype: "hiddenfield",
                        name: "recharge_plat",//无效值，兼容？
                        value: "0"
                    }],
                listeners: {
                    beforeaction: function (_this, action, eOpts) {

                        var params = _this.getValues();
                        params.state = params.display | params.newServer | params.noticeSetting;

                        Ext.data.JsonP.request({
                            params: params, // values from form fields..
                            url: Ext.getCmp("dataForm").url,
                            callbackKey: 'function',
                            scope: 'this',
                            success: function (res) {
                                console.log(res);
                                if (res && res.status == 1) {
                                    top.Ext.MessageBox.alert("提示", Ext.getCmp("dataForm").operate + "成功");
                                    gameStore.reload();
                                    addDataWindow.hide();
                                    return;
                                }
                                top.Ext.MessageBox.alert("提示", Ext.getCmp("dataForm").operate + "失败");
                                Ext.getCmp("addSubmitBtn").enable();
                            },
                            failure: function (response) {
                                top.Ext.MessageBox.alert("提示", Ext.getCmp("dataForm").operate + "失败");
                                Ext.getCmp("addSubmitBtn").enable();
                            }
                        });
                        return false;
                    }
                },
                buttons: [{
                    text: '确定',
                    id: "addSubmitBtn",
                    handler: function (v) {
                        var form = v.up("form").getForm();
                        if (form.isValid()) {
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

function addGame() {
    addDataWindow.setTitle("添加游戏");
    Ext.getCmp("dataForm").getForm().reset();
    Ext.getCmp("dataForm").url = URLS.GAME_INFO.ADD_GAME;
    Ext.getCmp("dataForm").operate = "添加";
    Ext.getCmp("gidField").setReadOnly(false);
    addDataWindow.show();
}
function updateGame(data) {
    data.display = {display: (data.state & 1)};
    data.newServer = {newServer: (data.state & 2)};
    data.noticeSetting = {noticeSetting: (data.state & 4)};
    data.catids = {catids: data.catids.split(",")};
    Ext.getCmp("gidField").setReadOnly(true);
    addDataWindow.setTitle("修改游戏");
    Ext.getCmp("dataForm").operate = "修改";
    Ext.getCmp("dataForm").getForm().reset();
    Ext.getCmp("dataForm").url = URLS.GAME_INFO.UPDATE_GAME;
    Ext.getCmp("dataForm").getForm().setValues(data);
    addDataWindow.show();
}

function deleteGame(gid) {
    Ext.MessageBox.confirm("删除确认", "是否要删除游戏区：", function (res) {
        if (res == "yes") {
            Ext.data.JsonP.request({
                url: URLS.GAME_INFO.DELETE_SERVER,
                params: {
                    gid: gid
                },
                callbackKey: 'function',
                // scope: 'this',
                success: function (res) {
                    if (res && res.status == 1) {
                        Ext.MessageBox.alert("提示", "删除成功");
                        serverStore.reload();
                        return;
                    }
                    Ext.MessageBox.alert("提示", "删除失败");
                },
                failure: function (response) {
                    Ext.MessageBox.alert("提示", "删除失败");
                }
            });
        }
    });
}

