import * as SQLite from 'expo-sqlite';

async function openDatabase() {
    try {
        return SQLite.openDatabaseAsync('rssFeeds.db');
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

export const insertFeed = async (title: string, url: string) => {
    try {
        console.log(`🚀 Adding feed: ${title} - ${url}`);
        const db = await openDatabase();
        await db.runAsync(`INSERT INTO feeds (title, url) VALUES (?, ?);`, [title, url]);
        console.log('✅ Feed inserted successfully');
    } catch (error) {
        console.error('❌ Error inserting feed:', error);
    }
};

export const getFeeds = async (): Promise<any[]> => {
    try {
        const db = await openDatabase();
        return await db.getAllAsync(`SELECT * FROM feeds;`);
    } catch (error) {
        console.error('❌ Error fetching feeds:', error);
        return [];
    }
};

export const updateFeed = async (id: number, title: string, url: string) => {
    try {
        const db = await openDatabase();
        await db.runAsync(`UPDATE feeds SET title = ?, url = ? WHERE id = ?;`, [title, url, id]);
        console.log('✅ Feed updated successfully');
    } catch (error) {
        console.error('❌ Error updating feed:', error);
    }
};

export const deleteFeed = async (id: number) => {
    try {
        const db = await openDatabase();
        await db.runAsync(`DELETE FROM feeds WHERE id = ?;`, [id]);
        console.log('✅ Feed deleted successfully');
    } catch (error) {
        console.error('❌ Error deleting feed:', error);
    }
};

export default openDatabase;
