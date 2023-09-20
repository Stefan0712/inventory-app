const sqlite3 = require('sqlite3');
const db = new sqlite3.Database('inventory.db');

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY,
      name TEXT,
      category TEXT,
      description TEXT,
      price REAL,
      quantity INTEGER,
      stock INTEGER,
      maxStock INTEGER,
      minStock INTEGER,
      expirationDate TEXT,
      unit TEXT,
      purchasePrice REAL
    )
  `);
});

module.exports = db;
