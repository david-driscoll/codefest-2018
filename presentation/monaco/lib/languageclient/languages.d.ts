import { Languages, DiagnosticCollection, CompletionItemProvider, DocumentIdentifier, HoverProvider, SignatureHelpProvider, DefinitionProvider, ReferenceProvider, DocumentHighlightProvider, DocumentSymbolProvider, CodeActionProvider, CodeLensProvider, DocumentFormattingEditProvider, DocumentRangeFormattingEditProvider, OnTypeFormattingEditProvider, RenameProvider, CompletionClientCapabilities, DocumentFilter, DocumentSelector } from 'vscode-base-languageclient/lib/services';
import { ProtocolToMonacoConverter, MonacoToProtocolConverter } from './converter';
import { Disposable } from './disposable';
export interface MonacoModelIdentifier {
    uri: monaco.Uri;
    languageId: string;
}
export declare namespace MonacoModelIdentifier {
    function fromDocument(document: DocumentIdentifier): MonacoModelIdentifier;
    function fromModel(model: monaco.editor.IReadOnlyModel): MonacoModelIdentifier;
}
export declare function testGlob(pattern: string, value: string): boolean;
export declare function getLanguages(): string[];
export declare class MonacoLanguages implements Languages {
    protected readonly p2m: ProtocolToMonacoConverter;
    protected readonly m2p: MonacoToProtocolConverter;
    readonly completion: CompletionClientCapabilities;
    constructor(p2m: ProtocolToMonacoConverter, m2p: MonacoToProtocolConverter);
    match(selector: DocumentSelector, document: DocumentIdentifier): boolean;
    createDiagnosticCollection(name?: string): DiagnosticCollection;
    registerCompletionItemProvider(selector: DocumentSelector, provider: CompletionItemProvider, ...triggerCharacters: string[]): Disposable;
    protected createCompletionProvider(selector: DocumentSelector, provider: CompletionItemProvider, ...triggerCharacters: string[]): monaco.languages.CompletionItemProvider;
    registerHoverProvider(selector: DocumentSelector, provider: HoverProvider): Disposable;
    protected createHoverProvider(selector: DocumentSelector, provider: HoverProvider): monaco.languages.HoverProvider;
    registerSignatureHelpProvider(selector: DocumentSelector, provider: SignatureHelpProvider, ...triggerCharacters: string[]): Disposable;
    protected createSignatureHelpProvider(selector: DocumentSelector, provider: SignatureHelpProvider, ...triggerCharacters: string[]): monaco.languages.SignatureHelpProvider;
    registerDefinitionProvider(selector: DocumentSelector, provider: DefinitionProvider): Disposable;
    protected createDefinitionProvider(selector: DocumentSelector, provider: DefinitionProvider): monaco.languages.DefinitionProvider;
    registerReferenceProvider(selector: DocumentSelector, provider: ReferenceProvider): Disposable;
    protected createReferenceProvider(selector: DocumentSelector, provider: ReferenceProvider): monaco.languages.ReferenceProvider;
    registerDocumentHighlightProvider(selector: DocumentSelector, provider: DocumentHighlightProvider): Disposable;
    protected createDocumentHighlightProvider(selector: DocumentSelector, provider: DocumentHighlightProvider): monaco.languages.DocumentHighlightProvider;
    registerDocumentSymbolProvider(selector: DocumentSelector, provider: DocumentSymbolProvider): Disposable;
    protected createDocumentSymbolProvider(selector: DocumentSelector, provider: DocumentSymbolProvider): monaco.languages.DocumentSymbolProvider;
    registerCodeActionsProvider(selector: DocumentSelector, provider: CodeActionProvider): Disposable;
    protected createCodeActionProvider(selector: DocumentSelector, provider: CodeActionProvider): monaco.languages.CodeActionProvider;
    registerCodeLensProvider(selector: DocumentSelector, provider: CodeLensProvider): Disposable;
    protected createCodeLensProvider(selector: DocumentSelector, provider: CodeLensProvider): monaco.languages.CodeLensProvider;
    registerDocumentFormattingEditProvider(selector: DocumentSelector, provider: DocumentFormattingEditProvider): Disposable;
    protected createDocumentFormattingEditProvider(selector: DocumentSelector, provider: DocumentFormattingEditProvider): monaco.languages.DocumentFormattingEditProvider;
    registerDocumentRangeFormattingEditProvider(selector: DocumentSelector, provider: DocumentRangeFormattingEditProvider): Disposable;
    createDocumentRangeFormattingEditProvider(selector: DocumentSelector, provider: DocumentRangeFormattingEditProvider): monaco.languages.DocumentRangeFormattingEditProvider;
    registerOnTypeFormattingEditProvider(selector: DocumentSelector, provider: OnTypeFormattingEditProvider, firstTriggerCharacter: string, ...moreTriggerCharacter: string[]): Disposable;
    protected createOnTypeFormattingEditProvider(selector: DocumentSelector, provider: OnTypeFormattingEditProvider, firstTriggerCharacter: string, ...moreTriggerCharacter: string[]): monaco.languages.OnTypeFormattingEditProvider;
    registerRenameProvider(selector: DocumentSelector, provider: RenameProvider): Disposable;
    protected createRenameProvider(selector: DocumentSelector, provider: RenameProvider): monaco.languages.RenameProvider;
    protected matchModel(selector: string | DocumentFilter | DocumentSelector, model: MonacoModelIdentifier): boolean;
}
