"use strict";
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
/* --------------------------------------------------------------------------------------------
 * Copyright (c) 2017 TypeFox GmbH (http://www.typefox.io). All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */
var is = require("vscode-base-languageclient/lib/utils/is");
var base_1 = require("vscode-base-languageclient/lib/base");
var ProtocolCodeLens;
(function (ProtocolCodeLens) {
    function is(item) {
        return !!item && 'data' in item;
    }
    ProtocolCodeLens.is = is;
})(ProtocolCodeLens = exports.ProtocolCodeLens || (exports.ProtocolCodeLens = {}));
var ProtocolCompletionItem;
(function (ProtocolCompletionItem) {
    function is(item) {
        return !!item && 'data' in item;
    }
    ProtocolCompletionItem.is = is;
})(ProtocolCompletionItem = exports.ProtocolCompletionItem || (exports.ProtocolCompletionItem = {}));
var MonacoToProtocolConverter = /** @class */ (function () {
    function MonacoToProtocolConverter() {
    }
    MonacoToProtocolConverter.prototype.asPosition = function (lineNumber, column) {
        var line = lineNumber === undefined || lineNumber === null ? undefined : lineNumber - 1;
        var character = column === undefined || column === null ? undefined : column - 1;
        return {
            line: line, character: character
        };
    };
    MonacoToProtocolConverter.prototype.asRange = function (range) {
        if (range === undefined) {
            return undefined;
        }
        if (range === null) {
            return null;
        }
        var start = this.asPosition(range.startLineNumber, range.startColumn);
        var end = this.asPosition(range.endLineNumber, range.endColumn);
        return {
            start: start, end: end
        };
    };
    MonacoToProtocolConverter.prototype.asTextDocumentIdentifier = function (model) {
        return {
            uri: model.uri.toString()
        };
    };
    MonacoToProtocolConverter.prototype.asTextDocumentPositionParams = function (model, position) {
        return {
            textDocument: this.asTextDocumentIdentifier(model),
            position: this.asPosition(position.lineNumber, position.column)
        };
    };
    MonacoToProtocolConverter.prototype.asCompletionItem = function (item) {
        var result = { label: item.label };
        if (item.detail) {
            result.detail = item.detail;
        }
        if (item.documentation) {
            result.documentation = item.documentation;
        }
        if (item.filterText) {
            result.filterText = item.filterText;
        }
        this.fillPrimaryInsertText(result, item);
        // Protocol item kind is 1 based, codes item kind is zero based.
        if (is.number(item.kind)) {
            if (monaco.languages.CompletionItemKind.Text <= item.kind && item.kind <= monaco.languages.CompletionItemKind.Reference) {
                result.kind = (item.kind + 1);
            }
            else {
                result.kind = base_1.CompletionItemKind.Text;
            }
        }
        if (item.sortText) {
            result.sortText = item.sortText;
        }
        // TODO: if (item.additionalTextEdits) { result.additionalTextEdits = asTextEdits(item.additionalTextEdits); }
        // TODO: if (item.command) { result.command = asCommand(item.command); }
        if (ProtocolCompletionItem.is(item)) {
            result.data = item.data;
        }
        return result;
    };
    MonacoToProtocolConverter.prototype.fillPrimaryInsertText = function (target, source) {
        var format = base_1.InsertTextFormat.PlainText;
        var text;
        var range;
        if (source.textEdit) {
            text = source.textEdit.text;
            range = this.asRange(source.textEdit.range);
        }
        else if (typeof source.insertText === 'string') {
            text = source.insertText;
        }
        else if (source.insertText) {
            format = base_1.InsertTextFormat.Snippet;
            text = source.insertText.value;
        }
        if (source.range) {
            range = this.asRange(source.range);
        }
        target.insertTextFormat = format;
        if (source.fromEdit && text && range) {
            target.textEdit = { newText: text, range: range };
        }
        else {
            target.insertText = text;
        }
    };
    MonacoToProtocolConverter.prototype.asReferenceParams = function (model, position, options) {
        return {
            textDocument: this.asTextDocumentIdentifier(model),
            position: this.asPosition(position.lineNumber, position.column),
            context: { includeDeclaration: options.includeDeclaration }
        };
    };
    MonacoToProtocolConverter.prototype.asDocumentSymbolParams = function (model) {
        return {
            textDocument: this.asTextDocumentIdentifier(model)
        };
    };
    MonacoToProtocolConverter.prototype.asCodeLensParams = function (model) {
        return {
            textDocument: this.asTextDocumentIdentifier(model)
        };
    };
    MonacoToProtocolConverter.prototype.asDiagnosticSeverity = function (value) {
        switch (value) {
            case monaco.Severity.Error:
                return base_1.DiagnosticSeverity.Error;
            case monaco.Severity.Warning:
                return base_1.DiagnosticSeverity.Warning;
            case monaco.Severity.Info:
                return base_1.DiagnosticSeverity.Information;
        }
        return undefined;
    };
    MonacoToProtocolConverter.prototype.asDiagnostic = function (marker) {
        var range = this.asRange(new monaco.Range(marker.startLineNumber, marker.startColumn, marker.endLineNumber, marker.endColumn));
        var severity = this.asDiagnosticSeverity(marker.severity);
        return base_1.Diagnostic.create(range, marker.message, severity, marker.code, marker.source);
    };
    MonacoToProtocolConverter.prototype.asDiagnostics = function (markers) {
        var _this = this;
        if (markers === void 0 || markers === null) {
            return markers;
        }
        return markers.map(function (marker) { return _this.asDiagnostic(marker); });
    };
    MonacoToProtocolConverter.prototype.asCodeActionContext = function (context) {
        if (context === void 0 || context === null) {
            return context;
        }
        var diagnostics = this.asDiagnostics(context.markers);
        return {
            diagnostics: diagnostics
        };
    };
    MonacoToProtocolConverter.prototype.asCodeActionParams = function (model, range, context) {
        return {
            textDocument: this.asTextDocumentIdentifier(model),
            range: this.asRange(range),
            context: this.asCodeActionContext(context)
        };
    };
    MonacoToProtocolConverter.prototype.asCommand = function (item) {
        if (item) {
            var args = item.arguments || [];
            return base_1.Command.create.apply(base_1.Command, [item.title, item.id].concat(args));
        }
        return undefined;
    };
    MonacoToProtocolConverter.prototype.asCodeLens = function (item) {
        var range = this.asRange(item.range);
        var data = ProtocolCodeLens.is(item) ? item.data : undefined;
        var command = this.asCommand(item.command);
        return {
            range: range, data: data, command: command
        };
    };
    MonacoToProtocolConverter.prototype.asFormattingOptions = function (options) {
        return { tabSize: options.tabSize, insertSpaces: options.insertSpaces };
    };
    MonacoToProtocolConverter.prototype.asDocumentFormattingParams = function (model, options) {
        return {
            textDocument: this.asTextDocumentIdentifier(model),
            options: this.asFormattingOptions(options)
        };
    };
    MonacoToProtocolConverter.prototype.asDocumentRangeFormattingParams = function (model, range, options) {
        return {
            textDocument: this.asTextDocumentIdentifier(model),
            range: this.asRange(range),
            options: this.asFormattingOptions(options)
        };
    };
    MonacoToProtocolConverter.prototype.asDocumentOnTypeFormattingParams = function (model, position, ch, options) {
        return {
            textDocument: this.asTextDocumentIdentifier(model),
            position: this.asPosition(position.lineNumber, position.column),
            ch: ch,
            options: this.asFormattingOptions(options)
        };
    };
    MonacoToProtocolConverter.prototype.asRenameParams = function (model, position, newName) {
        return {
            textDocument: this.asTextDocumentIdentifier(model),
            position: this.asPosition(position.lineNumber, position.column),
            newName: newName
        };
    };
    return MonacoToProtocolConverter;
}());
exports.MonacoToProtocolConverter = MonacoToProtocolConverter;
var ProtocolToMonacoConverter = /** @class */ (function () {
    function ProtocolToMonacoConverter() {
    }
    ProtocolToMonacoConverter.prototype.asResourceEdits = function (resource, edits) {
        var _this = this;
        return edits.map(function (edit) {
            var range = _this.asRange(edit.range);
            return {
                resource: resource,
                range: range,
                newText: edit.newText
            };
        });
    };
    ProtocolToMonacoConverter.prototype.asWorkspaceEdit = function (item) {
        if (!item) {
            return undefined;
        }
        var edits = [];
        if (item.documentChanges) {
            for (var _i = 0, _a = item.documentChanges; _i < _a.length; _i++) {
                var change = _a[_i];
                var resource = monaco.Uri.parse(change.textDocument.uri);
                edits.push.apply(edits, this.asResourceEdits(resource, change.edits));
            }
        }
        else if (item.changes) {
            for (var _b = 0, _c = Object.keys(item.changes); _b < _c.length; _b++) {
                var key = _c[_b];
                var resource = monaco.Uri.parse(key);
                edits.push.apply(edits, this.asResourceEdits(resource, item.changes[key]));
            }
        }
        return {
            edits: edits
        };
    };
    ProtocolToMonacoConverter.prototype.asTextEdit = function (edit) {
        var range = this.asRange(edit.range);
        return {
            range: range,
            text: edit.newText
        };
    };
    ProtocolToMonacoConverter.prototype.asTextEdits = function (items) {
        var _this = this;
        if (!items) {
            return undefined;
        }
        return items.map(function (item) { return _this.asTextEdit(item); });
    };
    ProtocolToMonacoConverter.prototype.asCodeLens = function (item) {
        if (!item) {
            return undefined;
        }
        var range = this.asRange(item.range);
        var result = { range: range };
        if (item.command) {
            result.command = this.asCommand(item.command);
        }
        if (item.data !== void 0 && item.data !== null) {
            result.data = item.data;
        }
        return result;
    };
    ProtocolToMonacoConverter.prototype.asCodeLenses = function (items) {
        var _this = this;
        if (!items) {
            return undefined;
        }
        return items.map(function (codeLens) { return _this.asCodeLens(codeLens); });
    };
    ProtocolToMonacoConverter.prototype.asCommand = function (command) {
        return {
            id: command.command,
            title: command.title,
            arguments: command.arguments
        };
    };
    ProtocolToMonacoConverter.prototype.asCommands = function (commands) {
        var _this = this;
        return commands.map(function (command) { return _this.asCommand(command); });
    };
    ProtocolToMonacoConverter.prototype.asSymbolInformations = function (values, uri) {
        var _this = this;
        if (!values) {
            return undefined;
        }
        return values.map(function (information) { return _this.asSymbolInformation(information, uri); });
    };
    ProtocolToMonacoConverter.prototype.asSymbolInformation = function (item, uri) {
        // Symbol kind is one based in the protocol and zero based in code.
        return {
            name: item.name,
            containerName: item.containerName,
            kind: item.kind - 1,
            location: this.asLocation(uri ? __assign({}, item.location, { uri: uri.toString() }) : item.location)
        };
    };
    ProtocolToMonacoConverter.prototype.asDocumentHighlights = function (values) {
        var _this = this;
        if (!values) {
            return undefined;
        }
        return values.map(function (item) { return _this.asDocumentHighlight(item); });
    };
    ProtocolToMonacoConverter.prototype.asDocumentHighlight = function (item) {
        var range = this.asRange(item.range);
        var kind = is.number(item.kind) ? this.asDocumentHighlightKind(item.kind) : undefined;
        return { range: range, kind: kind };
    };
    ProtocolToMonacoConverter.prototype.asDocumentHighlightKind = function (item) {
        switch (item) {
            case base_1.DocumentHighlightKind.Text:
                return monaco.languages.DocumentHighlightKind.Text;
            case base_1.DocumentHighlightKind.Read:
                return monaco.languages.DocumentHighlightKind.Read;
            case base_1.DocumentHighlightKind.Write:
                return monaco.languages.DocumentHighlightKind.Write;
        }
        return monaco.languages.DocumentHighlightKind.Text;
    };
    ProtocolToMonacoConverter.prototype.asReferences = function (values) {
        var _this = this;
        if (!values) {
            return undefined;
        }
        return values.map(function (location) { return _this.asLocation(location); });
    };
    ProtocolToMonacoConverter.prototype.asDefinitionResult = function (item) {
        var _this = this;
        if (!item) {
            return undefined;
        }
        if (is.array(item)) {
            return item.map(function (location) { return _this.asLocation(location); });
        }
        else {
            return this.asLocation(item);
        }
    };
    ProtocolToMonacoConverter.prototype.asLocation = function (item) {
        if (!item) {
            return undefined;
        }
        var uri = monaco.Uri.parse(item.uri);
        var range = this.asRange(item.range);
        return {
            uri: uri, range: range
        };
    };
    ProtocolToMonacoConverter.prototype.asSignatureHelp = function (item) {
        if (!item) {
            return undefined;
        }
        var result = {};
        if (is.number(item.activeSignature)) {
            result.activeSignature = item.activeSignature;
        }
        else {
            // activeSignature was optional in the past
            result.activeSignature = 0;
        }
        if (is.number(item.activeParameter)) {
            result.activeParameter = item.activeParameter;
        }
        else {
            // activeParameter was optional in the past
            result.activeParameter = 0;
        }
        if (item.signatures) {
            result.signatures = this.asSignatureInformations(item.signatures);
        }
        return result;
    };
    ProtocolToMonacoConverter.prototype.asSignatureInformations = function (items) {
        var _this = this;
        return items.map(function (item) { return _this.asSignatureInformation(item); });
    };
    ProtocolToMonacoConverter.prototype.asSignatureInformation = function (item) {
        var result = { label: item.label };
        if (item.documentation) {
            result.documentation = item.documentation;
        }
        if (item.parameters) {
            result.parameters = this.asParameterInformations(item.parameters);
        }
        return result;
    };
    ProtocolToMonacoConverter.prototype.asParameterInformations = function (item) {
        var _this = this;
        return item.map(function (item) { return _this.asParameterInformation(item); });
    };
    ProtocolToMonacoConverter.prototype.asParameterInformation = function (item) {
        var result = { label: item.label };
        if (item.documentation) {
            result.documentation = item.documentation;
        }
        ;
        return result;
    };
    ProtocolToMonacoConverter.prototype.asHover = function (hover) {
        if (!hover) {
            return undefined;
        }
        var contents = Array.isArray(hover.contents) ? hover.contents : [hover.contents];
        var range = this.asRange(hover.range);
        return {
            contents: contents, range: range
        };
    };
    ProtocolToMonacoConverter.prototype.asSeverity = function (severity) {
        if (severity === 1) {
            return monaco.Severity.Error;
        }
        if (severity === 2) {
            return monaco.Severity.Warning;
        }
        if (severity === 3) {
            return monaco.Severity.Info;
        }
        return monaco.Severity.Ignore;
    };
    ProtocolToMonacoConverter.prototype.asMarker = function (diagnostic) {
        return {
            code: typeof diagnostic.code === "number" ? diagnostic.code.toString() : diagnostic.code,
            severity: this.asSeverity(diagnostic.severity),
            message: diagnostic.message,
            source: diagnostic.source,
            startLineNumber: diagnostic.range.start.line + 1,
            startColumn: diagnostic.range.start.character + 1,
            endLineNumber: diagnostic.range.end.line + 1,
            endColumn: diagnostic.range.end.character + 1
        };
    };
    ProtocolToMonacoConverter.prototype.asCompletionResult = function (result) {
        var _this = this;
        if (!result) {
            return undefined;
        }
        if (Array.isArray(result)) {
            return result.map(function (item) { return _this.asCompletionItem(item); });
        }
        return {
            isIncomplete: result.isIncomplete,
            items: result.items.map(this.asCompletionItem.bind(this))
        };
    };
    ProtocolToMonacoConverter.prototype.asCompletionItem = function (item) {
        var result = { label: item.label };
        if (item.detail) {
            result.detail = item.detail;
        }
        if (item.documentation) {
            result.documentation = item.documentation;
        }
        ;
        if (item.filterText) {
            result.filterText = item.filterText;
        }
        var insertText = this.asCompletionInsertText(item);
        if (insertText) {
            result.insertText = insertText.text;
            result.range = insertText.range;
            result.fromEdit = insertText.fromEdit;
        }
        // Protocol item kind is 1 based, codes item kind is zero based.
        if (is.number(item.kind) && item.kind > 0) {
            result.kind = item.kind - 1;
        }
        if (item.sortText) {
            result.sortText = item.sortText;
        }
        // TODO: if (item.additionalTextEdits) { result.additionalTextEdits = asTextEdits(item.additionalTextEdits); }
        // TODO: if (item.command) { result.command = asCommand(item.command); }
        if (item.data !== void 0 && item.data !== null) {
            result.data = item.data;
        }
        return result;
    };
    ProtocolToMonacoConverter.prototype.asCompletionInsertText = function (item) {
        if (item.textEdit) {
            var range = this.asRange(item.textEdit.range);
            var value = item.textEdit.newText;
            var text = item.insertTextFormat === base_1.InsertTextFormat.Snippet ? { value: value } : value;
            return {
                text: text, range: range, fromEdit: true
            };
        }
        if (item.insertText) {
            var value = item.insertText;
            var text = item.insertTextFormat === base_1.InsertTextFormat.Snippet ? { value: value } : value;
            return { text: text, fromEdit: false };
        }
        return undefined;
    };
    ProtocolToMonacoConverter.prototype.asRange = function (range) {
        if (range === undefined) {
            return undefined;
        }
        if (range === null) {
            return null;
        }
        var start = this.asPosition(range.start);
        var end = this.asPosition(range.end);
        if (start instanceof monaco.Position && end instanceof monaco.Position) {
            return new monaco.Range(start.lineNumber, start.column, end.lineNumber, end.column);
        }
        var startLineNumber = !start || start.lineNumber === undefined ? undefined : start.lineNumber;
        var startColumn = !start || start.column === undefined ? undefined : start.column;
        var endLineNumber = !end || end.lineNumber === undefined ? undefined : end.lineNumber;
        var endColumn = !end || end.column === undefined ? undefined : end.column;
        return { startLineNumber: startLineNumber, startColumn: startColumn, endLineNumber: endLineNumber, endColumn: endColumn };
    };
    ProtocolToMonacoConverter.prototype.asPosition = function (position) {
        if (position === undefined) {
            return undefined;
        }
        if (position === null) {
            return null;
        }
        var line = position.line, character = position.character;
        var lineNumber = line === undefined ? undefined : line + 1;
        var column = character === undefined ? undefined : character + 1;
        if (lineNumber !== undefined && column !== undefined) {
            return new monaco.Position(lineNumber, column);
        }
        return { lineNumber: lineNumber, column: column };
    };
    return ProtocolToMonacoConverter;
}());
exports.ProtocolToMonacoConverter = ProtocolToMonacoConverter;
//# sourceMappingURL=converter.js.map