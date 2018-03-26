"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/* --------------------------------------------------------------------------------------------
 * Copyright (c) 2017 TypeFox GmbH (http://www.typefox.io). All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */
var protocol_1 = require("vscode-base-languageclient/lib/protocol");
var ConsoleWindow = /** @class */ (function () {
    function ConsoleWindow() {
        this.channels = new Map();
    }
    ConsoleWindow.prototype.showMessage = function (type, message) {
        var actions = [];
        for (var _i = 2; _i < arguments.length; _i++) {
            actions[_i - 2] = arguments[_i];
        }
        if (type === protocol_1.MessageType.Error) {
            console.error(message);
        }
        if (type === protocol_1.MessageType.Warning) {
            console.warn(message);
        }
        if (type === protocol_1.MessageType.Info) {
            console.info(message);
        }
        if (type === protocol_1.MessageType.Log) {
            console.log(message);
        }
        return Promise.resolve(undefined);
    };
    ConsoleWindow.prototype.createOutputChannel = function (name) {
        var existing = this.channels.get(name);
        if (existing) {
            return existing;
        }
        var channel = {
            append: function (value) {
                console.log(name + ': ' + value);
            },
            appendLine: function (line) {
                console.log(name + ': ' + line);
            },
            show: function () {
                // no-op
            }
        };
        this.channels.set(name, channel);
        return channel;
    };
    return ConsoleWindow;
}());
exports.ConsoleWindow = ConsoleWindow;
//# sourceMappingURL=console-window.js.map