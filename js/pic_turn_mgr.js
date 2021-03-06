/**
 * Created by 李朝(Li.Zhao) on 2016/4/15.
 */
Ext.require(['Ext.grid.*', 'Ext.data.*', 'Ext.selection.CheckboxModel', 'Ext.moux.MoUploader']);

/**
 *权限管理
 */

var API_TYPE = "GAME_INFO_INTERNAL_ENDPOINT", API_NAME = "gameinfo/game/allgamelistlimitfields", API_VALUE = "", API_KEY = "gid";

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
    },
    listeners: {
        load: function (_this, records, successful, eOpts) {
            _this.add({gid: PLATFORM_IDENTIFIER, gname: "官网管理平台"});
        }
    }
});
var picTurnCatStore =  Ext.create('Ext.data.Store', {
    autoLoad: true,
    fields: ['id', 'gid', 'name', 'cname', 'configtype'],
    proxy: {
        type: "jsonp",
        extraParams: {type: COMMON_CONFIG.PIC_TURN_TYPE, gid: PLATFORM_IDENTIFIER},
        url: URLS.MISC.COMMON_CONFIG_CAT_LIST,
        callbackKey: "function",
        reader: {
            type: 'json',
            root: 'data'
        }
    }
});

var picTurnStore = Ext.create('Ext.data.Store', {
    autoLoad: false,
    fields: ['type', 'gid', 'sequence', 'state', 'title', 'link', 'img','catid','desc','ownerid'],
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
                            var tmp = baseData[i];
                            var tmpData = GlobalUtil.stringToJson(tmp.data);
                            delete tmp.data;
                            Ext.override(tmpData, tmp);
                            finalData.push(tmpData);
                        }
                        window.datas = finalData;
                        _this.add(finalData);
                        Ext.getCmp("addPicTurnBtn").enable();
                    } else {
                        Ext.getCmp("addPicTurnBtn").disable();
                        GlobalUtil.status(res.status)
                    }
                },
                failure: function (response) {
                    Ext.getCmp("addPicTurnBtn").disable();
                    top.Ext.MessageBox.alert("提示", "获取数据失败2");
                }
            });
        }
    }
});
picTurnStore.sort('sequence', 'ASC');

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
                    text: "标题",
                    width: 200,
                    dataIndex: "title"
                },
                {
                    text: "分类",
                    width: 150,
                    dataIndex: "catid",
                    renderer:function(v){
                        var record = picTurnCatStore.findRecord("id",v);
                        return !record?"":record.get("cname");
                    }
                },
                {
                    text:"所属游戏",
                    width: 150,
                    dataIndex: "ownerid",
                    renderer:function(v){
                        var record = gameStore.findRecord("gid",v);
                        return !record?"":record.get("gname");
                    }
                },
                {
                    text: "链接",
                    width: 150,
                    dataIndex: "link"
                },{
                    text: "描述",
                    width: 150,
                    dataIndex: "desc"
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
                    + '<a style="text-decoration:none;margin-right:5px;" href="javascript:updatePicTurn({id:\'{id}\',sequence:\'{sequence}\',state:{state},title:\'{title}\',link:\'{link}\',img:\'{img}\',type:\'{type}\',gid:\'{gid}\',catid:\'{catid}\',desc:\'{desc}\',ownerid:\'{ownerid}\'});"><img src="js/extjs/resources/icons/pencil.png"  title="修改" alt="修改" class="actionColumnImg" />&nbsp;</a>'
                    + '<a style="text-decoration:none;margin-right:5px;" href="javascript:deletePicTurn(\'{id}\');"><img src="js/extjs/resources/icons/delete.png"  title="删除" alt="删除" class="actionColumnImg" />&nbsp;</a>'
                    + '</tpl>'
                }

            ],
            dockedItems: [{
                xtype: "toolbar",
                items: [
                    Ext.create("Ext.moux.GameCombo", {
                    id: "gameCombo",
                    extraItems: {gid: PLATFORM_IDENTIFIER, gname: "官网管理平台"},
                    listeners: {
                        select: function (_this, records, eOpts) {
                            var gid = records[0].get('gid');
                            picTurnStore.getProxy().extraParams = {type: COMMON_CONFIG.PIC_TURN_TYPE,gid: gid};//游戏改变的时候重新加载权限数据
                            picTurnStore.load();
                            var proxy = picTurnCatStore.proxy;
                            proxy.extraParams = proxy.extraParams||{};
                            proxy.extraParams.gid=gid;
                            picTurnCatStore.load();
                        }
                    }
                }),{
                        id:"addPicTurnBtn",
                        disabled:true,
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
        title: "添加轮播图",
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
                        value: COMMON_CONFIG.PIC_TURN_TYPE
                    }, {
                        xtype: "hiddenfield",
                        name: "gid"
                    }, {
                        xtype: "combobox",
                        fieldLabel: "分类",
                        name: "catid",
                        store:picTurnCatStore,
                        queryMode: 'local',
                        displayField:"cname",
                        valueField:"id",
                        allowBlank:false,
                        editable: false,
                        emptyText:"--请选择--"
                    },
                        Ext.create("Ext.moux.MoUploader", {
                            name: "img"
                        })
                        , {
                            xtype: "combobox",
                            fieldLabel: "所属游戏",
                            name: "ownerid",
                            store:gameStore,
                            queryMode: 'local',
                            displayField:"gname",
                            valueField:"gid",
                            allowBlank:false,
                            editable: false,
                            emptyText:"--请选择--"
                        }, {
                            xtype: "textfield",
                            fieldLabel: "标题",
                            name: "title",
                            allowBlank: false
                        }, {
                            xtype: "textfield",
                            vtype: 'url',
                            fieldLabel: "链接地址",
                            name: "link"
                        }, {
                            xtype: "textareafield",
                            fieldLabel: "描述信息",
                            name: "desc"
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
                            value: 1,
                            name: "state"
                        }],
                    listeners: {
                        beforeaction: function (_this, action, eOpts) {
                            var params = _this.getValues();
                            params.apiname = API_NAME;
                            params.apitype = API_TYPE;
                            params.apikey = 'gid';
                            convertParams(params, ["title", "link", "img","desc"]);
                            params.gid=Ext.getCmp("gameCombo").getValue();
                            Ext.data.JsonP.request({
                                params: params, // values from form fields..
                                url: Ext.getCmp("dataForm").url,
                                callbackKey: 'function',
                                scope: 'this',
                                success: function (res) {
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
                }
            )
        ]
    })
    ;
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
    addDataWindow.setTitle("添加轮播图");
    Ext.getCmp("dataForm").getForm().reset();
    Ext.getCmp("dataForm").url = URLS.MISC.COMMON_CONFIG_ADD;
    Ext.getCmp("dataForm").operate = "添加";
    addDataWindow.show();
}
function updatePicTurn(data) {
    addDataWindow.setTitle("修改轮播图");
    Ext.getCmp("dataForm").operate = "修改";
    Ext.getCmp("dataForm").getForm().reset();
    Ext.getCmp("dataForm").url = URLS.MISC.COMMON_CONFIG_UPDATE;
    Ext.getCmp("dataForm").getForm().setValues(data);

    addDataWindow.show();
}

function deletePicTurn(id) {
    Ext.MessageBox.confirm("删除确认", "是否要删除此轮播图：", function (res) {
        if (res == "yes") {
            Ext.data.JsonP.request({
                url: URLS.MISC.COMMON_CONFIG_DELETE,
                params: {
                    id: id,
                    gid: Ext.getCmp("gameCombo").getValue(),
                    type: COMMON_CONFIG.PIC_TURN_TYPE
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

