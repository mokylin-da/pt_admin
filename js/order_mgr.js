/**
 * Created by 曾维刚 on 2016/4/15.
 */

Ext.require(['Ext.grid.*', 'Ext.data.*', 'Ext.selection.CheckboxModel','Ext.ux.form.DateTimeField']);

/**
 *权限管理
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
// The data store containing the list of states
var istatusStore = Ext.create('Ext.data.Store', {
    fields: ['ename', 'cname'],
    data : [
        {"ename":0, "cname":"用户未支付"},
        {"ename":1, "cname":"平台已收款"},
        {"ename":3, "cname":"游戏已到账"}
        //...
    ]
});
var iPlatformTypeStore = Ext.create('Ext.data.Store', {
    fields: ['ename', 'cname'],
    data : [
        {"ename":"ALIPAY", "cname":"支付宝"},
        {"ename":"WEICHAT", "cname":"微信"},
        {"ename":"YIBAO", "cname":"易宝"},
        {"ename":"Swiftpass", "cname":"威富通"}
        //...
    ]
});

// 订单存储模块
var orderStore = Ext
    .create(
        "Ext.data.Store",
        {
            autoLoad: true,
            fields: ["id","vOrderNo", "vUserId", "iPlayerId",'iPlayerName', 'iRmb','iGameId','iGameName','iWorldId','iWorldName','bValidated','requestgamenum','dtCreateTime','dtUpdateTime','iPlatformType','vCategory','vPlatformAccount','vPlatformOrderNo','iStatus','istatusVal'],
            pageSize:20,
            proxy: {
                type: "jsonp",
                url: URLS.PAY.PAGE_ORDER,
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
                    var status = _this.proxy.reader.jsonData.status;
                    var msg=_this.proxy.reader.jsonData.data.totalrmb;
                    Ext.getCmp("showmsg").setText("总金额："+msg+"分");
                    GlobalUtil.status(status);
                }

            }
        });

Ext.onReady(function () {

    var orderGrid = new Ext.grid.Panel(
        {
            multiSelect: true,// 支持多选
            selType: 'rowmodel',// 设置为单元格选择模式Ext.selection.RowModel
            id: "orderGridId",
            store: orderStore,
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
                    text: "序号",
                    width: 80,
                    dataIndex: "id"
                },
                {
                    text: "订单号",
                    width: 250,
                    dataIndex: "vOrderNo"
                },
                {
                    text: "用户id",
                    width: 270,
                    dataIndex: "vUserId"
                },
                {
                    text: "人民币",
                    width: 74,
                    dataIndex: "iRmb"
                },
                {
                    text: "游戏id",
                    width: 74,
                    dataIndex: "iGameId"
                },{
                    text: "区服id",
                    width: 74,
                    dataIndex: "iWorldId"
                },{
                    text: "角色id",
                    width: 74,
                    dataIndex: "iPlayerId"
                },{
                    text: "支付平台",
                    width: 98,
                    dataIndex: "iPlatformType"
                },
                {
                    text: "支付类型",
                    width: 98,
                    dataIndex: "vCategory"
                },
                {
                    text: "订单创建时间",
                    width: 146,
                    dataIndex: "dtCreateTime"
                    ,
                    renderer : function(value) {
                        if (value == null || value == 0) {
                            return '未知'
                        } else {
                            return Ext.util.Format.date(new Date(parseInt(value)),"Y-m-d H:i:s");
                            // return  new Date(parseInt(value)).format("Y-m-d H:i:s");
                        }
                    }
                },
                {
                    text: "订单刷新时间",
                    width: 146,
                    dataIndex: "dtUpdateTime"
                    ,
                    renderer : function(value) {
                        if (value == null || value == 0) {
                            return '未知'
                        } else {
                            return Ext.util.Format.date(new Date(parseInt(value)),"Y-m-d H:i:s");
                            // return  new Date(parseInt(value)).format("Y-m-d H:i:s");
                        }
                    }
                },
                {
                    text: "状态",
                    width: 92,
                    dataIndex: "iStatus",
                    renderer:function(v){
                        if (v=='INIT'){
                            return "用户未支付";
                        }else  if (v=='OUTER_RECHARGED'){
                            return "平台已收款";
                        }else  if (v=='END'){
                            return "游戏已到账";
                        }else {
                            return "未知"
                        }
                    }
                },
                {
                    text: "发货次数",
                    width: 86,
                    dataIndex: "requestgamenum"
                },
                {
                    header: "操作",
                    width: 78,
                    align: 'center',
                    xtype: 'templatecolumn',
                    tpl: '<tpl>'
                    + '<a style="text-decoration:none;margin-right:5px;" href="javascript:resetRequestNum(\'{vOrderNo}\',\'{iStatus}\');"><img src="js/extjs/resources/icons/arrow_refresh.png"  title="重置" alt="重置" class="actionColumnImg" />&nbsp;</a>'
                    + '</tpl>'
                },
                {
                    text: "游戏名",
                    width: 86,
                    dataIndex: "iGameName"
                },
                {
                    text: "服务器名",
                    width: 86,
                    dataIndex: "iWorldName"
                },
                {
                    text: "角色名",
                    width: 86,
                    dataIndex: "iPlayerName"
                }

            ],
            dockedItems: [{
                id: "pagingToolbarID",
                xtype: 'pagingtoolbar',
                store: orderStore,   // same store GridPanel is using
                dock: 'bottom',
                displayInfo: true
            },{
                xtype: "toolbar",
                items: [
                    {
                        xtype: 'form',
                        id: "dataForm",
                        fieldDefaults: {
                            labelAlign: 'right',
                            labelWidth: 100,
                            anchor: '150%'
                        },
                        frame: false,
                        border: false,
                        // bodyStyle: 'padding:10 10',
                        layout: 'column',
                        items: [
                            {
                                xtype: 'panel',
                                columnWidth: 0.2,
                                border: 0,
                                items: [
                                    {
                                        id: "istatusField",
                                        xtype: 'combobox',
                                        fieldLabel: '支付状态',
                                        name: 'istatusVal',
                                        valueField:"ename",
                                        displayField:"cname",
                                        store:istatusStore,
                                        emptyText: "请选择支付状态"
                                    },{
                                        xtype: 'textfield',
                                        fieldLabel: '订单号',
                                        name: 'vOrderNo',
                                        inputAttrTpl: [
                                            "autocomplete=\"on\""
                                        ],
                                        emptyText: "请输入订单号"
                                    }
                                ]
                            }, {
                                xtype: 'panel',
                                columnWidth: 0.2,
                                border: 0,
                                items: [
                                    {
                                        xtype: 'textfield',
                                        fieldLabel: '用户ID',
                                        name: 'vUserId',
                                        inputAttrTpl: [
                                            "autocomplete=\"on\""
                                        ]
                                    },{
                                        xtype: 'combobox',
                                        fieldLabel: '游戏ID',
                                        name: 'iGameId',
                                        valueField:"gid",
                                        displayField:"gname",
                                        store:gameStore,
                                        emptyText: "请选择游戏"
                                    }
                                ]
                            }, {
                                xtype: 'panel',
                                columnWidth: 0.2,
                                border: 0,
                                items: [
                                    {
                                        xtype: 'textfield',
                                        fieldLabel: '区服ID',
                                        name: 'iWorldId',
                                        inputAttrTpl: [
                                            "autocomplete=\"on\""
                                        ]
                                    },{
                                        xtype: 'combobox',
                                        fieldLabel: '支付平台',
                                        name: 'iPlatformTypeName',
                                        valueField:"ename",
                                        displayField:"cname",
                                        store:iPlatformTypeStore,
                                        emptyText: "请选择支付平台"
                                    }
                                ]
                            }, {
                                xtype: 'panel',
                                columnWidth: 0.2,
                                border: 0,
                                items: [
                                    Ext.create('Ext.ux.form.DateTimeField', {
                                        fieldLabel: "时间从",
                                        name: "dtCreateTime1",
                                        format: 'Y-m-d H:i:s',
                                        allowBlank: false
                                    }), Ext.create('Ext.ux.form.DateTimeField', {
                                        fieldLabel: "至",
                                        name: "dtCreateTime2",
                                        value: new Date(),
                                        format: 'Y-m-d H:i:s',
                                        allowBlank: false
                                    })
                                ]
                            }
                        ],
                        dockedItems: [{
                            xtype: 'toolbar',
                            dock: 'right',
                            layout: 'hbox',
                            border: 0,
                            items: [{
                                text: "搜索",
                                icon: "js/extjs/resources/icons/search.png",
                                formBind: true,
                                handler: function (v) {
                                    v.up("form").submit({
                                        submitEmptyText:false
                                    });
                                }
                            }, {
                                text: '重置',
                                handler: function (v) {
                                    v.up("form").getForm().reset()
                                }
                            },{
                                text:'下载订单',
                                handler: function (v) {
                                    console.log(v.up("form").getForm().getValues());
                                    var values = v.up("form").getForm().getValues();
                                    var u=URLS.PAY.DOWN_ORDER+"?x=1";
                                    for(var key in values){
                                        u+="&"+key+"="+values[key];

                                    }
                                    window.open(u)
                                }
                            },{
                                id:"showmsg",
                                text:''
                            }]
                        }],
                        listeners: {
                            beforeaction: function (form, action, options) {
                                orderStore.getProxy().extraParams = action.getParams();
                                orderStore.reload();
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
        items: [orderGrid],
        renderTo: Ext.getBody()
    });


});

/**
 * 重置订单发货次数
 */
function resetRequestNum(OrderNo,istatus)
{
    if (istatus != 'OUTER_RECHARGED')
        return;

    Ext.MessageBox.confirm("操作确认", "是否要重置发货次数：" + OrderNo,
        function (res)
        {
            if (res == "yes")
            {
                Ext.data.JsonP.request({
                    url: URLS.PAY.RESET_ORDER,
                    params: {
                        vOrderNo: OrderNo
                    },
                    callbackKey: 'function',
                    // scope: 'this',
                    success: function (res) {
                        if (res && res.status == 20001) {
                            GlobalUtil.tipMsg("提示", "重置成功");
                            orderStore.reload();
                            return;
                        }
                        Ext.MessageBox.alert("提示", "重置失败:" + res ? res.msg : "");
                    },
                    failure: function (response) {
                        Ext.MessageBox.alert("提示", "重置失败");
                    }
                });
            }
        }
    );
}
