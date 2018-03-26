"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var services_1 = require("vscode-base-languageclient/lib/services");
var MonacoWorkspace = /** @class */ (function () {
    function MonacoWorkspace(p2m, m2p, _rootUri) {
        if (_rootUri === void 0) { _rootUri = null; }
        var _this = this;
        this.p2m = p2m;
        this.m2p = m2p;
        this._rootUri = _rootUri;
        this.documents = new Map();
        this.onDidOpenTextDocumentEmitter = new services_1.Emitter();
        this.onDidCloseTextDocumentEmitter = new services_1.Emitter();
        this.onDidChangeTextDocumentEmitter = new services_1.Emitter();
        for (var _i = 0, _a = monaco.editor.getModels(); _i < _a.length; _i++) {
            var model = _a[_i];
            this.addModel(model);
        }
        monaco.editor.onDidCreateModel(function (model) { return _this.addModel(model); });
        monaco.editor.onWillDisposeModel(function (model) { return _this.removeModel(model); });
    }
    Object.defineProperty(MonacoWorkspace.prototype, "rootUri", {
        get: function () {
            return this._rootUri;
        },
        enumerable: true,
        configurable: true
    });
    MonacoWorkspace.prototype.removeModel = function (model) {
        var uri = model.uri.toString();
        var document = this.documents.get(uri);
        if (document) {
            this.documents.delete(uri);
            this.onDidCloseTextDocumentEmitter.fire(document);
        }
    };
    MonacoWorkspace.prototype.addModel = function (model) {
        var _this = this;
        var uri = model.uri.toString();
        var document = this.setModel(uri, model);
        this.onDidOpenTextDocumentEmitter.fire(document);
        model.onDidChangeContent(function (event) {
            return _this.onDidChangeContent(uri, model, event);
        });
    };
    MonacoWorkspace.prototype.onDidChangeContent = function (uri, model, event) {
        var textDocument = this.setModel(uri, model);
        var contentChanges = [];
        for (var _i = 0, _a = event.changes; _i < _a.length; _i++) {
            var change = _a[_i];
            var range = this.m2p.asRange(change.range);
            var rangeLength = change.rangeLength;
            var text = change.text;
            contentChanges.push({ range: range, rangeLength: rangeLength, text: text });
        }
        this.onDidChangeTextDocumentEmitter.fire({
            textDocument: textDocument,
            contentChanges: contentChanges
        });
    };
    MonacoWorkspace.prototype.setModel = function (uri, model) {
        var document = services_1.TextDocument.create(uri, model.getModeId(), model.getVersionId(), model.getValue());
        this.documents.set(uri, document);
        return document;
    };
    Object.defineProperty(MonacoWorkspace.prototype, "textDocuments", {
        get: function () {
            return Array.from(this.documents.values());
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(MonacoWorkspace.prototype, "onDidOpenTextDocument", {
        get: function () {
            return this.onDidOpenTextDocumentEmitter.event;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(MonacoWorkspace.prototype, "onDidCloseTextDocument", {
        get: function () {
            return this.onDidCloseTextDocumentEmitter.event;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(MonacoWorkspace.prototype, "onDidChangeTextDocument", {
        get: function () {
            return this.onDidChangeTextDocumentEmitter.event;
        },
        enumerable: true,
        configurable: true
    });
    MonacoWorkspace.prototype.applyEdit = function (workspaceEdit) {
        var edit = this.p2m.asWorkspaceEdit(workspaceEdit);
        // Collect all referenced models
        var models = edit.edits.reduce(function (acc, currentEdit) {
            acc[currentEdit.resource.toString()] = monaco.editor.getModel(currentEdit.resource);
            return acc;
        }, {});
        // If any of the models do not exist, refuse to apply the edit.
        if (!Object.keys(models).map(function (uri) { return models[uri]; }).every(function (model) { return !!model; })) {
            return Promise.resolve(false);
        }
        // Group edits by resource so we can batch them when applying
        var editsByResource = edit.edits.reduce(function (acc, currentEdit) {
            var uri = currentEdit.resource.toString();
            if (!(uri in acc)) {
                acc[uri] = [];
            }
            acc[uri].push(currentEdit);
            return acc;
        }, {});
        // Apply edits for each resource
        Object.keys(editsByResource).forEach(function (uri) {
            models[uri].pushEditOperations([], // Do not try and preserve editor selections.
            editsByResource[uri].map(function (resourceEdit) {
                return {
                    identifier: { major: 1, minor: 0 },
                    range: monaco.Range.lift(resourceEdit.range),
                    text: resourceEdit.newText,
                    forceMoveMarkers: true,
                };
            }), function () { return []; });
        });
        return Promise.resolve(true);
    };
    return MonacoWorkspace;
}());
exports.MonacoWorkspace = MonacoWorkspace;
//# sourceMappingURL=workspace.js.map