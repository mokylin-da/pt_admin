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


var gameCatStore = Ext.create('Ext.data.Store', {
    autoLoad: true,
    fields: ['id', 'gid', 'name', 'sequence', 'state', 'cuser', 'uuser', 'cdate', 'udate'],
    proxy: {
        type: "jsonp",
        url: URLS.GAME_INFO.GAME_CAT_LIST,
        callbackKey: "function",
        reader: {
            type: 'json',
            root: 'data'
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
            store: gameCatStore,
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
                    text: "分类名称",
                    width: 100,
                    dataIndex: "name"
                },
                {
                    text: "是否显示",
                    width: 70,
                    dataIndex: "state",
                    renderer: function (v) {
                        return v == 0 ? '否' : '是';
                    }
                },
                {
                    text: "创建者",
                    width: 100,
                    dataIndex: "cuser"
                },
                {
                    text: "更新者",
                    width: 100,
                    dataIndex: "uuser"
                },
                {
                    text: "创建时间",
                    width: 150,
                    dataIndex: "cdate",
                    renderer: function (v) {
                        return new Date(v).toLocaleString()
                    }
                },
                {
                    text: "更新时间",
                    width: 150,
                    dataIndex: "udate",
                    renderer: function (v) {
                        return new Date(v).toLocaleString()
                    }
                },
                {
                    text: "序号",
                    width: 60,
                    dataIndex: "sequence"
                }
                ,
                {
                    header: "操作",
                    width: 150,
                    align: 'center',
                    xtype: 'templatecolumn',
                    tpl: '<tpl>'
                    + '<a style="text-decoration:none;margin-right:5px;" href="javascript:updateGameCat({id:\'{id}\',name:\'{name}\',state:\'{state}\',sequence:\'{sequence}\'});"><img src="js/extjs/resources/icons/pencil.png"  title="修改" alt="修改" class="actionColumnImg" />&nbsp;</a>'
                    + '<a style="text-decoration:none;margin-right:5px;" href="javascript:deleteGameCat(\'{id}\');"><img src="js/extjs/resources/icons/delete.png"  title="删除" alt="删除" class="actionColumnImg" />&nbsp;</a>'
                    + '</tpl>'
                }

            ],
            dockedItems: [{
                xtype: "toolbar",
                items: [{
                    text: "添加分类",
                    icon: "js/extjs/resources/icons/add.png",
                    handler: function () {
                        addGameCat();
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
    title: "添加游戏分类",
    width: 300,
    height: 200,
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
                fieldDefaults: {
                    labelAlign: 'right',
                    labelWidth: 100,
                    anchor: '90%'
                },
                frame: false,
                bodyStyle: 'padding:10 10',
                items: [
                    {
                        xtype: "hiddenfield",
                        name: "id"
                    }, {
                        id: "nameField",
                        xtype: "textfield",
                        fieldLabel: "名称",
                        name: "name",
                        allowBlank: false
                    }, {
                        id: "sequenceField",
                        xtype: "textfield",
                        fieldLabel: "序号",
                        name: "sequence",
                        allowBlank: false
                    }, {
                        fieldLabel: "是否显示",
                        xtype: "checkboxfield",
                        uncheckedValue: 0,
                        inputValue: 1,
                        value: 1,
                        name: "state"
                    }, {
                        id: "gidField",
                        xtype: "hiddenfield",
                        name: "gid",
                        value: PLATFORM_IDENTIFIER
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
                                    gameCatStore.reload();
                                    addDataWindow.hide();
                                    return;
                                }
                                top.Ext.MessageBox.alert("提示", Ext.getCmp("dataForm").operate + "失败");
                            },
                            failure: function (response) {
                                top.Ext.MessageBox.alert("提示", Ext.getCmp("dataForm").operate + "失败");
                            }
                        });
                        return false;
                    }
                },
                dockedItems: [{
                    xtype: 'toolbar',
                    dock: 'bottom',
                    layout: {pack: 'end'},
                    border: false,
                    items: [{
                        text: '确定',
                        formBind: true,
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
                }]
            }
        )]
});
function addGameCat() {
    addDataWindow.setTitle("添加游戏分类");
    Ext.getCmp("dataForm").getForm().reset();
    Ext.getCmp("dataForm").url = URLS.GAME_INFO.GAME_CAT_ADD;
    Ext.getCmp("dataForm").operate = "添加";
    addDataWindow.show();
}
function updateGameCat(data) {
    addDataWindow.setTitle("修改游戏分类");
    Ext.getCmp("dataForm").operate = "修改";
    Ext.getCmp("dataForm").getForm().reset();
    Ext.getCmp("dataForm").url = URLS.GAME_INFO.GAME_CAT_UPDATE;
    Ext.getCmp("dataForm").getForm().setValues(data);
    addDataWindow.show();
}

function deleteGameCat(id) {
    Ext.MessageBox.confirm("删除确认", "是否要删除游戏区：", function (res) {
        if (res == "yes") {
            Ext.data.JsonP.request({
                url: URLS.GAME_INFO.GAME_CAT_DELETE,
                params: {
                    id: id,
                    gid: PLATFORM_IDENTIFIER
                },
                callbackKey: 'function',
                // scope: 'this',
                success: function (res) {
                    if (res && res.status == 1) {
                        Ext.MessageBox.alert("提示", "删除成功");
                        gameCatStore.reload();
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

