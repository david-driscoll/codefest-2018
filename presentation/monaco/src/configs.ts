import * as path from "path";
import { DocumentSelector } from "./languageclient/index";

export default {
    omnisharp: {
        command: 'OmniSharp.exe',
        workingDirectory: path.resolve(__dirname, '..', 'server/omnisharp/'),
        args: ['-lsp'],
        language: 'csharp',
        documentSelector: [{
            pattern: "**/*.cs"
        },{
            pattern: "**/*.csx"
        }]
    },
} as {
    [server: string]: {
        command: string;
        workingDirectory: string;
        language: string;
        args: string[];
        documentSelector: DocumentSelector
    };
}
