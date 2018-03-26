declare const _default: {
    [server: string]: {
        command: string;
        workingDirectory: string;
        language: string;
        args: string[];
        documentSelector: (string | {
            language: string;
            scheme?: string | undefined;
            pattern?: string | undefined;
        } | {
            language?: string | undefined;
            scheme: string;
            pattern?: string | undefined;
        } | {
            language?: string | undefined;
            scheme?: string | undefined;
            pattern: string;
        })[];
    };
};
export default _default;
