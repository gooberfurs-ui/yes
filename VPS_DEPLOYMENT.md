# VPS Deployment Guide for GoodDoggoLuna Website

This guide will help you run your website entirely on your VPS server.

## Prerequisites

- Node.js (v16 or higher) installed on your VPS
- npm installed on your VPS
- A domain name pointing to your VPS IP (optional, but recommended)
- SSH access to your VPS

## Installation Steps

### 1. Install Node.js and npm

If you haven't installed Node.js yet:

```bash
# On Ubuntu/Debian
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# On CentOS/RHEL
curl -fsSL https://rpm.nodesource.com/setup_20.x | sudo bash -
sudo yum install nodejs
```

### 2. Clone and Set Up Your Project

```bash
# Navigate to where you want the site
cd /home/yourusername

# Clone from GitHub (or upload your files)
git clone https://github.com/gooberfurs-ui/yes.git
cd yes

# Install dependencies
npm install
```

### 3. Test the Server Locally

```bash
npm start
```

Visit `http://localhost:3000` in your browser to test. Press Ctrl+C to stop.

### 4. Set Up as a Systemd Service (Auto-start & Auto-restart)

```bash
# Copy the service file to systemd
sudo cp gooddoggoluna.service /etc/systemd/system/

# Edit it to set the correct paths (replace /path/to/your/website)
sudo nano /etc/systemd/system/gooddoggoluna.service

# Update these lines with your actual paths:
# WorkingDirectory=/home/yourusername/yes
# ExecStart=/usr/bin/node /home/yourusername/yes/server.js
```

After editing, save with Ctrl+X, then Y, then Enter.

```bash
# Reload systemd to recognize the new service
sudo systemctl daemon-reload

# Enable the service to start on boot
sudo systemctl enable gooddoggoluna

# Start the service
sudo systemctl start gooddoggoluna

# Check if it's running
sudo systemctl status gooddoggoluna
```

### 5. Set Up Nginx Reverse Proxy (Recommended)

Nginx acts as a public-facing proxy and handles port 80/443:

```bash
# Install Nginx
sudo apt-get install nginx

# Create Nginx config
sudo nano /etc/nginx/sites-available/gooddoggoluna
```

Paste this config:

```nginx
server {
    listen 80;
    listen [::]:80;

    server_name yourdomain.com www.yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Replace `yourdomain.com` with your actual domain.

```bash
# Enable this config
sudo ln -s /etc/nginx/sites-available/gooddoggoluna /etc/nginx/sites-enabled/

# Remove the default config (optional)
sudo rm /etc/nginx/sites-enabled/default

# Test Nginx config
sudo nginx -t

# Start Nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

### 6. Set Up HTTPS with Let's Encrypt (Recommended)

```bash
# Install Certbot
sudo apt-get install certbot python3-certbot-nginx

# Get a free SSL certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Certbot will ask some questions - follow the prompts
# Choose to redirect HTTP to HTTPS when asked
```

### 7. Verify Everything Works

1. Visit your domain in a browser
2. Check if your TikTok stats load (they may take a moment)
3. Try refreshing the follower count

### Troubleshooting

**Check service logs:**
```bash
sudo journalctl -u gooddoggoluna -n 50 -f
```

**Check Nginx logs:**
```bash
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

**Restart everything:**
```bash
sudo systemctl restart gooddoggoluna
sudo systemctl restart nginx
```

**Test local server:**
```bash
npm start
curl http://localhost:3000
```

### Environment Variables (Optional)

If you want to customize the port:

```bash
PORT=8080 npm start
```

Or create a `.env` file:
```
PORT=3000
```

## Updating Your Site

When you push changes to GitHub:

```bash
cd /home/yourusername/yes
git pull origin main
npm install  # If you added new dependencies
sudo systemctl restart gooddoggoluna
```

## Performance Tips

1. Your TikTok API is cached for 5 minutes on the server
2. The snapshot fallback ensures your site works even if TikTok is down
3. Nginx caching can be added for even faster loads
4. Consider a CDN like Cloudflare for global performance

## File Structure on VPS

```
/home/yourusername/yes/
├── server.js              # Main Node.js server
├── package.json           # Dependencies
├── index.html             # Main page
├── assets/
│   ├── css/
│   ├── js/
│   ├── img/
│   └── webfonts/
├── api/                   # (Not used anymore, kept for reference)
├── data/
│   └── tiktok-followers.json
├── site/                  # (Your original site folder)
└── gooddoggoluna.service  # Systemd service file
```

That's it! Your website now runs entirely on your VPS! 🌙
