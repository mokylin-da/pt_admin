/**
 * Created by 李朝(Li.Zhao) on 2016/4/15.
 */

Ext.require(['Ext.grid.*', 'Ext.data.*', 'Ext.selection.CheckboxModel','Ext.ux.form.DateTimeField']);

/**
 *礼包分类
 */

Ext.QuickTips.init();


// 订单存储模块
var codeCatStore = Ext
    .create(
        "Ext.data.Store",
        {
            autoLoad: true,
            fields: ["id","ename", "cname"],
            proxy: {
                type: "jsonp",
                url: URLS.MISC.ActivationCodeCat_LIST,
                callbackKey: "function",
                reader: {
                    type: 'json',
                    root: 'data'
                }
            },
            listeners: {
                prefetch: function (this_, operation, eOpts) {
                    alert(operation);
                },
                load: function (_this, records, successful, eOpts) {
                    var status = _this.proxy.reader.jsonData.status;
                    GlobalUtil.status(status);
                }

            }
        });

Ext.onReady(function () {

    var codeCatGrid = new Ext.grid.Panel(
        {
            multiSelect: true,// 支持多选
            selType: 'rowmodel',// 设置为单元格选择模式Ext.selection.RowModel
            id: "codeCatGridId",
            store: codeCatStore,
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
                    text: "ID",
                    width: 200,
                    dataIndex: "id"
                },
                {
                    text: "英文标识",
                    width: 200,
                    dataIndex: "ename"
                },
                {
                    text: "中文名",
                    width: 200,
                    dataIndex: "cname"
                },
                {
                    header: "操作",
                    width: 150,
                    align: 'center',
                    xtype: 'templatecolumn',
                    tpl: '<tpl>'
                    + '<a style="text-decoration:none;margin-right:5px;" href="javascript:updateCodeCat({id:\'{id}\',ename:\'{ename}\',cname:\'{cname}\'});"><img src="js/extjs/resources/icons/pencil.png"  title="修改" alt="修改" class="actionColumnImg" />&nbsp;</a>'
                    + '<a style="text-decoration:none;margin-right:5px;" href="javascript:deleteCodeCat(\'{id}\');"><img src="js/extjs/resources/icons/delete.png"  title="删除" alt="删除" class="actionColumnImg" />&nbsp;</a>'
                    + '</tpl>'
                }

            ],
            dockedItems: [{
                xtype: "toolbar",
                items: [{
                    text: "添加分类",
                    icon: "js/extjs/resources/icons/add.png",
                    handler: function () {
                        addCodeCat();
                    }
                }]
            }]

        });

    /**
      * 布局
      */
    new Ext.Viewport({
         layout: "fit",
         items: [codeCatGrid],
         renderTo: Ext.getBody()
    });
});
    function addCodeCat() {
        addDataWindow.setTitle("添加礼包分类");
        Ext.getCmp("dataForm").getForm().reset();
        Ext.getCmp("dataForm").url = URLS.MISC.ActivationCodeCat_Add;
        Ext.getCmp("dataForm").operate = "添加";
        addDataWindow.show();
    }
    function updateCodeCat(data) {
        addDataWindow.setTitle("修改礼包分类");
        Ext.getCmp("dataForm").operate = "修改";
        Ext.getCmp("dataForm").getForm().reset();
        Ext.getCmp("dataForm").url = URLS.MISC.ActivationCodeCat_Update;
        Ext.getCmp("dataForm").getForm().setValues(data);
        addDataWindow.show();
    }
function deleteCodeCat(id) {
    Ext.MessageBox.confirm("删除确认", "是否要删除分类：", function (res) {
        if (res == "yes") {
            Ext.data.JsonP.request({
                url: URLS.MISC.ActivationCodeCat_Delete,
                params: {
                    id: id,
                    gid: PLATFORM_IDENTIFIER
                },
                callbackKey: 'function',
                // scope: 'this',
                success: function (res) {
                    if (res && res.status == 1) {
                        GlobalUtil.tipMsg("提示", "删除成功");
                        codeCatStore.reload();
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
    var addDataWindow = new Ext.Window({
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
                            id: "enameField",
                            xtype: "textfield",
                            fieldLabel: "英文标识",
                            name: "ename",
                            allowBlank: false
                        }, {
                            id: "cnameField",
                            xtype: "textfield",
                            fieldLabel: "中文标识",
                            name: "cname",
                            allowBlank: false
                        }],
                    listeners: {
                        beforeaction: function (_this, action, eOpts) {
                            Ext.Ajax.request({
                                params: _this.getValues(), // values from form fields..
                                url: Ext.getCmp("dataForm").url,
                                //callbackKey: 'function',
                                scope: 'this',
                                success: function (res) {
                                    console.log(res);
                                    if (res && res.status == 1) {
                                        GlobalUtil.tipMsg("提示", Ext.getCmp("dataForm").operate + "成功");
                                        codeCatStore.reload();
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


