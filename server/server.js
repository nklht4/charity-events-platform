const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

app.use(express.static(path.join(__dirname, 'client')));

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

// 在 server.js 中修改 processEventImages 函数
function processEventImages(events) {
    // 创建活动ID到图片的映射
    const eventImageMapping = {
        7: 'images/1.jpg',   // Charity Tennis Open
        6: 'images/2.jpeg',  // Tech Skills Workshop
        2: 'images/3.webp',  // Sunrise Fun Run 2025
        1: 'images/4.webp',  // Hope Charity Gala 2025
        5: 'images/5.webp',  // Online Silent Auction
        8: 'images/6.webp',  // Taste of Hope Festival
        3: 'images/7.webp',  // Art for Hope Exhibition
        4: 'images/8.webp'   // Symphony of Hope Concert
    };

    return events.map(event => {
        // 强制使用我们映射的图片，忽略数据库中的图片路径
        const mappedImage = eventImageMapping[event.EventID];
        if (mappedImage) {
            return {
                ...event,
                EventImage: mappedImage
            };
        }
        
        // 如果没有映射，使用默认逻辑
        if (event.EventImage) {
            // 如果数据库中有图片路径，确保是正确的相对路径
            if (!event.EventImage.startsWith('images/')) {
                event.EventImage = 'images/' + event.EventImage;
            }
            return event;
        } else {
            // 如果没有图片，根据分类使用默认图片
            const defaultImage = getDefaultImageByCategory(event.CategoryName);
            return {
                ...event,
                EventImage: defaultImage
            };
        }
    });
}
// 根据分类获取默认图片
function getDefaultImageByCategory(categoryName) {
    const defaultImages = {
        'Sports Tournament': 'images/1.jpg',
        'Workshop': 'images/2.jpeg',
        'Fun Run': 'images/3.webp',
        'Gala Dinner': 'images/4.webp',
        'Silent Auction': 'images/5.webp',
        'Food Festival': 'images/6.webp',
        'Art Exhibition': 'images/7.webp',
        'Concert': 'images/8.webp'
    };
    
    return defaultImages[categoryName] || 'images/1.jpg';
}

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
        
        // 处理图片路径
        const eventsWithImages = processEventImages(results);
        
        console.log(`📋 Return ${eventsWithImages.length} activities`);
        res.json(eventsWithImages);
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
        
        // 处理图片路径
        const eventsWithImages = processEventImages(results);
        
        console.log(`🔍 Search results: ${eventsWithImages.length} items found`);
        res.json(eventsWithImages);
    });
});

app.get('/api/events/:id', (req, res) => {
    const eventId = req.params.id;
    console.log(`📄 Request for event details ID: ${eventId}`);
    
    const query = `
        SELECT e.*, c.CategoryName
        FROM events e 
        JOIN categories c ON e.CategoryID = c.CategoryID 
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
        
        // 处理图片路径
        const eventWithImage = processEventImages([results[0]])[0];
        
        console.log(`✅ Find the activity: ${eventWithImage.EventName}`);
        res.json(eventWithImage);
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