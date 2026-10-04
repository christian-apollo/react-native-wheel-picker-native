import { useCallback, useMemo } from 'react';
import { Platform, StyleSheet, type NativeSyntheticEvent } from 'react-native';
import WheelPickerNativeView, {
  type NativeValueChangeEvent,
} from './WheelPickerNativeViewNativeComponent';
import type { WheelPickerProps, WheelPickerValue } from './types';

/**
 * The platform's own wheel picker: UIPickerView on iOS, NumberPicker on Android.
 *
 * The native side never reloads a wheel that is on screen. When `items`, `textColor` or
 * `fontSize` change it builds a fresh wheel in place, and it only moves the selection itself
 * while nobody is touching the wheel. See the README for why.
 */
export function WheelPicker<T extends WheelPickerValue>({
  items,
  selectedValue,
  onValueChange,
  textColor,
  fontSize,
  accessibilityLabel,
  style,
  testID,
}: WheelPickerProps<T>) {
  const labels = useMemo(() => items.map((item) => item.label), [items]);
  const selectedIndex = useMemo(
    () =>
      selectedValue === undefined
        ? 0
        : Math.max(
            items.findIndex((item) => item.value === selectedValue),
            0
          ),
    [items, selectedValue]
  );

  const handleValueChange = useCallback(
    (event: NativeSyntheticEvent<NativeValueChangeEvent>) => {
      const { index } = event.nativeEvent;
      const item = items[index];
      if (item !== undefined) {
        onValueChange?.(item.value, index);
      }
    },
    [items, onValueChange]
  );

  return (
    <WheelPickerNativeView
      labels={labels}
      selectedIndex={selectedIndex}
      textColor={textColor}
      fontSize={fontSize ?? 0}
      accessibilityTitle={accessibilityLabel}
      onValueChange={handleValueChange}
      style={[styles.wheel, style]}
      testID={testID}
    />
  );
}

const styles = StyleSheet.create({
  wheel: {
    height: Platform.OS === 'ios' ? 216 : 180,
  },
});
