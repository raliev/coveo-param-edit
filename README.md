# Coveo Search Request Interceptor

This Chrome Extension is a developer tool designed to intercept, inspect, and modify HTTP requests sent to the Coveo Search V2 REST API. It allows engineers to troubleshoot search relevance and behavior by overriding request parameters (such as query strings, result counts, or advanced query expressions) in real-time, without modifying the source code of the application.

## Overview

Modern enterprise search implementations often rely on complex frontend logic to construct search queries. Debugging these requests typically requires intercepting network traffic or modifying minified JavaScript.

This extension simplifies the process by injecting a proxy layer into the browser's network stack. It hooks into both `window.fetch` and `XMLHttpRequest` to modify the POST body payload immediately before the request is transmitted to the server.

## Features

  * **Dual Protocol Support:** Intercepts both modern `fetch` API calls and legacy `XMLHttpRequest` (XHR) widely used by Sitecore/Coveo integrations.
  * **JSON Configuration:** Allows users to define parameter overrides using a simple JSON format.
  * **Targeted Interception:** Specifically targets the `/coveo/rest/search/v2` endpoint to avoid disrupting other network traffic.
  * **Hot Application:** Updates to parameter overrides are applied immediately to subsequent requests without requiring a page reload.
  * **Persistent Storage:** Saves configuration preferences in Chrome Local Storage.

## Installation

This extension is intended for local development and is not distributed via the Chrome Web Store.

1.  Clone or download this repository to your local machine.
2.  Open Google Chrome and navigate to `chrome://extensions/`.
3.  Enable **Developer mode** using the toggle switch in the top right corner.
4.  Click the **Load unpacked** button.
5.  Select the directory containing the `manifest.json` file from this repository.

## Usage

1.  Navigate to the target website (configured in `manifest.json`).
2.  Click the extension icon in the Chrome toolbar.
3.  In the popup window, enter a JSON object containing the parameters you wish to override or inject.
4.  Click **Save & Apply**.
5.  Perform a search on the website.
6.  Open the Browser Developer Tools (F12) and view the Console to see logs regarding intercepted requests and applied overrides.

### Configuration Example

To force a specific search query and limit the results to 5, enter the following JSON:

```json
{
  "q": "corrosion management",
  "numberOfResults": "5",
  "sortCriteria": "date descending"
}
```

Any key-value pair provided in the JSON will either overwrite the existing parameter in the request body or be added if it does not exist.

## Technical Architecture

The extension utilizes Manifest V3 and operates via the following components:

  * **Popup:** Handles user input and saves configuration to `chrome.storage.local`.
  * **Content Script:** Acts as a bridge between the extension context and the page context. It injects the actual interception logic into the DOM.
  * **Injected Script:** runs in the "Main World" context of the browser. It monkey-patches `window.fetch` and `XMLHttpRequest.prototype.open`/`send`. When a request matching the Coveo signature is detected, it parses the `application/x-www-form-urlencoded` body, applies the overrides, and re-serializes the body before execution.

## Troubleshooting

If requests are not being intercepted:

1.  Ensure you are on the correct domain specified in `manifest.json`.
2.  Open the Developer Tools Console. You should see a message stating: `[Coveo Interceptor] Hooks installed (Fetch + XHR)`.
3.  If the script is not active, reload the page to ensure the content script is injected properly.

## License

MIT
