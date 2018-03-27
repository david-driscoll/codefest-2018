/* --------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */
'use strict';

import * as path from 'path';

import { workspace, ExtensionContext } from 'vscode';
import { LanguageClient, LanguageClientOptions, ServerOptions, TransportKind } from 'vscode-languageclient';

export function activate(context: ExtensionContext) {

	// NOTE: Node.js
	// The server is implemented in node
	// let serverModule = context.asAbsolutePath(path.join('server', 'server.js'));
	// The debug options for the server
	// let debugOptions = { execArgv: ["--nolazy", "--inspect=6009"] };

	// If the extension is launched in debug mode then the debug server options are used
	// Otherwise the run options are used
	// let serverOptions: ServerOptions = {
	// 	run : { module: serverModule, transport: TransportKind.ipc },
	// 	debug: { module: serverModule, transport: TransportKind.ipc, options: debugOptions }
	// }

	// NOTE: C#
	// The server is implemented in c#
	let serverModule = context.asAbsolutePath(path.join('..', 'server-csharp'));
	// let serverModule = context.asAbsolutePath(path.join('server-csharp', 'bin', 'Debug', 'server-csharp.dll'));

	let serverOptions: ServerOptions = {
		run : { command: 'dotnet', args: ['run', '-p', serverModule], transport: TransportKind.stdio },
		debug: { command: 'dotnet', args: ['run', '-p', serverModule], transport: TransportKind.stdio, options: {} }
	}

	// Options to control the language client
	let clientOptions: LanguageClientOptions = {
		// Register the server for plain text documents
		documentSelector: [{scheme: 'file', language: 'ini'}],
		synchronize: {
			// Synchronize the setting section 'languageServerExample' to the server
			configurationSection: 'iniSample',
			// Notify the server about file changes to '.clientrc files contain in the workspace
			fileEvents: workspace.createFileSystemWatcher('**/*.ini')
		}
	}

	// Create the language client and start the client.
	let disposable = new LanguageClient('iniSample', 'Ini Server Example', serverOptions, clientOptions).start();

	// Push the disposable to the context's subscriptions so that the
	// client can be deactivated on extension deactivation
	context.subscriptions.push(disposable);
}
