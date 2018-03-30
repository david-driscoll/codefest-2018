using System;
using System.Linq;
using System.Reflection;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
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
}
