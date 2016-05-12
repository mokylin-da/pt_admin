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
    fields: ['gname', 'gid','gurl','gtag','opentime','addtime'],
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

Ext.onReady(function () {

    var gameGrid = new Ext.grid.Panel(
        {
            multiSelect: true,// 支持多选
            selType: 'rowmodel',// 设置为单元格选择模式Ext.selection.RowModel
            id: "authGridId",
            store: gameStore,
            viewConfig:{
                stripeRows:true,//在表格中显示斑马线
                enableTextSelection:true //可以复制单元格文字
            },
            loadMask: {
                msg: "正在加载数据,请稍等..."
            },
            columns: [
                Ext.create("Ext.grid.RowNumberer"),
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
            dockedItems: [{
                xtype: "toolbar",
                items: [{
                        text: "添加游戏",
                        icon: "js/extjs/resources/icons/add.png",
                        handler: function () {
                            addGame();
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
    height: 350,
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
                bodyStyle: 'padding:10 10',
                items: [
                    {
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
                        xtype: 'combo',
                        triggerAction: 'all',
                        forceSelection: true,
                        editable: false,
                        displayField: 'name',
                        valueField: 'value',
                        emptyText: "--请选择--",
                        store: new Ext.data.Store({
                            fields:["name","value"],
                            data:[{name:"关服",value:0},{name:"开服",value:1}]
                        }),
                        fieldLabel: "状态",
                        name: "state",
                        value:1,
                        allowBlank: false
                    },{
                        id:"recharge_platField",
                        xtype:"hiddenfield",
                        name:"recharge_plat",
                        value:"0"
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
                                if (res && res.status==1) {
                                    top.Ext.MessageBox.alert("提示", Ext.getCmp("dataForm").operate + "成功");
                                    gameStore.reload();
                                    addDataWindow.hide();
                                    return;
                                }
                                top.Ext.MessageBox.alert("提示",Ext.getCmp("dataForm").operate + "失败");
                            },
                            failure: function (response) {
                                top.Ext.MessageBox.alert("提示",Ext.getCmp("dataForm").operate + "失败");
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
function updateGame(gid, gname, gurl,recharge_ratio,login_token) {
    addDataWindow.setTitle("修改游戏");
    Ext.getCmp("dataForm").operate = "修改";
    Ext.getCmp("dataForm").getForm().reset();
    Ext.getCmp("dataForm").url = URLS.GAME_INFO.UPDATE_GAME;
    Ext.getCmp("gidField").setValue(gid);
    Ext.getCmp("gname").setValue(gname);
    Ext.getCmp("gurl").setValue(gurl);
    Ext.getCmp("recharge_ratio").setValue(recharge_ratio);
    Ext.getCmp("login_token").setValue(login_token);
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
                    if (res && res.status==1) {
                        Ext.MessageBox.alert("提示", "删除成功");
                        serverStore.reload();
                        return;
                    }
                    Ext.MessageBox.alert("提示","删除失败");
                },
                failure: function (response) {
                    Ext.MessageBox.alert("提示", "删除失败");
                }
            });
        }
    });
}

