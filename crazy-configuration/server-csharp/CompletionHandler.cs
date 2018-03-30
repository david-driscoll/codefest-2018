using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using OmniSharp.Extensions.LanguageServer.Protocol;
using OmniSharp.Extensions.LanguageServer.Protocol.Client.Capabilities;
using OmniSharp.Extensions.LanguageServer.Protocol.Models;

namespace server_csharp
{
    class CompletionHandler : ICompletionHandler
    {
        private readonly SimpleIniParser parser;
        private CompletionCapability capability;

        public CompletionHandler(SimpleIniParser parser)
        {
            this.parser = parser;
        }

        public CompletionRegistrationOptions GetRegistrationOptions()
        {
            return new CompletionRegistrationOptions()
            {
                DocumentSelector = new DocumentSelector(
                    new DocumentFilter()
                    {
                        Pattern = "**/*.ini"
                    }
                )
            };
        }

        public async Task<CompletionList> Handle(TextDocumentPositionParams request, CancellationToken token)
        {
            await Task.Yield();

            var item = parser.GetItemAtCursor(request.Position);
            if (item?.Type == "section")
            {
                return new CompletionList(
                    parser.GetSections()
                        .Select(x => new CompletionItem()
                        {
                            Label = x,
                            Kind = CompletionItemKind.Keyword,
                            InsertText = item == null ? $"[{x}]" : x,
                            FilterText = x,
                            SortText = x
                        })
                );
            }
            item = parser.GetItemNearCursor(request.Position);
            if (item == null)
            {
                return new CompletionList(
                    parser.GetSections()
                        .Select(x => new CompletionItem()
                        {
                            Label = x,
                            Kind = CompletionItemKind.Keyword,
                            InsertText = item == null ? $"[{x}]" : x,
                            FilterText = x,
                            SortText = x
                        })
                );
            }
            return new CompletionList(
                parser.GetNamesForSection(request.Position)
                    .Select(x => new CompletionItem()
                    {
                        Label = x,
                        Kind = CompletionItemKind.Field,
                        InsertText = x,
                        FilterText = x,
                        SortText = x
                    })
            );
        }

        public void SetCapability(CompletionCapability capability)
        {
            this.capability = capability;
        }
    }
}
