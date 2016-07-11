/**
 * @author Li Zhao
 * @since 2016/7/8
 */
Ext.define("Ext.moux.CommonConfigCat", {
    extend: 'Ext.grid.Panel',
    alias: 'widget.commonconfigcat',
    gameComboExtraItem:{},
    multiSelect: true,// 支持多选
    selType: 'rowmodel',// 设置为单元格选择模式Ext.selection.RowModel
    viewConfig: {
        stripeRows: true,//在表格中显示斑马线
        enableTextSelection: true //可以复制单元格文字
    },
    loadMask: {
        msg: "正在加载数据,请稍等..."
    },
    configType:"",
    addOrUpdateWindow:null,
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
        }
        ,
        {
            header: "操作",
            width: 150,
            align: 'center',
            xtype: 'templatecolumn',
            tpl: '<tpl>'
            + '<a style="text-decoration:none;margin-right:5px;" href="javascript:window.commonConfigCatUpdateData({id:\'{id}\',name:\'{name}\',cname:\'{cname}\',configtype:\'{configtype}\'});"><img src="js/extjs/resources/icons/pencil.png"  title="修改" alt="修改" class="actionColumnImg" />&nbsp;</a>'
            + '<a style="text-decoration:none;margin-right:5px;" href="javascript:window.commonConfigCatDeleteData(\'{id}\');"><img src="js/extjs/resources/icons/delete.png"  title="删除" alt="删除" class="actionColumnImg" />&nbsp;</a>'
            + '</tpl>'
        }

    ],
    dockedItems: [{
        xtype: "toolbar",
        items: [
            Ext.create("Ext.moux.GameCombo", {
            id: "gameCombo",
            extraItems: [{gid: PLATFORM_IDENTIFIER, gname: "官网管理平台"}],
            listeners: {
                select: function (_this, records, eOpts) {
                    var dataStore = _this.up("grid").store;
                    dataStore.proxy.extraParams = dataStore.proxy.extraParams||{};
                    dataStore.getProxy().extraParams.gid = records[0].get('gid');//游戏改变的时候重新加载权限数据
                    dataStore.load();
                }
            }
        }),{
            id:"addCatBtn",
            text: "添加分类",
            disabled:true,
            icon: "js/extjs/resources/icons/add.png",
            handler: function () {
                window.commonConfigCatAddData();
            }
        }]
    }],

    initComponent: function () {
        var _this = this;
        var dataStore = _this.store = Ext.create('Ext.data.Store', {
            autoLoad: false,
            fields: ['id', 'gid', 'name', 'cname', 'configtype'],
            proxy: {
                type: "jsonp",
                extraParams: {type: _this.configType, gid: PLATFORM_IDENTIFIER},
                url: URLS.MISC.COMMON_CONFIG_CAT_LIST,
                callbackKey: "function",
                reader: {
                    type: 'json',
                    root: 'data',
                    successProperty:"status"
                }
            },
            listeners:{
                load:function(){
                    Ext.getCmp("addCatBtn").enable();
                }
            }
        });

        window.commonconfigCatAddDataWindow = new Ext.Window({
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
                            allowBlank: false,
                            validator: function (v) {
                                var record = dataStore.findRecord("name",v,0,false,true,true);
                                if(!record || record.get("id")==this.previousNode('hiddenfield[name=id]').getValue()){
                                    return true;
                                }
                                return !!record?"存在名称为【"+v+"】的分类":true;
                            }
                        }, {
                            id: "cnameField",
                            xtype: "textfield",
                            fieldLabel: "中文名称",
                            name: "cname",
                            allowBlank: false
                        }, {
                            id: "configtypeField",
                            xtype: "hiddenfield",
                            name: "configtype",
                            value: _this.configType
                        }, {
                            id: "gidField",
                            xtype: "hiddenfield",
                            name: "gid"
                        }],
                        listeners: {
                            beforeaction: function (_this, action, eOpts) {
                                var params = _this.getValues();
                                params.gid=Ext.getCmp("gameCombo").getValue();
                                Ext.data.JsonP.request({
                                    params: params, // values from form fields..
                                    url: Ext.getCmp("dataForm").url,
                                    callbackKey: 'function',
                                    scope: 'this',
                                    success: function (res) {
                                        console.log(res);
                                        if (res && res.status == 1) {
                                            GlobalUtil.tipMsg("提示", Ext.getCmp("dataForm").operate + "成功");
                                            dataStore.reload();
                                            window.commonconfigCatAddDataWindow.hide();
                                            return;
                                        }
                                        GlobalUtil.status(res.status,function(){
                                            Ext.getCmp("addSubmitBtn").enable();
                                        });
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
        window.commonConfigCatAddData = function () {
            window.commonconfigCatAddDataWindow.setTitle("添加分类");
            Ext.getCmp("dataForm").getForm().reset();
            Ext.getCmp("dataForm").url = URLS.MISC.COMMON_CONFIG_CAT_ADD;
            Ext.getCmp("dataForm").operate = "添加";
            window.commonconfigCatAddDataWindow.show();
        };
        window.commonConfigCatUpdateData = function (data) {
            window.commonconfigCatAddDataWindow.setTitle("修改分类");
            Ext.getCmp("dataForm").operate = "修改";
            Ext.getCmp("dataForm").getForm().reset();
            Ext.getCmp("dataForm").url = URLS.MISC.COMMON_CONFIG_CAT_UPDATE;
            Ext.getCmp("dataForm").getForm().setValues(data);
            window.commonconfigCatAddDataWindow.show();
        };



        window.commonConfigCatDeleteData = function (id) {
            Ext.MessageBox.confirm("删除确认", "是否要删除该分类：", function (res) {
                if (res == "yes") {
                    Ext.data.JsonP.request({
                        url: URLS.MISC.COMMON_CONFIG_CAT_DELETE,
                        params: {
                            id: id,
                            gid: Ext.getCmp("gameCombo").getValue(),
                            type:_this.configType
                        },
                        callbackKey: 'function',
                        // scope: 'this',
                        success: function (res) {
                            if (res && res.status == 1) {
                                GlobalUtil.tipMsg("提示", "删除成功");
                                dataStore.reload();
                                return;
                            }
                            GlobalUtil.status(res.status);
                        },
                        failure: function (response) {
                            Ext.MessageBox.alert("提示", "删除失败");
                        }
                    });
                }
            });
        };

        this.callParent(arguments);
    }
});