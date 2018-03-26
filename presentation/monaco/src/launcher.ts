/* --------------------------------------------------------------------------------------------
import server = require("./server")
 * Copyright (c) 2017 TypeFox GmbH (http://www.typefox.io). All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */
import * as path from 'path';
import * as rpc from 'vscode-ws-jsonrpc';
import * as server from 'vscode-ws-jsonrpc/lib/server';
import * as lsp from 'vscode-languageserver';
import { DocumentSelector } from './languageclient';
import configs from './configs';

export function launch(socket: rpc.IWebSocket, name: string) {
    const reader = new rpc.WebSocketMessageReader(socket);
    const writer = new rpc.WebSocketMessageWriter(socket);
    // start the language server as an external process
    const socketConnection = server.createConnection(reader, writer, () =>
        socket.dispose()
    );
    const connectTo = configs[name];
    const serverConnection = server.createServerProcess(
        name,
        connectTo.command,
        connectTo.args,
        {
            cwd: connectTo.workingDirectory,
        }
    );

    server.forward(socketConnection, serverConnection, message => {
        console.log(message);
        if (rpc.isRequestMessage(message)) {
            if (message.method === lsp.InitializeRequest.type.method) {
                const initializeParams = message.params as lsp.InitializeParams;

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
