/**
 * Created by 曾维刚
 */

Ext.require(['Ext.grid.*', 'Ext.data.*', 'Ext.selection.CheckboxModel','Ext.ux.form.DateTimeField']);

/**
 *礼包分类
 */

Ext.QuickTips.init();
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



// 订单存储模块
var gametaskStore = Ext
    .create(
        "Ext.data.Store",
        {
            autoLoad: true,
            fields: ["id","cname", "ename", "description", "summary", "link", "growth", "points", "type", "gid", "opentimelimit", "levellimit", "exenumlimit", "cat","pic"],
            proxy: {
                type: "jsonp",
                url: URLS.USER.Game_InnerTask_List,
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

    var gametaskGrid = new Ext.grid.Panel(
        {
            multiSelect: true,// 支持多选
            selType: 'rowmodel',// 设置为单元格选择模式Ext.selection.RowModel
            id: "gametaskGridId",
            store: gametaskStore,
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
                    + '<a style="text-decoration:none;margin-right:5px;" href="javascript:updateInnertask({id:\'{id}\',gid:parseInt(\'{gid}\'),ename:\'{ename}\',cname:\'{cname}\',description:\'{description}\',summary:\'{summary}\',link:\'{link}\',growth:\'{growth}\',link:\'{link}\',points:\'{points}\',type:\'{type}\',opentimelimit:\'{opentimelimit}\',levellimit:\'{levellimit}\',exenumlimit:\'{exenumlimit}\',cat:\'{cat}\',pic:\'{pic}\'});"><img src="js/extjs/resources/icons/pencil.png"  title="修改" alt="修改" class="actionColumnImg" />&nbsp;</a>'
                    + '</tpl>'
                }

            ]

        });

    /**
      * 布局
      */
    new Ext.Viewport({
         layout: "fit",
         items: [gametaskGrid],
         renderTo: Ext.getBody()
    });
});
    function updateInnertask(data) {
        addDataWindow.setTitle("修改游戏任务");
        Ext.getCmp("dataForm").operate = "修改";
        Ext.getCmp("dataForm").getForm().reset();
        Ext.getCmp("dataForm").url = URLS.USER.Game_InnerTask_Update;
        Ext.getCmp("dataForm").getForm().setValues(data);
        Ext.getCmp("updatecat").setValue({"cat": data.cat});
        addDataWindow.show();

    }
//function deleteCodeCat(id) {
//    Ext.MessageBox.confirm("删除确认", "是否要删除分类：", function (res) {
//        if (res == "yes") {
//            Ext.data.JsonP.request({
//                url: URLS.GAME_INFO.ActivationCodeCat_Delete,
//                params: {
//                    id: id,
//                    gid: PLATFORM_IDENTIFIER
//                },
//                callbackKey: 'function',
//                // scope: 'this',
//                success: function (res) {
//                    if (res && res.status == 1) {
//                        GlobalUtil.tipMsg("提示", "删除成功");
//                        codeCatStore.reload();
//                        return;
//                    }
//                    Ext.MessageBox.alert("提示", "删除失败");
//                },
//                failure: function (response) {
//                    Ext.MessageBox.alert("提示", "删除失败");
//                }
//            });
//        }
//    });
//}
    var addDataWindow = new Ext.Window({
        width: 800,
        height: 600,
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
                            xtype: "textfield",
                            fieldLabel: "中文标识",
                            name: "cname",
                            allowBlank: false
                        },Ext.create("Ext.moux.MoUploader", {
                            fieldLabel: '任务图标',
                            name: "pic",
                            allowBlank: false
                        }),{
                            id:"updatecat",
                            fieldLabel: "分类",
                            name: "cat",
                            allowBlank: false,
                            xtype: 'radiogroup',
                            cls: 'x-check-group-alt',
                            items: [
                                {boxLabel: '新手任务', name: 'cat', inputValue: 0, checked: true},
                                {boxLabel: '日常任务', name: 'cat', inputValue: 1}
                            ]
                        }, {
                            xtype: "textfield",
                            fieldLabel: "简要描述",
                            name: "summary",
                            allowBlank: false
                        }, {
                            xtype: "textfield",
                            fieldLabel: "详细描述",
                            name: "description",
                            allowBlank: false
                        }, {
                            xtype: "textfield",
                            fieldLabel: "任务地址",
                            name: "link",
                            allowBlank: false
                        }, {
                            xtype: "textfield",
                            fieldLabel: "成长值",
                            name: "growth",
                            allowBlank: false
                        }, {
                            xtype: "textfield",
                            fieldLabel: "积分",
                            name: "points",
                            allowBlank: false
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
                                        GlobalUtil.tipMsg("提示", Ext.getCmp("dataForm").operate + "成功");
                                        gametaskStore.reload();
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


