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
    fields: ['gname', 'gid', 'gurl', 'gtag', 'opentime', 'addtime','picture','catids','sequence','state','recharge_plat','serverurl'],
    pageSize: 20,
    proxy: {
        type: "jsonp",
        url: URLS.GAME_INFO.GAME_PAGE_LIST,
        callbackKey: "function",
        pageParam: "pagenum",
        limitParam: "pageize",
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
            var data=res.data;
            if(!data || data.constructor != Array){
                return;
            }
            for(var i=0;i<data.length;i++){
                gameCatItems.push({boxLabel: data[i].name, name:'catids',inputValue:data[i].id});
            }
            return;
        }
        Ext.MessageBox.alert("提示", "读取游戏分类失败");
    },
    failure: function (response) {
        Ext.MessageBox.alert("提示", "读取游戏分类失败");
    }
});

var gameCatStore = Ext.create('Ext.data.Store', {
    autoLoad: true,
    fields: ['id', 'name', 'sequence', 'state', 'cuser', 'uuser', 'cdate', 'udate'],
    proxy: {
        type: "jsonp",
        url: URLS.GAME_INFO.GAME_CAT_LIST,
        callbackKey: "function",
        reader: {
            type: 'json',
            root: 'data'
        }
    },
    listeners: {
        load: function (_this, records, successful, eOpts) {
            gameCatStore.add({id: '', name: '全部', sequence: '-1'});
        }
    }
});
gameCatStore.sort('sequence', 'ASC');

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
                    width: 200,
                    dataIndex: "picture",
                    renderer:function(v){
                        return "<img src='"+v+" style='height:100px;'/>";
                    }
                },
                {
                    text: "游戏ID",
                    width: 200,
                    dataIndex: "gid"
                },
                {
                    text: "游戏名称",
                    width: 150,
                    dataIndex: "gname"
                },
                {
                    text: "登陆地址",
                    width: 150,
                    dataIndex: "gurl"
                },
                {
                    text: "游戏标识",
                    width: 150,
                    dataIndex: "gtag"
                }
                //,
                //{
                //    header: "操作",
                //    width: 150,
                //    align: 'center',
                //    xtype: 'templatecolumn',
                //    tpl: '<tpl>'
                //    + '<a style="text-decoration:none;margin-right:5px;" href="javascript:deleteGame(\'{gid}\');"><img src="js/extjs/resources/icons/delete.png"  title="删除" alt="删除" class="actionColumnImg" />&nbsp;</a>'
                //    + '</tpl>'
                //}

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
            },{
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
                    items:[{
                        xtype: 'combobox',
                        fieldLabel: '游戏分类',
                        displayField: 'name',
                        valueField: 'id',
                        store: gameCatStore,
                        editable:false,
                        name:'catid',
                        value:''
                    }, {
                        xtype: 'textfield',
                        fieldLabel: '游戏名称',
                        name:'gname'
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
                                    submitEmptyText:false
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
                width:'100%',
                bodyStyle: 'padding:10 10',
                items: [
                    {
                        id: "gidField",
                        xtype: "textfield",
                        fieldLabel: "游戏分类",
                        name: "gid",
                        allowBlank: false
                    },{
                        xtype: 'checkboxgroup',
                        fieldLabel: '游戏分类',
                        height:150,
                        autoScroll : true,
                        items:[],
                        layout: {
                            type: 'vbox',
                            align: 'left'
                        },
                        listeners:{
                            afterrender:function(_this){
                                _this.add(gameCatItems);
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
                        id: "stateField",
                        xtype: 'radiogroup',
                        items: [{boxLabel: "关服",name:'state', inputValue: 0}, {boxLabel: "开服",name:'state', inputValue: 1,checked:true}],
                        fieldLabel: "状态",
                        name: "state"
                    },
                    Ext.create("Ext.ux.form.MoUploader",{
                        fieldLabel:'游戏图片',
                        name:"picture"
                    }), {
                        id: "recharge_platField",
                        xtype: "hiddenfield",
                        name: "recharge_plat",//无效值，兼容？
                        value: "0"
                    }],
                listeners: {
                    beforeaction: function (_this, action, eOpts) {
                        Ext.data.JsonP.request({
                            params: _this.getValues(), // values from form fields..
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

function addGame() {
    addDataWindow.setTitle("添加游戏");
    Ext.getCmp("dataForm").getForm().reset();
    Ext.getCmp("dataForm").url = URLS.GAME_INFO.ADD_GAME;
    Ext.getCmp("dataForm").operate = "添加";
    addDataWindow.show();
}
function updateGame(gid, gname, gurl, recharge_ratio, login_token) {
    addDataWindow.setTitle("修改游戏");
    Ext.getCmp("dataForm").operate = "修改";
    Ext.getCmp("dataForm").getForm().reset();
    Ext.getCmp("dataForm").url = URLS.GAME_INFO.UPDATE_GAME;
    Ext.getCmp("dataForm").getForm().setValues({
        gid: gid,
        gname: gname,
        gurl: gurl,
        recharge_ratio: recharge_ratio,
        login_token: login_token
    });
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

