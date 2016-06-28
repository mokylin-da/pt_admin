Ext.define('Ext.ux.form.MoHtmlEditor', {

    alias: 'widget.mohtmleditor',

    extend: 'Ext.form.field.HtmlEditor',

    requires: ['Ext.form.field.HtmlEditor'],

    createToolbar: function () {
        var me = this;
        me.callParent(arguments);
        me.toolbar.insert(17, {
            xtype: 'button',
            icon: '/js/extjs/resources/icons/picture.png',
            text: 'image',
            handler: this.showImgUploader,
            scope: this
        });
        return me.toolbar;
    },

    showImgUploader: function () {
        var editor = this;
        var crossDomain = new CrossDomain();
        var uploadFields = {
            gid: PLATFORM_IDENTIFIER,
            file: {value: null, type: "file"}
        };
        crossDomain.init(URLS.MISC.FILE_UPLOAD, uploadFields, function (v) {
            var params = v.split(",");
            var status = parseInt(params[0]);
            if (!status || status != 1) {
                GlobalUtil.status(status);
                return;
            }
            var element = document.createElement('img');
            element.src = URLS.FILE_BASE + "/" + params[1];
            var vals = crossDomain.extraData;
            if (vals.width > 0 && vals.height > 0) {
                element.width = vals.width;
                element.height = vals.height;
            }
            if (Ext.isIE) {
                editor.insertAtCursor(element.outerHTML);
            } else {
                var selection = editor.win.getSelection();
                if (!selection.isCollapsed) {
                    selection.deleteFromDocument();
                }
                selection.getRangeAt(0).insertNode(element);
            }
            win.hide();
            crossDomain.clear();
        });


        var imgform = Ext.create('Ext.tab.Panel', {
            region: 'left',
            border: false,
            activeTab: 0,
            items: [{
                title: '本地图片',
                icon: '/js/extjs/resources/icons/picture.png',
                layout: 'fit',
                items: [{
                    xtype: 'form',
                    border: false,
                    bodyPadding: 10,
                    items: [{
                        xtype: 'filefield',
                        labelWidth: 70,
                        fieldLabel: '图片',
                        buttonText: '浏览',
                        name: 'pic',
                        allowBlank: false,
                        blankText: '文件不能为空',
                        anchor: '100%',
                        editable: false,
                        listeners: {
                            render: function (_this) {
                                crossDomain.fields.file.onchange = function () {
                                    var pic = crossDomain.fields.file.value;
                                    var fileext = pic.substring(pic.lastIndexOf('.'), pic.length).toLowerCase();
                                    if (pic != "" && fileext != '.jpg' && fileext != '.gif' && fileext != '.jpeg' && fileext != '.png' && fileext != '.bmp') {
                                        Ext.Msg.show({
                                            title: '提示',
                                            icon: 'ext-mb-error',
                                            width: 300,
                                            msg: '对不起，系统仅支持标准格式的照片，请调整格式后重新上传，谢谢 ！',
                                            buttons: Ext.MessageBox.OK
                                        });
                                        crossDomain.fields.file.value = "";
                                        _this.setRawValue("");
                                        return;
                                    }
                                    _this.setRawValue(crossDomain.fields.file.value);
                                };
                                _this.mon(_this.triggerWrap, {
                                    click: function () {
                                        _this.disable();
                                        crossDomain.fields.file.click();
                                        Ext.defer(function () {
                                            _this.enable();
                                        }, 100);//阻止原生的弹出窗口
                                    }
                                });
                            }
                        }
                    }, {
                        xtype: 'textfield',
                        labelWidth: 70,
                        fieldLabel: '标题',
                        name: 'title',
                        allowBlank: false,
                        blankText: '标题不能为空',
                        anchor: '100%'
                    }, {
                        layout: 'column',
                        border: false,
                        items: [{
                            //layout: 'form',
                            fieldLabel: '尺寸(宽x高)',
                            columnWidth: .55,
                            //width:50,
                            xtype: 'numberfield',
                            minValue: 0,
                            name: 'width'
                        }, {
                            columnWidth: .10,
                            xtype: 'label',
                            html: ' px'
                        }, {
                            //layout: 'form',
                            xtype: 'numberfield',
                            columnWidth: .25,
                            //width:50,
                            name: 'height'
                        }, {
                            columnWidth: .10,
                            xtype: 'label',
                            html: ' px'
                        }]
                    }],
                    dockedItems: [{
                        xtype: 'toolbar',
                        dock: 'bottom',
                        layout: {pack: 'end'},
                        items: [{
                            text: '上传',
                            formBind: true,
                            handler: function (obj) {
                                var f = obj.up('form');
                                if (!f.isValid()) {
                                    return;
                                }
                                crossDomain.extraData = f.getForm().getValues();
                                crossDomain.submit();
                            }
                        }, {
                            text: '取消',
                            handler: function () {
                                win.hide();
                            }
                        }]
                    }]
                }]
            }, {
                title: '远程图片',
                icon: '/js/extjs/resources/icons/image_link.png',
                layout: 'fit',
                items: [{
                    xtype: 'form',
                    border: false,
                    bodyPadding: 10,
                    items: [{
                        xtype: 'textfield',
                        vtype: 'url',
                        labelWidth: 70,
                        fieldLabel: '图片URL',
                        anchor: '100%',
                        name: 'pic',
                        allowBlank: false,
                        blankText: '图片URL不能为空'
                    }, {
                        layout: 'column',
                        border: false,
                        items: [{
                            //layout: 'form',
                            fieldLabel: '尺寸(宽x高)',
                            columnWidth: .55,
                            //width:50,
                            xtype: 'numberfield',
                            minValue: 0,
                            name: 'width'
                        }, {
                            columnWidth: .10,
                            xtype: 'label',
                            html: ' px'
                        }, {
                            //layout: 'form',
                            xtype: 'numberfield',
                            columnWidth: .25,
                            //width:50,
                            name: 'height'
                        }, {
                            columnWidth: .10,
                            xtype: 'label',
                            html: ' px'
                        }]
                    }],
                    dockedItems: [{
                        xtype: 'toolbar',
                        dock: 'bottom',
                        layout: {pack: 'end'},
                        border: false,
                        items: [{
                            text: '添加',
                            formBind: true,
                            handler: function (obj) {
                                var f = obj.up('form');
                                if (!f.isValid()) {
                                    return;
                                }
                                var vals = f.getForm().getValues();
                                var pic = vals.pic;
                                var fileext = pic.substring(pic.lastIndexOf('.'), pic.length).toLowerCase();
                                if (fileext != '.jpg' && fileext != '.gif' && fileext != '.jpeg' && fileext != '.png' && fileext != '.bmp') {
                                    f.items.items[0].setValue('');
                                    Ext.Msg.show({
                                        title: '提示',
                                        icon: 'ext-mb-error',
                                        width: 300,
                                        msg: '对不起，系统仅支持标准格式的照片，请调整格式后重新上传，谢谢 ！',
                                        buttons: Ext.MessageBox.OK
                                    });
                                    return;
                                }
                                var element = document.createElement('img');
                                element.src = pic;
                                if (vals.width > 0 && vals.height > 0) {
                                    element.width = vals.width;
                                    element.height = vals.height;
                                }
                                if (Ext.isIE) {
                                    editor.insertAtCursor(element.outerHTML);
                                } else {
                                    var selection = editor.win.getSelection();
                                    if (!selection.isCollapsed) {
                                        selection.deleteFromDocument();
                                    }
                                    selection.getRangeAt(0).insertNode(element);
                                }
                                win.hide();
                            }
                        }, {
                            text: '取消',
                            handler: function () {
                                win.hide();
                            }
                        }]
                    }]
                }]
            }]
        });
        var win = Ext.create('Ext.Window', {
            title: '插入图片',
            icon: '/js/extjs/resources/icons/picture_add.png',
            width: 400,
            height: 240,
            plain: true,
            modal: true,
            closeAction: 'hide',
            resizable: false,
            border: false,
            layout: 'fit',
            items: imgform
        });
        win.show(this);
    }

});