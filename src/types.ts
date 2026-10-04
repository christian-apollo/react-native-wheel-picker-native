import type { ColorValue, StyleProp, ViewStyle } from 'react-native';

/** A value a wheel row can carry. */
export type WheelPickerValue = string | number;

/** One row of the wheel. */
export type WheelPickerItem<T extends WheelPickerValue = WheelPickerValue> = {
  /** Text shown on the row. */
  label: string;
  /** Value passed to `onValueChange` when the row is chosen. Values should be unique. */
  value: T;
};

export type WheelPickerProps<T extends WheelPickerValue = WheelPickerValue> = {
  /** The rows, top to bottom. */
  items: ReadonlyArray<WheelPickerItem<T>>;
  /**
   * The value of the row to show. When it does not match any item, the first row is shown.
   * Update it from `onValueChange` to keep the wheel and your state in step.
   */
  selectedValue?: T;
  /** Called when the wheel comes to rest on a row the user scrolled or tapped to. */
  onValueChange?: (value: T, index: number) => void;
  /** Colour of the row text. Defaults to the platform's label colour. */
  textColor?: ColorValue;
  /** Font size of the row text, in points. Defaults to the platform size. */
  fontSize?: number;
  /** Name read by VoiceOver and TalkBack for the wheel, for example "Speed limit". */
  accessibilityLabel?: string;
  /** Size and layout. The wheel is 216 points tall on iOS and 180 on Android unless you set a height. */
  style?: StyleProp<ViewStyle>;
  testID?: string;
};
