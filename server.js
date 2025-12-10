const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
    origin: process.env.FRONTEND_URL || '*',
    methods: ['GET', 'POST'],
    credentials: true
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files (HTML, CSS, JS, images, fonts)
app.use(express.static(path.join(__dirname)));

// Email transporter configuration
let transporter;

try {
    transporter = nodemailer.createTransport({
        service: process.env.EMAIL_SERVICE || 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD
        }
    });

    // Verify transporter configuration
    transporter.verify((error, success) => {
        if (error) {
            console.error('❌ Email transporter error:', error.message);
            console.log('⚠️  Please configure your .env file with valid Gmail credentials');
        } else {
            console.log('✅ Email server is ready to send messages');
        }
    });
} catch (error) {
    console.error('❌ Failed to create email transporter:', error.message);
    console.log('⚠️  Server will run but emails cannot be sent until .env is configured');
}

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        message: 'Lodge Finder Email Server is running',
        emailConfigured: !!(process.env.EMAIL_USER && process.env.EMAIL_PASSWORD)
    });
});

// Contact form endpoint
app.post('/api/contact', async (req, res) => {
    const { name, email, phone, subject, message } = req.body;

    // Validation
    if (!name || !email || !message) {
        return res.status(400).json({
            success: false,
            message: 'Please provide name, email, and message'
        });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({
            success: false,
            message: 'Please provide a valid email address'
        });
    }

    // Check if email is configured
    if (!transporter || !process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
        console.log('📧 Contact form submission (email not configured):', { name, email, subject });
        return res.status(200).json({
            success: true,
            message: 'Message received! (Email service not configured - check server logs)',
            demo: true
        });
    }

    // Prepare email content
    const mailOptions = {
        from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
        to: process.env.EMAIL_TO || process.env.EMAIL_USER,
        replyTo: email,
        subject: `Lodge Finder Contact: ${subject || 'General Inquiry'}`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #2c5f4f;">New Contact Form Submission</h2>
                <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <p><strong>Name:</strong> ${name}</p>
                    <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
                    ${phone ? `<p><strong>Phone:</strong> ${phone}</p>` : ''}
                    <p><strong>Subject:</strong> ${subject || 'General Inquiry'}</p>
                </div>
                <div style="margin: 20px 0;">
                    <h3 style="color: #2c5f4f;">Message:</h3>
                    <p style="line-height: 1.6;">${message.replace(/\n/g, '<br>')}</p>
                </div>
                <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
                <p style="color: #666; font-size: 12px;">
                    This message was sent from the Lodge Finder contact form.
                </p>
            </div>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('✅ Contact email sent successfully from:', email);
        res.json({
            success: true,
            message: 'Thank you for your message! We will get back to you soon.'
        });
    } catch (error) {
        console.error('❌ Error sending contact email:', error.message);
        res.status(500).json({
            success: false,
            message: 'Failed to send message. Please try again or contact us directly.'
        });
    }
});

// Bookmark subscription endpoint
app.post('/api/subscribe', async (req, res) => {
    const { email, lodgeName, lodgeId } = req.body;

    // Validation
    if (!email) {
        return res.status(400).json({
            success: false,
            message: 'Please provide an email address'
        });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({
            success: false,
            message: 'Please provide a valid email address'
        });
    }

    // Check if email is configured
    if (!transporter || !process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
        console.log('📧 Bookmark subscription (email not configured):', { email, lodgeName });
        return res.status(200).json({
            success: true,
            message: 'Subscription received! (Email service not configured - check server logs)',
            demo: true
        });
    }

    // Prepare confirmation email to user
    const userMailOptions = {
        from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
        to: email,
        subject: `Bookmark Confirmed - ${lodgeName || 'Lodge Finder'}`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #2c5f4f;">Bookmark Confirmed!</h2>
                <p>Thank you for bookmarking <strong>${lodgeName || 'our lodge'}</strong>.</p>
                <p>You will receive notifications about:</p>
                <ul>
                    <li>Special discount offers</li>
                    <li>Exclusive events</li>
                    <li>Seasonal promotions</li>
                </ul>
                <p style="margin-top: 20px;">
                    <a href="http://lodgefinder.com" style="background: #c46780; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
                        View Lodge Details
                    </a>
                </p>
                <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
                <p style="color: #666; font-size: 12px;">
                    You're receiving this because you subscribed to updates for ${lodgeName || 'a lodge'} on Lodge Finder.
                </p>
            </div>
        `
    };

    // Prepare notification email to admin
    const adminMailOptions = {
        from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
        to: process.env.EMAIL_TO || process.env.EMAIL_USER,
        subject: `New Bookmark Subscription - ${lodgeName || 'Lodge'}`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #2c5f4f;">New Bookmark Subscription</h2>
                <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <p><strong>Lodge:</strong> ${lodgeName || 'Unknown'}</p>
                    <p><strong>Lodge ID:</strong> ${lodgeId || 'N/A'}</p>
                    <p><strong>Subscriber Email:</strong> <a href="mailto:${email}">${email}</a></p>
                    <p><strong>Date:</strong> ${new Date().toLocaleString()}</p>
                </div>
                <p style="color: #666; font-size: 12px;">
                    This notification was sent from the Lodge Finder bookmark system.
                </p>
            </div>
        `
    };

    try {
        // Send both emails
        await Promise.all([
            transporter.sendMail(userMailOptions),
            transporter.sendMail(adminMailOptions)
        ]);

        console.log('✅ Subscription emails sent successfully to:', email);
        res.json({
            success: true,
            message: 'Subscription confirmed! Check your email for details.'
        });
    } catch (error) {
        console.error('❌ Error sending subscription emails:', error.message);
        res.status(500).json({
            success: false,
            message: 'Failed to process subscription. Please try again.'
        });
    }
});

