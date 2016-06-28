/**
 * Created by 李朝(Li.Zhao) on 2016/4/15.
 */

Ext.require(['Ext.grid.*', 'Ext.data.*', 'Ext.selection.CheckboxModel','Ext.ux.form.DateTimeField']);

/**
 *权限管理
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
var serverStore = Ext
    .create(
        "Ext.data.Store",
        {
            fields: ["gid", "sid", "sname", 'surl','opentime','addtime'],
            proxy: {
                type: "jsonp",
                url: URLS.GAME_INFO.SERVER_LIST,
                callbackKey: "function",
                reader: {
                    type: 'json',
                    root: 'data'
                }
            }
        });

Ext.onReady(function () {

    var serverGrid = new Ext.grid.Panel(
        {
            multiSelect: true,// 支持多选
            selType: 'rowmodel',// 设置为单元格选择模式Ext.selection.RowModel
            id: "authGridId",
            store: serverStore,
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
                    text: "游戏区ID",
                    width: 200,
                    dataIndex: "sid"
                },
                {
                    text: "游戏区名称",
                    width: 150,
                    dataIndex: "sname"
                },
                {
                    text: "登陆接口",
                    width: 150,
                    dataIndex: "surl"
                },
                {
                    text: "开服时间",
                    width: 150,
                    dataIndex: "opentime"
                },
                {
                    text: "添加时间",
                    width: 150,
                    dataIndex: "addtime"
                },
                //{
                //    header: "操作",
                //    width: 150,
                //    align: 'center',
                //    xtype: 'templatecolumn',
                //    tpl: '<tpl>'
                //    + '<a style="text-decoration:none;margin-right:5px;" href="javascript:updateServer(\'{gid}\',\'{sid}\');"><img src="js/extjs/resources/icons/pencil.png"  title="修改" alt="修改" class="actionColumnImg" />&nbsp;</a>'
                //    + '<a style="text-decoration:none;margin-right:5px;" href="javascript:deleteServer(\'{gid}\',\'{sid}\');"><img src="js/extjs/resources/icons/delete.png"  title="删除" alt="删除" class="actionColumnImg" />&nbsp;</a>'
                //    + '</tpl>'
                //},
                {
                    header: "操作",
                    width: 150,
                    dataIndex: "sequence",
                    renderer:function(val,metaData,record,rowIndex,store,view){
                        var value = record.raw;
                        value.opentime = value.opentime.replace(/\..*$/,"");
                        var records = JSON.stringify(value).replace(/"/g,'\"');
                        return    '<a style="text-decoration:none;margin-right:5px;" href=\'javascript:updateServer('+records+');\'><img src="js/extjs/resources/icons/pencil.png"  title="修改" alt="修改" class="actionColumnImg" />&nbsp;</a>'
                            + '<a style="text-decoration:none;margin-right:5px;" href="javascript:deleteServer(\''+value.gid+'\',\''+value.sid+'\');"><img src="js/extjs/resources/icons/delete.png"  title="删除" alt="删除" class="actionColumnImg" />&nbsp;</a>';
                    }
                }

            ],
            dockedItems: [{
                xtype: "toolbar",
                items: [
                    {
                        id: "gameCombo",
                        xtype: 'combo',
                        triggerAction: 'all',
                        forceSelection: true,
                        editable: true,
                        fieldLabel: '游戏名称',
                        name: 'gid',
                        displayField: 'gname',
                        valueField: 'gid',
                        queryMode: 'local',
                        emptyText: "输入游戏名称",
                        typeAhead: false,
                        store: gameStore,
                        listeners: {
                            select: function (_this, records, eOpts) {
                                serverStore.getProxy().extraParams = {"gid": records[0].get('gid')};//游戏改变的时候重新加载权限数据
                                serverStore.load();
                                Ext.getCmp("addServerBtn").enable();
                            },
                            afterrender: function (_this, eOpts) {
                                //var data = gameStore.getAt(0);
                                ////防止组件加载完后store还未接收到数据的情况，100ms获取一次
                                //(function sleepFn() {
                                //    setTimeout(function () {
                                //        data = gameStore.getAt(0);
                                //        if (!data) {
                                //            sleepFn();
                                //        } else {
                                //            var gid = data.get("gid");
                                //            //默认加载第一个游戏的权限列表
                                //            _this.setValue(gid);
                                //        }
                                //    }, 100);
                                //})();
                            }
                        }
                    },
                    "-",
                    {
                        text: "添加区服",
                        id:'addServerBtn',
                        disabled:true,
                        icon: "js/extjs/resources/icons/add.png",
                        handler: function () {
                            addServer();
                        }
                    }]
            }]

        });

    /**
      * 布局
      */
    new Ext.Viewport({
         layout: "fit",
         items: [serverGrid],
         renderTo: Ext.getBody()
    });


});
var addDataWindow = new Ext.Window({
    title: "添加区服",
    width: 300,
    height: 300,
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
                id: "serverForm",
                fieldDefurlaults: {
                    labelAlign: 'right',
                    labelWidth: 60,
                    anchor: '100%'
                },
                frame: false,
                bodyStyle: 'padding:10 10',
                items: [
                    {
                        id: "sidField",
                        xtype: "textfield",
                        fieldLabel: "区服ID",
                        name: "sid",
                        allowBlank: false
                    }, {
                        id: "snameField",
                        xtype: "textfield",
                        fieldLabel: "区服名称",
                        name: "sname",
                        allowBlank: false
                    }, {
                        id: "surlField",
                        xtype: "textfield",
                        fieldLabel: "登陆接口",
                        name: "surl",
                        allowBlank: false
                    }, {
                        id: "api_getplayerid_linkField",
                        xtype: "textfield",
                        fieldLabel: "用户查询接口",
                        name: "api_getplayerid_link",
                        allowBlank: false
                    }, {
                        id: "recharge_urlField",
                        xtype: "textfield",
                        fieldLabel: "充值接口",
                        name: "recharge_url",
                        allowBlank: false
                    }, Ext.create("Ext.ux.form.DateTimeField",{
                        id: "opentimeField",
                        xtype: "datetimefield",
                        fieldLabel: "区服开服时间",
                        name: "opentime",
                        value: new Date(),
                        format: 'Y-m-d H:i:s',
                        allowBlank: false
                    }),{
                        id: "gidField",
                        xtype: "hiddenfield",
                        name: "gid"
                    }],
                listeners: {
                    beforeaction: function (_this, action, eOpts) {
                        Ext.getCmp("gidField").setValue(Ext.getCmp("gameCombo").getValue());
                        Ext.data.JsonP.request({
                            params: _this.getValues(), // values from form fields..
                            url: Ext.getCmp("serverForm").url,
                            callbackKey: 'function',
                            scope: 'this',
                            success: function (res) {
                                console.log(res);
                                if (res && res.status==1) {
                                    top.Ext.MessageBox.alert("提示", Ext.getCmp("serverForm").operate + "成功");
                                    serverStore.reload();
                                    addDataWindow.hide();
                                    return;
                                }
                                top.Ext.MessageBox.alert("提示",Ext.getCmp("serverForm").operate + "失败");
                            },
                            failure: function (response) {
                                top.Ext.MessageBox.alert("提示",Ext.getCmp("serverForm").operate + "失败");
                            }
                        });
                        return false;
                    }
                },
                buttons: [{
                    text: '确定',
                    id: "addSubmitBtn",
                    handler: function (v) {
                        var form=v.up("form");
                        if(form.form.isValid()){
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
function addServer() {
    addDataWindow.setTitle("添加区服");
    Ext.getCmp("serverForm").getForm().reset();
    Ext.getCmp("serverForm").url = URLS.GAME_INFO.ADD_SERVER;
    Ext.getCmp("serverForm").operate = "添加";
    Ext.getCmp("sidField").setReadOnly(false);
    addDataWindow.show();
}
function updateServer(data) {
    addDataWindow.setTitle("修改区服");
    Ext.getCmp("serverForm").operate = "修改";
    Ext.getCmp("serverForm").getForm().reset();
    Ext.getCmp("serverForm").url = URLS.GAME_INFO.UPDATE_SERVER;
    Ext.getCmp("serverForm").getForm().setValues(data);
    Ext.getCmp("sidField").setReadOnly(true);
    addDataWindow.show();
}

function deleteServer(gid, sid) {
    Ext.MessageBox.confirm("删除确认", "是否要删除游戏区：", function (res) {
        if (res == "yes") {
            Ext.data.JsonP.request({
                url: URLS.GAME_INFO.DELETE_SERVER,
                params: {
                    gid: gid,
                    sid: sid
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

