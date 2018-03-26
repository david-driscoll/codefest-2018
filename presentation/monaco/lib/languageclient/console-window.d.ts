import { MessageActionItem, MessageType } from 'vscode-base-languageclient/lib/protocol';
import { Window, OutputChannel } from 'vscode-base-languageclient/lib/services';
export declare class ConsoleWindow implements Window {
    protected readonly channels: Map<string, OutputChannel>;
    showMessage<T extends MessageActionItem>(type: MessageType, message: string, ...actions: T[]): Thenable<T | undefined>;
    createOutputChannel(name: string): OutputChannel;
}
