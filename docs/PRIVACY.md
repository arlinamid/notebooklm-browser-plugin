# Privacy Policy

**Effective Date:** 2026-08-02
**Applies to:** version 1.4.3 and later

This Privacy Policy describes how Prompt Architect for NotebookLM ("the Extension", "we", "us", or "our") handles your data.

## 1. Data Collection

**We do not collect, transmit, distribute, or sell your personal data.** There is no account, no sign-up, no telemetry, and no server operated by us. There is nowhere for your data to be sent, because no such destination exists.

## 2. What the Extension Stores

The Extension uses the `storage` permission to keep two things: your settings (interface language, which built-in templates you have hidden) and any prompt templates you create yourself.

This is stored in two places:

- **`chrome.storage.local`** — on your own device. Nothing here leaves your computer.
- **`chrome.storage.sync`** — Chrome's own synchronisation storage, so your saved prompts and settings follow you to other computers where you are signed into the same Chrome profile.

**Please note what `chrome.storage.sync` means for you.** When you are signed into Chrome with sync enabled, Chrome uploads that data to Google's servers so it can reach your other devices. That transfer is performed by Chrome itself under [Google's Privacy Policy](https://policies.google.com/privacy) — not by us, and we have no access to it at any point. If you are not signed into Chrome, this storage behaves as local storage and nothing is uploaded.

The only data placed there is what is described above. Your NotebookLM sources, chats and generated content are never stored or copied by the Extension.

You can remove everything at any time by uninstalling the Extension, or by clearing the extension's data from Chrome's settings.

## 3. Host Permissions

The Extension requests permission to read and change data on `notebook.google.com` and `notebooklm.google.com`.

This is used solely to inject the prompt template selector into the NotebookLM interface and to place selected prompt text into its chat and Studio inputs. The Extension does not read, intercept, log or transmit your conversations, sources, documents or generated output.

## 4. Analytics and Tracking

The Extension contains no third-party analytics, tracking scripts, advertising, or remotely loaded code. Everything it runs ships inside the extension package and is visible in the [public source repository](https://github.com/arlinamid/notebooklm-browser-plugin).

## 5. External Resources

The popup loads the Google Fonts stylesheet and two images hosted by GitHub and Buy Me a Coffee for the author's profile picture and support button. Requesting those files tells the hosting service your IP address, as any web request does. No identifying information about you or your prompts is included.

## 6. Changes to This Policy

We may update this Privacy Policy to reflect changes in the Extension or for operational, legal, or regulatory reasons. The effective date above records when it was last revised.

## 7. Contact

Questions or concerns: please open an issue in the [GitHub repository](https://github.com/arlinamid/notebooklm-browser-plugin/issues).
