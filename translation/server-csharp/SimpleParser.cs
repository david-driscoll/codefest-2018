using System;
using System.Collections.Generic;
using System.Linq;
using Newtonsoft.Json;
using OmniSharp.Extensions.LanguageServer.Protocol;
using OmniSharp.Extensions.LanguageServer.Protocol.Models;
using OmniSharp.Extensions.LanguageServer.Server;

namespace server_csharp
{
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
