var RevealMonaco =
    window.RevealMonaco ||
    (function() {
        const KEYCODE_ESC = 9;
        function indexOf(element) {
            return Array.prototype.indexOf.call(element.parentElement.children, element);
        }

        const slideEditors = {};

        var options = Reveal.getConfig().monaco || {};
        options.base = options.base || 'plugin/monaco/';

        var currentEditors = [];

        Reveal.getSlides().forEach((element, index) => {
            const elements = element.querySelectorAll('monaco-editor');
            const editors = [];
            const active = false;
            slideEditors[index] = {
                elements,
                editors,
                active,
            };
        });

        function activateEditors(slide) {
            if (!slide) return;
            const index = indexOf(slide);
            const context = slideEditors[index];
            if (context.active) return;
            const indices = Reveal.getIndices(slide);
            loadEditors(slide, indices, context.editors);
            context.active = true;
        }

        function deactivateEditors(slide) {
            if (!slide) return;
            const index = indexOf(slide);
            const context = slideEditors[index];
            unloadEditors(slide, context.editors);
            context.active = false;
        }

        activateEditors(Reveal.getCurrentSlide());

        Reveal.addEventListener('slidechanged', function(event) {
            const direction =
                indexOf(event.currentSlide) > indexOf(event.previousSlide) ? 1 : -1;
            const lastSlide = Reveal.getSlide(
                indexOf(event.previousSlide) - 1 * direction
            );
            deactivateEditors(lastSlide);
            activateEditors(event.currentSlide);
            activateEditors(Reveal.getSlide(indexOf(event.currentSlide) + 1 * direction));
        });

        function loadEditors(element, event, editors) {
            var elements = element.querySelectorAll('monaco-editor');
            Array.from(elements).reduce((promise, element, i) => {
                element.className = 'stretch';
                element.id = 'monaco-' + event.indexh + '-' + event.indexv + '-' + i;

                let resolve;
                const promise2 = new Promise(r => (resolve = r));
                const lsp = element.getAttribute('lsp') || '';
                const context = {
                    ...options,
                    lsp,
                    filename: element.getAttribute('filename'),
                };
                context.theme = element.getAttribute('theme') || options.theme;
                context.fontSize = element.getAttribute('fontSize') || options.fontSize;
                context.language = element.getAttribute('language') || options.language;

                var iframe = document.createElement('iframe');
                iframe.className = 'monaco-frame';
                iframe.src = options.base + 'monaco-container.html';
                iframe.onload = () => {
                    extractCode(element)
                        .then(code => {
                            context.code = code;
                            return iframe.contentWindow
                                .bootstrapEditor(
                                    iframe.contentDocument.getElementById(
                                        'monaco-container'
                                    ),
                                    context
                                )
                                .then(editor => {
                                    editors.push(editor);

                                    editor.onKeyUp(e => {
                                        if (e.keyCode === KEYCODE_ESC) {
                                            document.activeElement.blur();
                                        }
                                    });
                                });
                        })
                        .then(resolve);
                };

                return promise.then(() => element.appendChild(iframe)).then(promise2);
            }, Promise.resolve());
        }

        function unloadEditors(element, editors) {
            editors.forEach(editor => {
                editor.dispose();
            });
            editors = [];
            var elements = element.querySelectorAll('monaco-editor');
            elements.forEach(function(element) {
                element.querySelectorAll('iframe.monaco-frame').forEach(function(el) {
                    el.remove();
                });
            });
        }

        async function extractCode(element) {
            var url = element.getAttribute('url');
            let code;
            if (url) {
                code = await fetch(url).then(
                    function(c) {
                        return c.text();
                    },
                    function(e) {
                        return "Error loading '" + url + "': " + JSON.stringify(e);
                    }
                );
            } else {
                code = element.getAttribute('code') || '';
            }
            if (code) {
                code = code
                    .replace(/\\n/g, '\n')
                    .replace(/\\r/g, '\r')
                    .replace(/\\t/g, '\t');
            } else {
                var codeElement = element.querySelectorAll('.monaco-code')[0];
                if (codeElement) {
                    code = codeElement.innerHTML.trim();
                } else {
                    console.warn(
                        'Monaco Code editor with id of ' +
                            element.id +
                            ' has no code to display. Either use the "code" attribute on "#' +
                            element.id +
                            '" or create a child span with class "monaco-code" to provide code for the editor.'
                    );
                }
            }
            return code;
        }
    })();
