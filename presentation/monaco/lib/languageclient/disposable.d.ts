import { Disposable } from 'vscode-base-languageclient/lib/services';
export { Disposable };
export declare class DisposableCollection implements Disposable {
    protected readonly disposables: Disposable[];
    dispose(): void;
    push(disposable: Disposable): Disposable;
}
