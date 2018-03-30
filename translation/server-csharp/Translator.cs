using System.Net.Http;
using System.Threading.Tasks;
using System.Xml.Linq;

namespace server_csharp
{
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
}
