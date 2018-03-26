"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var converter_1 = require("./converter");
var commands_1 = require("./commands");
var languages_1 = require("./languages");
var workspace_1 = require("./workspace");
var console_window_1 = require("./console-window");
function createMonacoServices(editor, options) {
    if (options === void 0) { options = {}; }
    var m2p = new converter_1.MonacoToProtocolConverter();
    var p2m = new converter_1.ProtocolToMonacoConverter();
    return {
        commands: new commands_1.MonacoCommands(editor),
        languages: new languages_1.MonacoLanguages(p2m, m2p),
        workspace: new workspace_1.MonacoWorkspace(p2m, m2p, options.rootUri),
        window: new console_window_1.ConsoleWindow()
    };
}
exports.createMonacoServices = createMonacoServices;
//# sourceMappingURL=services.js.map