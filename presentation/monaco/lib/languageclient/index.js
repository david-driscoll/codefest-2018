"use strict";
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
var languages_1 = require("./languages");
/* --------------------------------------------------------------------------------------------
 * Copyright (c) 2017 TypeFox GmbH (http://www.typefox.io). All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */
__export(require("./disposable"));
__export(require("./commands"));
__export(require("./console-window"));
__export(require("./languages"));
__export(require("./workspace"));
__export(require("./converter"));
__export(require("./services"));
__export(require("vscode-base-languageclient/lib/base"));
__export(require("vscode-base-languageclient/lib/connection"));
languages_1.MonacoModelIdentifier.fromModel = function fromModel(model) {
    return {
        uri: monaco.Uri.parse(model.uri),
        languageId: model.getModeId(),
    };
};
//# sourceMappingURL=index.js.map