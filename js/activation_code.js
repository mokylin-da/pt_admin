/**
 * Created by 李朝(Li.Zhao) on 2016/4/15.
 */

Ext.require(['Ext.grid.*', 'Ext.data.*', 'Ext.selection.CheckboxModel','Ext.ux.form.DateTimeField']);

/**
 *礼包列表
 */

Ext.QuickTips.init();
var codeCatStore = Ext
    .create(
    "Ext.data.Store",
    {
        autoLoad: true,
        fields: ["id","ename", "cname"],
        proxy: {
            type: "jsonp",
            url: URLS.GAME_INFO.ActivationCodeCat_LIST,
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
                var status = _this.proxy.reader.jsonData.newstatus;
                GlobalUtil.status(status);
            }

        }
    });
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
var codeStore = Ext
    .create(
        "Ext.data.Store",
        {
            fields: ["id","catid", "getmethod", "gift", "state", "begindate","name","limitnum","remaining","begindateStr","picture","gid","hot"],
            proxy: {
                type: "jsonp",
                url: URLS.GAME_INFO.ActivationCode_Page4admin,
                callbackKey: "function",
                pageParam: "pagenum",
                limitParam: "pagesize",
                reader: {
                    type: 'json',
                    root: 'data.data',
                    totalProperty: "data.total",
                    successProperty: "status"
                }
            },
            listeners: {
                prefetch: function (this_, operation, eOpts) {
                    alert(operation);
                },
                load: function (_this, records, successful, eOpts) {
                    var status = _this.proxy.reader.jsonData.newstatus;
                    GlobalUtil.status(status);
                }

            }
        });

Ext.onReady(function () {

    var codeGrid = new Ext.grid.Panel(
        {
            multiSelect: true,// 支持多选
            selType: 'rowmodel',// 设置为单元格选择模式Ext.selection.RowModel
            id: "codeGridId",
            store: codeStore,
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
                    text: "礼包图片",
                    width: 100,
                    dataIndex: "picture",
                    renderer: function (v) {
                        return "<img src='" + v + "' style='height:100px;width:100px;'/>";
                    }
                },
                {
                    text: "ID",
                    width: 200,
                    dataIndex: "id"
                },{
                    text: "游戏",
                    width: 200,
                    dataIndex: "gid",
                    renderer:function(v){

                        for(var i=0;i<gameStore.getCount();i++){
                            var tmp=gameStore.getAt(i);
                            if(tmp.raw.gid=v){
                                return tmp.raw.gname;
                            }
                        }
                    }
                },
                {
                    text: "礼包名称",
                    width: 200,
                    dataIndex: "name"
                },
                {
                    text: "领取限制",
                    width: 200,
                    dataIndex: "limitnum"
                },{
                    text: "开始时间",
                    width: 200,
                    dataIndex: "begindateStr"
                },
                {
                    text: "剩余数量",
                    width: 200,
                    dataIndex: "remaining"
                },{
                    text: "状态",
                    width: 80,
                    dataIndex: "state",
                    renderer: function (v) {
                        switch (v) {
                            case 0:
                                return "可用";
                            case 1:
                                return "不可用";
                        }
                        return "未知"
                    }
                },{
                    text: "热门礼包",
                    width: 80,
                    dataIndex: "hot",
                    renderer: function (v) {
                        switch (v) {
                            case 0:
                                return "非";
                            case 1:
                                return "是";
                        }
                        return "未知"
                    }
                },
                {
                    header: "操作",
                    width: 150,
                    align: 'center',
                    xtype: 'templatecolumn',
                    tpl: '<tpl>'
                    + '<a style="text-decoration:none;margin-right:5px;" href="javascript:addCodes({id:\'{id}\'});"><img src="js/extjs/resources/icons/add.png"  title="补充激活码" alt="补充激活码" class="actionColumnImg" />&nbsp;</a>'
                    + '<a style="text-decoration:none;margin-right:5px;" href="javascript:clearCodes(\'{id}\');"><img src="js/extjs/resources/icons/delete.png"  title="清空激活码" alt="清空激活码" class="actionColumnImg" />&nbsp;</a>'
                    + '<a style="text-decoration:none;margin-right:5px;" href="javascript:updateInfo({id:\'{id}\',hot:\'{hot}\',name:\'{name}\',limitnum:\'{limitnum}\',begindate:\'{begindateStr}\',state:\'{state}\',getmethod:\'{getmethod}\',gift:\'{gift}\',picture:\'{picture}\',gid:\'{gid}\'});"><img src="js/extjs/resources/icons/pencil.png"  title="修改信息" alt="修改信息" class="actionColumnImg" />&nbsp;</a>'
                    + '</tpl>'
                }

            ],
            dockedItems: [{
                id: "pagingToolbarID",
                xtype: 'pagingtoolbar',
                store: codeStore,   // same store GridPanel is using
                dock: 'bottom',
                displayInfo: true
            },{
                xtype: "toolbar",
                items: [Ext.create('Ext.form.ComboBox', {
                    id:"catCombo",
                    fieldLabel: '礼包分类',
                    store: codeCatStore,
                    //queryMode: 'local',
                    displayField: 'cname',
                    valueField: 'id',
                    renderTo: Ext.getBody(),
                    listeners:{
                        scope: this,
                        change: function (_this, nv,ov, eOpts) {
                            codeStore.getProxy().extraParams={"catid":nv};
                            codeStore.reload();
                        }
                    }
                }),{
                    text: "添加礼包",
                    icon: "js/extjs/resources/icons/add.png",
                    handler: function () {
                        addCode();
                    }
                }]
            }]

        });

    /**
      * 布局
      */
    new Ext.Viewport({
         layout: "fit",
         items: [codeGrid],
         renderTo: Ext.getBody()
    });
});
    function addCode() {
        addDataWindow.setTitle("添加礼包");
        Ext.getCmp("dataForm").getForm().reset();
        Ext.getCmp("dataForm").url = URLS.GAME_INFO.ActivationCode_Add;
        //Ext.getCmp("dataForm").url = "http://localhost:8086/external/GAME_INFO/activationcode/add";
        Ext.getCmp("dataForm").operate = "添加";
        addDataWindow.show();
    }
    function addCodes(data) {
        addCodesDataWindow.setTitle("补充激活码");
        Ext.getCmp("codesDataForm").operate = "补充";
        Ext.getCmp("codesDataForm").getForm().reset();
        Ext.getCmp("codesDataForm").url = URLS.GAME_INFO.ActivationCode_Add_Codes;
        Ext.getCmp("codesDataForm").getForm().setValues(data);
        addCodesDataWindow.show();
    }
