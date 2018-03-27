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
    [ContentType("java")]
    [Export(typeof(ILanguageClient))]
    public class JavaLanguageClient : ILanguageClient, ILanguageClientCustomMessage
    {
        internal const string UiContextGuidString = "DE885E15-D44E-40B1-A370-45372EFC23AA";

        private Guid uiContextGuid = new Guid(UiContextGuidString);

        public event AsyncEventHandler<EventArgs> StartAsync;
        public event AsyncEventHandler<EventArgs> StopAsync;

        public JavaLanguageClient()
        {
            Instance = this;
        }

        internal static JavaLanguageClient Instance
        {
            get;
            set;
        }

        internal JsonRpc Rpc
        {
            get;
            set;
        }

        public string Name => "Java Language Extension";

        public IEnumerable<string> ConfigurationSections
        {
            get
            {
                yield return "java";
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
            var info = GetJavaStart(@"D:\Development\david-driscoll\codefest-2018\examples");

            Process process = new Process();
            process.StartInfo = info;

            process.Start();
            var connection = new Connection(process.StandardOutput.BaseStream, process.StandardInput.BaseStream);

            return connection;
        }

        private ProcessStartInfo GetJavaStart(string projectPath)
        {
            var config = "win";

            //var serverHome = Path.Combine(Path.GetDirectoryName(Assembly.GetExecutingAssembly().Location), @"TODO");
            var serverHome = @"D:\Development\david-driscoll\codefest-2018\visual-studio-java\server\";
            var command = @"java.exe";

            var dataDir = Path.GetTempFileName();
            File.Delete(dataDir);
            Directory.CreateDirectory(dataDir);
            var args = new List<string>();
            if (8 >= 9)
            {
                args.AddRange(new[] {
                    "--add-modules=ALL-SYSTEM",
                    "--add-opens", "java.base/java.util=ALL-UNNAMED",
                    "--add-opens", "java.base/java.lang=ALL-UNNAMED"
                });
            }

            args.AddRange(new[]
            {
                "-jar", Path.Combine(serverHome, @"plugins\org.eclipse.equinox.launcher_1.5.0.v20180207-1446.jar"),
                "-configuration", Path.Combine(serverHome, $"config_{config}"),
                "-data", dataDir
            });

            ProcessStartInfo info = new ProcessStartInfo
            {
                UseShellExecute = false,
                FileName = command,
                Arguments = string.Join(" ", args),
                WorkingDirectory = Path.GetDirectoryName(projectPath),
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
