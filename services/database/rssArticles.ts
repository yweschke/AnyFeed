import { openDatabase} from './feeds.ts';
import { Article } from '@/types/rssFeed/article.ts';
import { Feed } from '@/types/rssFeed/feed.ts';

export const setupDatabase = async () => {
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
                authors TEXT,     -- Store as JSON string
                categories TEXT,  -- Store as JSON string
                images TEXT       -- Store as JSON string
            );
        `);

        console.log('✅ Database initialized with JSON storage');
    } catch (error) {
        console.error('❌ Error setting up database:', error);
    }
};

export const insertArticle = async (article: Article, feedId : Feed.id ) => {
    try {
        const db = await openDatabase();

        await db.runAsync(
            `INSERT INTO rssArticles (feed_id, title, url, content, description, published, updated, authors, categories, images)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
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
                JSON.stringify(article.image)         // Convert images to JSON
            ]
        );

        console.log(`✅ Article '${article.title}' inserted successfully`);
    } catch (error) {
        console.error('❌ Error inserting article:', error);
    }
}

export const getArticles = async (feedId: Feed.id): Promise<Article[]> => {
    try {
        const db = await openDatabase();
        const rawArticles = await db.getAllAsync(`SELECT * FROM rssArticles WHERE feed_id = ?;`, [feedId]);

        return rawArticles.map((row: any) => ({
            title: row.title,
            url: row.url,
            content: row.content,
            description: row.description,
            published: row.published ? new Date(row.published) : undefined,
            updated: row.updated ? new Date(row.updated) : undefined,
            authors: JSON.parse(row.authors || "[]"),       // Convert JSON to array
            categories: JSON.parse(row.categories || "[]"), // Convert JSON to array
            image: JSON.parse(row.images || "[]")          // Convert JSON to array
        }));
    } catch (error) {
        console.error('❌ Error fetching articles:', error);
        return [];
    }
};

export const getArticle = async (id: number): Promise<Article | null> => {
    try {
        const db = await openDatabase();
        const rawArticle = await db.getAsync(`SELECT * FROM rssArticles WHERE id = ?;`, [id]);

        if (!rawArticle) {
            return null;
        }

        return {
            title: rawArticle.title,
            url: rawArticle.url,
            content: rawArticle.content,
            description: rawArticle.description,
            published: rawArticle.published ? new Date(rawArticle.published) : undefined,
            updated: rawArticle.updated ? new Date(rawArticle.updated) : undefined,
            authors: JSON.parse(rawArticle.authors || "[]"),       // Convert JSON to array
            categories: JSON.parse(rawArticle.categories || "[]"), // Convert JSON to array
            image: JSON.parse(rawArticle.images || "[]")          // Convert JSON to array
        };
    } catch (error) {
        console.error("❌ Error fetching article:", error);
        return null;
    }
};


export const updateArticle = async (id: number, article: Article) => {
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
                 images = ?
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
                id
            ]
        );

        console.log(`✅ Article with ID ${id} updated successfully`);
    } catch (error) {
        console.error('❌ Error updating article:', error);
    }
};

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
