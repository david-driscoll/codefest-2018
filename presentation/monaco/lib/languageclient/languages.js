"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/* --------------------------------------------------------------------------------------------
 * Copyright (c) 2017 TypeFox GmbH (http://www.typefox.io). All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */
var services_1 = require("vscode-base-languageclient/lib/services");
var diagnostic_collection_1 = require("./diagnostic-collection");
var disposable_1 = require("./disposable");
var globToRegExp = require('glob-to-regexp');
var MonacoModelIdentifier;
(function (MonacoModelIdentifier) {
    function fromDocument(document) {
        return {
            uri: monaco.Uri.parse(document.uri),
            languageId: document.languageId,
        };
    }
    MonacoModelIdentifier.fromDocument = fromDocument;
    function fromModel(model) {
        return {
            uri: model.uri,
            languageId: model.getModeId(),
        };
    }
    MonacoModelIdentifier.fromModel = fromModel;
})(MonacoModelIdentifier = exports.MonacoModelIdentifier || (exports.MonacoModelIdentifier = {}));
function testGlob(pattern, value) {
    var regExp = globToRegExp(pattern, {
        extended: true,
        globstar: true,
    });
    return regExp.test(value);
}
exports.testGlob = testGlob;
function getLanguages() {
    var languages = [];
    for (var _i = 0, _a = monaco.languages.getLanguages().map(function (l) { return l.id; }); _i < _a.length; _i++) {
        var language = _a[_i];
        if (languages.indexOf(language) === -1) {
            languages.push(language);
        }
    }
    return languages;
}
exports.getLanguages = getLanguages;
var MonacoLanguages = /** @class */ (function () {
    function MonacoLanguages(p2m, m2p) {
        this.p2m = p2m;
        this.m2p = m2p;
        this.completion = {
            completionItem: {
                snippetSupport: true,
            },
        };
    }
    MonacoLanguages.prototype.match = function (selector, document) {
        return this.matchModel(selector, MonacoModelIdentifier.fromDocument(document));
    };
    MonacoLanguages.prototype.createDiagnosticCollection = function (name) {
        return new diagnostic_collection_1.MonacoDiagnosticCollection(name || 'default', this.p2m);
    };
    MonacoLanguages.prototype.registerCompletionItemProvider = function (selector, provider) {
        var triggerCharacters = [];
        for (var _i = 2; _i < arguments.length; _i++) {
            triggerCharacters[_i - 2] = arguments[_i];
        }
        var completionProvider = this.createCompletionProvider.apply(this, [selector,
            provider].concat(triggerCharacters));
        var providers = new disposable_1.DisposableCollection();
        for (var _a = 0, _b = getLanguages(); _a < _b.length; _a++) {
            var language = _b[_a];
            providers.push(monaco.languages.registerCompletionItemProvider(language, completionProvider));
        }
        return providers;
    };
    MonacoLanguages.prototype.createCompletionProvider = function (selector, provider) {
        var _this = this;
        var triggerCharacters = [];
        for (var _i = 2; _i < arguments.length; _i++) {
            triggerCharacters[_i - 2] = arguments[_i];
        }
        return {
            triggerCharacters: triggerCharacters,
            provideCompletionItems: function (model, position, token) {
                if (!_this.matchModel(selector, MonacoModelIdentifier.fromModel(model))) {
                    return [];
                }
                var params = _this.m2p.asTextDocumentPositionParams(model, position);
                return provider
                    .provideCompletionItems(params, token)
                    .then(function (result) { return _this.p2m.asCompletionResult(result); });
            },
            resolveCompletionItem: provider.resolveCompletionItem
                ? function (item, token) {
                    var protocolItem = _this.m2p.asCompletionItem(item);
                    return provider.resolveCompletionItem(protocolItem, token).then(function (item) { return _this.p2m.asCompletionItem(item); });
                }
                : undefined,
        };
    };
    MonacoLanguages.prototype.registerHoverProvider = function (selector, provider) {
        var hoverProvider = this.createHoverProvider(selector, provider);
        var providers = new disposable_1.DisposableCollection();
        for (var _i = 0, _a = getLanguages(); _i < _a.length; _i++) {
            var language = _a[_i];
            providers.push(monaco.languages.registerHoverProvider(language, hoverProvider));
        }
        return providers;
    };
    MonacoLanguages.prototype.createHoverProvider = function (selector, provider) {
        var _this = this;
        return {
            provideHover: function (model, position, token) {
                if (!_this.matchModel(selector, MonacoModelIdentifier.fromModel(model))) {
                    return undefined;
                }
                var params = _this.m2p.asTextDocumentPositionParams(model, position);
                return provider
                    .provideHover(params, token)
                    .then(function (hover) { return _this.p2m.asHover(hover); });
            },
        };
    };
    MonacoLanguages.prototype.registerSignatureHelpProvider = function (selector, provider) {
        var triggerCharacters = [];
        for (var _i = 2; _i < arguments.length; _i++) {
            triggerCharacters[_i - 2] = arguments[_i];
        }
        var signatureHelpProvider = this.createSignatureHelpProvider.apply(this, [selector,
            provider].concat(triggerCharacters));
        var providers = new disposable_1.DisposableCollection();
        for (var _a = 0, _b = getLanguages(); _a < _b.length; _a++) {
            var language = _b[_a];
            providers.push(monaco.languages.registerSignatureHelpProvider(language, signatureHelpProvider));
        }
        return providers;
    };
    MonacoLanguages.prototype.createSignatureHelpProvider = function (selector, provider) {
        var _this = this;
        var triggerCharacters = [];
        for (var _i = 2; _i < arguments.length; _i++) {
            triggerCharacters[_i - 2] = arguments[_i];
        }
        var signatureHelpTriggerCharacters = triggerCharacters;
        return {
            signatureHelpTriggerCharacters: signatureHelpTriggerCharacters,
            provideSignatureHelp: function (model, position, token) {
                if (!_this.matchModel(selector, MonacoModelIdentifier.fromModel(model))) {
                    return undefined;
                }
                var params = _this.m2p.asTextDocumentPositionParams(model, position);
                return provider
                    .provideSignatureHelp(params, token)
                    .then(function (signatureHelp) { return _this.p2m.asSignatureHelp(signatureHelp); });
            },
        };
    };
    MonacoLanguages.prototype.registerDefinitionProvider = function (selector, provider) {
        var definitionProvider = this.createDefinitionProvider(selector, provider);
        var providers = new disposable_1.DisposableCollection();
        for (var _i = 0, _a = getLanguages(); _i < _a.length; _i++) {
            var language = _a[_i];
            providers.push(monaco.languages.registerDefinitionProvider(language, definitionProvider));
        }
        return providers;
    };
    MonacoLanguages.prototype.createDefinitionProvider = function (selector, provider) {
        var _this = this;
        return {
            provideDefinition: function (model, position, token) {
                if (!_this.matchModel(selector, MonacoModelIdentifier.fromModel(model))) {
                    return undefined;
                }
                var params = _this.m2p.asTextDocumentPositionParams(model, position);
                return provider
                    .provideDefinition(params, token)
                    .then(function (result) { return _this.p2m.asDefinitionResult(result); });
            },
        };
    };
    MonacoLanguages.prototype.registerReferenceProvider = function (selector, provider) {
        var referenceProvider = this.createReferenceProvider(selector, provider);
        var providers = new disposable_1.DisposableCollection();
        for (var _i = 0, _a = getLanguages(); _i < _a.length; _i++) {
            var language = _a[_i];
            providers.push(monaco.languages.registerReferenceProvider(language, referenceProvider));
        }
        return providers;
    };
    MonacoLanguages.prototype.createReferenceProvider = function (selector, provider) {
        var _this = this;
        return {
            provideReferences: function (model, position, context, token) {
                if (!_this.matchModel(selector, MonacoModelIdentifier.fromModel(model))) {
                    return [];
                }
                var params = _this.m2p.asReferenceParams(model, position, context);
                return provider
                    .provideReferences(params, token)
                    .then(function (result) { return _this.p2m.asReferences(result); });
            },
        };
    };
    MonacoLanguages.prototype.registerDocumentHighlightProvider = function (selector, provider) {
        var documentHighlightProvider = this.createDocumentHighlightProvider(selector, provider);
        var providers = new disposable_1.DisposableCollection();
        for (var _i = 0, _a = getLanguages(); _i < _a.length; _i++) {
            var language = _a[_i];
            providers.push(monaco.languages.registerDocumentHighlightProvider(language, documentHighlightProvider));
        }
        return providers;
    };
    MonacoLanguages.prototype.createDocumentHighlightProvider = function (selector, provider) {
        var _this = this;
        return {
            provideDocumentHighlights: function (model, position, token) {
                if (!_this.matchModel(selector, MonacoModelIdentifier.fromModel(model))) {
                    return [];
                }
                var params = _this.m2p.asTextDocumentPositionParams(model, position);
                return provider
                    .provideDocumentHighlights(params, token)
                    .then(function (result) { return _this.p2m.asDocumentHighlights(result); });
            },
        };
    };
    MonacoLanguages.prototype.registerDocumentSymbolProvider = function (selector, provider) {
        var documentSymbolProvider = this.createDocumentSymbolProvider(selector, provider);
        var providers = new disposable_1.DisposableCollection();
        for (var _i = 0, _a = getLanguages(); _i < _a.length; _i++) {
            var language = _a[_i];
            providers.push(monaco.languages.registerDocumentSymbolProvider(language, documentSymbolProvider));
        }
        return providers;
    };
    MonacoLanguages.prototype.createDocumentSymbolProvider = function (selector, provider) {
        var _this = this;
        return {
            provideDocumentSymbols: function (model, token) {
                if (!_this.matchModel(selector, MonacoModelIdentifier.fromModel(model))) {
                    return [];
                }
                var params = _this.m2p.asDocumentSymbolParams(model);
                return provider
                    .provideDocumentSymbols(params, token)
                    .then(function (result) { return _this.p2m.asSymbolInformations(result); });
            },
        };
    };
    MonacoLanguages.prototype.registerCodeActionsProvider = function (selector, provider) {
        var codeActionProvider = this.createCodeActionProvider(selector, provider);
        var providers = new disposable_1.DisposableCollection();
        for (var _i = 0, _a = getLanguages(); _i < _a.length; _i++) {
            var language = _a[_i];
            providers.push(monaco.languages.registerCodeActionProvider(language, codeActionProvider));
        }
        return providers;
    };
    MonacoLanguages.prototype.createCodeActionProvider = function (selector, provider) {
        var _this = this;
        return {
            provideCodeActions: function (model, range, context, token) {
                if (!_this.matchModel(selector, MonacoModelIdentifier.fromModel(model))) {
                    return [];
                }
                var params = _this.m2p.asCodeActionParams(model, range, context);
                return provider
                    .provideCodeActions(params, token)
                    .then(function (result) { return _this.p2m.asCommands(result); });
            },
        };
    };
    MonacoLanguages.prototype.registerCodeLensProvider = function (selector, provider) {
        var codeLensProvider = this.createCodeLensProvider(selector, provider);
        var providers = new disposable_1.DisposableCollection();
        for (var _i = 0, _a = getLanguages(); _i < _a.length; _i++) {
            var language = _a[_i];
            providers.push(monaco.languages.registerCodeLensProvider(language, codeLensProvider));
        }
        return providers;
    };
    MonacoLanguages.prototype.createCodeLensProvider = function (selector, provider) {
        var _this = this;
        return {
            provideCodeLenses: function (model, token) {
                if (!_this.matchModel(selector, MonacoModelIdentifier.fromModel(model))) {
                    return [];
                }
                var params = _this.m2p.asCodeLensParams(model);
                return provider
                    .provideCodeLenses(params, token)
                    .then(function (result) { return _this.p2m.asCodeLenses(result); });
            },
            resolveCodeLens: provider.resolveCodeLens
                ? function (model, codeLens, token) {
                    if (!_this.matchModel(selector, MonacoModelIdentifier.fromModel(model))) {
                        return codeLens;
                    }
                    var protocolCodeLens = _this.m2p.asCodeLens(codeLens);
                    return provider.resolveCodeLens(protocolCodeLens, token).then(function (result) { return _this.p2m.asCodeLens(result); });
                }
                : undefined,
        };
    };
    MonacoLanguages.prototype.registerDocumentFormattingEditProvider = function (selector, provider) {
        var documentFormattingEditProvider = this.createDocumentFormattingEditProvider(selector, provider);
        var providers = new disposable_1.DisposableCollection();
        for (var _i = 0, _a = getLanguages(); _i < _a.length; _i++) {
            var language = _a[_i];
            providers.push(monaco.languages.registerDocumentFormattingEditProvider(language, documentFormattingEditProvider));
        }
        return providers;
    };
    MonacoLanguages.prototype.createDocumentFormattingEditProvider = function (selector, provider) {
        var _this = this;
        return {
            provideDocumentFormattingEdits: function (model, options, token) {
                if (!_this.matchModel(selector, MonacoModelIdentifier.fromModel(model))) {
                    return [];
                }
                var params = _this.m2p.asDocumentFormattingParams(model, options);
                return provider
                    .provideDocumentFormattingEdits(params, token)
                    .then(function (result) { return _this.p2m.asTextEdits(result); });
            },
        };
    };
    MonacoLanguages.prototype.registerDocumentRangeFormattingEditProvider = function (selector, provider) {
        var documentRangeFormattingEditProvider = this.createDocumentRangeFormattingEditProvider(selector, provider);
        var providers = new disposable_1.DisposableCollection();
        for (var _i = 0, _a = getLanguages(); _i < _a.length; _i++) {
            var language = _a[_i];
            providers.push(monaco.languages.registerDocumentRangeFormattingEditProvider(language, documentRangeFormattingEditProvider));
        }
        return providers;
    };
    MonacoLanguages.prototype.createDocumentRangeFormattingEditProvider = function (selector, provider) {
        var _this = this;
        return {
            provideDocumentRangeFormattingEdits: function (model, range, options, token) {
                if (!_this.matchModel(selector, MonacoModelIdentifier.fromModel(model))) {
                    return [];
                }
                var params = _this.m2p.asDocumentRangeFormattingParams(model, range, options);
                return provider
                    .provideDocumentRangeFormattingEdits(params, token)
                    .then(function (result) { return _this.p2m.asTextEdits(result); });
            },
        };
    };
    MonacoLanguages.prototype.registerOnTypeFormattingEditProvider = function (selector, provider, firstTriggerCharacter) {
        var moreTriggerCharacter = [];
        for (var _i = 3; _i < arguments.length; _i++) {
            moreTriggerCharacter[_i - 3] = arguments[_i];
        }
        var onTypeFormattingEditProvider = this.createOnTypeFormattingEditProvider.apply(this, [selector,
            provider,
            firstTriggerCharacter].concat(moreTriggerCharacter));
        var providers = new disposable_1.DisposableCollection();
        for (var _a = 0, _b = getLanguages(); _a < _b.length; _a++) {
            var language = _b[_a];
            providers.push(monaco.languages.registerOnTypeFormattingEditProvider(language, onTypeFormattingEditProvider));
        }
        return providers;
    };
    MonacoLanguages.prototype.createOnTypeFormattingEditProvider = function (selector, provider, firstTriggerCharacter) {
        var _this = this;
        var moreTriggerCharacter = [];
        for (var _i = 3; _i < arguments.length; _i++) {
            moreTriggerCharacter[_i - 3] = arguments[_i];
        }
        var autoFormatTriggerCharacters = [firstTriggerCharacter].concat(moreTriggerCharacter);
        return {
            autoFormatTriggerCharacters: autoFormatTriggerCharacters,
            provideOnTypeFormattingEdits: function (model, position, ch, options, token) {
                if (!_this.matchModel(selector, MonacoModelIdentifier.fromModel(model))) {
                    return [];
                }
                var params = _this.m2p.asDocumentOnTypeFormattingParams(model, position, ch, options);
                return provider
                    .provideOnTypeFormattingEdits(params, token)
                    .then(function (result) { return _this.p2m.asTextEdits(result); });
            },
        };
    };
    MonacoLanguages.prototype.registerRenameProvider = function (selector, provider) {
        var renameProvider = this.createRenameProvider(selector, provider);
        var providers = new disposable_1.DisposableCollection();
        for (var _i = 0, _a = getLanguages(); _i < _a.length; _i++) {
            var language = _a[_i];
            providers.push(monaco.languages.registerRenameProvider(language, renameProvider));
        }
        return providers;
    };
    MonacoLanguages.prototype.createRenameProvider = function (selector, provider) {
        var _this = this;
        return {
            provideRenameEdits: function (model, position, newName, token) {
                if (!_this.matchModel(selector, MonacoModelIdentifier.fromModel(model))) {
                    return undefined;
                }
                var params = _this.m2p.asRenameParams(model, position, newName);
                return provider
                    .provideRenameEdits(params, token)
                    .then(function (result) { return _this.p2m.asWorkspaceEdit(result); });
            },
        };
    };
    MonacoLanguages.prototype.matchModel = function (selector, model) {
        var _this = this;
        if (Array.isArray(selector)) {
            return selector.findIndex(function (filter) { return _this.matchModel(filter, model); }) !== -1;
        }
        if (services_1.DocumentFilter.is(selector)) {
            if (!!selector.language && selector.language !== model.languageId) {
                return false;
            }
            if (!!selector.scheme && selector.scheme !== model.uri.scheme) {
                return false;
            }
            if (!!selector.pattern && !testGlob(selector.pattern, model.uri.path)) {
                return false;
            }
            return true;
        }
        return selector === model.languageId;
    };
    return MonacoLanguages;
}());
exports.MonacoLanguages = MonacoLanguages;
//# sourceMappingURL=languages.js.map