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


var dataStore = Ext.create('Ext.data.Store', {
    autoLoad: true,
    fields: ['id', 'gid', 'name', 'cname', 'configtype'],
    proxy: {
        type: "jsonp",
        url: URLS.MISC.COMMON_CONFIG_CAT_LIST,
        callbackKey: "function",
        reader: {
            type: 'json',
            root: 'data'
        }
    }
});
dataStore.sort('sequence', 'ASC');

Ext.onReady(function () {

    var dataGrid = new Ext.grid.Panel(
        {
            multiSelect: true,// 支持多选
            selType: 'rowmodel',// 设置为单元格选择模式Ext.selection.RowModel
            store: dataStore,
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
                    width: 100,
                    dataIndex: "name"
                },
                {
                    text: "中文名",
                    width: 100,
                    dataIndex: "cname"
                },
                {
                    text: "配置类型",
                    width: 100,
                    dataIndex: "configtype"
                }
                ,
                {
                    header: "操作",
                    width: 150,
                    align: 'center',
                    xtype: 'templatecolumn',
                    tpl: '<tpl>'
                    + '<a style="text-decoration:none;margin-right:5px;" href="javascript:updateData({id:\'{id}\',name:\'{name}\',cname:\'{cname}\',configtype:\'{configtype}\'});"><img src="js/extjs/resources/icons/pencil.png"  title="修改" alt="修改" class="actionColumnImg" />&nbsp;</a>'
                    + '<a style="text-decoration:none;margin-right:5px;" href="javascript:deleteData(\'{id}\');"><img src="js/extjs/resources/icons/delete.png"  title="删除" alt="删除" class="actionColumnImg" />&nbsp;</a>'
                    + '</tpl>'
                }

            ],
            dockedItems: [{
                xtype: "toolbar",
                items: [{
                    text: "添加分类",
                    icon: "js/extjs/resources/icons/add.png",
                    handler: function () {
                        addData();
                    }
                }]
            }]

        });

    /**
     * 布局
     */
    new Ext.Viewport({
        layout: "fit",
        items: [dataGrid],
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
                items: [{
                    xtype: 'hiddenfield',
                    name: 'id'
                }, {
                    id: "nameField",
                    xtype: "textfield",
                    fieldLabel: "名称",
                    name: "name",
                    allowBlank: false
                }, {
                    id: "cnameField",
                    xtype: "textfield",
                    fieldLabel: "中文名称",
                    name: "cname",
                    allowBlank: false
                }, {
                    id: "configtypeField",
                    xtype: "textfield",
                    fieldLabel: "序号",
                    name: "configtype",
                    allowBlank: false
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
                                    dataStore.reload();
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
function addData() {
    addDataWindow.setTitle("添加分类");
    Ext.getCmp("dataForm").getForm().reset();
    Ext.getCmp("dataForm").url = URLS.MISC.COMMON_CONFIG_CAT_ADD;
    Ext.getCmp("dataForm").operate = "添加";
    addDataWindow.show();
}
function updateData(data) {
    addDataWindow.setTitle("修改分类");
    Ext.getCmp("dataForm").operate = "修改";
    Ext.getCmp("dataForm").getForm().reset();
    Ext.getCmp("dataForm").url = URLS.MISC.COMMON_CONFIG_CAT_UPDATE;
    Ext.getCmp("dataForm").getForm().setValues(data);
    addDataWindow.show();
}

function deleteData(id) {
    Ext.MessageBox.confirm("删除确认", "是否要删除游戏区：", function (res) {
        if (res == "yes") {
            Ext.data.JsonP.request({
                url: URLS.MISC.COMMON_CONFIG_CAT_DELETE,
                params: {
                    id: id,
                    gid: PLATFORM_IDENTIFIER
                },
                callbackKey: 'function',
                // scope: 'this',
                success: function (res) {
                    if (res && res.status == 1) {
                        Ext.MessageBox.alert("提示", "删除成功");
                        dataStore.reload();
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

