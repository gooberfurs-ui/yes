const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const roleRotator = document.getElementById('roleRotator');
const roles = [
  'making videos on TikTok',
  'working on VRChat avatars',
  'looking forward to con season',
  'trying to be gentle with myself'
];
let roleIndex = 0;

if (roleRotator) {
  setInterval(() => {
    roleIndex = (roleIndex + 1) % roles.length;
    roleRotator.style.opacity = '0';
    roleRotator.style.transform = 'translateY(6px)';

    setTimeout(() => {
      roleRotator.textContent = roles[roleIndex];
      roleRotator.style.opacity = '1';
      roleRotator.style.transform = 'translateY(0)';
    }, 180);
  }, 2600);
}

const tabs = document.querySelectorAll('.tab');
const focusPanel = document.getElementById('focusPanel');

const focusContent = {
  tiktok: {
    icon: 'fa-brands fa-tiktok',
    kicker: 'TikTok',
    title: 'TikTok is one of the biggest places I get to be myself',
    body: 'A lot of people meet me there first. It is where my energy, my humor, and my style all come together in a way that feels really natural to me.',
    points: [
      'This site can pull my follower count from my public TikTok page when it is deployed',
      'I wanted everything here to stay centered around @GoodDoggoLuna',
      'I tried to make this feel personal and cozy instead of cold or corporate'
    ]
  },
  vrchat: {
    icon: 'fa-solid fa-vr-cardboard',
    kicker: 'VRChat',
    title: 'I love making avatars that feel expressive and full of personality',
    body: 'My VRChat work matters to me just as much as my social content does. I wanted that part of me to have its own place here too, because it is a big part of what I love creating.',
    points: [
      'I care a lot about style, polish, and personality',
      'I want my avatar work to feel creative, playful, and true to my taste',
      'It connects so naturally with the furry and VR spaces I feel at home in'
    ]
  },
  cons: {
    icon: 'fa-solid fa-ticket',
    kicker: 'Con life',
    title: 'The cons I go to each year really are part of my rhythm',
    body: 'Furality, FurSquared, MFF, and AquatiFur are not just names I threw onto a page. They are places and moments I genuinely look forward to and love having as part of my year.',
    points: [
      'Furality keeps me close to the VR side of the community',
      'FurSquared, MFF, and AquatiFur all have their own special place in my heart',
      'I wanted this section to feel lived-in and real, not like a checklist'
    ]
  },
  personal: {
    icon: 'fa-solid fa-moon',
    kicker: 'My heart',
    title: 'I wanted this site to feel sweet, honest, and safe to land in',
    body: 'I am open about bipolar disorder, ADHD, anxiety, and other mental health struggles because being honest matters to me. I never wanted this space to feel fake when it could feel kind instead.',
    points: [
      'Being real is more important to me than sounding polished',
      'I want people here to feel warmth, not distance',
      'I hope this feels a little like me, and a little like comfort'
    ]
  }
};

function renderFocusTab(key) {
  const content = focusContent[key];
  if (!content || !focusPanel) return;

  focusPanel.innerHTML = `
    <div class="focus-icon"><i class="${content.icon}"></i></div>
    <div>
      <p class="panel-kicker">${content.kicker}</p>
      <h3>${content.title}</h3>
      <p>${content.body}</p>
      <ul class="panel-points">
        ${content.points.map((point) => `<li>${point}</li>`).join('')}
      </ul>
    </div>
  `;
}

tabs.forEach((tab) => {
  tab.addEventListener('click', () => {
    tabs.forEach((button) => {
      button.classList.remove('active');
      button.setAttribute('aria-selected', 'false');
    });

    tab.classList.add('active');
    tab.setAttribute('aria-selected', 'true');
    if (focusPanel?.animate && !prefersReducedMotion) {
      focusPanel.animate([{ opacity: 0.65, transform: 'translateY(6px)' }, { opacity: 1, transform: 'translateY(0)' }], {
        duration: 220,
        easing: 'ease-out'
      });
    }
    renderFocusTab(tab.dataset.tab);
  });
});

const revealItems = document.querySelectorAll('[data-reveal]');
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('revealed');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });

revealItems.forEach((item) => revealObserver.observe(item));

const handleText = document.getElementById('handleText');
const copyHandleButton = document.getElementById('copyHandleButton');
const copyStatus = document.getElementById('copyStatus');

