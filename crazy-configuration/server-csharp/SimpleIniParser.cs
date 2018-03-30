using System;
using System.Collections.Generic;
using System.Linq;
using Newtonsoft.Json;
using OmniSharp.Extensions.LanguageServer.Protocol;
using OmniSharp.Extensions.LanguageServer.Protocol.Models;
using OmniSharp.Extensions.LanguageServer.Server;

namespace server_csharp
{
    class SimpleIniParser
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

        public SimpleIniParser(ILanguageServer server)
        {
            this.server = server;
        }

        public void Update(Uri file, string content)
        {
            this.content = content;
            this.items = ParseItems(server, content);

            var diagnostics = new List<Diagnostic>();

            var sections = GetCurrentSections();
            var matchedSections = Data.GetSections()
                .Join(sections, x => x, x => x, (a, b) => a, StringComparer.OrdinalIgnoreCase);
            var extraSections = sections.Except(matchedSections, StringComparer.OrdinalIgnoreCase);
            if (extraSections.Any())
            {
                foreach (var section in extraSections.Select(x => items.First(z => z.Value == x)))
                {
                    diagnostics.Add(new Diagnostic()
                    {
                        Range = section.Range,
                        Severity = DiagnosticSeverity.Warning,
                        Message = $"Unknown section '{section.Value}'"
                    });
                }
            }

            foreach (var section in sections.Select(x => items.First(z => z.Value == x)))
            {
                var names = GetCurrentItemsForSection(section.Value);
                var matchedNames = Data.GetNamesForSection(section.Value)
                    .Join(names, x => x, x => x.Value, (a, b) => b, StringComparer.OrdinalIgnoreCase);
                var extraNames = names.Except(matchedNames);
                foreach (var name in extraNames)
                {
                    diagnostics.Add(new Diagnostic()
                    {
                        Range = name.Range,
                        Severity = DiagnosticSeverity.Warning,
                        Message = $"Unknown name '{name.Value}'"
                    });
                }
            }

            server.PublishDiagnostics(new PublishDiagnosticsParams()
            {
                Uri = file,
                Diagnostics = diagnostics
            });
        }

        private static List<Item> ParseItems(ILanguageServer server, string content)
        {
            var items = new List<Item>();
            var length = content.Length;
            var index = 0;
            var line = 0L;
            var column = 0L;
            Item currentItem = null;
            Item currentSection = null;
            while (index < length)
            {
                var c = content[index];
                switch (c)
                {
                    case '[':
                        currentSection = currentItem = new Item() { Type = "section" };
                        currentItem.Range.Start = new Position(line, column);
                        break;
                    case ']':
                        currentItem.Range.End = new Position(line, column + 1);
                        items.Add(currentItem);
                        currentItem = null;
                        break;
                    case '\n':
                        if (currentItem != null)
                            items.Add(currentItem);
                        currentItem = null;
                        line++;
                        column = -1;
                        break;
                    case '=':
                        currentItem.Range.End = new Position(line, column);
                        items.Add(currentItem);
                        var oldItem = currentItem;
                        currentItem = new Item() { Type = "value", For = oldItem };
                        currentItem.Range.Start = new Position(line, column);
                        break;
                    default:
                        if (char.IsLetterOrDigit(c))
                        {
                            if (currentItem == null)
                            {
                                currentItem = new Item() { Type = "name", For = currentSection };
                                currentItem.Range.Start = new Position(line, column);
                            }
                            currentItem.Value += c;
                        }
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

            // server.Log(new LogMessageParams() {
            //     Type = MessageType.Info,
            //     Message = JsonConvert.SerializeObject(items, Formatting.Indented)
            // });
            return items;
        }

        public Item GetItemNearCursor(Position position)
        {
            foreach (var item in items.AsEnumerable().Reverse())
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
                    else if (item.Range.Start.Line == position.Line - 1 && item.Range.End.Line == position.Line - 1)
                    {
                        return item;
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

        public IEnumerable<string> GetNamesForSection(Position position)
        {
            var item = GetItemNearCursor(position);
            server.Log($"Item for position{position.Line},{position.Character}: {item?.Type}{item?.Value}");
            while (item != null)
            {
                if (item.Type == "section")
                {
                    var names = Data.GetNamesForSection(item.Value)
                        .Except(GetCurrentNamesForSection(item.Value), StringComparer.OrdinalIgnoreCase);
                    server.Log(string.Join(", ", names));
                    foreach (var name in names)
                    {
                        yield return name;
                    }
                    yield break;
                }
                item = item.For;
            }
        }

        private IEnumerable<Item> GetSectionItems()
        {
            return items.Where(x => x.Type == "section");
        }

        private IEnumerable<string> GetCurrentSections()
        {
            return items.Where(x => x.Type == "section").Select(x => x.Value);
        }

        private IEnumerable<string> GetCurrentNamesForSection(string section)
        {
            return items
                .Where(x => x.Type == "name" && x.For?.Value?.Equals(section, StringComparison.OrdinalIgnoreCase) == true)
                .Select(x => x.Value);
        }

        private IEnumerable<Item> GetCurrentItemsForSection(string section)
        {
            return items
                .Where(x => x.Type == "name" && x.For?.Value?.Equals(section, StringComparison.OrdinalIgnoreCase) == true);
        }

        public IEnumerable<string> GetSections()
        {
            var names = Data.GetSections();
            names = names
                .Except(GetCurrentSections(), StringComparer.OrdinalIgnoreCase);
            foreach (var name in names)
            {
                yield return name;
            }
        }

        public string GetNameAtCursor(Position position)
        {
            return GetItemNearCursor(position)?.Value;
        }
    }
}
