/**
 * Created by 李朝(Li.Zhao) on 2016/4/12.
 */
Ext.require(['Ext.grid.*', 'Ext.data.*', 'Ext.ux.RowExpander',
    'Ext.selection.CheckboxModel']);

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
    },
    listeners: {
        load: function (_this, records, successful, eOpts) {
            _this.add({gid: PLATFORM_IDENTIFIER, gname: "官网管理平台"});
        }
    }
});

// 权限列表存储块
var permissionListStore = Ext
    .create(
        "Ext.data.Store",
        {
            autoLoad: true,
            fields: ["id", "name", "cname"],
            proxy: {
                type: "jsonp",
                url: URLS.USER.PERMISSION_LIST,
                callbackKey: "function",
                reader: {
                    type: 'json',
                    root: 'data'
                }
            }
        });

Ext.onReady(function () {

    var permissionGrid = new Ext.grid.Panel(
        {
            renderTo: Ext.getBody(),
            multiSelect: true,// 支持多选
            selType: 'rowmodel',// 设置为单元格选择模式Ext.selection.RowModel
            id: "authGridId",
            store: permissionListStore,
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
                    text: "名称",
                    width: 200,
                    dataIndex: "name"
                },
                {
                    text: "中文名称",
                    width: 150,

                    dataIndex: "cname"
                },
                {
                    header: "操作",
                    width: 150,
                    align: 'center',
                    xtype: 'templatecolumn',
                    tpl: '<tpl>'
                    + '<a style="text-decoration:none;margin-right:5px;" href="javascript:updatePermission(\'{id}\',\'{name}\',\'{cname}\');"><img src="js/extjs/resources/icons/pencil.png"  title="修改" alt="修改" class="actionColumnImg" />&nbsp;</a>'
                        //+ '<a style="text-decoration:none;margin-right:5px;" href="javascript:deletePermission(\'{id}\');"><img src="js/extjs/resources/icons/delete.png"  title="删除" alt="删除" class="actionColumnImg" />&nbsp;</a>'
                    + '</tpl>'
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
                                permissionListStore.getProxy().extraParams = {"gid": records[0].get('gid')};//游戏改变的时候重新加载权限数据
                                permissionListStore.load();
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
                        text: "添加权限",
                        icon: "js/extjs/resources/icons/add.png",
                        handler: function () {
                            addPermission();
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
    title: "添加权限",
    width: 300,
    height: 200,
    resizable: false,
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
                id: "permissionForm",
                fieldDefurlaults: {
                    labelAlign: 'right',
                    labelWidth: 60,
                    anchor: '100%'
                },
                frame: false,
                bodyStyle: 'padding:10 10',
                items: [
                    {
                        id: "nameField",
                        xtype: "textfield",
                        fieldLabel: "权限名称（key）",
                        name: "name",
                        allowBlank: false
                    }, {
                        id: "cnameField",
                        xtype: "textfield",
                        fieldLabel: "权限中文名",
                        name: "cname",
                        allowBlank: false
                    }, {
                        id: "idField",
                        xtype: "hiddenfield",
                        name: "id"
                    }, {
                        id: "gameIdentiferField",
                        xtype: "hiddenfield",
                        name: "gid"
                    }],
                listeners: {
                    beforeaction: function (_this, action, eOpts) {
                        Ext.getCmp("gameIdentiferField").setValue(Ext.getCmp("gameCombo").getValue());
                        Ext.data.JsonP.request({
                            params: _this.getValues(), // values from form fields..
                            url: Ext.getCmp("permissionForm").url,
                            callbackKey: 'function',
                            scope: 'this',
                            success: function (res) {
                                console.log(res);
                                if (res && res.status == 1) {
                                    Ext.MessageBox.alert("提示", Ext.getCmp("permissionForm").operate + "成功");
                                    permissionListStore.reload();
                                    addDataWindow.hide();
                                    return;
                                }
                                Ext.MessageBox.alert("提示", Ext.getCmp("permissionForm").operate + "失败");
                            },
                            failure: function (response) {
                                Ext.MessageBox.alert("提示", Ext.getCmp("permissionForm").operate + "失败");
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
function addPermission() {
    addDataWindow.setTitle("添加权限");
    Ext.getCmp("permissionForm").getForm().reset();
    Ext.getCmp("permissionForm").url = URLS.USER.ADD_PERMISSION;
    Ext.getCmp("permissionForm").operate = "添加";
    addDataWindow.show();
}
function updatePermission(id, name, cname) {
    addDataWindow.setTitle("修改权限");
    Ext.getCmp("permissionForm").operate = "修改";
    Ext.getCmp("permissionForm").getForm().reset();
    Ext.getCmp("permissionForm").url = URLS.USER.UPDATE_PERMISSION;
    Ext.getCmp("permissionForm").getForm().setValues({id: id, name: name, cname: cname});
    addDataWindow.show();
}

function deletePermission(id) {
    Ext.MessageBox.confirm("删除确认", "是否要删除权限：", function (res) {
        if (res == "yes") {
            alert(res);
        }
    });
}

