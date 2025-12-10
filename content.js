// Wrap in an IIFE or check a global flag to prevent double-execution errors
if (!window.coveoInterceptorLoaded) {
    window.coveoInterceptorLoaded = true;

    // 1. Inject the script that actually hooks into window.fetch
    const s = document.createElement('script');
    s.src = chrome.runtime.getURL('injected.js');
    s.onload = function() {
        this.remove();
    };
    (document.head || document.documentElement).appendChild(s);

    // 2. Listen for storage changes (Popup -> Content Script -> Injected Script)
    chrome.storage.local.get(['coveoOverrides'], (result) => {
        if (result.coveoOverrides) {
            window.postMessage({ type: "COVEO_CONFIG_INIT", payload: result.coveoOverrides }, "*");
        }
    });

    chrome.runtime.onMessage.addListener((message) => {
        if (message.type === "UPDATE_OVERRIDES") {
            window.postMessage({ type: "COVEO_CONFIG_UPDATE", payload: message.payload }, "*");
        }
    });

    console.log("[Coveo Interceptor] Content script loaded.");
}
