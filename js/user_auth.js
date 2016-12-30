/**
 * Created by 李朝(Li.Zhao) on 2016/4/14.
 */
Ext.require(['Ext.grid.*']);

var userStore = Ext.create('Ext.data.Store', {
    fields: ['uid', 'email', 'nickname', 'cDate', 'emailVerifyed', 'status', 'idcard', 'name', 'come_from', 'accountname','sqes','phone','question'],
    proxy: {
        type: "jsonp",
        url: URLS.USER.QUERY_USER,
        callbackKey: "function",
        reader: {
            type: 'json',
            root: 'data'
        }
    }
});
Ext.onReady(function () {


    var userGrid = new Ext.grid.Panel(
        {
            multiSelect: true,// 支持多选
            // selType: 'rowmodel',// 设置为单元格选择模式Ext.selection.RowModel
            id: "authGridId",
            store: userStore,
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
                    text: "账号ID",
                    width: 200,
                    dataIndex: "uid"
                },
                {
                    text: "账号名",
                    width: 150,
                    dataIndex: "accountname"
                },
                {
                    text: "昵称",
                    width: 150,
                    dataIndex: "nickname"
                },
                {
                    text: "密保邮箱",
                    width: 150,
                    dataIndex: "email"
                },
                {
                    text: "手机号码",
                    width: 150,
                    dataIndex: "phone"
                },
                {
                    text: "密保问题",
                    width: 300,
                    dataIndex: "question",
                    renderer: function(value){
                        var rs="";
                        var arr = value.split(",");
                        for(var i = 0, l = arr.length; i < l; i++) {
                            var item=arr[i];
                            if(item=='1'){
                                rs+="您母亲的姓名是？";
                            }else if(item=='2'){
                                rs+="您父亲的姓名是？";
                            }else if(item=='3'){
                                rs+="您配偶的生日是？";
                            }else if(item=='4'){
                                rs+="您的学号（工号）是？";
                            }else if(item=='5'){
                                rs+="您高中班主任的名字是？";
                            }else if(item=='6'){
                                rs+="您最喜欢的颜色是？";
                            }else if(item=='7'){
                                rs+="您最好的朋友姓名是？";
                            }else if(item=='8'){
                                rs+="您就读的小学校名是？";
                            }else if(item=='9'){
                                rs+="您最喜欢的食物是？";
                            }
                        }

                        return rs;
                    }
                },
                {
                    text: "身份证号码",
                    width: 150,
                    dataIndex: "idcard"
                },
                {
                    text: "注册时间",
                    width: 150,
                    dataIndex: "cDate"
                }, {
                    header: "操作",
                    width: 150,
                    align: 'center',
                    xtype: 'templatecolumn',
                    tpl: '<tpl>'
                    + '<a style="text-decoration:none;margin-right:5px;" href="javascript:updateAuth(\'{uid}\');"><img src="js/extjs/resources/icons/lock_edit.png"  title="授权" alt="授权" class="actionColumnImg" />&nbsp;</a>'
                    + '<a style="text-decoration:none;margin-right:5px;" href="javascript:addemail({uid:\'{uid}\',email:\'{email}\'});"><img src="js/extjs/resources/icons/add.png"  title="授权" alt="授权" class="actionColumnImg" />&nbsp;</a>'
                    + '</tpl>'
                }

            ],
            dockedItems: [{
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
                                id: "uidField",
                                xtype: 'textfield',
                                fieldLabel: '账号ID',
                                name: 'uid',
                                inputAttrTpl: [
                                    "autocomplete=\"on\""
                                ],
                                emptyText: "请输入账号ID"
                            },{
                                id: "accountnameField",
                                xtype: 'textfield',
                                fieldLabel: '账号',
                                name: 'accountname',
                                inputAttrTpl: [
                                    "autocomplete=\"on\""
                                ],
                                emptyText: "请输入账号"
                            }, {
                                id: "nicknameField",
                                xtype: 'textfield',
                                fieldLabel: '昵称',
                                name: 'nickname',
                                inputAttrTpl: [
                                    "autocomplete=\"on\""
                                ],
                                emptyText: "请输入昵称"
                            }, {
                                id: "emailField",
                                xtype: 'textfield',
                                fieldLabel: '邮箱',
                                name: 'email',
                                inputAttrTpl: [
                                    "autocomplete=\"on\""
                                ],
                                emptyText: "请输入邮箱"
                            }, {
                                id: "phoneField",
                                xtype: 'textfield',
                                fieldLabel: '手机',
                                name: 'phone',
                                inputAttrTpl: [
                                    "autocomplete=\"on\""
                                ],
                                emptyText: "请输入手机"
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
                                userStore.getProxy().extraParams = action.getParams();
                                userStore.reload();
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
        items: [userGrid],
        renderTo: Ext.getBody()
    });


});
// 权限列表存储块
var permissionListStore = Ext
    .create(
    "Ext.data.Store",
    {
        fields: ["id", "name", "cname"],
        proxy: {
            type: "jsonp",
            url: URLS.USER.PERMISSION_LIST,
            callbackKey: "function",
            reader: {
                type: 'json',
                root: 'data'
            }
        }
    });

