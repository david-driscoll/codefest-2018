"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/* --------------------------------------------------------------------------------------------
 * Copyright (c) 2017 TypeFox GmbH (http://www.typefox.io). All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */
var vscode_ws_jsonrpc_1 = require("vscode-ws-jsonrpc");
var languageclient_1 = require("./languageclient");
var configs_1 = require("./configs");
window.addEventListener('load', function (x) {
    window.require(['vs/editor/editor.main'], function () {
        monaco.editor.onDidCreateEditor(function (editor) {
            editor.getDomNode();
        });
        // register Monaco languages
        monaco.languages.register({
            id: 'json',
            extensions: [
                '.json',
                '.bowerrc',
                '.jshintrc',
                '.jscsrc',
                '.eslintrc',
                '.babelrc',
            ],
            aliases: ['JSON', 'json'],
            mimetypes: ['application/json'],
        });
        monaco.languages.register({
            id: 'csharp',
            extensions: ['.cs', '.csx'],
            aliases: ['omnisharp'],
        });
    });
});
window.configureLsp = function configureLsp(editor, name, code) {
    var config = configs_1.default[name];
    var ReconnectingWebSocket = require('reconnecting-websocket');
    var url = createUrl("/lsp/" + name);
    var webSocket = createWebSocket(url);
    vscode_ws_jsonrpc_1.listen({
        webSocket: webSocket,
        onConnection: function (connection) {
            // create and start the language client
            var languageClient = createLanguageClient(connection);
            var disposable = languageClient.start();
            languageClient.onReady().then(function () {
                setTimeout(function () {
                    var model = editor.getModel();
                    languageClient.sendNotification(languageclient_1.DidOpenTextDocumentNotification.type, {
                        textDocument: {
                            uri: model.uri,
                            languageId: config.language,
                            version: 0,
                            text: model.getValue(),
                        },
                    });
                    // editor.setModel(model);
                }, 1000);
            });
            connection.onClose(function () { return disposable.dispose(); });
        },
    });
    var services = languageclient_1.createMonacoServices(editor);
    function createLanguageClient(connection) {
        return new languageclient_1.BaseLanguageClient({
            name: name,
            clientOptions: {
                // use a language id as a document selector
                documentSelector: [config.language],
                // disable the default error handler
                errorHandler: {
                    error: function () { return languageclient_1.ErrorAction.Continue; },
                    closed: function () { return languageclient_1.CloseAction.DoNotRestart; },
                },
            },
            services: services,
            // create a language client connection from the JSON RPC connection on demand
            connectionProvider: {
                get: function (errorHandler, closeHandler) {
                    return Promise.resolve(languageclient_1.createConnection(connection, errorHandler, closeHandler));
                },
            },
        });
    }
    function createUrl(path) {
        var protocol = location.protocol === 'https:' ? 'wss' : 'ws';
        return protocol + "://" + location.host + path;
    }
    function createWebSocket(url) {
        var socketOptions = {
            maxReconnectionDelay: 10000,
            minReconnectionDelay: 1000,
            reconnectionDelayGrowFactor: 1.3,
            connectionTimeout: 10000,
            maxRetries: Infinity,
            debug: false,
        };
        return new ReconnectingWebSocket(url, undefined, socketOptions);
    }
};
//# sourceMappingURL=client.js.map