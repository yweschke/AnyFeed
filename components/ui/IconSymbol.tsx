// This file is a fallback for using MaterialIcons on Android and web.

import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { SymbolWeight } from 'expo-symbols';
import React from 'react';
import { OpaqueColorValue, StyleProp, ViewStyle } from 'react-native';

// Add your SFSymbol to MaterialIcons mappings here.
const MAPPING = {
  // See MaterialIcons here: https://icons.expo.fyi
  // See SF Symbols in the SF Symbols app on Mac.
  'house.fill': 'home',
  'paperplane.fill': 'send',
  'chevron.left.forwardslash.chevron.right': 'code',
  'chevron.right': 'chevron-right',
  'bookmark.fill': 'bookmark',
  'bookmark': 'bookmark_border',
  'envelope': 'email',
  'envelope.open': 'drafts',
  'globe': 'public',
  'globe.americas.fill': 'public',
  'square.and.arrow.up': 'share',
  'textformat.size': 'text_fields',
  'chevron.backward': 'arrow_back',
  'search': 'search', // Just to be explicit
} as Partial<
    Record<
        import('expo-symbols').SymbolViewProps['name'],
        React.ComponentProps<typeof MaterialIcons>['name']
    >
>;

export type IconSymbolName = keyof typeof MAPPING;

/**
 * An icon component that uses native SFSymbols on iOS, and MaterialIcons on Android and web. This ensures a consistent look across platforms, and optimal resource usage.
 *
 * Icon `name`s are based on SFSymbols and require manual mapping to MaterialIcons.
 */
export function IconSymbol({
                             name,
                             size = 24,
                             color,
                             style,
                           }: {
  name: IconSymbolName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<ViewStyle>;
  weight?: SymbolWeight;
}) {
  // If the name is not in our mapping, use a default icon
  const iconName = MAPPING[name] || 'help_outline';
  return <MaterialIcons color={color} size={size} name={iconName} style={style} />;
}
