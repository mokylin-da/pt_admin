Ext.onReady(function () {
    /**
     * 布局
     */
    new Ext.Viewport({
        layout: "fit",
        items: [
            Ext.create("Ext.moux.CommonConfigCat",{
                configType:COMMON_CONFIG.PIC_TURN_TYPE
            })
        ],
        renderTo: Ext.getBody()
    });


});