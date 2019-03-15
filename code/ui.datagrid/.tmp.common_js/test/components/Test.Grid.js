"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var React = require("react");
var rxjs_1 = require("rxjs");
var operators_1 = require("rxjs/operators");
var common_1 = require("./common");
var Editor_1 = require("../../src/components/Editor");
var render = require("../../src/components/Grid.render");
var Test_Editor_1 = require("./Test.Editor");
var createColumns = function (length) {
    return Array.from({ length: length }).map(function () {
        return {
            renderer: render.MY_CELL,
            editor: Editor_1.Editor,
        };
    });
};
var Test = (function (_super) {
    tslib_1.__extends(Test, _super);
    function Test() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.state = {};
        _this.state$ = new rxjs_1.Subject();
        _this.unmounted$ = new rxjs_1.Subject();
        _this.events$ = new rxjs_1.Subject();
        _this.gridRef = function (ref) { return (_this.grid = ref); };
        _this.factory = function (req) {
            switch (req.type) {
                case 'EDITOR':
                    return React.createElement(Test_Editor_1.TestEditor, null);
                default:
                    console.log("Factory type '" + req.type + "' not supported by test.");
                    return null;
            }
        };
        return _this;
    }
    Test.prototype.componentWillMount = function () {
        var _this = this;
        this.state$.pipe(operators_1.takeUntil(this.unmounted$)).subscribe(function (e) { return _this.setState(e); });
        var Table = this.Table;
        var settings = createSampleData({ Table: Table });
        this.state$.next({ settings: settings });
        render.registerAll(Table);
        var events$ = this.events$.pipe(operators_1.takeUntil(this.unmounted$));
        events$
            .pipe(operators_1.filter(function (e) { return e.type === 'GRID/EDITOR/end'; }), operators_1.map(function (e) { return e; }), operators_1.filter(function (e) { return !e.payload.isCancelled; }))
            .subscribe(function (e) {
            var settings = _this.state.settings;
            if (settings) {
                settings = tslib_1.__assign({}, settings);
                var _a = e.payload, row = _a.row, column = _a.column;
                var data = tslib_1.__assign({}, settings.data);
                data[row][column] = 'yo mama';
                settings.data = data;
            }
        });
        events$.subscribe(function (e) {
        });
    };
    Test.prototype.componentWillUnmount = function () {
        this.unmounted$.next();
    };
    Object.defineProperty(Test.prototype, "Table", {
        get: function () {
            var _a = this.props.Table, Table = _a === void 0 ? common_1.Handsontable : _a;
            return Table;
        },
        enumerable: true,
        configurable: true
    });
    Test.prototype.render = function () {
        return (React.createElement(common_1.datagrid.Grid, { ref: this.gridRef, settings: this.state.settings, "events$": this.events$, factory: this.factory, Handsontable: this.Table, style: this.props.style }));
    };
    return Test;
}(React.PureComponent));
exports.Test = Test;
function createEmptyData(rows, columns) {
    return Array.from({ length: rows }).map(function (row) { return Array.from({ length: columns }).map(function (col) { return ''; }); });
}
exports.createEmptyData = createEmptyData;
function createSampleData(args) {
    var data = createEmptyData(1000, 100);
    data[0][0] = 'A1';
    var settings = {
        data: data,
        columns: createColumns(100),
        beforeChange: function (changes, source) {
        },
        afterChange: function (e) {
        },
        afterScrollVertically: function () {
        },
    };
    return settings;
}
exports.createSampleData = createSampleData;
