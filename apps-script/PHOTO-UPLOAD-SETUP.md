# Staff photo upload pilot — SESI 01–10

This is a **separate** authenticated Google Apps Script Web App. Do not paste into the existing public-api project (both define doGet).

1. Visit https://script.google.com/home/projects and create **New project**.
2. Paste `staff-photo-upload.gs` into `Code.gs`.
3. Add an **HTML** file named `Upload`, paste the contents of `Upload.html`.
4. In Code.gs replace `REPLACE_WITH_YOUR_GOOGLE_EMAIL` with your actual signed-in Google email. Keep `ALLOWED_EMAILS` restricted to approved staff. Confirm folder ID `1Jk7AT7VaUbdhnlIJ3k1wufTJ5oj3oQ6Z` is your intended Picture folder.
5. Deploy → New deployment → Web app. Execute as **Me**; Who has access: **Anyone with Google account** (or your Workspace organization, if available). **Never** grant anonymous access.
6. Test the Web App URL with `?tree=CNMI-T000214`. Select a small JPEG image and save. Confirm file appears in the Picture folder.
7. Send the deployed `/exec` URL to connect a staff upload action in CNMI Tree.

Security: Server checks `Session.getActiveUser().getEmail()` against the allowlist. In some personal Google account deployment configurations this may be blank when executing as the owner; the upload will fail closed. If that happens, use a Google Workspace deployment that provides a verifiable identity or an OAuth-based authenticated backend. Do **not** remove the allowlist or make the public endpoint writable.

Pilot limitation: image files are saved with Tree_UID in filename and description; the Tree_Photos index, public photo gallery, and thumbnail permissions are not yet implemented. Do not assume a successful upload makes an image public.
