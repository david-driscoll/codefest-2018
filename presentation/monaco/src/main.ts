/* --------------------------------------------------------------------------------------------
 * Copyright (c) 2017 TypeFox GmbH (http://www.typefox.io). All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */
// window.addEventListener('load', x => {
    // load Monaco code
    (<any>window).require(['vs/editor/editor.main'], () => {
        // load client code
        require('./client');
    });
// });