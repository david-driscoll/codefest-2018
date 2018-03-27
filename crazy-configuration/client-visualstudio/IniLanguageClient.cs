using Microsoft.VisualStudio;
using Microsoft.VisualStudio.LanguageServer.Client;
using Microsoft.VisualStudio.Shell;
using Microsoft.VisualStudio.Shell.Interop;
using Microsoft.VisualStudio.Threading;
using Microsoft.VisualStudio.Utilities;
using StreamJsonRpc;
using System;
using System.Collections.Generic;
using System.ComponentModel.Composition;
using System.Diagnostics;
using System.IO;
using System.IO.Pipes;
using System.Reflection;
using System.Threading;
using System.Threading.Tasks;
using Task = System.Threading.Tasks.Task;

namespace MockLanguageExtension
{
    [ContentType("ini")]
    [Export(typeof(ILanguageClient))]
    public class IniLanguageClient : ILanguageClient, ILanguageClientCustomMessage
    {
        internal const string UiContextGuidString = "02485db8-f875-4e4b-b81a-4255fceca408";

        private Guid uiContextGuid = new Guid(UiContextGuidString);

        public event AsyncEventHandler<EventArgs> StartAsync;
        public event AsyncEventHandler<EventArgs> StopAsync;

        public IniLanguageClient()
        {
            Instance = this;
        }

        internal static IniLanguageClient Instance
        {
            get;
            set;
        }

        internal JsonRpc Rpc
        {
            get;
            set;
        }

        public string Name => "Ini Language Extension";

        public IEnumerable<string> ConfigurationSections
        {
            get
            {
                yield return "ini";
            }
        }

        public object InitializationOptions => null;

        public IEnumerable<string> FilesToWatch => null;

        public object MiddleLayer => null;

        public object CustomMessageTarget => null;

        public Task OnServerInitializeFailedAsync(Exception e)
        {
            throw new NotImplementedException();
        }

        public async Task<Connection> ActivateAsync(CancellationToken token)
        {
            //var info = GetJavaStart(@"TODO");
            var info = GetJavaStart();

            Process process = new Process();
            process.StartInfo = info;

            process.Start();
            var connection = new Connection(process.StandardOutput.BaseStream, process.StandardInput.BaseStream);

            return connection;
        }

        private ProcessStartInfo GetJavaStart()
        {
            var config = "win";

            var serverHome = Path.Combine(Path.GetDirectoryName(Assembly.GetExecutingAssembly().Location), @"Server\");
            var command = @"dotnet.exe";

            var dataDir = Path.GetTempFileName();
            File.Delete(dataDir);
            Directory.CreateDirectory(dataDir);
            var args = new List<string>();

            args.AddRange(new[]
            {
                "\"" + Path.Combine(serverHome, "server-csharp.dll") + "\""
            });

            ProcessStartInfo info = new ProcessStartInfo
            {
                UseShellExecute = false,
                FileName = command,
                Arguments = string.Join(" ", args),
                WorkingDirectory = serverHome,
                RedirectStandardInput = true,
                RedirectStandardOutput = true,
                RedirectStandardError = true,
                CreateNoWindow = true
            };

            return info;
        }

        public async System.Threading.Tasks.Task AttachForCustomMessageAsync(JsonRpc rpc)
        {
            this.Rpc = rpc;

            await ThreadHelper.JoinableTaskFactory.SwitchToMainThreadAsync();
        }

        public async System.Threading.Tasks.Task OnLoadedAsync()
        {
            await StartAsync?.InvokeAsync(this, EventArgs.Empty);
        }

        public Task OnServerInitializedAsync()
        {
            System.Diagnostics.Debugger.Break();
            return Task.CompletedTask;
        }
    }
}
