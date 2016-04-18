Ext.define("Ext.ux.form.QueryUserField", {
	requires : ['Ext.grid.Panel'],
	extend : "Ext.form.field.ComboBox",
	alias : "widget.queryuserfield",
	displayField : 'realname',
	valueField : 'id',
	fieldLabel : '用户姓名',
	typeAhead : false,
	triggerCls : 'searchUserIcon',
	queryMode : 'local',
	minChars : 0,
	obtainQueryWindow : function() {
		var extQueryCombox = this;
		var extUserStore = Ext.create("Ext.data.Store", {
					autoLoad : true,
					fields : ["id", "username", "realname", "email",
							"mobilePhone", "telPhone", "sex", "addTime",
							"lastLoginTime", "roles"],
					pageSize : DEFAULT_EACH_PAGE_DATA,
					proxy : {
						pageParam : "cloudContext.pageInfo.nowPage",
						limitParam : "cloudContext.pageInfo.eachPageData",
						type : "ajax",
						actionMethods : {
							read : 'POST'
						},
						url : "globalManager/global!queryUsers_.action",
						reader : {
							type : "json",
							root : "cloudContext.params.users",
							totalProperty : 'cloudContext.pageInfo.dataCount'
						}
					}
				});
		var queryWindow = new Ext.Window({
			layout : 'fit',
			resizable : false,
			draggable : false,
			width : 600,
			height : 400,
			closeAction : 'hide',
			title : '查询',
			modal : true,
			buttonAlign : 'right',
			border : true,
			items : [new Ext.grid.Panel({
				layout : "fit",
				selType : 'rowmodel',// 设置为单元格选择模式Ext.selection.RowModel
				autoScroll : true,
				store : extUserStore,
				loadMask : {
					msg : "正在加载数据,请稍等..."
				},
				columns : [Ext.create("Ext.grid.RowNumberer"), {
							text : "用户名",
							flex : 1,
							dataIndex : "username"
						}, {
							header : "姓名",
							flex : 1,
							dataIndex : "realname"
						}, {
							header : "性别",
							flex : 0.5,
							dataIndex : "sex",
							renderer : function(value) {
								return value == "1" ? "男" : "女";
							}
						}, {
							text : "手机",
							flex : 1,
							dataIndex : "mobilePhone"
						}, {
							text : "邮箱",
							flex : 1,
							dataIndex : "email"
						}],
				dockedItems : [{
					xtype : "pagingtoolbar",
					store : extUserStore,
					dock : "bottom",
					displayInfo : true,
					items : ['-', '&nbsp;&nbsp;', new Ext.form.field.ComboBox({
						id : 'pagesize_combo',
						hiddenName : 'pagesize',
						typeAhead : true,
						triggerAction : 'all',
						lazyRender : true,
						queryMode : 'local',
						store : new Ext.data.ArrayStore({
									fields : ['value', 'text'],
									data : [[20, '20条/页'], [40, '40条/页'],
											[60, '60条/页'], [80, '80条/页'],
											[100, '100条/页']]
								}),
						valueField : 'value',
						displayField : 'text',
						value : DEFAULT_EACH_PAGE_DATA,
						editable : false,
						width : 85,
						listeners : {
							"select" : function(comboBox) {
								var pageSize = parseInt(comboBox.getValue());
								extUserStore.pageSize = pageSize;
								extUserStore.currentPage = 1;
								extUserStore.load();
							}
						}
					})]
				}, {
					xtype : "toolbar",
					style : 'border-width:1px 0px 1px 1px;background-image: none',
					items : [{
								xtype : "textfield",
								fieldLabel : '用户名',
								name : 'searchUserName',
								id : "searchUserNameId",
								width : 150,
								labelWidth : 50
							}, {
								xtype : 'combobox',
								name : 'searchRole',
								id : 'searchRoleId',
								autoSelect : true,
								fieldLabel : '角色',
								triggerAction : 'all',// 单击触发按钮显示全部数据
								store : Ext.create("Ext.data.Store", {
											fields : ["id", "name"],
											data : [],
											autoLoad : true
										}),// 设置数据源
								displayField : 'name',// 定义要显示的字段
								valueField : 'id',// 定义值字段
								queryMode : 'local',// 可以取消loading加载框
								forceSelection : false,
								editable : false,
								typeAhead : true,
								width : 150,
								labelWidth : 40,
								listeners : {
									beforerender : function() {
										this.store
												.loadData(extQueryCombox.ckExtJsonDatas.cloudContext.params.roles);
										this.store.insert(0, {
													id : "",
													name : "--请选择--"
												});
										this.setValue('');
									}
								}
							}, {
								xtype : 'combobox',
								name : 'searchSex',
								id : 'searchSexId',
								autoSelect : true,
								fieldLabel : '性别',
								triggerAction : 'all',// 单击触发按钮显示全部数据
								store : Ext.create('Ext.data.Store', {
											fields : ['id', 'text'],
											data : [{
														id : '',
														text : '--请选择--'
													}, {
														id : '1',
														text : '男'
													}, {
														id : '0',
														text : '女'
													}]
										}),// 设置数据源
								displayField : 'text',// 定义要显示的字段
								valueField : 'id',// 定义值字段
								queryMode : 'local',// 可以取消loading加载框
								editable : false,
								typeAhead : true,
								forceSelection : true,
								value : '',
								width : 150,
								labelWidth : 40
							}]
				}, {
					xtype : "toolbar",
					style : 'border-width:0px 1px 1px 1px;background-image: none',
					items : [{
								xtype : "textfield",
								fieldLabel : '姓名',
								name : 'searchRealName',
								id : "searchRealNameId",
								width : 150,
								labelWidth : 50
							}, {
								xtype : "textfield",
								fieldLabel : '邮箱',
								name : 'searchEmail',
								id : "searchEmailId",
								width : 150,
								labelWidth : 40
							}, {
								xtype : "textfield",
								fieldLabel : '手机',
								name : 'searchMobilePhoneName',
								id : "searchMobilePhoneId",
								width : 150,
								labelWidth : 40
							}, "-", {
								text : "搜索",
								icon : "extjs/resources/icons/zoom.png",
								handler : function() {
									ckExtQueryUser();
								}
							}, {
								text : "重置",
								icon : "extjs/resources/icons/arrow_rotate_anticlockwise.png",
								handler : function() {
									Ext.getCmp('searchUserNameId').setValue('');
									Ext.getCmp('searchRoleId').setValue('');
									Ext.getCmp('searchSexId').setValue('');
									Ext.getCmp('searchEmailId').setValue('');
									Ext.getCmp('searchMobilePhoneId')
											.setValue('');
									Ext.getCmp('searchRealNameId').setValue('');
								}
							}]
				}],
				listeners : {
					itemdblclick : function(v) {
						var rows = this.items.first().getSelectionModel()
								.getSelection();
//						alert(rows[0].get('id'));return;
						extQueryCombox.setValue(rows[0].get('id'));
						this.up().close();
					},
					beforerender : function(e) {
						ckExtQueryUser = function() {
							var params = {
								"cloudContext.params.username" : Ext
										.getCmp('searchUserNameId').getValue(),
								"cloudContext.params.realname" : Ext
										.getCmp('searchRealNameId').getValue(),
								"cloudContext.params.role" : Ext
										.getCmp('searchRoleId').getValue(),
								"cloudContext.params.sex" : Ext
										.getCmp('searchSexId').getValue(),
								"cloudContext.params.email" : Ext
										.getCmp('searchEmailId').getValue(),
								"cloudContext.params.mobilePhone" : Ext
										.getCmp('searchMobilePhoneId')
										.getValue()
							};
							e.store.proxy.extraParams = params;
							e.store.load();
						}
					}
				}
			})],
			buttons : [{
				text : '确定',
				id : 'button_save',
				iconCls : 'acceptIcon',
				handler : function(e) {
					var rows = e.up().up().items.first().getSelectionModel()
							.getSelection();
					extQueryCombox.setValue(rows[0].get('id'));
					this.up().up().close();
				}
			}, {
				text : '关闭',
				iconCls : 'deleteIcon',
				handler : function() {
					this.up().up().close();
				}
			}]
		});
		return queryWindow;
	},
	store : Ext.create('Ext.data.Store', {
				autoLoad : true,
				fields : ['id', 'realname'],
				autoDestroy : true,
				data : []
			}),
	listConfig : {
		loadingText : '查找中...',
		emptyText : '没有匹配的用户',
		getInnerTpl : function() {
			return '<a>{realname}</a>';
		}
	},
	ckExtJsonDatas : null,
	reloadData : function() {
		var self = this;
		var scriptResultDatas = null;
		CKGobal.ajax({
					url : 'globalManager/global!initQueryUsersPage_.action',
					async : false,
					success : function(response, options, resultJSON) {
						self.ckExtJsonDatas = resultJSON;
					}
				});
		jq.ajax({
					url : 'globalManager/global!generateUserJS_.action',
					async : false,
					success : function(v) {
						scriptResultDatas = v;
					}
				});
		eval(scriptResultDatas);
		ckExtAllUserStr = CKGobal.jsonToString(allUser);
		ckExtQueryResultDate = allUser;
		ckExtInitDataUser = allUser;
		this.store.removeAll();
		this.store.loadData(ckExtQueryResultDate);
		this.bindStore(this.store, false);
	},
	constructor : function(config) {
		this.callParent(arguments);
		this.initConfig(config);
		if (!Ext.isEmpty(config.id)) {
			this.id = config.id;
		}
		var self = this;
		CKGobal.ajax({
					url : 'globalManager/global!initQueryUsersPage_.action',
					async : false,
					success : function(response, options, resultJSON) {
						self.ckExtJsonDatas = resultJSON;
					}
				});
		var scriptResultDatas = null;
		jq.ajax({
					url : 'globalManager/global!generateUserJS_.action',
					async : false,
					success : function(v) {
						scriptResultDatas = v;
					}
				});
		eval(scriptResultDatas);
		ckExtAllUserStr = CKGobal.jsonToString(allUser);
		ckExtQueryResultDate = allUser;
		ckExtInitDataUser = allUser;
		this.store.loadData(ckExtQueryResultDate);
	},
	onTriggerClick : function() {
		var rawValue = this.getRawValue();
		this.setRawValue('');
		this.doRawQuery();
		this.setRawValue(rawValue);
		this.obtainQueryWindow().show();
	},
	listeners : {
		beforequery : function(e) {
			if (Ext.isEmpty(e.query)) {
				ckExtQueryResultDate = ckExtInitDataUser;
			} else {
				ckExtQueryResultDate = quickQueryUser(ckExtAllUserStr, e.query);
				if (ckExtQueryResultDate == null) {
					return;
				}
			}
			this.store.removeAll();
			this.store.loadData(ckExtQueryResultDate);
			this.bindStore(this.store, false);
			return true;
		},
		focus : function(e) {
			this.doRawQuery();
		}
	},
	validateValue : function(value) {
		var empty = false;
		var e = this;
		var realname = null;
		var recordIndex = e.store.findExact('realname',value);
		empty = (recordIndex==-1);
		if (!Ext.isEmpty(value) && empty) {
			e.markInvalid('此用户不存在！')
			return false;
		}
		if (!Ext.isEmpty(e.getErrors())) {
			e.markInvalid(e.getErrors()[0]);
			return false;
		};
		if(!Ext.isEmpty(value)){
			e.setValue(e.store.getAt(recordIndex).get('id'));
		}
		e.markInvalid();
		return true;
	},
	getStore : function() {
		return this.store;
	}
});
