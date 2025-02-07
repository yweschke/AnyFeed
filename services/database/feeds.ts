import { openDatabase } from '@/services/database/rssFeeds';

interface Feed {
    id: number;
    title: string;
    url: string;
    created_at: string; // SQLite stores timestamps as strings
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
    } catch (error) {
        console.error('❌ Error setting up database:', error);
    }
};

export const insertFeed = async (title: string, url: string) => {
    try {
        const db = await openDatabase();
        await db.runAsync(`INSERT INTO feeds (title, url) VALUES (?, ?);`, [title, url]);
    } catch (error) {
        console.error('❌ Error inserting feed:', error);
    }
};

export const getFeeds = async (): Promise<Feed[]> => {
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
    } catch (error) {
        console.error('❌ Error updating feed:', error);
    }
};

export const deleteFeed = async (id: number) => {
    try {
        const db = await openDatabase();
        await db.runAsync(`DELETE FROM feeds WHERE id = ?;`, [id]);
    } catch (error) {
        console.error('❌ Error deleting feed:', error);
    }
};

export default openDatabase;
