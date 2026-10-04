import type { WheelPickerProps, WheelPickerValue } from './types';

export function WheelPicker<T extends WheelPickerValue>(
  _props: WheelPickerProps<T>
): never {
  throw new Error(
    "'@apolloscooters/react-native-wheel-picker-native' only runs on iOS and Android."
  );
}
