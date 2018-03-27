using Microsoft.VisualStudio.LanguageServer.Client;
using Microsoft.VisualStudio.Utilities;
using System.ComponentModel.Composition;

namespace MockLanguageExtension
{
    public class JavaContentDefinition
    {
        [Export]
        [Name("java")]
        [BaseDefinition(CodeRemoteContentDefinition.CodeRemoteContentTypeName)]
        internal static ContentTypeDefinition FooContentTypeDefinition;


        [Export]
        [FileExtension(".java")]
        [ContentType("java")]
        internal static FileExtensionToContentTypeDefinition FooFileExtensionDefinition;
    }
}
