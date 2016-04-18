/**
 * Created by 李朝(Li.Zhao) on 2016/4/14.
 */
Ext.Loader.setConfig({
    enabled: true
});
Ext.Loader.setPath('Ext.ux', 'js/extjs/ux');
Ext.require(['Ext.grid.*']);

var userStore = Ext.create('Ext.data.Store', {
    fields: ['uid', 'nickname', 'email', 'cDate', 'emailVerifyed', 'status'],
    proxy: {
        type: "jsonp",
        url: queryuser_url,
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
            layout: "fit",
            renderTo: Ext.getBody(),
            multiSelect: true,// 支持多选
            // selType: 'rowmodel',// 设置为单元格选择模式Ext.selection.RowModel
            id: "authGridId",
            store: userStore,
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
                        id: "uidField",
                        xtype: 'textfield',
                        fieldLabel: 'uid',
                        name: 'uid',
                        emptyText: "请输入uid"
                    }, {
                        id: "nicknameField",
                        xtype: 'textfield',
                        fieldLabel: '昵称',
                        name: 'nickname',
                        emptyText: "请输入昵称"
                    },
                    "-",
                    {
                        text: "搜索",
                        icon: "js/extjs/resources/icons/search.png",
                        handler: function () {
                            search();
                        }
                    }]
            }]

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
            url: permission_list_url,
            callbackKey: "function",
            reader: {
                type: 'json',
                root: 'data'
            }
        }
    });
var gameStore = Ext.create('Ext.data.Store', {
    autoLoad: true,
    fields: ['gname', 'gid'],
    proxy: {
        type: "jsonp",
        url: gamelist_url,
        callbackKey: "function",
        reader: {
            type: 'json',
            root: 'data'
        }
    }
});
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
                        editable: false,
                        fieldLabel: '游戏名称',
                        name: 'gid',
                        displayField: 'gname',
                        valueField: 'gid',
                        emptyText: "--请选择--",
                        store: gameStore,
                        listeners: {
                            change: function (_this, newValue, oldValue, eOpts) {
                                permissionListStore.getProxy().extraParams = {"game_identifer": newValue};//游戏改变的时候重新加载权限数据
                                permissionListStore.reload();
                                loadUserPermission(newValue);
                            },
                            afterrender: function (_this, eOpts) {
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
                                            Ext.getCmp("addSubmitBtn").enable();
                                        }
                                    }, 100);
                                })();
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
                        url: setuserauth_url,
                        params: {
                            game_identifer: Ext.getCmp("gameCombo").getValue(),
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
        url: userpermission_url,
        params: {
            game_identifer: gid,
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
function search() {
    var params = {};
    var uid = Ext.getCmp("uidField").getValue();
    if (uid) {
        params.uid = uid;
    }
    var nickname = Ext.getCmp("nicknameField").getValue();
    if (nickname) {
        params.nickname = nickname;
    }
    if (params.uid || params.nickname) {
        userStore.getProxy().extraParams = params;
        userStore.reload();
    }
}