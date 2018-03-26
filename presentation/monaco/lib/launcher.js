"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/* --------------------------------------------------------------------------------------------
import server = require("./server")
 * Copyright (c) 2017 TypeFox GmbH (http://www.typefox.io). All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */
var path = require("path");
var rpc = require("vscode-ws-jsonrpc");
var server = require("vscode-ws-jsonrpc/lib/server");
var lsp = require("vscode-languageserver");
var configs_1 = require("./configs");
function launch(socket, name) {
    var reader = new rpc.WebSocketMessageReader(socket);
    var writer = new rpc.WebSocketMessageWriter(socket);
    // start the language server as an external process
    var socketConnection = server.createConnection(reader, writer, function () {
        return socket.dispose();
    });
    var connectTo = configs_1.default[name];
    var serverConnection = server.createServerProcess(name, connectTo.command, connectTo.args, {
        cwd: connectTo.workingDirectory,
    });
    server.forward(socketConnection, serverConnection, function (message) {
        console.log(message);
        if (rpc.isRequestMessage(message)) {
            if (message.method === lsp.InitializeRequest.type.method) {
                var initializeParams = message.params;
                // initializeParams.capabilities.textDocument!.codeAction!.dynamicRegistration = false;
                // initializeParams.capabilities.textDocument!.codeLens!.dynamicRegistration = false;
                // initializeParams.capabilities.textDocument!.completion!.dynamicRegistration = false;
                // initializeParams.capabilities.textDocument!.definition!.dynamicRegistration = false;
                // initializeParams.capabilities.textDocument!.documentHighlight!.dynamicRegistration = false;
                // initializeParams.capabilities.textDocument!.documentLink!.dynamicRegistration = false;
                // initializeParams.capabilities.textDocument!.documentSymbol!.dynamicRegistration = false;
                // initializeParams.capabilities.textDocument!.formatting!.dynamicRegistration = false;
                // initializeParams.capabilities.textDocument!.hover!.dynamicRegistration = false;
                // initializeParams.capabilities.textDocument!.onTypeFormatting!.dynamicRegistration = false;
                // initializeParams.capabilities.textDocument!.rangeFormatting!.dynamicRegistration = false;
                // initializeParams.capabilities.textDocument!.references!.dynamicRegistration = false;
                // initializeParams.capabilities.textDocument!.rename!.dynamicRegistration = false;
                // initializeParams.capabilities.textDocument!.signatureHelp!.dynamicRegistration = false;
                // initializeParams.capabilities.textDocument!.synchronization!.dynamicRegistration = false;
                // initializeParams.capabilities.workspace!.didChangeConfiguration!.dynamicRegistration = false;
                // initializeParams.capabilities.workspace!.didChangeWatchedFiles!.dynamicRegistration = false;
                // initializeParams.capabilities.workspace!.executeCommand!.dynamicRegistration = false;
                // initializeParams.capabilities.workspace!.symbol!.dynamicRegistration = false;
                // initializeParams.capabilities
                initializeParams.processId = process.pid;
                initializeParams.rootUri = path.resolve(__dirname, '..', 'server/root/');
                initializeParams.trace = 'verbose';
            }
        }
        return message;
    });
}
exports.launch = launch;
//# sourceMappingURL=launcher.js.map