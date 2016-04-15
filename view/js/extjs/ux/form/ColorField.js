/**
 * 文件颜色选择器 write by 谢国俊
 */
Ext.define('Ext.ux.form.ColorField', {
	extend : 'Ext.form.field.Trigger',
	alias : 'widget.colorfield',
	requires : ['Ext.form.field.VTypes', 'Ext.layout.component.field.Text'],
	errorText : "颜色格式必须为#XXXXXX，比如#FFFFFF",
	regex : /^#[0-9a-f]{6}$/i,
	constructor : function(config) {
		this.callParent(arguments);
		this.initConfig(config)
	},
	validateValue : function(value) {
		if (!this.getEl()) {
			return true;
		}
		if (!Ext.isEmpty(value) && !this.regex.test(value)) {
			this.markInvalid(Ext.String.format(this.errorText, value));
			return false;
		}
		this.markInvalid();
		this.setColor(value);
		return true;
	},
	markInvalid : function(msg) {
		Ext.ux.form.ColorField.superclass.markInvalid.call(this, msg);
		this.inputEl.setStyle({
			'background-image' : 'url(extjs/resources/themes/images/default/grid/invalid_line.gif)'
		});
	},
	setValue : function(hex) {
		if (Ext.isEmpty(hex)) {
			Ext.ux.form.ColorField.superclass.setValue.call(this, "");
			return;
		}
		var tmpVal = hex;
		if (!/^#.*/.test(hex)) {
			tmpVal = "#" + tmpVal;
		}
		Ext.ux.form.ColorField.superclass.setValue.call(this, tmpVal);
		this.setColor(tmpVal);
	},
	setColor : function(val) {
		Ext.ux.form.ColorField.superclass.setFieldStyle.call(this, {
					'color' : val,
					'background-image' : 'none'
				});
	},
	menuListeners : {
		select : function(m, d) {
			this.setValue(d);
		},
		show : function() {
			this.onFocus();
		},
		hide : function() {
			this.focus();
			var ml = this.menuListeners;
			this.menu.un("select", ml.select, this);
			this.menu.un("show", ml.show, this);
			this.menu.un("hide", ml.hide, this);
		}
	},
	onTriggerClick : function(e) {
		if (this.disabled) {
			return;
		}
		this.menu = new Ext.menu.ColorPicker({
					shadow : true,
					autoShow : true
				});
		this.menu.alignTo(this.inputEl, 'tl-bl?');
		this.menu.doLayout();

		this.menu.on(Ext.apply({}, this.menuListeners, {
					scope : this
				}));

		this.menu.show(this.inputEl);
	}
});