function updateInfo(data) {
    updateDataWindow.setTitle("修改信息");
    Ext.getCmp("updatedataForm").operate = "修改";
    Ext.getCmp("updatedataForm").getForm().reset();
    Ext.getCmp("updatedataForm").url = URLS.GAME_INFO.ActivationCode_Update;
    Ext.getCmp("updatedataForm").getForm().setValues(data);
    Ext.getCmp("updateinfostate").setValue({"state": data.state});
    Ext.getCmp("updateinfohot").setValue({"hot": data.hot});
    Ext.getCmp("updateinfostate").setValue({"gid": data.gid});
    updateDataWindow.show();
}

function clearCodes(id) {
    Ext.MessageBox.confirm("清空确认", "是否要清空激活码：", function (res) {
        if (res == "yes") {
            Ext.data.JsonP.request({
                url: URLS.GAME_INFO.ActivationCode_Clear_Codes,
                params: {
                    id: id
                },
                callbackKey: 'function',
                // scope: 'this',
                success: function (res) {
                    if (res && res.status == 1) {
                        GlobalUtil.tipMsg("提示", "清空成功");
                        codeStore.reload();
                        return;
                    }
                    Ext.MessageBox.alert("提示", "清空失败");
                },
                failure: function (response) {
                    Ext.MessageBox.alert("提示", "清空失败");
                }
            });
        }
    });
}
var updateDataWindow = new Ext.Window({
    width: 600,
    height: 800,
    resizable: true,
    modal: true,
    autoShow: false,
    closable: false,
    layout: 'fit',
    listeners: {
        beforeshow: function (_this, eOpts) {
            Ext.getCmp("updateSubmitBtn").enable();
        }
    },
    items: [
        new Ext.form.Panel({
                id: "updatedataForm",
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
                    }, Ext.create("Ext.moux.MoUploader", {
                        fieldLabel: '礼包图片',
                        name: "picture",
                        allowBlank: false
                    }),  {
                        xtype: "textfield",
                        fieldLabel: "领取上限",
                        name: "limitnum",
                        allowBlank: false
                    },{
                        xtype: "textfield",
                        fieldLabel: "礼包名称",
                        name: "name",
                        allowBlank: false
                    }, {
                        xtype: "textareafield",
                        fieldLabel: "领取方式",
                        name: "getmethod",
                        allowBlank: false
                    }, {
                        xtype: "textareafield",
                        fieldLabel: "礼包内容",
                        name: "gift",
                        allowBlank: false
                    },{
                        id:"updateinfostate",
                        fieldLabel: "状态",
                        name: "state",
                        allowBlank: false,
                        xtype: 'radiogroup',
                        cls: 'x-check-group-alt',
                        items: [
                            {boxLabel: '可用', name: 'state', inputValue: 0},
                            {boxLabel: '不可用', name: 'state', inputValue: 1}
                        ]
                    },{
                        id:"updateinfohot",
                        fieldLabel: "热门礼包",
                        name: "hot",
                        allowBlank: false,
                        xtype: 'radiogroup',
                        cls: 'x-check-group-alt',
                        items: [
                            {boxLabel: '否', name: 'hot', inputValue: 0, checked: true},
                            {boxLabel: '是', name: 'hot', inputValue: 1}
                        ]
                    },Ext.create("Ext.ux.form.DateTimeField",{
                        id: "begindateField",
                        xtype: "datetimefield",
                        fieldLabel: "开始时间",
                        name: "begindate",
                        value: new Date(),
                        format: 'Y-m-d H:i:s',
                        allowBlank: false
                    })],
                listeners: {
                    beforeaction: function (_this, action, eOpts) {
                        var values = _this.getValues();
                        var crossDomain = new CrossDomain();
                        crossDomain.init(Ext.getCmp("updatedataForm").url, values, function (v) {
                            if (v == 10001) {
                                GlobalUtil.tipMsg("提示", Ext.getCmp("updatedataForm").operate + "成功");
                                codeStore.reload();
                                updateDataWindow.hide();
                                return;
                            }
                            GlobalUtil.status(parseInt(v), function () {
                                Ext.getCmp("updateSubmitBtn").enable();
                            });
                        });
                        crossDomain.submit();
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
                        id: "updateSubmitBtn",
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

var addCodesDataWindow = new Ext.Window({
    width: 600,
    height: 400,
    resizable: true,
    modal: true,
    autoShow: false,
    closable: false,
    layout: 'fit',
    listeners: {
        beforeshow: function (_this, eOpts) {
            Ext.getCmp("addCodesSubmitBtn").enable();
        }
    },
    items: [
        new Ext.form.Panel({
                id: "codesDataForm",
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
                    },{
                        xtype: "textareafield",
                        height:300,
                        fieldLabel: "补充激活码",
                        name: "codes",
                        allowBlank: false
                    }],
                listeners: {
                    beforeaction: function (_this, action, eOpts) {
                        var values = _this.getValues();
                        var crossDomain = new CrossDomain();
                        crossDomain.init(Ext.getCmp("codesDataForm").url, values, function (v) {
                            if (v == 10001) {
                                GlobalUtil.tipMsg("提示", Ext.getCmp("codesDataForm").operate + "成功");
                                codeStore.reload();
                                addCodesDataWindow.hide();
                                return;
                            }
                            GlobalUtil.status(parseInt(v), function () {
                                Ext.getCmp("addCodesSubmitBtn").enable();
                            });
                        });
                        crossDomain.submit();
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
                        id: "addCodesSubmitBtn",
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
    var addDataWindow = new Ext.Window({
        width: 600,
        height: 800,
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
                            id:"catidField",
                            xtype: "hiddenfield",
                            name: "catid"
                        },{
                            xtype: "combobox",
                            fieldLabel: "所属游戏",
                            name: "gid",
                            store:gameStore,
                            queryMode: 'local',
                            displayField:"gname",
                            valueField:"gid",
                            allowBlank:false,
                            editable: false,
                            emptyText:"--请选择--"
                        }, Ext.create("Ext.moux.MoUploader", {
                            fieldLabel: '礼包图片',
                            name: "picture",
                            allowBlank: false
                        }), {
                            xtype: "numberfield",
                            fieldLabel: "领取上限",
                            name: "limitnum",
                            allowBlank: false
                        },{
                            xtype: "textfield",
                            fieldLabel: "礼包名称",
                            name: "name",
                            allowBlank: false
                        }, {
                            id: "getmethodField",
                            xtype: "textareafield",
                            fieldLabel: "领取方式",
                            name: "getmethod",
                            allowBlank: false
                        }, {
                            xtype: "textareafield",
                            fieldLabel: "礼包内容",
                            name: "gift",
                            allowBlank: false
                        },{
                            fieldLabel: "状态",
                            name: "state",
                            allowBlank: false,
                            xtype: 'radiogroup',
                            cls: 'x-check-group-alt',
                            items: [
                                {boxLabel: '可用', name: 'state', inputValue: 0, checked: true},
                                {boxLabel: '不可用', name: 'state', inputValue: 1}
                            ]
                        },{
                            fieldLabel: "热门礼包",
                            name: "hot",
                            allowBlank: false,
                            xtype: 'radiogroup',
                            cls: 'x-check-group-alt',
                            items: [
                                {boxLabel: '否', name: 'hot', inputValue: 0, checked: true},
                                {boxLabel: '是', name: 'hot', inputValue: 1}
                            ]
                        },Ext.create("Ext.ux.form.DateTimeField",{
                            xtype: "datetimefield",
                            fieldLabel: "开始时间",
                            name: "begindate",
                            value: new Date(),
                            format: 'Y-m-d H:i:s',
                            allowBlank: false
                        }), {
                            xtype: "textareafield",
                            fieldLabel: "激活码",
                            name: "codes",
                            allowBlank: false
                        }],
                    listeners: {
                        beforeaction: function (_this, action, eOpts) {
                            Ext.getCmp("catidField").setValue(Ext.getCmp("catCombo").getValue());
                            var values = _this.getValues();
                            var crossDomain = new CrossDomain();
                            crossDomain.init(Ext.getCmp("dataForm").url, values, function (v) {
                                if (v == 10001) {
                                    GlobalUtil.tipMsg("提示", Ext.getCmp("dataForm").operate + "成功");
                                    codeStore.reload();
                                    addDataWindow.hide();
                                    return;
                                }
                                GlobalUtil.status(parseInt(v), function () {
                                    Ext.getCmp("addSubmitBtn").enable();
                                });
                            });
                            crossDomain.submit();
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


