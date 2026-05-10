import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from root
app.use(express.static(__dirname));

// Serve static files from site directory
app.use(express.static(path.join(__dirname, 'site')));

// API endpoint for TikTok followers
app.get('/api/tiktok-followers', async (req, res) => {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).json({ ok: true });
  }

  const username = String((req.query?.username || 'GoodDoggoLuna')).replace(/^@/, '').trim();

  try {
    const response = await fetch(`https://www.tiktok.com/@${encodeURIComponent(username)}?lang=en`, {
      headers: {
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'accept-language': 'en-US,en;q=0.9',
        'cache-control': 'no-cache',
        'pragma': 'no-cache',
        'referer': 'https://www.tiktok.com/'
      },
      redirect: 'follow'
    });

    if (!response.ok) {
      throw new Error(`TikTok returned status ${response.status}`);
    }

    const html = await response.text();
    const data = extractEmbeddedJson(html);

    if (!data) {
      throw new Error('Could not find embedded TikTok JSON data');
    }

    const detail = data?.__DEFAULT_SCOPE__?.['webapp.user-detail'];
    const stats = detail?.userInfo?.stats || deepFindStats(data);
    const user = detail?.userInfo?.user || deepFindUser(data) || {};

    if (!stats || typeof stats.followerCount !== 'number') {
      throw new Error('Follower count missing from TikTok data');
    }

    res.set('Cache-Control', 's-maxage=300, stale-while-revalidate=86400');

    return res.status(200).json({
      username,
      displayName: user.nickname || user.uniqueId || username,
      followerCount: stats.followerCount,
      followingCount: stats.followingCount ?? null,
      likesCount: stats.heartCount ?? stats.heart ?? null,
      videoCount: stats.videoCount ?? null,
      avatar: user.avatarThumb || null,
      source: 'TikTok public page data',
      fetchedAt: new Date().toISOString()
    });
  } catch (error) {
    return res.status(500).json({
      error: 'Unable to fetch TikTok stats right now.',
      details: error.message
    });
  }
});

// Catch-all for SPA routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Helper functions
function extractEmbeddedJson(html) {
  const patterns = [
    /<script id="__UNIVERSAL_DATA_FOR_REHYDRATION__" type="application\/json">([\s\S]*?)<\/script>/,
    /<script id="SIGI_STATE" type="application\/json">([\s\S]*?)<\/script>/,
    /<script[^>]*>\s*window\[['"]SIGI_STATE['"]\]\s*=\s*([\s\S]*?)<\/script>/
  ];

  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (!match) continue;

    const raw = match[1].trim().replace(/;\s*$/, '');
    try {
      return JSON.parse(raw);
    } catch {
      // keep trying the next pattern
    }
  }

  return null;
}

function deepFindStats(node) {
  if (!node || typeof node !== 'object') return null;

  if (
    typeof node.followerCount === 'number' &&
    (typeof node.videoCount === 'number' || typeof node.heartCount === 'number' || typeof node.heart === 'number')
  ) {
    return node;
  }

  if (Array.isArray(node)) {
    for (const item of node) {
      const found = deepFindStats(item);
      if (found) return found;
    }
    return null;
  }

  for (const value of Object.values(node)) {
    const found = deepFindStats(value);
    if (found) return found;
  }

  return null;
}

function deepFindUser(node) {
  if (!node || typeof node !== 'object') return null;

  if (
    typeof node.nickname === 'string' ||
    typeof node.uniqueId === 'string' ||
    typeof node.avatarThumb === 'string'
  ) {
    return node;
  }

  if (Array.isArray(node)) {
    for (const item of node) {
      const found = deepFindUser(item);
      if (found) return found;
    }
    return null;
  }

  for (const value of Object.values(node)) {
    const found = deepFindUser(value);
    if (found) return found;
  }

  return null;
}

app.listen(PORT, () => {
  console.log(`🌙 GoodDoggoLuna site running on http://localhost:${PORT}`);
});
