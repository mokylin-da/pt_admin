/**
 ****************************************** Ext扩展
 */

Ext.ns("Ext.ux.renderer");
Ext.ux.renderer.ComboRenderer = function (combo) {
    return function (value) {
        var record = combo.findRecord(combo.valueField, value);
        return record ? record.get(combo.displayField) : combo.valueNotFoundText;
    };
};

var EB = window.EB || {};
EB.required = '<span style="color:red;font-weight:bold" data-qtip="Required">*</span>';

// 自定义vtype
// 验证数字 vtype: 'Number'
Ext.apply(Ext.form.field.VTypes, {
    Number: function (v) {
        return /^[1-9]\d*$/.test(v);
    },
    NumberText: '数字格式不对',
    NumberMask: /[\d]/i
});

// 验证电话号码 vtype: 'Phone'
Ext.apply(Ext.form.field.VTypes, {
    Phone: function (v) {
        return /^(\d{3,4}-)?\d{7,8}$/.test(v);
    },
    PhoneText: '电话号码格式不对',
    PhoneMask: /[\d-]/i
});

// 验证手机号码 vtype: 'Mobile'
Ext.apply(Ext.form.field.VTypes, {
    Mobile: function (v) {
        return /^0?(1[3458][0-9]{9})$/.test(v);
    },
    MobileText: '手机号码格式不对',
    MobileMask: /[\d]/i
});

/**
 * 处理Grid重新加载过后selectionModel中的记录不更新的问题
 * me.selected中存放的是选中的记录的集合
 */
Ext.override(Ext.selection.Model, {
    onStoreLoad: function (store, records, successful, eOpts) {
        var me = this,
            length = me.selected.getCount();

        //如果没有选中的记录，则不需要进行任何的操作
        if (length === 0)return;

        //遍历selected并更新其中的记录
        me.selected.eachKey(function (key, item) {

            var model = store.getById(key);

            //如果获取到了model就更新，否则从selected中移除
            if (model) {
                me.selected.add(model);//add时会覆盖掉原来的值
            } else {
                me.selected.removeAtKey(key);
            }
        })

    }
});

/**
 ****************************************** Mokylin通用函数、方法和类
 */

var Mokylin = window.Mokylin || {};

/**
 * 静态数据共用类
 */

Mokylin.localData = function (obj) {
    this.obj = obj;
};

Mokylin.localData.prototype = {
    getData: function (k) {
        var data = '',
            store = [],
            obj = this.obj;

        if (k) {
            data = obj[k] ? obj[k] : data;
        } else {
            for (var p in obj) {
                store.push([p, obj[p]]);
            }
            data = store;
        }
        return data;
    },
    getStore: function (insertAll) {
        var arr = this.getData();
        insertAll && arr.unshift(["null", "全部"]);
        return arr;
    }
};


/**
 * 通用函数
 */

