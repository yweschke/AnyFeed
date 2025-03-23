import { openDatabase } from './feeds.ts';
import { Feed } from '@/types/rssFeed/feed.ts';

export const setupDatabase = async () => {
    try {
        const db = await openDatabase();
        await db.execAsync(`CREATE TABLE IF NOT EXISTS rssFeeds (
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
        const db = await openDatabase();
        await db.runAsync(`INSERT INTO rssFeeds (title, url) VALUES (?, ?);`, [title, url]);
        console.log('✅ Feed inserted successfully');
    } catch (error) {
        console.error('❌ Error inserting feed:', error);
    }
};

export const getFeed = async (id: number): Promise<Feed | null> => {
    try {
        const db = await openDatabase();
        return await db.getAllAsync(`SELECT * FROM rssFeeds WHERE id = ?;`, [id]);
    } catch (error) {
        console.error('❌ Error fetching feed:', error);
        return null;
    }
}

export const getFeeds = async (): Promise<Feed[]> => {
    try {
        const db = await openDatabase();
        return await db.getAllAsync(`SELECT * FROM rssFeeds;`);
    } catch (error) {
        console.error('❌ Error fetching feeds:', error);
        return [];
    }
};

export const updateFeed = async (id: number, title: string, url: string) => {
    try {
        const db = await openDatabase();
        await db.runAsync(`UPDATE rssFeeds SET title = ?, url = ? WHERE id = ?;`, [title, url, id]);
        console.log('✅ Feed updated successfully');
    } catch (error) {
        console.error('❌ Error updating feed:', error);
    }
};

export const deleteFeed = async (id: number) => {
    try {
        const db = await openDatabase();
        await db.runAsync(`DELETE FROM rssFeeds WHERE id = ?;`, [id]);
        console.log('✅ Feed deleted successfully');
    } catch (error) {
        console.error('❌ Error deleting feed:', error);
    }
};
