// components/modals/TextSettingsModal.tsx
import React, { useState } from 'react';
import { View, Text, Modal, TouchableOpacity, Pressable } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useColorScheme } from '@/hooks/useColorScheme';
import { TextSettings } from '@/types/rssFeed/article.ts';

interface TextSettingsModalProps {
    visible: boolean;
    onClose: () => void;
    initialSettings: TextSettings;
    onSave: (settings: TextSettings) => void;
}

const FONT_SIZES = [14, 16, 18, 20, 22, 24];
const FONT_FAMILIES = [
    { name: 'System', value: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif' },
    { name: 'Serif', value: 'Georgia, Times New Roman, serif' },
    { name: 'Sans-serif', value: 'Arial, Helvetica, sans-serif' },
    { name: 'Monospace', value: 'Courier New, monospace' }
];

export default function TextSettingsModal({ visible, onClose, initialSettings, onSave }: TextSettingsModalProps) {
    const { t } = useTranslation('article');
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    const [settings, setSettings] = useState<TextSettings>(initialSettings);

    const handleSave = () => {
        onSave(settings);
        onClose();
    };

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <Pressable
                className="flex-1 justify-end"
                onPress={onClose}
            >
                <Pressable
                    className="rounded-t-3xl p-5 shadow-md bg-primary-light dark:bg-primary-dark"
                    onPress={e => e.stopPropagation()}
                >
                    <View className="flex-row justify-between items-center mb-5">
                        <Text className="text-xl font-bold text-textPrimary-light dark:text-textPrimary-dark">
                            {t('textSettings.title', 'Text Settings')}
                        </Text>
                    </View>

                    {/* Font Size Section */}
                    <View className="mb-5">
                        <Text className="text-lg font-semibold mb-2 text-textPrimary-light dark:text-textPrimary-dark">
                            {t('textSettings.fontSize', 'Font Size')}
                        </Text>
                        <View className="flex-row flex-wrap justify-between">
                            {FONT_SIZES.map(size => (
                                <TouchableOpacity
                                    key={`size-${size}`}
                                    className={`p-3 rounded-lg mb-2 w-[30%] items-center justify-center border border-accent-light dark:border-accent-dark ${
                                        settings.fontSize === size ? 'bg-accent-light dark:bg-accent-dark' : 'bg-transparent'
                                    }`}
                                    onPress={() => setSettings({ ...settings, fontSize: size })}
                                >
                                    <Text
                                        style={{ fontSize: size * 0.7 }}
                                        className={`font-medium ${
                                            settings.fontSize === size ? 'text-white' : 'text-textPrimary-light dark:text-textPrimary-dark'
                                        }`}
                                    >
                                        {`${size}px`}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    {/* Font Family Section */}
                    <View className="mb-5">
                        <Text className="text-lg font-semibold mb-2 text-textPrimary-light dark:text-textPrimary-dark">
                            {t('textSettings.fontFamily', 'Font Family')}
                        </Text>
                        <View>
                            {FONT_FAMILIES.map(font => {
                                const isSelected = settings.fontFamily === font.value;
                                return (
                                    <TouchableOpacity
                                        key={`font-${font.name}`}
                                        className={`p-3 rounded-lg mb-2 border border-accent-light dark:border-accent-dark ${
                                            isSelected ? "bg-accent-light dark:bg-accent-dark" : 'bg-transparent'
                                        }`}
                                        onPress={() => setSettings({ ...settings, fontFamily: font.value })}
                                    >
                                        <Text
                                            className={`font-semibold text-base mb-1 ${
                                                isSelected ? 'text-white' : "text-textSecondary-light dark:text-textPrimary-dark"
                                            }`}
                                        >
                                            {font.name}
                                        </Text>
                                        <Text
                                            style={{ fontFamily: font.name === 'System' ? undefined : font.value.split(',')[0] }}
                                            className={`text-sm ${
                                                isSelected ? 'text-white' : 'text-textPrimary-light dark:text-textPrimary-dark'
                                            }`}
                                        >
                                            {t('textSettings.sampleText', 'Sample Text')}
                                        </Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    </View>

                    {/* Save Button */}
                    <TouchableOpacity
                        className="p-4 rounded-lg items-center mt-2 bg-active-light dark:bg-active-dark"
                        onPress={handleSave}
                    >
                        <Text className="text-white font-bold text-base">
                            {t('textSettings.apply', 'Apply Changes')}
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        className="items-center m-3"
                        onPress={onClose}>
                        <Text className="font-bold text-textSecondary-light dark:text-textSecondary-dark">
                            {t('textSettings.cancel', 'Cancel')}
                        </Text>
                    </TouchableOpacity>
                </Pressable>
            </Pressable>
        </Modal>
    );
}