Mokylin.Common = {

    /*
     ****************************
     * 1.基础逻辑、算法通用组件的定义
     *****************************
     */

    /**
     * 判断所给数据是否为没有意义的”空“数据
     * @param obj
     * @returns {boolean}
     */
    isEmptyData: function (obj) {
        return obj === "null" || obj === "0" || obj === " " || obj === "" || obj === 0 || obj === null;
    },

    /**
     * 数组移位算法
     * @param arr {Array} 要计算的数组
     * @param form {Number}
     * @param to {Number}
     */
    changeArrPos: function (arr, form, to) {
        var temp, i,
            step = form - to;
        if (step === 1 || step === -1 || step === 0) {
            return;
        }
        if (step < 0) {
            temp = arr[to - 1];
            arr[to - 1] = arr[form];
            for (i = form; i < to - 2; i++) {
                arr[i] = arr[i + 1]
            }
            arr[to - 2] = temp;

        } else {
            temp = arr[form];
            for (i = form; i > to; i--) {
                arr[i] = arr[i - 1];
            }
            arr[to] = temp;
        }
    },

    /**
     * 根据一个数组某一字段的值来排序别一数组
     * @param sortArr {Array} 要排序的数组
     * @param byArr {Array} 依据的数组
     * @param type {String} 依据的字段
     * @returns {Array}
     */
    sortArrByArr: function (sortArr, byArr, type) {
        var newArr = [];
        for (var i = 0, j = byArr.length; i < j; i++) {
            for (var m = 0, n = sortArr.length; m < n; m++) {
                if (byArr[i] === sortArr[m][type]) {
                    newArr.push(sortArr[m]);
                }
            }
        }
        return newArr;
    },

    /**
     * 判断一个数组内的元素是否全相等
     * @param arr {Array}
     * @returns {boolean}
     */
    isArrAllEqual: function (arr) {
        var len = arr.length,
            first = arr[0];
        for (var i = 1; i < len; i++) {
            if (first != arr[i]) {
                return false;
            }
        }
        return true;
    },

    /**
     * 判断数据中是包含有空数据
     * @param arr {Array}
     * @returns {boolean}
     */
    hasEmpytData: function (arr) {
        var len = arr.length;
        for (var i = 0; i < len; i++) {
            if (this.isEmptyData(arr[i])) {
                return false
            }
        }
        return true;
    },

    /**
     * 判断对象的属性是否都为没有意思的空数据
     * @param obj {Object}
     * @returns {boolean}
     */
    isEmptyObj: function (obj) {
        var flag = true;
        for (var key in obj) {
            if (obj.hasOwnProperty(key) && !this.isEmptyData(obj[key])) {
                flag = false;
            }
        }
        return flag;
    },

    /**
     * 格式批对象成可查询的字符串
     * @param obj
     * @returns {string}
     */
    parseParam: function (obj) {
        var str = '';
        for (var key in obj) {
            if (obj.hasOwnProperty(key)) {
                str += '&' + key + '=' + encodeURIComponent(obj[key]);
            }
        }
        str = str.substr(1);
        return str;
    },

    /**
     * 操作提示信息 tip message
     * @param title {String}
     * @param format
     */
    tipMsg: function (title, format) {
        var msgCt;
        if (!msgCt) {
            msgCt = Ext.DomHelper.insertFirst(document.body, {id: 'msg-div'}, true);
        }
        var s = Ext.String.format.apply(String, Array.prototype.slice.call(arguments, 1));
        var m = Ext.DomHelper.append(msgCt, '<div class="msg"><h3>' + title + '</h3><p>' + s + '</p></div>', true);
        m.hide();
        m.slideIn('t').ghost("t", { delay: 1000, remove: true});
    },


    /**
     *
     * @param data              返回数据data对象
     * @param win               要关闭窗口变量
     * @param gird  {String}    刷新表格id
     * @param flag              是否要关闭窗口
     */
    tipMsgIsCloseWindow: function (data, win, gird, flag) {
        Mokylin.Common.tipMsg('操作成功', data.msg);
        flag ? win.close() : console.log('不关闭窗口');
        this.getGridObj(gird).getStore().load();
    },

    /**
     * 通用表格toolbar操作响应
     * @param options {Object} 传参
     *  options.url {String} 响应路径
     *  options.params {Object} post数据
     *  options.successCall {Function} 返回成功后要制行的代码
     *  options.successTipMsg {String} 返回成功后的提示信息
     * @returns {Function}
     */
    doAction: function (options) {
        var root = this,
            defaults = {
                url: '/assets/js/order/data/orderList.json',
                params: {},
                successCall: function () {
                },
                failureCall: function () {
                },
                commonCall: function () {
                },
                successTipMsg: '订单操作成功'
            };
        //参数合并
        options = Ext.apply(defaults, options);

        return function (btn) {
            //点击”取消“，则返回，不做任何处理
            if (btn != 'yes') return;

            Ext.Ajax.request({
                url: options.url,
                method: options.method,
                params: options.params,
                success: function (response) {
                    var data = Ext.decode(response.responseText);
                    if (data.success) {
                        root.tipMsg('操作成功', options.successTipMsg);
                        options.successCall(data);
                    } else {
                        options.failureCall();
                        Ext.Msg.show({
                            title: '错误',
                            msg: data.msg,
                            buttons: Ext.Msg.YES,
                            icon: Ext.Msg.WARNING
                        });
                    }
                    options.commonCall();
                },
                failure: function () {
                    options.failureCall();
                    Ext.Msg.show({
                        title: '错误',
                        msg: '服务器错误，请重新提交!',
                        buttons: Ext.Msg.YES,
                        icon: Ext.Msg.WARNING
                    });
                    options.commonCall();
                }
            })
        }
    },

    /**
     * 弹出至少选择一项警告
     * @param msg {String} 弹出的消息
     */
    showGridSelErr: function (msg) {
        Ext.Msg.alert({
            title: '警告！',
            msg: msg,
            icon: Ext.Msg.WARNING,
            buttons: Ext.Msg.YES
        });
    },

    /**
     * 通用表格默认无数据时的显示内容
     * @param text {String}
     * @returns {{}}
     */
    getEmptyText: function (text) {
        var obj = {};
        text = text || "没有数据";
        obj['emptyText'] = '<div style="text-align:center;padding:10px;color:#F00">' + text + '</div>';
        return obj;
    },

    /*
     **************************************************************
     * 2.表格操作通用接口,不涉及具体的表格操作，只做抽象
     **************************************************************
     */

    /**
     * 根据表格id获取表格对象
     * @param gridId {String/Object} 表格id或表格对象
     * @returns {Object}
     */
    getGridObj: function (gridId) {
        gridId = typeof gridId === 'object' ? gridId : Ext.getCmp(gridId);
        return gridId;
    },

    /**
     * 跟据表格id选出所有选中项的id字段，组成数组，并返回
     * @param gridId {String/Object} 表格id或表格对象
     * @returns {Array}  表格选中项的唯一字段组成的数组，如[1,2,3,4]
     */
    getGridSelsId: function (gridId) {
        return this.getGridSels(gridId, "id");
    },

    /**
     * 跟据表格id选出所有选中项的某一字段组成数组，并返回
     * @param gridId {String/Object} 表格id或表格对象
     * @param type {String} 字段名
     * @returns {Array}
     */
    getGridSels: function (gridId, type) {
        var arr = [],
            sels = this.getGridObj(gridId).getSelectionModel().selected.items;


        Ext.each(sels, function (sel, index, sels) {
            arr.push(sel.get(type));
        });
        return arr;
    },

    /**
     * 根据表格id取消表格选中的项
     * @param gridId {String/Object} 表格id或表格对象
     */
    removeGridSel: function (gridId) {
        this.getGridObj(gridId).getSelectionModel().clearSelections();
    },

    /**
     * 判断表格的选中项是否为单项
     * @param gridId {String/Object} 表格id或表格对象
     * @returns {boolean}
     */
    isGridSingleSel: function (gridId) {
        return this.getGridObj(gridId).getSelectionModel().getSelection().length === 1;
    },

    /**
     * 判断选取表格是否有选择项
     * @param gridId {String/Object} 表格id或表格对象
     * @returns {boolean}
     */
    isGridSel: function (gridId) {
        return this.getGridObj(gridId).getSelectionModel().getSelection().length > 0;
    },

    /**
     * 做操作前，检查表格是否有选择项，并弹出提示
     * @param gridId {String/Object} 表格id或表格对象
     * @param msg {String} 没有选中项时的提示信息
     * @returns {boolean}
     */
    checkGridSel: function (gridId, msg) {
        msg = msg || '请至少在表格中选择一项';
        if (!this.isGridSel(gridId)) {
            this.showGridSelErr(msg);
            return false;
        }
        return true;
    },

    /**
     * 重载表格数据,可跟据某一表单搜索数据来重载
     * @param gridId {String/Object} 表格id或表格对象
     * @param formId {String} 表单id,若无，则可传入false
     * @param isRetSel {boolean} 是否取消之前gird中的选择项
     */
    reLoadGird: function (gridId, formId, isRetSel) {
        if (!!formId) {
//            this.getGridObj(gridId).getStore().loadPage(1, {
//                params: Ext.getCmp(formId).getValues()
//            });
            this.getGridObj(gridId).getStore().reload({
                params: Ext.getCmp(formId).getValues()
            });
        } else {
            this.getGridObj(gridId).getStore().reload();
        }

        isRetSel && this.removeGridSel(gridId);
    },

    /**
     * 表格表头根据dataIndex字段排序
     * @param gridColumns {String/Object} 表头数组或表格对象
     * @param byArr {Array} 排序依据的数组
     * @returns {Array}
     */
    sortGridHead: function (gridColumns, byArr) {
        if (!Ext.isArray(gridColumns)) {
            gridColumns = gridColumns.columns;
            for (var i = 0, j = gridColumns.length; i < j; i++) {
                gridColumns[i] = gridColumns[i]['initialConfig'];
            }
        }
        return this.sortArrByArr(gridColumns, byArr, 'dataIndex');
    },

    /**
     * 根据表头的详细数组生成某一字段的新简单数组
     * @param columns {Array} 详数组
     * @param type {String} 要截取的字段
     * @returns {Array} 返回的简单数组
     */
    getGridHead: function (columns, type) {
        var arr = [];
        Ext.each(columns, function (col, index, cols) {
            arr.push(col[type]);
        });
        return arr;
    },

    /**
     * 跟据html5 localStorage 或服务器获取表格列的顺序的数组
     * @param gridId {String/Object} 表格id或表格对象
     * @param dataName {String} 名字
     * @param url {String} 数组路径
     * @returns {Array}
     */
    getGridColumnData: function (gridId, url, dataName) {
        var localColumns,
            modelFields = null,
            columns = null;
        dataName = dataName || 'pending';

        if (typeof gridId === 'object') {
            gridId = gridId.getId() || gridId.getItemId();
        }

        if (window.localStorage) {
            //localColumns = window.localStorage[gridId];
            localColumns = localStorage.getItem(gridId + dataName);
        }

        if (localColumns && localColumns.length > 0) {
            //尝试读localStorage的表列排序列数据
            columns = localColumns;
        }

        columns = Ext.JSON.decode(columns);

        //还没有表列排序列数据，就返回false
        if (!columns || columns.length < 1) {
            columns = false;
        }
        return columns;
    },

    /**
     * 保存表格列的顺序
     * @param columns {Array} 表头数组
     * @param fromIdx {Number}
     * @param toIdx {Number}
     * @param url {String}
     * @param gridId {String/Object} 表格id或对象，用来做为存储时的名字
     * @param dataName {String} 用来做为存储时的名字
     */
    saveGridColumnsData: function (columns, fromIdx, toIdx, url, gridId, dataName) {
        dataName = dataName || 'pending';
        //获取表格对应的列排序数据
        columns = this.getGridHead(columns, 'dataIndex');

        if (typeof gridId === 'object') {
            gridId = gridId.getId() || gridId.getItemId();
        }

        //本地localStorage存一份列排序数组
        if (window.localStorage) {
            columns = Ext.JSON.encode(columns);
            localStorage.removeItem(gridId + dataName);
            localStorage.setItem(gridId + dataName, columns);
        }
    },

    /**
     * 通用修改store地址
     * @param reg {Object} 正则对象
     * @returns {Function}
     */
    changeStoreUrl: function (reg) {
        return function (store, fld) {
            store.getProxy().url = store.getProxy().url.replace(reg, '/' + fld);
        }
    },
    /**
     * 通用插入“全部”
     */
    comInsertNull: function (store) {
        store.insert(0, { name: '全部', id: null });
    },

    /**
     * 提交表单
     * @param form {Form}
     * @param options {Object} 选择项
     *  options.url {String} 接收表单的URL
     *  options.successMsg {String} 表单提交成功后的提示
     * @param callback {Function} 提交成功后回调方法
     */
    submitForm: function (form, options, callback) {

        var defaults = {
                url: '',
                successMsg: '保存成功'
            },
            root = this;

        options = Ext.apply(defaults, options);

        if (form.isValid()) {
            form.submit({
                url: options.url,
                submitEmptyText: false,
                waitMsg: '保存中...',
                success: function (form, action) {
                    var data = Ext.JSON.decode(action.response.responseText);
                    if (data.success) {
                        root.tipMsg('系统提示', options.successMsg);
                        callback();
                    } else {
                        Ext.MessageBox.show({
                            title: '系统提示',
                            msg: data.msg,
                            buttons: Ext.MessageBox.OK,
                            icon: 'x-message-box-warning'
                        });
                    }
                },
                failure: function (form, action) {
                    try {
                        var data = Ext.JSON.decode(action.response.responseText);
                        Ext.MessageBox.show({
                            title: '系统提示',
                            msg: data.msg,
                            buttons: Ext.MessageBox.OK,
                            icon: 'x-message-box-warning'
                        });
                    } catch (e) {
                        Ext.MessageBox.show({
                            title: '系统提示',
                            msg: '服务器错误',
                            buttons: Ext.MessageBox.OK,
                            icon: 'x-message-box-error'
                        });
                    }
                }
            });
        }
    },
    /**
     * 创建下拉列表框Store
     * @param url
     * @param insertAll {Boolean} 是否插入”全部“选择项 可选 默认值为false
     * @param fields {Array} 模型的字段 可选 默认为 ['id', 'name']
     * @returns store
     */
    createComboStore: function (url, insertAll, fields) {
        var comboStore = new Ext.data.Store({
                singleton: true,
                proxy: {
                    type: 'ajax',
                    url: url,
                    actionMethods: 'get',
                    reader: {
                        type: 'json',
                        root: 'data.list'
                    }
                },
                fields: fields || ['id', 'name'],
                autoLoad: false
            }),
            options = {};

        if (insertAll) {
            options = {
                callback: function () {
                    comboStore.insert(0, { name: '全部', id: null });
                }
            };
        }
        comboStore.load(options);

        return comboStore;
    },

    /**
     * 在提交表单前对表单进行栓正，不通过则弹出题示信息
     * @param formId {String/Object} 表单对象或id
     * @param callback {Function} 回调函数
     * @param msg {String} 题示内容
     */
    doFormCheck: function (formId, callback, msg) {
        msg = msg || '请在表单中输入正确的信息';
        var form = formId.isComponent ? formId : Ext.getCmp(formId);
        if (formId.isValid()) {
            callback && callback();
        } else {
            Ext.MessageBox.show({
                title: '警告',
                msg: msg,
                buttons: Ext.MessageBox.OK,
                icon: 'x-message-box-error'
            });
        }
    },
    /**
     * 公共查询
     * @param gridId {String} 表格id
     * @param formId {String} 表单id
     * @param isRetSel {boolean} 是否取消之前gird中的选择项
     */
    doSearch: function (gridId, formId, isRetSel) {
        var store = Ext.getCmp(gridId).getStore();
        store.getProxy().extraParams = Ext.getCmp(formId).getValues();
        store.loadPage(1);
        isRetSel && this.removeGridSel(gridId);
    },
    /**
     * 输入框绑定键盘事件
     * @param El            输入框的dom对象
     * @param key           绑定键值  例如：enter键 Ext.EventObject.ENTER
     * @param fn            触发函数
     */
    bindEvent: function (El, key,fn) {
        var scope = Ext.get(El);
        scope.addKeyMap({
            key: key,
            fn: fn,
            ctrl: false,
            scope: scope
        });
    }
};


Ext.Ajax.on('requestexception', function (conn, response, options) {
    var data, msg;
    if (!!response.responseText) {
        data = Ext.decode(response.responseText);
    }
    if (response.status == "999") {
        Ext.Msg.alert('提示', '会话超时，请重新登录!', function () {
            window.location.href = '/login.html';
        });
    } else if (response.status == "998") {
        msg = data.msg || '您没有权限!';
        Ext.Msg.alert('提示', msg);
    } else if (response.status == "997") {
        msg = data.msg || '服务器错误!';
        Ext.Msg.alert('提示', msg);
    }
});