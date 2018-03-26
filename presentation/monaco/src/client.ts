/* --------------------------------------------------------------------------------------------
 * Copyright (c) 2017 TypeFox GmbH (http://www.typefox.io). All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */
import { listen, MessageConnection } from 'vscode-ws-jsonrpc';
import {
    BaseLanguageClient,
    CloseAction,
    ErrorAction,
    createMonacoServices,
    createConnection,
    DidOpenTextDocumentNotification,
} from './languageclient';
import { DocumentSelector } from './languageclient';
import configs from './configs';

window.addEventListener('load', x => {
    (window as any).require(['vs/editor/editor.main'], () => {
        monaco.editor.onDidCreateEditor(editor => {
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

(window as any).configureLsp = function configureLsp(
    editor: monaco.editor.IStandaloneCodeEditor,
    name: string,
    code: string
) {
    const config = configs[name];
    const ReconnectingWebSocket = require('reconnecting-websocket');
    const url = createUrl(`/lsp/${name}`);
    const webSocket = createWebSocket(url);
    listen({
        webSocket,
        onConnection: connection => {
            // create and start the language client
            const languageClient = createLanguageClient(connection);
            const disposable = languageClient.start();
            languageClient.onReady().then(() => {
                setTimeout(() => {
                    const model = editor.getModel();
                    languageClient.sendNotification(
                        DidOpenTextDocumentNotification.type as any,
                        {
                            textDocument: {
                                uri: model.uri,
                                languageId: config.language,
                                version: 0,
                                text: model.getValue(),
                            },
                        }
                    );
                    // editor.setModel(model);
                }, 1000);
            });

            connection.onClose(() => disposable.dispose());
        },
    });

    const services = createMonacoServices(editor);
    function createLanguageClient(connection: MessageConnection): BaseLanguageClient {
        return new BaseLanguageClient({
            name,
            clientOptions: {
                // use a language id as a document selector
                documentSelector: [config.language],
                // disable the default error handler
                errorHandler: {
                    error: () => ErrorAction.Continue,
                    closed: () => CloseAction.DoNotRestart,
                },
            },
            services,
            // create a language client connection from the JSON RPC connection on demand
            connectionProvider: {
                get: (errorHandler, closeHandler) => {
                    return Promise.resolve(
                        createConnection(connection, errorHandler, closeHandler)
                    );
                },
            },
        });
    }

    function createUrl(path: string): string {
        const protocol = location.protocol === 'https:' ? 'wss' : 'ws';
        return `${protocol}://${location.host}${path}`;
    }

    function createWebSocket(url: string): WebSocket {
        const socketOptions = {
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
