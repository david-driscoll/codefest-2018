"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var MonacoCommands = /** @class */ (function () {
    function MonacoCommands(editor) {
        this.editor = editor;
    }
    MonacoCommands.prototype.registerCommand = function (command, callback, thisArg) {
        return this.editor._commandService.addCommand(command, {
            handler: function (_accessor) {
                var args = [];
                for (var _i = 1; _i < arguments.length; _i++) {
                    args[_i - 1] = arguments[_i];
                }
                return callback.apply(void 0, args);
            }
        });
    };
    return MonacoCommands;
}());
exports.MonacoCommands = MonacoCommands;
//# sourceMappingURL=commands.js.map