if (copyHandleButton && handleText) {
  copyHandleButton.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(handleText.textContent.trim());
      copyStatus.textContent = 'Copied with love.';
    } catch {
      copyStatus.textContent = 'Copy did not work here, but you can still find me as @GoodDoggoLuna.';
    }
  });
}

const followerCountEl = document.getElementById('followerCount');
const videoCountEl = document.getElementById('videoCount');
const likesCountEl = document.getElementById('likesCount');
const counterStatusEl = document.getElementById('counterStatus');
const counterMetaEl = document.getElementById('counterMeta');
const counterBarFillEl = document.getElementById('counterBarFill');
const refreshCounterButton = document.getElementById('refreshCounterButton');
let currentStats = { followers: 22500, videos: 89, likes: 11700 };

function formatCompact(value) {
  return new Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits: value >= 10000 ? 1 : 0
  }).format(value);
}

function formatDate(dateString) {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return 'recently';
  return date.toLocaleString([], {
    dateStyle: 'medium',
    timeStyle: 'short'
  });
}

function animateNumber(element, startValue, endValue, formatter, duration = 1000) {
  if (!element) return;

  if (prefersReducedMotion) {
    element.textContent = formatter(endValue);
    return;
  }

  const start = performance.now();

  function frame(now) {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = Math.round(startValue + (endValue - startValue) * eased);
    element.textContent = formatter(current);

    if (progress < 1) {
      requestAnimationFrame(frame);
    }
  }

  requestAnimationFrame(frame);
}

function setCounterState(message, statusText, state = 'default') {
  if (counterMetaEl) counterMetaEl.textContent = message;
  if (counterStatusEl) {
    counterStatusEl.textContent = statusText;
    counterStatusEl.dataset.state = state;
  }
}

function applyTikTokStats(data, isLive) {
  const followers = Number(data.followerCount || 0);
  const videos = Number(data.videoCount || 0);
  const likes = Number(data.likesCount || data.heartCount || 0);
  const updatedText = formatDate(data.fetchedAt);

  animateNumber(followerCountEl, currentStats.followers, followers, formatCompact, 1200);
  animateNumber(videoCountEl, currentStats.videos, videos, (value) => value.toString(), 850);
  animateNumber(likesCountEl, currentStats.likes, likes, formatCompact, 1000);

  currentStats = { followers, videos, likes };

  if (counterBarFillEl) {
    const width = Math.max(18, Math.min(100, followers / 300));
    counterBarFillEl.style.width = `${width}%`;
  }

  if (isLive) {
    setCounterState(`Pulled from my TikTok on ${updatedText}.`, 'live now', 'live');
  } else {
    setCounterState(`Using my saved TikTok snapshot from ${updatedText}.`, 'snapshot', 'snapshot');
  }
}

async function fetchJson(url) {
  const response = await fetch(url, { cache: 'no-store' });
  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }
  return response.json();
}

async function loadTikTokStats({ manual = false } = {}) {
  if (refreshCounterButton) {
    refreshCounterButton.disabled = true;
    refreshCounterButton.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Refreshing';
  }

  if (manual) {
    setCounterState('Checking my TikTok…', 'refreshing', 'refreshing');
  }

  try {
    const liveData = await fetchJson(`/api/tiktok-followers?username=GoodDoggoLuna&t=${Date.now()}`);
    applyTikTokStats(liveData, true);
  } catch (liveError) {
    try {
      const snapshotData = await fetchJson(`data/tiktok-followers.json?t=${Date.now()}`);
      applyTikTokStats(snapshotData, false);
    } catch {
      setCounterState('My TikTok data could not be loaded here right now.', 'offline', 'offline');
    }
  } finally {
    if (refreshCounterButton) {
      refreshCounterButton.disabled = false;
      refreshCounterButton.innerHTML = '<i class="fa-solid fa-rotate-right"></i> Refresh count';
    }
  }
}

if (refreshCounterButton) {
  refreshCounterButton.addEventListener('click', () => loadTikTokStats({ manual: true }));
}

loadTikTokStats();
setInterval(() => loadTikTokStats(), 300000);

if (!prefersReducedMotion) {
  const tiltCards = document.querySelectorAll('[data-tilt]');

  tiltCards.forEach((card) => {
    const strength = 8;

    card.addEventListener('pointermove', (event) => {
      const rect = card.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      const rotateY = ((x / rect.width) - 0.5) * strength;
      const rotateX = ((y / rect.height) - 0.5) * -strength;
      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
    });

    card.addEventListener('pointerleave', () => {
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)';
    });
  });
}

