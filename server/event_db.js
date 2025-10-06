// event_db.js - Database connection file for PROG2002 Assignment 2
const mysql = require('mysql2');

/**
 * Database connection configuration
 * This file handles the connection to MySQL database
 */
const dbConfig = {
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: 'root',
    database: 'charityevents_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
};

// Create connection pool
const pool = mysql.createPool(dbConfig);

// Create promise wrapper for the pool
const promisePool = pool.promise();

// Test database connection
async function testConnection() {
    try {
        const connection = await promisePool.getConnection();
        console.log('✅ Database connection established successfully');
        console.log('📊 Database: charityevents_db');
        connection.release();
        return true;
    } catch (err) {
        console.error('❌ Database connection failed:', err.message);
        console.log('\nPlease check:');
        console.log('- MySQL server is running');
        console.log('- Database "charityevents_db" exists');
        console.log('- Username and password are correct');
        console.log('- Port 3306 is accessible');
        return false;
    }
}

// Function to execute queries
async function executeQuery(sql, params = []) {
    try {
        const [rows, fields] = await promisePool.execute(sql, params);
        return rows;
    } catch (err) {
        console.error('❌ Query execution error:', err.message);
        throw err;
    }
}

// Function to get all events
async function getAllEvents() {
    const query = `
        SELECT e.*, c.CategoryName 
        FROM events e 
        JOIN categories c ON e.CategoryID = c.CategoryID 
        WHERE e.CurrentStatus = 1 
        ORDER BY e.EventDate ASC
    `;
    return await executeQuery(query);
}

// Function to search events
async function searchEvents(category = null, location = null, date = null) {
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
    return await executeQuery(query, params);
}

// Function to get event by ID
async function getEventById(eventId) {
    const query = `
        SELECT e.*, c.CategoryName
        FROM events e 
        JOIN categories c ON e.CategoryID = c.CategoryID 
        WHERE e.EventID = ?
    `;
    const results = await executeQuery(query, [eventId]);
    return results.length > 0 ? results[0] : null;
}

// Function to get all categories
async function getAllCategories() {
    const query = 'SELECT * FROM categories ORDER BY CategoryName';
    return await executeQuery(query);
}

// Function to close the connection pool
async function closeConnection() {
    await promisePool.end();
    console.log('📋 Database connection closed');
}

// Export functions
module.exports = {
    testConnection,
    executeQuery,
    getAllEvents,
    searchEvents,
    getEventById,
    getAllCategories,
    closeConnection
};