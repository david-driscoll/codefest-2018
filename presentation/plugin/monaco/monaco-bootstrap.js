/// <reference path="../../node_modules/monaco-editor/monaco.d.ts" />
require.config({ paths: { vs: '../../node_modules/monaco-editor/min/vs' } });

window.bootstrapEditor = function(element, context) {
    const { code, reference, language, theme, fontSize, lsp, filename } = context;
    return new Promise((resolve, reject) => {
        require(['vs/editor/editor.main'], function() {
            var config = Object.assign(
                {
                    promises: [],
                    code: '',
                },
                (window.Reveal || window.parent.Reveal).getConfig().monaco,
                {
                    promises: [],
                }
            );
            var referenceString = reference;
            if (referenceString) {
                try {
                    var references = JSON.parse(referenceString);
                    references.forEach(function(reference) {
                        config.promises.push(
                            xhr('../../' + reference).then(
                                function(response) {
                                    monaco.languages.typescript.javascriptDefaults.addExtraLib(
                                        response.responseText,
                                        reference
                                    );
                                    monaco.languages.typescript.typescriptDefaults.addExtraLib(
                                        response.responseText,
                                        reference
                                    );
                                },
                                function(error) {
                                    console.warn(
                                        "Error loading reference '" + reference + "': ",
                                        error
                                    );
                                }
                            )
                        );
                    });
                } catch (error) {
                    console.warn(
                        'Reference value "' +
                            referenceString +
                            '" is not a valid JSON array. More information: ',
                        error
                    );
                }
            }
            config.code = code;
            config.language = language;
            config.theme = theme;
            config.fontSize = fontSize;
            config.filename = filename;

            return Promise.all(config.promises)
                .then(load)
                .then(editor => resolve(editor));

            function load() {
                var editor = monaco.editor.create(element, {
                    theme: config.theme || 'vs-dark',
                    fontSize: config.fontSize || 20,
                    fontLigatures: true,
                    fontFamily: 'Fira Code',
                    model: monaco.editor.createModel(
                        config.code || '',
                        config.language || 'typescript',
                        `file://${window.rootDir}/${config.filename}`
                    )
                });
                window.addEventListener('resize', () => editor.layout());
                if (lsp) {
                    window.configureLsp(editor, lsp, code);
                }
                return editor;
            }

            /**
             * Taken from https://github.com/Microsoft/monaco-editor/blob/5cee62a7c0d1007660d79c280963c7989590aae3/website/playground/playground.js#L311
             */
            function xhr(url) {
                var req = null;
                return new Promise(
                    function(resolve, reject, p) {
                        req = new XMLHttpRequest();
                        req.onreadystatechange = function() {
                            if (req._canceled) {
                                return;
                            }
                            if (req.readyState === 4) {
                                if (
                                    (req.status >= 200 && req.status < 300) ||
                                    req.status === 1223
                                ) {
                                    resolve(req);
                                } else {
                                    reject(req);
                                }
                                req.onreadystatechange = function() {};
                            } else {
                                //p(req);
                            }
                        };
                        req.open('GET', url, true);
                        req.responseType = '';
                        req.send(null);
                    },
                    function() {
                        req._canceled = true;
                        req.abort();
                    }
                );
            }
        });
    });
};
