import * as SQLite from 'expo-sqlite';

async function openDatabase() {
    try {
        return SQLite.openDatabaseAsync('rssArticles.db');
    } catch (error) {
        console.error('❌ Failed to open database:', error);
        throw error;
    }
}

export const setupDatabase = async () => {
    try {
        const db = await openDatabase();
        await db.execAsync(`CREATE TABLE IF NOT EXISTS feeds (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            url TEXT UNIQUE NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );`);
        console.log('✅ Database initialized');
    } catch (error) {
        console.error('❌ Error setting up database:', error);
    }
};
