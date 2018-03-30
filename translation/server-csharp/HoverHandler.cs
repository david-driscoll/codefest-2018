using System.IO;
using System.Threading;
using System.Threading.Tasks;
using OmniSharp.Extensions.LanguageServer.Protocol;
using OmniSharp.Extensions.LanguageServer.Protocol.Client.Capabilities;
using OmniSharp.Extensions.LanguageServer.Protocol.Models;

namespace server_csharp
{
    class HoverHandler : IHoverHandler
    {
        private readonly SimpleParser parser;
        private readonly Translator translator;
        private HoverCapability capability;

        public HoverHandler(SimpleParser parser)
        {
            this.parser = parser;
            using (var reader = new StreamReader(typeof(Translator).Assembly.GetManifestResourceStream("server-csharp.key.secret")))
            {
                var key = reader.ReadToEnd().Trim();
                this.translator = new Translator(key);
            }
        }

        public TextDocumentRegistrationOptions GetRegistrationOptions()
        {
            return new TextDocumentRegistrationOptions()
            {
                DocumentSelector = new DocumentSelector(
                    new DocumentFilter()
                    {
                        Pattern = "**/*.*"
                    }
                )
            };
        }

        public async Task<Hover> Handle(TextDocumentPositionParams request, CancellationToken token)
        {
            await Task.Yield();

            var item = parser.GetItemAtCursor(request.Position);
            if (item == null) return null;

            return new Hover()
            {
                Contents = new MarkedStringsOrMarkupContent(
                    new MarkupContent()
                    {
                        Kind = MarkupKind.Markdown,
                        Value = $@"Original: {item.Value}

Translated: **{await translator.TranslateText(item.Value)}**"
                    }
                ),
                Range = item.Range
            };
        }

        public void SetCapability(HoverCapability capability)
        {
            this.capability = capability;
        }
    }
}
