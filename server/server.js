const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../client')));

const db = mysql.createConnection({
    host: 'localhost',      
    port: 3306,             
    user: 'root',           
    password: 'root',   
    database: 'charityevents_db'
});

db.connect((err) => {
    if (err) {
        console.error('Database connection failed: ' + err.message);
        console.log('Please check:');
        console.log('- Host: localhost');
        console.log('- Port: 3306'); 
        console.log('- Username: root');
        console.log('- Password: Is it correct?');
        console.log('- Database: Does the "charityevents_db" exist?');
        return;
    }
    console.log('✅ Successfully connected to the MySQL database');
    console.log('📊 Database: charityevents_db');
});

app.get('/api/events', (req, res) => {
    const query = `
        SELECT e.*, c.CategoryName 
        FROM events e 
        JOIN categories c ON e.CategoryID = c.CategoryID 
        WHERE e.CurrentStatus = 1 
        ORDER BY e.EventDate ASC
    `;
    
    db.query(query, (err, results) => {
        if (err) {
            console.error('Database query error:', err);
            return res.status(500).json({ error: 'Server Error' });
        }
        console.log(`📋 Return ${results.length} activities`);
        res.json(results);
    });
});

app.get('/api/events/search', (req, res) => {
    const { category, location, date } = req.query;
    
    console.log('🔍 Search parameters:', { category, location, date });
    
    let query = `
        SELECT e.*, c.CategoryName 
        FROM events e 
        JOIN categories c ON e.CategoryID = c.CategoryID 
        WHERE e.CurrentStatus = 1
    `;
    let params = [];

    if (category && category !== 'all') {
        query += ' AND c.CategoryName = ?';
        params.push(category);
    }
    if (location) {
        query += ' AND e.Location LIKE ?';
        params.push(`%${location}%`);
    }
    if (date) {
        query += ' AND e.EventDate = ?';
        params.push(date);
    }

    query += ' ORDER BY e.EventDate ASC';

    db.query(query, params, (err, results) => {
        if (err) {
            console.error('Search query error:', err);
            return res.status(500).json({ error: 'Server Error' });
        }
        console.log(`🔍 Search results: ${results.length} items found`);
        res.json(results);
    });
});

app.get('/api/events/:id', (req, res) => {
    const eventId = req.params.id;
    console.log(`📄 Request for event details ID: ${eventId}`);
    
    const query = `
        SELECT e.*, c.CategoryName, u.Username as OrganizerName 
        FROM events e 
        JOIN categories c ON e.CategoryID = c.CategoryID 
        JOIN users u ON e.OrganizerID = u.UserID 
        WHERE e.EventID = ?
    `;
    
    db.query(query, [eventId], (err, results) => {
        if (err) {
            console.error('Error in detail inquiry:', err);
            return res.status(500).json({ error: 'Server Error' });
        }
        if (results.length === 0) {
            return res.status(404).json({ error: 'Activity not found' });
        }
        console.log(`✅ Find the activity: ${results[0].EventName}`);
        res.json(results[0]);
    });
});

app.get('/api/categories', (req, res) => {
    const query = 'SELECT * FROM categories ORDER BY CategoryName';
    
    db.query(query, (err, results) => {
        if (err) {
            console.error('Classification query error:', err);
            return res.status(500).json({ error: 'Server Error' });
        }
        console.log(`📂 Return ${results.length} categories`);
        res.json(results);
    });
});

app.listen(PORT, () => {
    console.log('🚀 The server has started successfully!');
    console.log(`📍 Access Address: http://localhost:${PORT}`);
    console.log('');
    console.log('📡 API interface list:');
    console.log(`   GET http://localhost:${PORT}/api/events`);
    console.log(`   GET http://localhost:${PORT}/api/events/search`);
    console.log(`   GET http://localhost:${PORT}/api/events/1`);
    console.log(`   GET http://localhost:${PORT}/api/categories`);
});