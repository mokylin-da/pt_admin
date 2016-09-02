/**
 * Created by 李朝(Li.Zhao) on 2016/4/15.
 */

Ext.require(['Ext.grid.*', 'Ext.data.*', 'Ext.selection.CheckboxModel','Ext.ux.form.DateTimeField']);

/**
 *权限管理
 */

Ext.QuickTips.init();

// The data store containing the list of states
var istatusStore = Ext.create('Ext.data.Store', {
    fields: ['ename', 'cname'],
    data : [
        {"ename":"INIT", "cname":"用户未支付"},
        {"ename":"OUTER_RECHARGED", "cname":"平台已收款"},
        {"ename":"END", "cname":"游戏已到账"}
        //...
    ]
});

// 订单存储模块
var orderStore = Ext
    .create(
        "Ext.data.Store",
        {
            autoLoad: true,
            fields: ["id","vorderNo", "vuserId", "iplayerId", 'irmb','igameId','iworldId','bValidated','requestgamenum','dtCreateTime','dtUpdateTime','iplatformType','vplatformAccount','vplatformOrderNo','istatus','istatusVal'],
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
                    text: "ID",
                    width: 200,
                    dataIndex: "id"
                },
                {
                    text: "订单号",
                    width: 200,
                    dataIndex: "vorderNo"
                },
                {
                    text: "用户id",
                    width: 150,
                    dataIndex: "vuserId"
                },
                {
                    text: "角色id",
                    width: 150,
                    dataIndex: "iplayerId"
                },
                {
                    text: "人民币",
                    width: 150,
                    dataIndex: "irmb"
                },
                {
                    text: "游戏id",
                    width: 150,
                    dataIndex: "igameId"
                },{
                    text: "区服id",
                    width: 150,
                    dataIndex: "iworldId"
                },{
                    text: "支付平台",
                    width: 150,
                    dataIndex: "iplatformType"
                },
                {
                    text: "状态",
                    width: 150,
                    dataIndex: "istatusVal",
                    renderer:function(v){
                        switch (v) {
                            case 0:
                                return "用户未支付";
                            case 1:
                                return "平台已收款";
                            case 3:
                                return "游戏已到账";
                        }
                        return "未知"
                    }
                },
                {
                    header: "操作",
                    width: 150,
                    dataIndex: "sequence",
                    renderer:function(val,metaData,record,rowIndex,store,view){
                        var value = record.raw;
                        value.opentime = value.opentime.replace(/\..*$/,"");
                        var records = JSON.stringify(value).replace(/"/g,'\"');
                        return    '<a style="text-decoration:none;margin-right:5px;" href=\'javascript:updateServer('+records+');\'><img src="js/extjs/resources/icons/pencil.png"  title="修改" alt="修改" class="actionColumnImg" />&nbsp;</a>'
                            + '<a style="text-decoration:none;margin-right:5px;" href="javascript:deleteServer(\''+value.gid+'\',\''+value.sid+'\');"><img src="js/extjs/resources/icons/delete.png"  title="删除" alt="删除" class="actionColumnImg" />&nbsp;</a>';
                    }
                }

            ],
            dockedItems: [{
                id: "pagingToolbarID",
                xtype: 'pagingtoolbar',
                store: orderStore,   // same store GridPanel is using
                dock: 'bottom',
                displayInfo: true
            },
                {
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
                                    id: "istatusField",
                                    xtype: 'combobox',
                                    fieldLabel: '支付状态',
                                    name: 'istatus',
                                    valueField:"ename",
                                    displayField:"cname",
                                    store:istatusStore,
                                    emptyText: "请选择支付状态"
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
                                            submitEmptyText:false
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

