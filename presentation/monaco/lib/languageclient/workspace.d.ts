import { MonacoToProtocolConverter, ProtocolToMonacoConverter } from './converter';
import { Workspace, TextDocumentDidChangeEvent, TextDocument, Event, Emitter } from 'vscode-base-languageclient/lib/services';
import { WorkspaceEdit } from 'vscode-base-languageclient/lib/base';
import IModel = monaco.editor.IModel;
export declare class MonacoWorkspace implements Workspace {
    protected readonly p2m: ProtocolToMonacoConverter;
    protected readonly m2p: MonacoToProtocolConverter;
    protected _rootUri: string | null;
    protected readonly documents: Map<string, TextDocument>;
    protected readonly onDidOpenTextDocumentEmitter: Emitter<TextDocument>;
    protected readonly onDidCloseTextDocumentEmitter: Emitter<TextDocument>;
    protected readonly onDidChangeTextDocumentEmitter: Emitter<TextDocumentDidChangeEvent>;
    constructor(p2m: ProtocolToMonacoConverter, m2p: MonacoToProtocolConverter, _rootUri?: string | null);
    readonly rootUri: string | null;
    protected removeModel(model: IModel): void;
    protected addModel(model: IModel): void;
    protected onDidChangeContent(uri: string, model: IModel, event: monaco.editor.IModelContentChangedEvent): void;
    protected setModel(uri: string, model: IModel): TextDocument;
    readonly textDocuments: TextDocument[];
    readonly onDidOpenTextDocument: Event<TextDocument>;
    readonly onDidCloseTextDocument: Event<TextDocument>;
    readonly onDidChangeTextDocument: Event<TextDocumentDidChangeEvent>;
    applyEdit(workspaceEdit: WorkspaceEdit): Promise<boolean>;
}
