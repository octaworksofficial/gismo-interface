const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from current directory
app.use(express.static(__dirname));

// Security headers for better HTTPS handling
app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    
    // Allow microphone access over HTTPS
    res.setHeader('Permissions-Policy', 'microphone=(self)');
    
    next();
});

// Main route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Settings route
app.get('/settings', (req, res) => {
    res.sendFile(path.join(__dirname, 'settings.html'));
});

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'OK', service: 'Gismo Robot Interface' });
});

app.listen(PORT, () => {
    console.log(`🤖 Gismo Robot Interface running on port ${PORT}`);
    console.log(`🌐 Access at: https://localhost:${PORT}`);
});