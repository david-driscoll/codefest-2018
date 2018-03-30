using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net.Http;
using System.Reflection;
using System.Threading;
using System.Threading.Tasks;
using System.Xml.Linq;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;
using OmniSharp.Extensions.LanguageServer.Protocol;
using OmniSharp.Extensions.LanguageServer.Protocol.Client.Capabilities;
using OmniSharp.Extensions.LanguageServer.Protocol.Models;
using OmniSharp.Extensions.LanguageServer.Server;

namespace server_csharp
{
    class Program
    {
        static async Task Main(string[] args)
        {
            var server = new LanguageServer(Console.OpenStandardInput(), Console.OpenStandardOutput(), new LoggerFactory());
            var parser = new SimpleParser(server);
            server.AddHandlers(
                new TextDocumentHandler(server, parser),
                new HoverHandler(parser)
            );

            await server.Initialize();
            await server.WaitForExit;
        }
    }

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

    class Translator
    {
        public Translator(string key)
        {
            this.key = key;
        }
        const string host = "https://api.microsofttranslator.com";
        const string path = "/V2/Http.svc/Translate";

        // NOTE: Replace this example key with a valid subscription key.
        public readonly string key;

        public async Task<string> TranslateText(string text)
        {
            HttpClient client = new HttpClient();
            client.DefaultRequestHeaders.Add("Ocp-Apim-Subscription-Key", key);

            string uri = host + path + "?to=ru-ru&text=" + System.Net.WebUtility.UrlEncode(text);

            HttpResponseMessage response = await client.GetAsync(uri);

            string result = await response.Content.ReadAsStringAsync();
            // NOTE: A successful response is returned in XML. You can extract the contents of the XML as follows.
            var content = XElement.Parse(result).Value;
            return content;
        }
    }

    class SimpleParser
    {
        public class Item
        {
            public Range Range { get; } = new Range();
            public string Value { get; set; } = "";
            public string Type { get; set; }
            public Item For { get; set; }
        }
        private string content;
        private List<Item> items = new List<Item>();
        private readonly ILanguageServer server;

        public SimpleParser(ILanguageServer server)
        {
            this.server = server;
        }

        public void Update(Uri file, string content)
        {
            this.content = content;
            try
            {
                this.items = ParseItems(server, content);
            }
            catch (Exception e)
            {
                server.LogError(e.ToString());
            }
        }

        private static List<Item> ParseItems(ILanguageServer server, string content)
        {
            var items = new List<Item>();
            var length = content.Length;
            var index = 0;
            var line = 0L;
            var column = 0L;
            Item currentItem = null;
            var commentStart = false;
            var mutlilineComment = false;
            while (index < length)
            {
                var c = content[index];
                switch (c)
                {
                    case '/':
                        if (!commentStart)
                        {
                            commentStart = true;
                        }
                        else
                        {
                            commentStart = false;
                            currentItem = new Item() { Type = "comment" };
                            currentItem.Range.Start = new Position(line, column - 1);
                        }
                        break;
                    case '*':
                        if (mutlilineComment && content[index + 1] == '/')
                        {
                            if (currentItem != null)
                                items.Add(currentItem);
                            currentItem.Value = currentItem.Value.Trim();
                            currentItem.Range.End = new Position(line, column + 1);
                            currentItem = null;
                            mutlilineComment = false;
                        }
                        else if (commentStart)
                        {
                            mutlilineComment = true;
                            currentItem = new Item() { Type = "comment" };
                            currentItem.Range.Start = new Position(line, column - 1);
                        }
                        break;
                    case '\n':
                        if (mutlilineComment)
                        {
                            line++;
                            column = -1;
                            break;
                        }

                        if (currentItem != null)
                        {
                            items.Add(currentItem);
                            currentItem.Range.End = new Position(line, column);
                            currentItem.Value = currentItem.Value.Trim();
                        }
                        currentItem = null;
                        line++;
                        column = -1;
                        break;
                    case '\r':
                        break;
                    default:
                        if (currentItem != null) currentItem.Value += c;
                        break;
                }
                index++;
                column++;
            }
            if (currentItem != null)
            {
                currentItem.Range.End = new Position(line, column);
                items.Add(currentItem);
            }

            server.Log(new LogMessageParams()
            {
                Type = MessageType.Info,
                Message = JsonConvert.SerializeObject(items, Formatting.Indented)
            });
            return items;
        }

        public Item GetItemAtCursor(Position position)
        {
            foreach (var item in items.AsEnumerable())
            {
                try
                {
                    if (item.Range.Start.Line == position.Line && item.Range.End.Line == position.Line)
                    {
                        if (item.Range.Start.Character <= position.Character && item.Range.End.Character >= position.Character)
                        {
                            return item;
                        }
                    }
                }
                catch (Exception e)
                {
                    server.Log(JsonConvert.SerializeObject(item));
                    server.Log(e.ToString());
                }
            }
            return null;
        }
    }
}