var userAuthWindow = new Ext.Window({
    id: "authWindowId",
    title: "用户授权",
    width: 500,
    height: 500,
    resizable: true,
    modal: true,
    autoShow: false,
    closable: false,
    layout: 'fit',
    items: [new Ext.grid.Panel(
        {
            layout: "fit",
            renderTo: Ext.getBody(),
            multiSelect: true,// 支持多选
            selModel : Ext.create('Ext.selection.CheckboxModel', {
                checkOnly: true
            }),
            selType: 'checkboxmodel',// 设置为单元格选择模式Ext.selection.RowModel
            id: "permissionGridId",
            store: permissionListStore,
            loadMask: {
                msg: "正在加载数据,请稍等..."
            },
            columns: [
                {
                    text: "名称",
                    width: 200,
                    dataIndex: "name"
                },
                {
                    text: "中文名称",
                    width: 150,
                    dataIndex: "cname"
                }
            ],
            dockedItems: [{
                xtype: "toolbar",
                items: [
                    Ext.create("Ext.moux.GameCombo",{
                    id: "gameCombo",
                    extraItems:{gid:PLATFORM_IDENTIFIER,gname:"官网管理平台"},
                    listeners: {
                        select: function (_this, records, eOpts) {
                            permissionListStore.getProxy().extraParams = {"gid": records[0].get('gid')};//游戏改变的时候重新加载权限数据
                            permissionListStore.load(function(){
                                loadUserPermission(records[0].get('gid'));
                            });
                        }
                    }
                })]
            }],
            buttons: [{
                text: '确定',
                id: "addSubmitBtn",
                disabled:true,
                handler: function (v) {
                    v.disable();
                    var selModel = v.up("grid").getSelectionModel();
                    var selArr = selModel.getSelection();
                    var pms_ids = [];
                    if (selArr && selArr.length > 0) {
                        for (var i = 0; i < selArr.length; i++) {
                            pms_ids.push(selArr[i].get("id"));
                        }
                    }
                    Ext.data.JsonP.request({
                        url: URLS.USER.SET_USER_AUTH,
                        params: {
                            gid: Ext.getCmp("gameCombo").getValue(),
                            uid: userAuthWindow.uid,
                            pms_ids: pms_ids
                        },
                        callbackKey: 'function',
                        success: function (res) {
                            if (res && res.status == 1) {
                                GlobalUtil.tipMsg("提示", "操作成功");
                                permissionListStore.reload();
                                Ext.getCmp("authWindowId").hide();
                            } else {
                                Ext.MessageBox.alert("提示", "操作失败");
                            }
                        },
                        failure: function (response) {
                            Ext.MessageBox.alert("提示", "操作失败");
                        }
                    });
                }
            }, {
                text: '取消',
                handler: function (v) {
                    Ext.getCmp("authWindowId").hide();
                }
            }]
        })]
});

function contains(arr, val) {
    for (var i = 0; i < arr.length; i++) {
        if (arr[i] == val)return true;
    }
    return false;
}

function loadUserPermission(gid) {
    Ext.data.JsonP.request({
        url: URLS.USER.USER_PERMISSION,
        params: {
            gid: gid,
            uid: userAuthWindow.uid
        },
        callbackKey: 'function',
        // scope: 'this',
        success: function (res) {
            if (res && res.status == 1) {
                var selectedData = res.data;
                if (!selectedData) {
                    return;
                }
                var datas = permissionListStore.getRange();
                var indexArr = [];
                for (var i = 0; i < datas.length; i++) {
                    if (contains(selectedData, datas[i].get("name"))) {
                        indexArr.push(datas[i]);
                    }
                }
                var selModel = Ext.getCmp("permissionGridId").getSelectionModel();
                selModel.select(indexArr);
                Ext.getCmp("addSubmitBtn").enable();
            } else {
                Ext.MessageBox.alert("提示", "获取权限数据失败");
                Ext.getCmp("addSubmitBtn").disable();
            }
        },
        failure: function (response) {
            Ext.MessageBox.alert("提示", "获取权限数据失败");
            Ext.getCmp("addSubmitBtn").disable();
        }
    });
}

function updateAuth(uid) {
    userAuthWindow.uid = uid;
    Ext.getCmp("authWindowId").show();
    Ext.getCmp("addSubmitBtn").enable();
    Ext.getCmp("permissionGridId").getSelectionModel().deselectAll();
    loadUserPermission(Ext.getCmp("gameCombo").getValue());
}
function addemail(data) {
    Ext.getCmp("addemailForm").getForm().reset();
    Ext.getCmp("addemailForm").url = URLS.USER.ADD_Email;
    Ext.getCmp("addemailForm").operate = "添加";
    if (data.email ==null||data.email ==""){
        Ext.getCmp("addemailForm").getForm().setValues(data);
        addemailWindow.show();
    }else {
        alert(data.email);
    }

}

var addemailWindow = new Ext.Window({
    title: "绑定邮箱",
    width: 300,
    height: 200,
    resizable: true,
    modal: true,
    autoShow: false,
    closable: false,
    layout: 'fit',
    listeners: {
        beforeshow: function (_this, eOpts) {
            Ext.getCmp("addemailSubmitBtn").enable();
        }
    },
    items: [
        new Ext.form.Panel({
                id: "addemailForm",
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
                        name: "uid"
                    }, {
                        id: "nameField",
                        xtype: "textfield",
                        fieldLabel: "邮箱",
                        name: "email",
                        allowBlank: false
                    }],
                listeners: {
                    beforeaction: function (_this, action, eOpts) {
                        Ext.data.JsonP.request({
                            params: _this.getValues(), // values from form fields..
                            url: Ext.getCmp("addemailForm").url,
                            callbackKey: 'function',
                            scope: 'this',
                            success: function (res) {
                                console.log(res);
                                if (res && res.status == 1) {
                                    GlobalUtil.tipMsg("提示", Ext.getCmp("addemailForm").operate + "成功");
                                    userStore.reload();
                                    addemailWindow.hide();
                                    return;
                                }
                                top.Ext.MessageBox.alert("提示", Ext.getCmp("addemailForm").operate + "失败");
                            },
                            failure: function (response) {
                                top.Ext.MessageBox.alert("提示", Ext.getCmp("addemailForm").operate + "失败");
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
                        id: "addemailSubmitBtn",
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
