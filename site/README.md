# GoodDoggoLuna site

This is the updated personal site for **GoodDoggoLuna**.

## Included

- starry blue glassmorphism design
- animated gradient title
- canvas starfield with shooting stars
- interactive focus tabs
- subtle 3D tilt on cards
- TikTok follower counter with manual refresh button
- fallback snapshot for preview environments

## TikTok follower counter

The live counter works through `api/tiktok-followers.js`.

Why it works that way:

- browsers usually cannot fetch TikTok profile HTML directly because of cross-origin restrictions
- the server-side route fetches the public TikTok page
- it extracts the follower count from TikTok's embedded page data
- the frontend calls that route and updates the counter
- if the route is unavailable, the site falls back to `data/tiktok-followers.json`

## Best deployment

Deploy on **Vercel** so the `api/` route works automatically.

## Preview note

Inside the Arena preview, network restrictions may force the site to use the saved snapshot instead of live TikTok data.
When deployed, the refresh button and auto-refresh can pull live data from TikTok's public page.
