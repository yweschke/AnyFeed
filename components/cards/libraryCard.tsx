import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { IconSymbol } from '../ui/IconSymbol';
interface LibraryCardProps {
    title: string;
    icon: string;
    onPress: () => void;
}

export default function LibraryCard({ title, icon, onPress }: LibraryCardProps) {
    const { t } = useTranslation('library');

    return (
        <TouchableOpacity onPress={onPress} className="bg-secondary-light dark:bg-secondary-dark shadow-sm shadow-accent-light dark:shadow-accent-dark rounded-2xl m-2 p-4 py-10 flex-row items-center justify-between">
            <Text className="text-textPrimary-light dark:text-textPrimary-dark text-2xl font-bold">{t("library.cards." + title)}</Text>
            <IconSymbol name={icon as any} size={28} color="text-accent-light dark:text-accent-dark"/>
        </TouchableOpacity>
    );
}
