import * as SQLite from 'expo-sqlite';

async function openDatabase() {
    return SQLite.openDatabaseAsync('rssFeeds.db');
}

export const setupDatabase = async () => {
    const db = await openDatabase();
    await db.execAsync(`CREATE TABLE IF NOT EXISTS feeds (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    url TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );`);
    console.log('✅ Database initialized');
};

export const insertFeed = async (title: string, url: string) => {
    console.log(`🚀 Adding feed: ${title} - ${url}`);
    const db = await openDatabase();
    await db.runAsync(`INSERT INTO feeds (title, url) VALUES (?, ?);`, [title, url]);
};

export const getFeeds = async (): Promise<any[]> => {
    const db = await openDatabase();
    const result = await db.getAllAsync(`SELECT * FROM feeds;`);
    return result;
};

export const updateFeed = async (id: number, title: string, url: string) => {
    const db = await openDatabase();
    await db.runAsync(`UPDATE feeds SET title = ?, url = ? WHERE id = ?;`, [title, url, id]);
};

export const deleteFeed = async (id: number) => {
    const db = await openDatabase();
    await db.runAsync(`DELETE FROM feeds WHERE id = ?;`, [id]);
};

export default openDatabase;
