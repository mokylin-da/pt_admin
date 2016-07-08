/**
 * Created by 李朝(Li.Zhao) on 2016/6/15.
 */
Ext.require(['Ext.grid.*', 'Ext.data.*', 'Ext.selection.CheckboxModel', 'Ext.ux.form.MoUploader']);

/**
 *权限管理
 */
var API_TYPE = "GAME_INFO_INTERNAL_ENDPOINT",API_NAME = "gameinfo/game/allgamelistlimitfields", API_VALUE = "",API_KEY = "gid";

Ext.QuickTips.init();
// ##########################################################
// 数据源存储块 开始
// ##########################################################
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

var picTurnStore = Ext.create('Ext.data.Store', {
    autoLoad: false,
    fields: ['type', 'gid', 'sequence', 'state', 'title', 'link', 'img','gname','apivalue'],
    listeners: {
        beforeload: function (_this) {
            Ext.data.JsonP.request({
                params: _this.getProxy().extraParams, // values from form fields..
                url: URLS.MISC.COMMON_CONFIG_LIST,
                callbackKey: 'function',
                scope: 'this',
                success: function (res) {
                    if (res && res.status == 1) {
                        var finalData = [];
                        var baseData = res.data;
                        if (!baseData) {
                            return;
                        }
                        for (var i = 0; i < baseData.length; i++) {
                            var tmp = baseData[i] || {};
                            var tmpData = GlobalUtil.stringToJson(tmp.data);
                            var apiData = tmp.apidata || {};
                            delete tmp.data;
                            delete tmp.apidata;
                            Ext.override(tmp, tmpData);
                            Ext.override(apiData, tmp);
                            finalData.push(apiData);
                        }
                        window.datas = finalData;
                        _this.add(finalData);
                    } else {
                        GlobalUtil.status(res.status)
                    }
                },
                failure: function (response) {
                    top.Ext.MessageBox.alert("提示", "获取数据失败2");
                }
            });
        }
    }
});
picTurnStore.getProxy().extraParams = {
    type: COMMON_CONFIG.RECOMMEND_GAME_TYPE,
    gid: PLATFORM_IDENTIFIER
};
picTurnStore.sort('sequence', 'ASC');
picTurnStore.load();
Ext.onReady(function () {

    var picTurnGrid = new Ext.grid.Panel(
        {
            multiSelect: true,// 支持多选
            selType: 'rowmodel',// 设置为单元格选择模式Ext.selection.RowModel
            id: "picTurnGridId",
            store: picTurnStore,
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
                    text: "图片",
                    width: 200,
                    dataIndex: "img",
                    renderer: function (v) {
                        return "<image src='" + v + "' style='height:50px;'/>";
                    }
                },
                {
                    text: "游戏名称",
                    width: 200,
                    dataIndex: "gname"
                },
                {
                    text: "序号",
                    width: 60,
                    dataIndex: "sequence"
                },
                {
                    text: "是否显示",
                    width: 80,
                    dataIndex: "state",
                    renderer: function (v) {
                        return v == 0 ? '否' : '是';
                    }
                },
                {
                    header: "操作",
                    width: 150,
                    align: 'center',
                    xtype: 'templatecolumn',
                    tpl: '<tpl>'
                    + '<a style="text-decoration:none;margin-right:5px;" href="javascript:updatePicTurn({id:\'{id}\',sequence:\'{sequence}\',state:\'{state}\',img:\'{img}\',type:\'{type}\',apivalue:parseInt(\'{apivalue}\')});"><img src="js/extjs/resources/icons/pencil.png"  title="修改" alt="修改" class="actionColumnImg" />&nbsp;</a>'
                    + '<a style="text-decoration:none;margin-right:5px;" href="javascript:deletePicTurn(\'{id}\');"><img src="js/extjs/resources/icons/delete.png"  title="删除" alt="删除" class="actionColumnImg" />&nbsp;</a>'
                    + '</tpl>'
                }

            ],
            dockedItems: [{
                xtype: "toolbar",
                items: [{
                    text: "添加",
                    icon: "js/extjs/resources/icons/add.png",
                    handler: function () {
                        addPicTurn();
                    }
                }]
            }]

        });

    /**
     * 布局
     */
    new Ext.Viewport({
        layout: "fit",
        items: [picTurnGrid],
        renderTo: Ext.getBody()
    });


});
var addDataWindow = new Ext.Window({
    title: "添加推荐游戏",
    width: 300,
    height: 350,
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
                fieldDefurlaults: {
                    labelAlign: 'right',
                    labelWidth: 150,
                    anchor: '150%'
                },
                frame: false,
                bodyStyle: 'padding:10 10',
                items: [{
                    xtype: "hiddenfield",
                    name: "id"
                }, {
                    xtype: "hiddenfield",
                    name: "type",
                    value: COMMON_CONFIG.RECOMMEND_GAME_TYPE
                }, {
                    xtype: "hiddenfield",
                    name: "gid",
                    value: PLATFORM_IDENTIFIER
                },
                    Ext.create("Ext.ux.form.MoUploader", {
                        name: "img",
                        fieldLabel:"图片(320*180)"
                    }), {
                        xtype: 'combo',
                        triggerAction: 'all',
                        forceSelection: true,
                        editable: true,
                        fieldLabel: '游戏名称',
                        name: 'apivalue',
                        displayField: 'gname',
                        valueField: 'gid',
                        queryMode: 'local',
                        emptyText: "输入游戏名称",
                        typeAhead: false,
                        allowBlank: false,
                        store: gameStore
                    }, {
                        xtype: "numberfield",
                        fieldLabel: "序号",
                        name: "sequence",
                        allowBlank: false
                    }, {
                        fieldLabel: "是否显示",
                        xtype: "checkboxfield",
                        uncheckedValue: 0,
                        inputValue: 1,
                        value:1,
                        name: "state"
                    }],
                listeners: {
                    beforeaction: function (_this, action, eOpts) {
                        var params = _this.getValues();
                        params.apiname=API_NAME;
                        params.apitype=API_TYPE;
                        params.apikey='gid';
                        convertParams(params, ["img"]);
                        Ext.data.JsonP.request({
                            params: params, // values from form fields..
                            url: Ext.getCmp("dataForm").url,
                            callbackKey: 'function',
                            scope: 'this',
                            success: function (res) {
                                console.log(res);
                                if (res && res.status == 1) {
                                    GlobalUtil.tipMsg("提示", Ext.getCmp("dataForm").operate + "成功");
                                    picTurnStore.reload();
                                    addDataWindow.hide();
                                    return;
                                }
                                top.Ext.MessageBox.alert("提示", Ext.getCmp("dataForm").operate + "失败");
                                Ext.getCmp("addSubmitBtn").enable();
                            },
                            failure: function (response) {
                                top.Ext.MessageBox.alert("提示", Ext.getCmp("dataForm").operate + "失败");
                                Ext.getCmp("addSubmitBtn").enable();
                            }
                        });
                        return false;
                    }
                },
                buttons: [{
                    text: '确定',
                    id: "addSubmitBtn",
                    handler: function (v) {
                        var form = v.up("form").getForm();
                        if(form.isValid()){
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
            }
        )]
});
/**
 * 将对象格式转换，如：
 * <code>
 * var obj={a:1,b:2,c:3,d:4};
 * convertParams(obj,["c","d"]);
 * //data 的值 ：{a:1,b:2,data:"{\"c\":3,\"d\":4}"}
 * </code>
 * @param data
 * @param convertKeys
 */
function convertParams(data, keys) {
    var tmpData = {};
    for (var i = 0; i < keys.length; i++) {
        var k = keys[i];
        tmpData[k] = data[k];
        delete data[k];
    }
    data.data = GlobalUtil.jsonToString(tmpData);
    return data;
}
function addPicTurn() {
    addDataWindow.setTitle("添加推荐游戏");
    Ext.getCmp("dataForm").getForm().reset();
    Ext.getCmp("dataForm").url = URLS.MISC.COMMON_CONFIG_ADD;
    Ext.getCmp("dataForm").operate = "添加";
    addDataWindow.show();
}
function updatePicTurn(data) {
    addDataWindow.setTitle("修改推荐游戏");
    Ext.getCmp("dataForm").operate = "修改";
    Ext.getCmp("dataForm").getForm().reset();
    Ext.getCmp("dataForm").url = URLS.MISC.COMMON_CONFIG_UPDATE;
    Ext.getCmp("dataForm").getForm().setValues(data);

    addDataWindow.show();
}

function deletePicTurn(id) {
    Ext.MessageBox.confirm("删除确认", "是否要删除", function (res) {
        if (res == "yes") {
            Ext.data.JsonP.request({
                url: URLS.MISC.COMMON_CONFIG_DELETE,
                params: {
                    id: id,
                    gid: PLATFORM_IDENTIFIER,
                    type: COMMON_CONFIG.RECOMMEND_GAME_TYPE
                },
                callbackKey: 'function',
                // scope: 'this',
                success: function (res) {
                    if (res && res.status == 1) {
                        GlobalUtil.tipMsg("提示", "删除成功");
                        picTurnStore.reload();
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

