# 🌐 Lodge Finder - Server URLs

Your entire Lodge Finder website is now running on the server!

## Main Website URL
**http://localhost:3000**

## All Pages

### Public Pages
- **Home Page**: http://localhost:3000/index.html
- **Search Lodges**: http://localhost:3000/search.html
- **Lodge Details**: http://localhost:3000/lodge-details.html
- **Contact Us**: http://localhost:3000/contact.html

### Admin Pages
- **Admin Login**: http://localhost:3000/admin/login.html
- **Admin Dashboard**: http://localhost:3000/admin/dashboard.html
- **Data Manager**: http://localhost:3000/data-manager.html (backup/restore lodges)
- **Email Setup Guide**: http://localhost:3000/email-setup.html (configure Gmail)

## API Endpoints

### Health Check
- **GET** http://localhost:3000/api/health

### Contact Form
- **POST** http://localhost:3000/api/contact

### Bookmark Subscription
- **POST** http://localhost:3000/api/subscribe

## How to Use

1. **Access the website**: Open http://localhost:3000 in your browser
2. **Browse lodges**: Navigate through the pages using the menu
3. **Submit contact form**: Go to the contact page and send a message
4. **Bookmark lodges**: Click the heart icon and subscribe for updates

## Server Status

✅ Server is running on port 3000
✅ All static files (HTML, CSS, JS, images, fonts) are being served
✅ API endpoints are active
⚠️ Email credentials not configured (emails will be logged but not sent)

## To Enable Email Sending

1. Copy `.env.example` to `.env`
2. Add your Gmail credentials
3. Restart the server with `npm start`

## Stopping the Server

Press `Ctrl+C` in the terminal where the server is running.

## Restarting the Server

```bash
npm start
```