const canvas = document.getElementById('skyCanvas');
const ctx = canvas?.getContext('2d');
let stars = [];
let shootingStars = [];
let lastMeteorAt = 0;

function resizeCanvas() {
  if (!canvas || !ctx) return;
  const ratio = window.devicePixelRatio || 1;
  canvas.width = window.innerWidth * ratio;
  canvas.height = window.innerHeight * ratio;
  canvas.style.width = `${window.innerWidth}px`;
  canvas.style.height = `${window.innerHeight}px`;
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);

  const count = Math.min(180, Math.floor(window.innerWidth / 8));
  stars = Array.from({ length: count }, () => ({
    x: Math.random() * window.innerWidth,
    y: Math.random() * window.innerHeight,
    size: Math.random() * 1.8 + 0.3,
    alpha: Math.random() * 0.7 + 0.15,
    twinkle: Math.random() * 0.02 + 0.004,
    direction: Math.random() > 0.5 ? 1 : -1,
    driftX: (Math.random() - 0.5) * 0.03,
    driftY: (Math.random() - 0.5) * 0.03
  }));
}

function spawnShootingStar() {
  if (!canvas || prefersReducedMotion) return;

  const fromLeft = Math.random() > 0.5;
  const startX = fromLeft ? Math.random() * window.innerWidth * 0.45 : window.innerWidth * (0.55 + Math.random() * 0.4);
  const startY = Math.random() * window.innerHeight * 0.35;
  const speed = 11 + Math.random() * 7;
  const angle = fromLeft ? Math.PI / 4 : (Math.PI * 3) / 4;

  shootingStars.push({
    x: startX,
    y: startY,
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed,
    length: 140 + Math.random() * 80,
    life: 0,
    maxLife: 34 + Math.random() * 12,
    alpha: 0.85
  });
}

function drawBackground(now) {
  if (!canvas || !ctx) return;
  ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

  stars.forEach((star) => {
    if (!prefersReducedMotion) {
      star.alpha += star.twinkle * star.direction;
      if (star.alpha >= 0.95 || star.alpha <= 0.15) {
        star.direction *= -1;
      }
      star.x += star.driftX;
      star.y += star.driftY;

      if (star.x < 0) star.x = window.innerWidth;
      if (star.x > window.innerWidth) star.x = 0;
      if (star.y < 0) star.y = window.innerHeight;
      if (star.y > window.innerHeight) star.y = 0;
    }

    ctx.beginPath();
    ctx.fillStyle = `rgba(214, 240, 255, ${star.alpha})`;
    ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
    ctx.fill();
  });

  if (!prefersReducedMotion && now - lastMeteorAt > 2200 + Math.random() * 3200) {
    spawnShootingStar();
    lastMeteorAt = now;
  }

  shootingStars = shootingStars.filter((meteor) => meteor.life < meteor.maxLife);

  shootingStars.forEach((meteor) => {
    meteor.x += meteor.vx;
    meteor.y += meteor.vy;
    meteor.life += 1;
    meteor.alpha = Math.max(0, 1 - meteor.life / meteor.maxLife);

    const tailX = meteor.x - meteor.vx * (meteor.length / Math.hypot(meteor.vx, meteor.vy));
    const tailY = meteor.y - meteor.vy * (meteor.length / Math.hypot(meteor.vx, meteor.vy));

    const gradient = ctx.createLinearGradient(meteor.x, meteor.y, tailX, tailY);
    gradient.addColorStop(0, `rgba(215, 244, 255, ${meteor.alpha})`);
    gradient.addColorStop(0.35, `rgba(113, 220, 255, ${meteor.alpha * 0.65})`);
    gradient.addColorStop(1, 'rgba(113, 220, 255, 0)');

    ctx.beginPath();
    ctx.strokeStyle = gradient;
    ctx.lineWidth = 2.2;
    ctx.moveTo(meteor.x, meteor.y);
    ctx.lineTo(tailX, tailY);
    ctx.stroke();
  });

  requestAnimationFrame(drawBackground);
}

if (canvas && ctx) {
  resizeCanvas();
  requestAnimationFrame(drawBackground);
  window.addEventListener('resize', resizeCanvas);
}
