"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/* --------------------------------------------------------------------------------------------
 * Copyright (c) 2017 TypeFox GmbH (http://www.typefox.io). All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */
var services_1 = require("vscode-base-languageclient/lib/services");
exports.Disposable = services_1.Disposable;
var DisposableCollection = /** @class */ (function () {
    function DisposableCollection() {
        this.disposables = [];
    }
    DisposableCollection.prototype.dispose = function () {
        while (this.disposables.length !== 0) {
            this.disposables.pop().dispose();
        }
    };
    DisposableCollection.prototype.push = function (disposable) {
        var disposables = this.disposables;
        disposables.push(disposable);
        return {
            dispose: function () {
                var index = disposables.indexOf(disposable);
                if (index !== -1) {
                    disposables.splice(index, 1);
                }
            }
        };
    };
    return DisposableCollection;
}());
exports.DisposableCollection = DisposableCollection;
//# sourceMappingURL=disposable.js.map