const Database = require('better-sqlite3');

// 1. Create a local database file named "my_data.db"
const db = new Database('my_data.db');

// 2. Create a simple table to hold data
db.prepare('CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY, name TEXT)').run();

// 3. Clear old data so we don't duplicate names every time we test
db.prepare('DELETE FROM users').run();

// 4. Insert a name into the database
const insert = db.prepare('INSERT INTO users (name) VALUES (?)');
insert.run('Alice');

// 5. Read the data back out
const users = db.prepare('SELECT * FROM users').all();

console.log('--- DATABASE CONTENTS ---');
console.log(users);
