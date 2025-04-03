import React from 'react';
import { View, Text, SafeAreaView, TouchableOpacity} from 'react-native';
import { IconSymbol } from '../ui/IconSymbol';
import { useTranslation } from 'react-i18next';
import LibraryCard from '../cards/libraryCard';

export default function LibraryList() {
    const { t } = useTranslation('library');

    const handleSettingsPress = () => {
        console.log('Settings pressed');
    }

    const handleSavedForLaterPress = () => {
        console.log('Saved for later pressed');
    }

    const handleRecentlyReadPress = () => {
        console.log('Recently read pressed');
    }

    const handleMyFeedsPress = () => {
        console.log('My feeds pressed');
    }
    return (
        <SafeAreaView className="top-0 left-0 right-0 heigth-60px bg-primary-light dark:bg-primary-dark justify-center px-6">
            <View className="bg-primary-light dark:bg-primary-dark">
                <View
                    className="flex-row items-center justify-between p-4 pt-6 border-b border-accent-light dark:border-accent-dark"
                >
                    <Text className="text-textPrimary-light dark:text-textPrimary-dark text-3xl font-bold mb-2">{t('library.title')}</Text>

                    <TouchableOpacity onPress={() => {handleSettingsPress()}}>
                        <View>
                            <IconSymbol 
                                name="gear" 
                                size={28} 
                                color="text-accent-light dark:text-accent-dark" 
                            />
                        </View>
                    </TouchableOpacity>
                </View>
            </View>
            <View className="bg-primary-light dark:bg-primary-dark px-60px">
                <LibraryCard title="savedForLater" icon="heart" onPress={() => {handleSavedForLaterPress()}} />
                <LibraryCard title="recentlyRead" icon="clock" onPress={() => {handleRecentlyReadPress()}} />
                <LibraryCard title="myFeeds" icon="rss" onPress={() => {handleMyFeedsPress()}} />
            </View>
        </SafeAreaView>
    );
}
