# CNMI Tree — live public data (read-only)

The public GitHub Pages site can refresh the approved inventory and carbon summary every **5 minutes**, but the Apps Script must first be deployed by the spreadsheet owner.

## Setup (one-time)

1. Open the **CNMI Tree Master** Google Sheet (ID `1VSjMe8JJY5DZZVlb7v-AuaSB0wfAz21sdA4_8vAM4No`).
2. Open **Extensions → Apps Script**.
3. Create a new script file named `public-api.gs` and paste the contents of [public-api.gs](./public-api.gs). Do not delete or overwrite existing Apps Script code.
4. **Deploy → New deployment → Web app**. Choose **Execute as: Me** and **Who has access: Anyone**. Approve access to both the Master and original 05-CNMI_Tree spreadsheets.
5. Copy the Web App URL ending in `/exec`. The URL is public and **read-only**. Do not use it for uploads or staff functions.
6. Edit [public/data/live-config.json](../public/data/live-config.json) on GitHub and paste that URL as `publicApiUrl`; commit the change.
7. Wait for GitHub Actions to finish and reload https://mpchamp90.github.io/cnmi-tree/. The top-right badge will show the latest data timestamp and automatic refresh status.

## Data definition

- Total trees and **measured trees**: existing values from original workbook `Summary!A3:B3`, preserving its custom `COUNT_TREES_DONE` rule.
- Total CO₂e: existing value from `Summary!C3`; no recalculation of carbon formulas.
- Per-area CO₂e: aggregate the values already present in `CNMI Tree Master / Tree!I`.
- Public tree details: the previously approved fields only, joined to `Tree_Registry` for stable UID.
- If live loading fails, the site retains the last successfully loaded data or the GitHub snapshot and labels it accordingly.

## Security / caveats

The Web App executes as its owner, so the endpoint must return **public-approved fields only**. Do not paste sensitive data, private staff information, Drive upload permissions, or API credentials into it. This is a public **read-only** endpoint. A separate authenticated backend will be required for photo uploads.

Google Apps Script's cross-origin redirect can prevent ordinary fetch requests from GitHub Pages. The frontend therefore uses a JSONP callback with a fixed URL from its config. This endpoint must never serve confidential information.

The source workbook's `Summary!B3` measured count is different from merely counting nonempty CO₂e cells in Master. Do not replace it with that shortcut.

If updating the Apps Script code later, deploy a **new version** of the existing Web App deployment.
