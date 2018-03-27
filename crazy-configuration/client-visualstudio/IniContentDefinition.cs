using Microsoft.VisualStudio.LanguageServer.Client;
using Microsoft.VisualStudio.Utilities;
using System.ComponentModel.Composition;

namespace MockLanguageExtension
{
    public class IniContentDefinition
    {
        [Export]
        [Name("ini")]
        [BaseDefinition(CodeRemoteContentDefinition.CodeRemoteContentTypeName)]
        internal static ContentTypeDefinition FooContentTypeDefinition;


        [Export]
        [FileExtension(".ini")]
        [ContentType("ini")]
        internal static FileExtensionToContentTypeDefinition FooFileExtensionDefinition;
    }
}
