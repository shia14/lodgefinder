# Lodge Finder

A luxury lodge discovery platform with integrated email functionality for contact forms and bookmark subscriptions.

## Features

- Browse and search luxury lodges
- Bookmark lodges and subscribe to updates
- Contact form for inquiries
- Admin panel for lodge management
- Email notifications via Gmail

## Setup Instructions

### Prerequisites

- Node.js (v14 or higher)
- npm (comes with Node.js)
- Gmail account with App Password

### Installation

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Configure Email Service**
   
   Copy the example environment file:
   ```bash
   copy .env.example .env
   ```
   
   Edit `.env` and add your Gmail credentials:
   ```
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASSWORD=your-app-specific-password
   EMAIL_TO=blessingsphiri196@gmail.com
   ```

3. **Generate Gmail App Password**
   
   To use Gmail for sending emails:
   - Go to your Google Account settings
   - Enable 2-Factor Authentication
   - Visit: https://myaccount.google.com/apppasswords
   - Create a new App Password for "Mail"
   - Use this password in your `.env` file (NOT your regular Gmail password)

### Running the Application

1. **Start the Email Server**
   ```bash
   npm start
   ```
   
   The server will run on `http://localhost:3000`

2. **Open the Frontend**
   
   Open `index.html` in your browser using a local server (e.g., Live Server extension in VS Code)

### Testing Email Functionality

1. **Contact Form**
   - Navigate to the Contact page
   - Fill out the form
   - Submit and check your email

2. **Bookmark Subscription**
   - Browse lodges
   - Click the bookmark (heart) icon
   - Enter your email
   - Check your email for confirmation

## API Endpoints

### Health Check
```
GET /api/health
```
Returns server status and email configuration status.

### Contact Form
```
POST /api/contact
```
Body:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+265...",
  "subject": "General Inquiry",
  "message": "Your message here"
}
```

### Bookmark Subscription
```
POST /api/subscribe
```
Body:
```json
{
  "email": "user@example.com",
  "lodgeName": "Alpine Sanctuary",
  "lodgeId": "1"
}
```

## Project Structure

```
Lodgefinder/
├── admin/              # Admin panel files
├── images/             # Image assets
├── fonts/              # Custom fonts
├── index.html          # Homepage
├── search.html         # Search page
├── lodge-details.html  # Lodge details page
├── contact.html        # Contact page
├── script.js           # Main JavaScript
├── contact-form.js     # Contact form handler
├── styles.css          # Main styles
├── server.js           # Email server (Node.js/Express)
├── package.json        # Node.js dependencies
├── .env.example        # Environment variables template
└── .env                # Your email credentials (not in git)
```

## Troubleshooting

### Emails Not Sending

1. Check server logs for error messages
2. Verify `.env` file has correct credentials
3. Ensure Gmail App Password is used (not regular password)
4. Check that 2-Factor Authentication is enabled on Gmail
5. Visit the health check endpoint: `http://localhost:3000/api/health`

### Server Not Starting

1. Make sure Node.js is installed: `node --version`
2. Install dependencies: `npm install`
3. Check if port 3000 is available
4. Check server logs for specific errors

### CORS Errors

If you see CORS errors in the browser console:
1. Make sure the server is running
2. Update `FRONTEND_URL` in `.env` to match your frontend URL
3. Restart the server after changing `.env`

## License

ISC

## Contact

For questions or support, contact: blessingsphiri196@gmail.com
