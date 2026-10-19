const path = require('path');
const Database = require('better-sqlite3');

const DB_PATH = process.env.BREWCRATE_DB || path.join(__dirname, 'brewcrate.db');

const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

module.exports = db;
module.exports.DB_PATH = DB_PATH;
