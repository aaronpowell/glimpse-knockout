using Glimpse.Core.Extensibility;

namespace Glimpse.Knockout
{
    public sealed class ClientScript : IDynamicClientScript
    {
        public ScriptOrder Order { get { return ScriptOrder.IncludeAfterClientInterfaceScript; } }
        public string GetResourceName()
        {
            return "Glimpse.Knockout.Scripts.glimpse-knockout.js";
        }
    }
}
