(function() {
    // 1. Prevent double injection
    if (window.CoveoInterceptorHasRun) return;
    window.CoveoInterceptorHasRun = true;

    let overrides = {};

    // 2. Listen for configuration from Popup
    window.addEventListener("message", (event) => {
        if (event.data.type === "COVEO_CONFIG_INIT" || event.data.type === "COVEO_CONFIG_UPDATE") {
            overrides = event.data.payload;
            console.log("%c[Coveo Interceptor] Overrides updated:", "color: cyan", overrides);
        }
    });

    // ============================================================
    // HELPER: Function to modify body params
    // ============================================================
    function modifyCoveoBody(bodyString) {
        try {
            const params = new URLSearchParams(bodyString);
            let modified = false;

            for (const [key, value] of Object.entries(overrides)) {
                // Apply override
                params.set(key, value);
                modified = true;
                console.log(`%c[Override] Setting ${key} = ${value}`, "color: yellow");
            }

            return modified ? params.toString() : bodyString;
        } catch (e) {
            console.error("Error parsing params", e);
            return bodyString;
        }
    }

    // ============================================================
    // HOOK 1: window.fetch (Modern API)
    // ============================================================
    const originalFetch = window.fetch;
    window.fetch = async function(resource, config) {
        let url = resource;
        if (resource instanceof Request) url = resource.url;

        if (url && typeof url === 'string' && url.includes('/coveo/rest/search/v2')) {
            console.log("[Coveo Interceptor] Fetch detected:", url);
            if (config && config.body) {
                config.body = modifyCoveoBody(config.body);
            }
        }
        return originalFetch.apply(this, arguments);
    };

    // ============================================================
    // HOOK 2: XMLHttpRequest (Legacy API - Likely used by Coveo)
    // ============================================================
    const XHR = XMLHttpRequest.prototype;
    const originalOpen = XHR.open;
    const originalSend = XHR.send;

    // Step A: Intercept .open() to capture the URL
    XHR.open = function(method, url) {
        this._url = url; // Save URL to the instance for later check in .send()
return originalOpen.apply(this, arguments);
    };

    // Step B: Intercept .send() to modify the Body
    XHR.send = function(body) {
        if (this._url && typeof this._url === 'string' && this._url.includes('/coveo/rest/search/v2')) {
            console.groupCollapsed("%c[Coveo Interceptor] XHR Request Detected", "color: orange");
            console.log("Original Body:", body);

            if (body && typeof body === 'string') {
                const newBody = modifyCoveoBody(body);
                console.log("Modified Body:", newBody);
                arguments[0] = newBody; // Override the argument passed to send
            }
            console.groupEnd();
        }
        return originalSend.apply(this, arguments);
    };

    console.log("%c[Coveo Interceptor] Hooks installed (Fetch + XHR).", "color: lime");
})();
