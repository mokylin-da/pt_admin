Ext.define('Ext.ux.form.VerifyCodeField', {
			extend : 'Ext.form.field.Text',
			alias : 'widget.verifyfield',
			inputTyle : 'verifyfield',
			imgUrl : "VerifyCode",
			isLoader : true,
			onRender : function(ct, position) {
				this.callParent(arguments);
				this.imgEl = ct.createChild({
							tag : 'img',
							src : Ext.BLANK_IMAGE_URL
						});
				this.el.applyStyles({
							'float' : "left"
						});
				this.imgEl.applyStyles({
							width : 73,
							height : 20,
							verticalAlign : "middle",
							cursor : "pointer",
							'float' : "left",
							marginLeft : 7
						});
				this.imgEl.on('click', this.loadCodeImg, this);
				if (this.isLoader)
					this.loadCodeImg();
			},
			alignErrorIcon : function() {
				this.errorIcon.alignTo(this.imgEl, 'tl-tr', [2, 0]);
			},
			loadCodeImg : function() {
				this.imgEl.set({
							src : this.imgUrl + '?t=' + Math.random()
						});
			}
		});