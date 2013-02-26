﻿using Glimpse.Core.Extensibility;

namespace Glimpse.Knockout
{
    public sealed class ClientScript : IStaticClientScript
    {
        public ScriptOrder Order { get { return ScriptOrder.IncludeAfterClientInterfaceScript; } }
        public string GetUri(string version)
        {
            return "/Scripts/glimpse-knockout.js";
        }
    }
}
