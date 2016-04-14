/**
 * Created by 李朝(Li.Zhao) on 2016/4/12.
 */
// 全局用户密码保存变量

Ext.Loader.setConfig({
    enabled: true
});
Ext.Loader.setPath('Ext.ux', 'js/extjs/ux');

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
        url: gamelist_url,
        extraParams: "game_identifer",
        callbackKey: "function",
        reader: {
            type: 'json',
            root: 'data'
        }
    }
});

// 权限列表存储块
var permissionListStore = Ext
    .create(
        "Ext.data.Store",
        {
            // autoLoad: true,
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


Ext.onReady(function () {

    var applyOrdersGrid = new Ext.grid.Panel(
        {
            layout: "fit",
            //title : parent.getTitle(jq("#requesturlId").val()),
            //iconCls : parent.getIcoCls(jq("#requesturlId").val()),
            multiSelect: true,// 支持多选
            selType: 'rowmodel',// 设置为单元格选择模式Ext.selection.RowModel
            id: "authGridId",
            store: permissionListStore,

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
                    + '<a style="text-decoration:none;margin-right:5px;" href="javascript:deletePermission(\'{id}\');"><img src="js/extjs/resources/icons/delete.png"  title="删除" alt="删除" class="actionColumnImg" />&nbsp;</a>'
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
                                permissionListStore.load();
                            },
                            afterrender: function (_this, eOpts) {
                                var data = gameStore.getAt(0);
                                (function sleepFn() {
                                    setTimeout(function () {
                                        data = gameStore.getAt(0);
                                        if (!data) {
                                            sleepFn();
                                        } else {
                                            //默认加载第一个游戏的权限
                                            _this.setValue(data.get("gid"));
                                        }
                                    }, 100);
                                })();
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
    var viewport = new Ext.Viewport({
        layout: "fit",
        items: [applyOrdersGrid],
        renderTo: Ext.getBody()
    });


    // var addDataWindow = new Ext.Window({
    //     title : "添加权限",
    //     width : 300,
    //     height : 200,
    //     resizable : false,
    //     modal : true,
    //     autoShow : true,
    //     layout : 'fit',
    //     items : new Ext.form.Panel({
    //         fieldDefaults : {
    //             labelAlign : 'right',
    //             labelWidth : 60,
    //             anchor : '99%'
    //         },
    //         frame : false,
    //         bodyStyle : 'padding:10 10',
    //         items : [{
    //             html : headInfo,
    //             border : 0,
    //             bodyStyle : 'padding:0 0 20 0'
    //         }, {
    //             xtype : "textfield",
    //             fieldLabel : oldFieldLabel,
    //             value : name,
    //             disabled : true,
    //             labelWidth : 50
    //         }, {
    //             xtype : 'combobox',
    //             fieldLabel : newFieldLabel,
    //             labelWidth : 50,
    //             displayField : displayField,
    //             valueField : valueField,
    //             editable : false,
    //             emptyText : '--请选择--',
    //             store : store,
    //             queryMode : 'local',
    //             allowBlank : false,
    //             listeners : {
    //                 beforerender : function() {
    //                     if (this.store.count() == 0) {
    //                         this.emptyText = '没有可选择的数据';
    //                     }
    //                 }
    //             }
    //         }]
    //     }),
    //     buttons : [{
    //         text : '确定',
    //         listeners : {
    //             click : function(v) {
    //                 var window = v.up().up();
    //                 var panel = window.items.first();
    //                 var combobox = panel.items.last();
    //                 if (combobox.isValid()) {
    //                     CKGobal.ajax({
    //                         url : url,
    //                         method : 'post',
    //                         async : false,
    //                         params : {
    //                             'cloudContext.params.id' : id,
    //                             'cloudContext.params.replaceId' : combobox
    //                                 .getValue()
    //                         },
    //                         autoMsgTip : false,
    //                         success : function(response, options, resultJSON,
    //                                            havaMsgFlag) {
    //                             if (resultJSON.cloudContext.msgList.length == 0) {
    //                                 Ext.MessageBox.alert('提示', "操作成功");
    //                                 // 刷新列表
    //                                 data.store.load();
    //                                 window.close();
    //                                 return;
    //                             }
    //                             for (var index in resultJSON.cloudContext.msgList) {
    //                                 Ext.MessageBox
    //                                     .alert(
    //                                         '提示',
    //                                         resultJSON.cloudContext.msgList[index]);
    //                             }
    //                             panel.getForm().reset();
    //                         }
    //                     });
    //                 }
    //             }
    //         }
    //     }, {
    //         text : '取消',
    //         listeners : {
    //             click : function(v) {
    //                 v.up().up().close();
    //             }
    //         }
    //     }]
    // });

    var addDataWindow = new Ext.Window({
        title: "添加权限",
        width: 300,
        height: 200,
        resizable: false,
        modal: true,
        autoShow: false,
        layout: 'fit',
        items: [new Ext.form.Panel({
            fieldDefaults : {
                labelAlign : 'right',
                labelWidth : 60,
                anchor : '99%'
            },
            frame : false,
            bodyStyle : 'padding:10 10',
            items:[],
        buttons: [{
            text: '确定',
            formBind: true,
            handler: function (v) {
                alert("submit");
            }
        }, {
            text: '取消',
            handler: function (v) {
                v.up().up().hide();
            }
        }]
            }
        )],
    });

    function addPermission() {
        addDataWindow.show();
    }
});


function deletePermission(id) {
    Ext.MessageBox.confirm("删除确认", "是否要删除权限：", function (res) {
        if (res == "yes") {
            alert(res);
        }
    });
}




