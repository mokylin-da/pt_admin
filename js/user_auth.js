/**
 * Created by 李朝(Li.Zhao) on 2016/4/14.
 */
Ext.require(['Ext.grid.*']);

var userStore = Ext.create('Ext.data.Store', {
    fields: ['uid', 'nickname', 'email', 'cDate', 'emailVerifyed', 'status'],
    proxy: {
        type: "jsonp",
        url: URLS.USER.QUERY_USER,
        callbackKey: "function",
        reader: {
            type: 'json',
            root: 'data'
        }
    }
});
Ext.onReady(function () {


    var userGrid = new Ext.grid.Panel(
        {
            multiSelect: true,// 支持多选
            // selType: 'rowmodel',// 设置为单元格选择模式Ext.selection.RowModel
            id: "authGridId",
            store: userStore,
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
                    text: "uid",
                    width: 200,
                    dataIndex: "uid"
                },
                {
                    text: "昵称",
                    width: 150,
                    dataIndex: "nickname"
                },
                {
                    text: "email",
                    width: 150,
                    dataIndex: "email"
                }, {
                    header: "操作",
                    width: 150,
                    align: 'center',
                    xtype: 'templatecolumn',
                    tpl: '<tpl>'
                    + '<a style="text-decoration:none;margin-right:5px;" href="javascript:updateAuth(\'{uid}\');"><img src="js/extjs/resources/icons/lock_edit.png"  title="授权" alt="授权" class="actionColumnImg" />&nbsp;</a>'
                    + '</tpl>'
                }

            ],
            dockedItems: [{
                xtype: "toolbar",
                items: [
                    {
                        xtype: 'form',
                        id: "dataForm",
                        fieldDefaults: {
                            labelAlign: 'left',
                            labelWidth: 100,
                            anchor: '150%'
                        },
                        frame: false,
                        border: false,
                        bodyStyle: 'padding:10 10',
                        layout: 'hbox',
                        items: [
                            {
                                id: "uidField",
                                xtype: 'textfield',
                                fieldLabel: 'uid',
                                name: 'uid',
                                inputAttrTpl: [
                                    "autocomplete=\"on\""
                                ],
                                emptyText: "请输入uid"
                            }, {
                                id: "nicknameField",
                                xtype: 'textfield',
                                fieldLabel: '昵称',
                                name: 'nickname',
                                inputAttrTpl: [
                                    "autocomplete=\"on\""
                                ],
                                emptyText: "请输入昵称"
                            }
                        ],
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
                                userStore.getProxy().extraParams = action.getParams();
                                userStore.reload();
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
        items: [userGrid],
        renderTo: Ext.getBody()
    });


});
// 权限列表存储块
var permissionListStore = Ext
    .create(
        "Ext.data.Store",
        {
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
var gameStore = Ext.create('Ext.data.Store', {
    autoLoad: false,
    fields: ['gname', 'gid'],
    proxy: {
        type: "jsonp",
        url: URLS.GAME_INFO.GAME_LIST,
        callbackKey: "function",
        reader: {
            type: 'json',
            root: 'data',
            successProperty: "status"
        }
    },
    listeners: {
        load: function (_this, records, successful, eOpts) {
        }
    }
});
gameStore.add({gid: PLATFORM_IDENTIFIER, gname: "官网管理平台"});
var userAuthWindow = new Ext.Window({
    id: "authWindowId",
    title: "用户授权",
    width: 500,
    height: 500,
    resizable: true,
    modal: true,
    autoShow: false,
    closable: false,
    layout: 'fit',
    items: [new Ext.grid.Panel(
        {
            layout: "fit",
            renderTo: Ext.getBody(),
            multiSelect: true,// 支持多选
            selType: 'checkboxmodel',// 设置为单元格选择模式Ext.selection.RowModel
            id: "permissionGridId",
            store: permissionListStore,
            loadMask: {
                msg: "正在加载数据,请稍等..."
            },
            columns: [
                {
                    text: "名称",
                    width: 200,
                    dataIndex: "name"
                },
                {
                    text: "中文名称",
                    width: 150,
                    dataIndex: "cname"
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
                                permissionListStore.load(function () {
                                    loadUserPermission(records[0].get('gid'));
                                });
                            },
                            afterrender: function (_this, eOpts) {
                                //Ext.getCmp("gameCombo").setValue(PLATFORM_IDENTIFIER);
                                //permissionListStore.getProxy().extraParams = {"gid": PLATFORM_IDENTIFIER};//游戏改变的时候重新加载权限数据
                                //permissionListStore.load(function(){
                                //    loadUserPermission(PLATFORM_IDENTIFIER);
                                //});
                            }
                        }
                    }]
            }],
            buttons: [{
                text: '确定',
                id: "addSubmitBtn",
                handler: function (v) {
                    v.disable();
                    var selModel = v.up("grid").getSelectionModel();
                    var selArr = selModel.getSelection();
                    var pms_ids = [];
                    if (selArr && selArr.length > 0) {
                        for (var i = 0; i < selArr.length; i++) {
                            pms_ids.push(selArr[i].get("id"));
                        }
                    }
                    Ext.data.JsonP.request({
                        url: URLS.USER.SET_USER_AUTH,
                        params: {
                            gid: Ext.getCmp("gameCombo").getValue(),
                            uid: userAuthWindow.uid,
                            pms_ids: pms_ids
                        },
                        callbackKey: 'function',
                        success: function (res) {
                            if (res && res.status == 1) {
                                Ext.MessageBox.alert("提示", "操作成功");
                                permissionListStore.reload();
                                Ext.getCmp("authWindowId").hide();
                            } else {
                                Ext.MessageBox.alert("提示", "操作失败");
                            }
                        },
                        failure: function (response) {
                            Ext.MessageBox.alert("提示", "操作失败");
                        }
                    });
                }
            }, {
                text: '取消',
                handler: function (v) {
                    Ext.getCmp("authWindowId").hide();
                }
            }]
        })]
});

function contains(arr, val) {
    for (var i = 0; i < arr.length; i++) {
        if (arr[i] == val)return true;
    }
    return false;
}

function loadUserPermission(gid) {
    Ext.data.JsonP.request({
        url: URLS.USER.USER_PERMISSION,
        params: {
            gid: gid,
            uid: userAuthWindow.uid
        },
        callbackKey: 'function',
        // scope: 'this',
        success: function (res) {
            if (res && res.status == 1) {
                var selectedData = res.data;
                if (!selectedData) {
                    return;
                }
                var datas = permissionListStore.getRange();
                var indexArr = [];
                for (var i = 0; i < datas.length; i++) {
                    if (contains(selectedData, datas[i].get("name"))) {
                        indexArr.push(datas[i]);
                    }
                }
                var selModel = Ext.getCmp("permissionGridId").getSelectionModel();
                selModel.select(indexArr);

            } else {
                Ext.MessageBox.alert("提示", "获取权限数据失败");
            }
        },
        failure: function (response) {
            Ext.MessageBox.alert("提示", "获取权限数据失败");
        }
    });
}

function updateAuth(uid) {
    userAuthWindow.uid = uid;
    Ext.getCmp("authWindowId").show();
    Ext.getCmp("addSubmitBtn").enable();
    Ext.getCmp("permissionGridId").getSelectionModel().deselectAll();
    loadUserPermission(Ext.getCmp("gameCombo").getValue());
}