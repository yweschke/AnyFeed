import { openDatabase} from './feeds.ts';
import { Article } from '@/types/rssFeed/article.ts';
import { Feed } from '@/types/rssFeed/feed.ts';

export const setupDatabase = async (): Promise<void> => {
    try {
        const db = await openDatabase();

        await db.execAsync(`
            CREATE TABLE IF NOT EXISTS rssArticles (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                feed_id INTEGER,
                title TEXT NOT NULL,
                url TEXT UNIQUE NOT NULL,
                content TEXT,
                description TEXT,
                published TEXT,
                updated TEXT,
                authors TEXT,     
                categories TEXT,  
                images TEXT,
                unread BOOLEAN NOT NULL DEFAULT 1
            );
        `);

        console.log('✅ Database initialized with JSON storage');
    } catch (error) {
        console.error('❌ Error setting up database:', error);
    }
};

export const insertArticle = async (article: Article, feedId: Feed.id): Promise<void> => {
    try {
        const db = await openDatabase();

        await db.runAsync(
            `INSERT OR IGNORE INTO rssArticles (feed_id, title, url, content, description, published, updated, authors, categories, images, unread)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
            [
                feedId,
                article.title,
                article.url,
                article.content,
                article.description,
                article.published?.toISOString() || null,
                article.updated?.toISOString() || null,
                JSON.stringify(article.authors),      // Convert authors to JSON
                JSON.stringify(article.categories),   // Convert categories to JSON
                JSON.stringify(article.image),        // Convert image to JSON
                article.unread                        // Set unread value
            ]
        );

        //console.log(`✅ Article '${article.title}' inserted successfully, read: ${!article.unread}`);
    } catch (error) {
        console.error('❌ Error inserting article:', error);
    }
}

export const insertArticles = async (articles: Article[], feedId: Feed.id): Promise<void> => {
    try {
        for (const article of articles) {
            await insertArticle(article, feedId);
        }
        console.log(`✅ Inserted ${articles.length} articles for feed ${feedId}`);
    } catch (error) {
        console.error('❌ Error batch inserting articles:', error);
    }
}

export const getArticles = async (feedId: number): Promise<Article[]> => {
    try {
        const db = await openDatabase();
        const rawArticles = await db.getAllAsync(`SELECT * FROM rssArticles WHERE feed_id = ?;`, [feedId]);

        return rawArticles.map((row: any) => ({
            id: row.id,
            title: row.title,
            url: row.url,
            content: row.content,
            description: row.description,
            published: row.published ? new Date(row.published) : undefined,
            updated: row.updated ? new Date(row.updated) : undefined,
            authors: JSON.parse(row.authors || "[]"),
            categories: JSON.parse(row.categories || "[]"),
            image: JSON.parse(row.images || "null"),
            unread: row.unread === 1
        }));
    } catch (error) {
        console.error('❌ Error fetching articles:', error);
        return [];
    }
}

export const getArticle = async (id: number): Promise<Article | null> => {
    try {
        const db = await openDatabase();
        const result = await db.getAllAsync(`SELECT * FROM rssArticles WHERE id = ?;`, [id]);

        if (!result || result.length === 0) {
            console.log("No article found with ID:", id);
            return null;
        }

        const rawArticle = result[0];

        return {
            id: rawArticle.id,
            title: rawArticle.title,
            url: rawArticle.url,
            content: rawArticle.content,
            description: rawArticle.description,
            published: rawArticle.published ? new Date(rawArticle.published) : undefined,
            updated: rawArticle.updated ? new Date(rawArticle.updated) : undefined,
            authors: JSON.parse(rawArticle.authors || "[]"),
            categories: JSON.parse(rawArticle.categories || "[]"),
            image: JSON.parse(rawArticle.images || "null"),
            unread: rawArticle.unread === 1
        };
    } catch (error) {
        console.error("❌ Error fetching article by ID:", error);
        return null;
    }
};

export const getNewestArticles = async (feedId: number, limit: number): Promise<Article[]> => {
    try {
        const db = await openDatabase();
        const rawArticles = await db.getAllAsync(
            `SELECT * FROM rssArticles WHERE feed_id = ? ORDER BY published DESC LIMIT ?;`,
            [feedId, limit]
        );

        return rawArticles.map((row: any) => ({
            id: row.id,
            title: row.title,
            url: row.url,
            content: row.content,
            description: row.description,
            published: row.published ? new Date(row.published) : undefined,
            updated: row.updated ? new Date(row.updated) : undefined,
            authors: JSON.parse(row.authors || "[]"),
            categories: JSON.parse(row.categories || "[]"),
            image: JSON.parse(row.images || "null"),
            unread: row.unread === 1
        }));
    } catch (error) {
        console.error('❌ Error fetching articles:', error);
        return [];
    }
}

export const getUnreadArticlesNumber = async (): Promise<number> => {
    try {
        const db = await openDatabase();
        const articles = await db.getAllAsync(`SELECT * FROM rssArticles WHERE unread = 1;`);
        return articles.length;
    } catch (error) {
        console.error('❌ Error fetching unread articles number:', error);
        return 0;
    }
}

export const getUnreadArticlesNumberFromFeed = async (feedId : Feed.id): Promise<number> => {
    try {
        const db = await openDatabase();
        const articles= await db.getAllAsync(`SELECT * FROM rssArticles WHERE unread = 1 AND feed_id = ?;`, [feedId]);
        return articles.length;
    } catch (error) {
        console.error('❌ Error fetching unread articles number:', error);
        return 0;
    }
}

export const updateArticle = async (id: number, article: Article): Promise<void> => {
    try {
        const db = await openDatabase();

        await db.runAsync(
            `UPDATE rssArticles
             SET title = ?,
                 url = ?,
                 content = ?,
                 description = ?,
                 published = ?,
                 updated = ?,
                 authors = ?,
                 categories = ?,
                 images = ?,
                 unread = ?
             WHERE id = ?;`,
            [
                article.title,
                article.url,
                article.content,
                article.description,
                article.published ? article.published.toISOString() : null,
                article.updated ? article.updated.toISOString() : null,
                JSON.stringify(article.authors),      // Convert authors array to JSON string
                JSON.stringify(article.categories),   // Convert categories array to JSON string
                JSON.stringify(article.image),        // Convert images array to JSON string
                article.unread ? 1 : 0,               // Convert boolean to SQLite integer
                id
            ]
        );

        console.log(`✅ Article with ID ${url} updated successfully`);
    } catch (error) {
        console.error('❌ Error updating article:', error);
    }
};

export const setToRead = async (id: number): Promise<void> => {
    try {
        const db = await openDatabase();
        await db.runAsync(`UPDATE rssArticles SET unread = 0 WHERE id = ?;`, [id]);
        console.log(`✅ Article with ID ${id} marked as read`);
    } catch (error) {
        console.error('❌ Error marking article as read:', error);
    }
};

export const setToUnread = async (id: number): Promise<void> => {
    try {
        const db = await openDatabase();
        await db.runAsync(`UPDATE rssArticles SET unread = 1 WHERE id = ?;`, [id]);
        console.log(`✅ Article with ID ${id} marked as unread`);
    } catch (error) {
        console.error('❌ Error marking article as unread:', error);
    }
};

export const deleteArticles = async (feedId: Feed.id): Promise<void> => {
    try {
        const db = await openDatabase();
        await db.runAsync(`DELETE FROM rssArticles WHERE feed_id = ?;`, [feedId]);
        console.log('✅ Articles deleted successfully');
    } catch (error) {
        console.error('❌ Error deleting articles:', error);
    }
}

export const deleteOldArticles = async (): Promise<void> => {
    try {
        const db = await openDatabase();
        await db.runAsync(`DELETE FROM rssArticles WHERE date(published) <= date('now', '-31 days');`);
        console.log("✅ Old articles deleted");
    } catch (error) {
        console.error("❌ Error deleting old articles:", error);
    }
};

export const deleteArticle = async (url: string): Promise<void> => {
    try {
        const db = await openDatabase();
        await db.runAsync(`DELETE FROM rssArticles WHERE url = ?;`, [url]);
        console.log('✅ Article deleted successfully');
    } catch (error) {
        console.error('❌ Error deleting article:', error);
    }
}

export const deleteAllArticles = async (): Promise<void> => {
    try {
        const db = await openDatabase();
        await db.runAsync(`DELETE FROM rssArticles;`);
        console.log('✅ All articles deleted successfully');
    } catch (error) {
        console.error('❌ Error deleting all articles:', error);
    }
}
