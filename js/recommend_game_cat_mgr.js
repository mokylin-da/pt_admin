Ext.onReady(function () {
    /**
     * 布局
     */
    new Ext.Viewport({
        layout: "fit",
        items: [
            Ext.create("Ext.moux.CommonConfigCat",{
                selectGid:PLATFORM_IDENTIFIER,
                configType:COMMON_CONFIG.RECOMMEND_GAME_TYPE
            })
        ],
        renderTo: Ext.getBody()
    });


});