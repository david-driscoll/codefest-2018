"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var disposable_1 = require("./disposable");
var MonacoDiagnosticCollection = /** @class */ (function () {
    function MonacoDiagnosticCollection(name, p2m) {
        this.name = name;
        this.p2m = p2m;
        this.diagnostics = new Map();
        this.toDispose = new disposable_1.DisposableCollection();
    }
    MonacoDiagnosticCollection.prototype.dispose = function () {
        this.toDispose.dispose();
    };
    MonacoDiagnosticCollection.prototype.get = function (uri) {
        var diagnostics = this.diagnostics.get(uri);
        return !!diagnostics ? diagnostics.diagnostics : [];
    };
    MonacoDiagnosticCollection.prototype.set = function (uri, diagnostics) {
        var _this = this;
        var existing = this.diagnostics.get(uri);
        if (existing) {
            existing.diagnostics = diagnostics;
        }
        else {
            var modelDiagnostics_1 = new MonacoModelDiagnostics(uri, diagnostics, this.name, this.p2m);
            this.diagnostics.set(uri, modelDiagnostics_1);
            this.toDispose.push(disposable_1.Disposable.create(function () {
                _this.diagnostics.delete(uri);
                modelDiagnostics_1.dispose();
            }));
        }
    };
    return MonacoDiagnosticCollection;
}());
exports.MonacoDiagnosticCollection = MonacoDiagnosticCollection;
var MonacoModelDiagnostics = /** @class */ (function () {
    function MonacoModelDiagnostics(uri, diagnostics, owner, p2m) {
        var _this = this;
        this.owner = owner;
        this.p2m = p2m;
        this.uri = monaco.Uri.parse(uri);
        this.diagnostics = diagnostics;
        monaco.editor.onDidCreateModel(function (model) { return _this.doUpdateModelMarkers(model); });
    }
    Object.defineProperty(MonacoModelDiagnostics.prototype, "diagnostics", {
        get: function () {
            return this._diagnostics;
        },
        set: function (diagnostics) {
            var _this = this;
            this._diagnostics = diagnostics;
            this._markers = diagnostics.map(function (diagnostic) { return _this.p2m.asMarker(diagnostic); });
            this.updateModelMarkers();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(MonacoModelDiagnostics.prototype, "markers", {
        get: function () {
            return this._markers;
        },
        enumerable: true,
        configurable: true
    });
    MonacoModelDiagnostics.prototype.dispose = function () {
        this._markers = [];
        this.updateModelMarkers();
    };
    MonacoModelDiagnostics.prototype.updateModelMarkers = function () {
        var model = monaco.editor.getModel(this.uri);
        this.doUpdateModelMarkers(model);
    };
    MonacoModelDiagnostics.prototype.doUpdateModelMarkers = function (model) {
        if (model && this.uri.toString() === model.uri.toString()) {
            monaco.editor.setModelMarkers(model, this.owner, this._markers);
        }
    };
    return MonacoModelDiagnostics;
}());
exports.MonacoModelDiagnostics = MonacoModelDiagnostics;
//# sourceMappingURL=diagnostic-collection.js.map