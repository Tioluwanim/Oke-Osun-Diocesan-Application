import React from 'react';
import { View } from 'react-native';
import SkeletonCard from './SkeletonCard';

export default function SkeletonList({ count = 6, itemHeight = 120, lines = 3, style }) {
  return (
    <View style={style}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={`sk-${i}`} height={itemHeight} lines={lines} style={{ marginBottom: 12 }} />
      ))}
    </View>
  );
}
