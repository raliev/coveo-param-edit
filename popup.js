document.addEventListener('DOMContentLoaded', () => {
  const textarea = document.getElementById('overrides');
  const status = document.getElementById('status');

  // Load saved settings
  chrome.storage.local.get(['coveoOverrides'], (result) => {
    if (result.coveoOverrides) {
      textarea.value = JSON.stringify(result.coveoOverrides, null, 2);
    }
  });

  document.getElementById('save').addEventListener('click', async () => {
    try {
      const overrides = JSON.parse(textarea.value);

      // 1. Save to storage
      await chrome.storage.local.set({ coveoOverrides: overrides });
      status.textContent = "Saved. ";

      // 2. Get active tab
      const [tab] = await chrome.tabs.query({active: true, currentWindow: true});

      if (!tab.url.includes("slb.com")) {
        status.textContent += " (Wrong site: go to slb.com)";
        status.style.color = "orange";
        return;
      }

      // 3. Try sending message
      chrome.tabs.sendMessage(tab.id, { type: "UPDATE_OVERRIDES", payload: overrides }, (response) => {
        if (chrome.runtime.lastError) {
          // 4. Message failed? Script isn't there. Inject it manually!
          console.log("Script missing. Injecting now...");
          status.textContent += "Injecting script...";

          chrome.scripting.executeScript({
            target: { tabId: tab.id },
            files: ['content.js']
          }, () => {
            // Retry sending message after injection
            setTimeout(() => {
              chrome.tabs.sendMessage(tab.id, { type: "UPDATE_OVERRIDES", payload: overrides });
              status.textContent += " Done! (Injected)";
              status.style.color = "green";
            }, 100);
          });
        } else {
          status.textContent += " Applied!";
          status.style.color = "green";
        }
      });

    } catch (e) {
      console.error(e);
      status.textContent = "Error: Invalid JSON";
      status.style.color = "red";
    }
  });
});
