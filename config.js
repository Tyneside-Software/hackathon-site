// Tailscale host (port 8080). Override before this file loads if you need local uvicorn.
window.HACKATHON_API = window.HACKATHON_API || "http://100.65.94.5:8080";

// Social login — paste IDs here (and on Cloud Run) to switch the buttons on.
// Google: https://console.cloud.google.com/apis/credentials  → OAuth client, Web
//   Authorized JavaScript origins:
//   https://hackathon.tyneside.software
//   https://tyneside.software
//   http://localhost:5500
//   http://127.0.0.1:5500
window.GOOGLE_CLIENT_ID = window.GOOGLE_CLIENT_ID || "";
// Apple: developer.apple.com → Identifiers → Services ID, with Sign in with Apple.
// Return URL must be the Account page HTTPS URL.
window.APPLE_CLIENT_ID = window.APPLE_CLIENT_ID || "";
// Facebook: developers.facebook.com → App → Facebook Login for web. Add the shop domains.
window.FACEBOOK_APP_ID = window.FACEBOOK_APP_ID || "";
