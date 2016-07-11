/**
 * @author Li Zhao
 * @since 2016/7/8
 */
Ext.define("Ext.moux.GameCombo", {
    extend:"Ext.form.ComboBox",
    alias : 'widget.gamecombo',
    triggerAction: 'all',
    forceSelection: true,
    editable: true,
    fieldLabel: '游戏名称',
    name: 'gid',
    displayField: 'gname',
    valueField: 'gid',
    queryMode: 'local',
    emptyText: "输入游戏名称",
    typeAhead: false,
    /**
     * 额外的选项，如：官网管理平台选项
     */
    extraItems:[],
    initComponent: function () {
        var _this = this
        this.store = Ext.create('Ext.data.Store', {
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
            listeners:{
                load:function(_t, records, successful, eOpts){
                    var eitems = _this.extraItems;
                    if(eitems){
                        _t.add(eitems);
                    }
                }
            }
        });
        this.callParent(arguments);
    }
});