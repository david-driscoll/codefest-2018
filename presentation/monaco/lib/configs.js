"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var path = require("path");
exports.default = {
    omnisharp: {
        command: 'OmniSharp.exe',
        workingDirectory: path.resolve(__dirname, '..', 'server/omnisharp/'),
        args: ['-lsp'],
        language: 'csharp',
        documentSelector: [{
                pattern: "**/*.cs"
            }, {
                pattern: "**/*.csx"
            }]
    },
};
//# sourceMappingURL=configs.js.map