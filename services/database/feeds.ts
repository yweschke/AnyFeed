import * as SQLite from 'expo-sqlite';

export async function openDatabase() {
    try {
        return SQLite.openDatabaseAsync('Feeds.db');
    } catch (error) {
        console.error('❌ Failed to open database:', error);
        throw error;
    }
}
