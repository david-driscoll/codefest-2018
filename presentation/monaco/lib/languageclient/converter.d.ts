import { CodeActionParams, CodeLensParams, DocumentFormattingParams, DocumentOnTypeFormattingParams, DocumentRangeFormattingParams, ReferenceParams, RenameParams, TextDocumentPositionParams, Position, TextDocumentIdentifier, CompletionItem, CompletionList, Range, Diagnostic, Hover, SignatureHelp, SignatureInformation, ParameterInformation, Definition, Location, DocumentHighlight, SymbolInformation, DocumentSymbolParams, CodeActionContext, DiagnosticSeverity, Command, CodeLens, FormattingOptions, TextEdit, WorkspaceEdit } from 'vscode-base-languageclient/lib/base';
import IReadOnlyModel = monaco.editor.IReadOnlyModel;
export declare type RecursivePartial<T> = {
    [P in keyof T]?: RecursivePartial<T[P]>;
};
export interface ProtocolCodeLens extends monaco.languages.ICodeLensSymbol {
    data?: any;
}
export declare namespace ProtocolCodeLens {
    function is(item: any): item is ProtocolCodeLens;
}
export interface ProtocolCompletionItem extends monaco.languages.CompletionItem {
    data?: any;
    fromEdit?: boolean;
}
export declare namespace ProtocolCompletionItem {
    function is(item: any): item is ProtocolCompletionItem;
}
export declare class MonacoToProtocolConverter {
    asPosition(lineNumber: undefined | null, column: undefined | null): {};
    asPosition(lineNumber: number, column: undefined | null): Pick<Position, 'line'>;
    asPosition(lineNumber: undefined | null, column: number): Pick<Position, 'character'>;
    asPosition(lineNumber: number, column: number): Position;
    asPosition(lineNumber: number | undefined | null, column: number | undefined | null): Partial<Position>;
    asRange(range: null): null;
    asRange(range: undefined): undefined;
    asRange(range: monaco.IRange): Range;
    asRange(range: monaco.IRange | undefined): Range | undefined;
    asRange(range: monaco.IRange | null): Range | null;
    asRange(range: Partial<monaco.IRange>): RecursivePartial<Range>;
    asRange(range: Partial<monaco.IRange> | undefined): RecursivePartial<Range> | undefined;
    asRange(range: Partial<monaco.IRange> | null): RecursivePartial<Range> | null;
    asTextDocumentIdentifier(model: IReadOnlyModel): TextDocumentIdentifier;
    asTextDocumentPositionParams(model: IReadOnlyModel, position: monaco.Position): TextDocumentPositionParams;
    asCompletionItem(item: monaco.languages.CompletionItem): CompletionItem;
    protected fillPrimaryInsertText(target: CompletionItem, source: ProtocolCompletionItem): void;
    asReferenceParams(model: IReadOnlyModel, position: monaco.Position, options: {
        includeDeclaration: boolean;
    }): ReferenceParams;
    asDocumentSymbolParams(model: IReadOnlyModel): DocumentSymbolParams;
    asCodeLensParams(model: IReadOnlyModel): CodeLensParams;
    asDiagnosticSeverity(value: monaco.Severity): DiagnosticSeverity | undefined;
    asDiagnostic(marker: monaco.editor.IMarkerData): Diagnostic;
    asDiagnostics(markers: monaco.editor.IMarkerData[]): Diagnostic[];
    asCodeActionContext(context: monaco.languages.CodeActionContext): CodeActionContext;
    asCodeActionParams(model: IReadOnlyModel, range: monaco.Range, context: monaco.languages.CodeActionContext): CodeActionParams;
    asCommand(item: monaco.languages.Command | undefined | null): Command | undefined;
    asCodeLens(item: monaco.languages.ICodeLensSymbol): CodeLens;
    asFormattingOptions(options: monaco.languages.FormattingOptions): FormattingOptions;
    asDocumentFormattingParams(model: IReadOnlyModel, options: monaco.languages.FormattingOptions): DocumentFormattingParams;
    asDocumentRangeFormattingParams(model: IReadOnlyModel, range: monaco.Range, options: monaco.languages.FormattingOptions): DocumentRangeFormattingParams;
    asDocumentOnTypeFormattingParams(model: IReadOnlyModel, position: monaco.IPosition, ch: string, options: monaco.languages.FormattingOptions): DocumentOnTypeFormattingParams;
    asRenameParams(model: IReadOnlyModel, position: monaco.IPosition, newName: string): RenameParams;
}
export declare class ProtocolToMonacoConverter {
    asResourceEdits(resource: monaco.Uri, edits: TextEdit[]): monaco.languages.IResourceEdit[];
    asWorkspaceEdit(item: WorkspaceEdit): monaco.languages.WorkspaceEdit;
    asWorkspaceEdit(item: undefined | null): undefined;
    asWorkspaceEdit(item: WorkspaceEdit | undefined | null): monaco.languages.WorkspaceEdit | undefined;
    asTextEdit(edit: TextEdit): monaco.editor.ISingleEditOperation;
    asTextEdits(items: TextEdit[]): monaco.editor.ISingleEditOperation[];
    asTextEdits(items: undefined | null): undefined;
    asTextEdits(items: TextEdit[] | undefined | null): monaco.editor.ISingleEditOperation[] | undefined;
    asCodeLens(item: CodeLens): monaco.languages.ICodeLensSymbol;
    asCodeLens(item: undefined | null): undefined;
    asCodeLens(item: CodeLens | undefined | null): monaco.languages.ICodeLensSymbol | undefined;
    asCodeLenses(items: CodeLens[]): monaco.languages.ICodeLensSymbol[];
    asCodeLenses(items: undefined | null): undefined;
    asCodeLenses(items: CodeLens[] | undefined | null): monaco.languages.ICodeLensSymbol[] | undefined;
    asCommand(command: Command): monaco.languages.Command;
    asCommands(commands: Command[]): monaco.languages.Command[];
    asSymbolInformations(values: SymbolInformation[], uri?: monaco.Uri): monaco.languages.SymbolInformation[];
    asSymbolInformations(values: undefined | null, uri?: monaco.Uri): undefined;
    asSymbolInformations(values: SymbolInformation[] | undefined | null, uri?: monaco.Uri): monaco.languages.SymbolInformation[] | undefined;
    asSymbolInformation(item: SymbolInformation, uri?: monaco.Uri): monaco.languages.SymbolInformation;
    asDocumentHighlights(values: DocumentHighlight[]): monaco.languages.DocumentHighlight[];
    asDocumentHighlights(values: undefined | null): undefined;
    asDocumentHighlights(values: DocumentHighlight[] | undefined | null): monaco.languages.DocumentHighlight[] | undefined;
    asDocumentHighlight(item: DocumentHighlight): monaco.languages.DocumentHighlight;
    asDocumentHighlightKind(item: number): monaco.languages.DocumentHighlightKind;
    asReferences(values: Location[]): monaco.languages.Location[];
    asReferences(values: undefined | null): monaco.languages.Location[] | undefined;
    asReferences(values: Location[] | undefined | null): monaco.languages.Location[] | undefined;
    asDefinitionResult(item: Definition): monaco.languages.Definition;
    asDefinitionResult(item: undefined | null): undefined;
    asDefinitionResult(item: Definition | undefined | null): monaco.languages.Definition | undefined;
    asLocation(item: Location): monaco.languages.Location;
    asLocation(item: undefined | null): undefined;
    asLocation(item: Location | undefined | null): monaco.languages.Location | undefined;
    asSignatureHelp(item: undefined | null): undefined;
    asSignatureHelp(item: SignatureHelp): monaco.languages.SignatureHelp;
    asSignatureHelp(item: SignatureHelp | undefined | null): monaco.languages.SignatureHelp | undefined;
    asSignatureInformations(items: SignatureInformation[]): monaco.languages.SignatureInformation[];
    asSignatureInformation(item: SignatureInformation): monaco.languages.SignatureInformation;
    asParameterInformations(item: ParameterInformation[]): monaco.languages.ParameterInformation[];
    asParameterInformation(item: ParameterInformation): monaco.languages.ParameterInformation;
    asHover(hover: Hover): monaco.languages.Hover;
    asHover(hover: undefined | null): undefined;
    asHover(hover: Hover | undefined | null): monaco.languages.Hover | undefined;
    asSeverity(severity?: number): monaco.Severity;
    asMarker(diagnostic: Diagnostic): monaco.editor.IMarkerData;
    asCompletionResult(result: CompletionItem[] | CompletionList | undefined): monaco.languages.CompletionItem[] | monaco.languages.CompletionList | undefined;
    asCompletionItem(item: CompletionItem): ProtocolCompletionItem;
    asCompletionInsertText(item: CompletionItem): {
        text: string | monaco.languages.SnippetString;
        range?: monaco.Range;
        fromEdit: boolean;
    } | undefined;
    asRange(range: null): null;
    asRange(range: undefined): undefined;
    asRange(range: Range): monaco.Range;
    asRange(range: Range | undefined): monaco.Range | undefined;
    asRange(range: Range | null): monaco.Range | null;
    asRange(range: RecursivePartial<Range>): Partial<monaco.IRange>;
    asRange(range: RecursivePartial<Range> | undefined): monaco.Range | Partial<monaco.IRange> | undefined;
    asRange(range: RecursivePartial<Range> | null): monaco.Range | Partial<monaco.IRange> | null;
    asPosition(position: null): null;
    asPosition(position: undefined): undefined;
    asPosition(position: Position): monaco.Position;
    asPosition(position: Position | undefined): monaco.Position | undefined;
    asPosition(position: Position | null): monaco.Position | null;
    asPosition(position: Partial<Position>): Partial<monaco.IPosition>;
    asPosition(position: Partial<Position> | undefined): monaco.Position | Partial<monaco.IPosition> | undefined;
    asPosition(position: Partial<Position> | null): monaco.Position | Partial<monaco.IPosition> | null;
}
