import { BaseLanguageClient } from "vscode-base-languageclient/lib/base";
export declare function createMonacoServices(editor: monaco.editor.IStandaloneCodeEditor, options?: MonacoServicesOptions): BaseLanguageClient.IServices;
export interface MonacoServicesOptions {
    rootUri?: string;
}