// Broadcast email endpoint (for admin to send to subscribers)
app.post('/api/broadcast', async (req, res) => {
    const { emails, subject, message, lodgeName } = req.body;

    // Validation
    if (!emails || !Array.isArray(emails) || emails.length === 0) {
        return res.status(400).json({
            success: false,
            message: 'Please provide at least one email address'
        });
    }

    if (!subject || !message) {
        return res.status(400).json({
            success: false,
            message: 'Please provide subject and message'
        });
    }

    // Check if email is configured
    if (!transporter || !process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
        console.log('📧 Broadcast attempt (email not configured):', { emails: emails.length, subject });
        return res.status(200).json({
            success: true,
            message: 'Broadcast logged! (Email service not configured - check server logs)',
            demo: true
        });
    }

    try {
        // Send email to each subscriber
        const emailPromises = emails.map(email => {
            const mailOptions = {
                from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
                to: email,
                subject: subject,
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                        <h2 style="color: #2c5f4f;">Update from ${lodgeName || 'Lodge Finder'}</h2>
                        <div style="margin: 20px 0;">
                            <p style="line-height: 1.6;">${message.replace(/\n/g, '<br>')}</p>
                        </div>
                        <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
                        <p style="color: #666; font-size: 12px;">
                            You're receiving this because you subscribed to updates for ${lodgeName || 'a lodge'} on Lodge Finder.
                        </p>
                    </div>
                `
            };
            return transporter.sendMail(mailOptions);
        });

        await Promise.all(emailPromises);

        console.log(`✅ Broadcast sent successfully to ${emails.length} subscribers`);
        res.json({
            success: true,
            message: `Broadcast sent successfully to ${emails.length} subscriber(s)!`
        });
    } catch (error) {
        console.error('❌ Error sending broadcast emails:', error.message);
        res.status(500).json({
            success: false,
            message: 'Failed to send broadcast. Please try again.'
        });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`\n🚀 Lodge Finder Server running on port ${PORT}`);
    console.log(`\n🌐 Website URL: http://localhost:${PORT}`);
    console.log(`   Home: http://localhost:${PORT}/index.html`);
    console.log(`   Search: http://localhost:${PORT}/search.html`);
    console.log(`   Contact: http://localhost:${PORT}/contact.html`);
    console.log(`   Admin: http://localhost:${PORT}/admin/login.html`);
    console.log(`\n📧 API Endpoints:`);
    console.log(`   Health: http://localhost:${PORT}/api/health`);
    console.log(`   Contact: POST http://localhost:${PORT}/api/contact`);
    console.log(`   Subscribe: POST http://localhost:${PORT}/api/subscribe`);
    console.log(`   Broadcast: POST http://localhost:${PORT}/api/broadcast`);
    console.log(`\n⚙️  Email Configuration:`);
    console.log(`   Email User: ${process.env.EMAIL_USER ? '✅ Configured' : '❌ Not configured'}`);
    console.log(`   Email Password: ${process.env.EMAIL_PASSWORD ? '✅ Configured' : '❌ Not configured'}`);

    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
        console.log(`\n⚠️  To enable email functionality:`);
        console.log(`   1. Copy .env.example to .env`);
        console.log(`   2. Add your Gmail credentials`);
        console.log(`   3. Restart the server\n`);
    }
});
