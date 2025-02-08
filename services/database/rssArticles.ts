import { openDatabase, Feed } from './feeds.ts';

export interface Article {
    title: string;
    link: string;
    date: string;
    creator?: string;
    content?: string;
    description?: string;
    categories?: string;
    isoDate?: string;
}

export const setupDatabase = async () => {
    try {
        const db = await openDatabase();
        await db.execAsync(`CREATE TABLE IF NOT EXISTS rssArticles (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            feed_id INTEGER FOREIGN KEY REFERENCES rssFeeds(id),
            title TEXT NOT NULL,
            link TEXT UNIQUE NOT NULL,
            date TEXT NOT NULL,
            creator TEXT,
            content TEXT,
            description TEXT,
            categories TEXT,
            isoDate TEXT`);
        console.log('✅ Database initialized');
    } catch (error) {
        console.error('❌ Error setting up database:', error);
    }
};

export const insertArticle = async (article: Article, feedId : Feed.id ) => {
    try {
        console.log(`🚀 Adding article: ${article.title} - ${article.link}`);
        const db = await openDatabase();
        await db.runAsync(
            `INSERT OR IGNORE INTO rssArticles (feed_id, title, link, date, creator, content, description, categories, isoDate) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);`,
            [feedId, article.title, article.link, article.date, article.creator, article.content, article.description, article.categories, article.isoDate]
        );
        console.log('✅ Article inserted successfully');
    } catch (error) {
        console.error('❌ Error inserting article:', error);
    }
}

export const getArticles = async (feedId: Feed.id): Promise<Article[]> => {
    try {
        const db = await openDatabase();
        return await db.getAllAsync(`SELECT * FROM rssArticles WHERE feed_id = ?;`, [feedId]);
    } catch (error) {
        console.error('❌ Error fetching articles:', error);
        return [];
    }
};

export const getArticle = async (id: number): Promise<Article | null> => {
    try {
        const db = await openDatabase();
        return await db.getAsync(`SELECT * FROM rssArticles WHERE id = ?;`, [id]);
    } catch (error) {
        console.error('❌ Error fetching article:', error);
        return null;
    }
}

export const updateArticle = async (id: number, article: Article) => {
    try {
        const db = await openDatabase();
        await db.runAsync(
            `UPDATE rssArticles SET title = ?, link = ?, date = ?, creator = ?, content = ?, description = ?, categories = ?, isoDate = ? WHERE id = ?;`,
            [article.title, article.link, article.date, article.creator, article.content, article.description, article.categories, article.isoDate, id]
        );
        console.log('✅ Article updated successfully');
    } catch (error) {
        console.error('❌ Error updating article:', error);
    }
}

export const deleteArticles = async (feedId: Feed.id) => {
    try {
        const db = await openDatabase();
        await db.runAsync(`DELETE FROM rssArticles WHERE feed_id = ?;`, [feedId]);
        console.log('✅ Articles deleted successfully');
    } catch (error) {
        console.error('❌ Error deleting articles:', error);
    }
}
export const deleteOldArticles = async () => {
    try {
        const db = await openDatabase();
        await db.runAsync(`DELETE FROM rssArticles WHERE date(isoDate) <= date('now', '-31 days');`);
        console.log("✅ Old articles deleted");
    } catch (error) {
        console.error("❌ Error deleting old articles:", error);
    }
};

export const deleteArticle = async (id: number) => {
    try {
        const db = await openDatabase();
        await db.runAsync(`DELETE FROM rssArticles WHERE id = ?;`, [id]);
        console.log('✅ Article deleted successfully');
    } catch (error) {
        console.error('❌ Error deleting article:', error);
    }
}
