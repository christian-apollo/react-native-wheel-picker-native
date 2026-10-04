import {
  codegenNativeComponent,
  type CodegenTypes,
  type ColorValue,
  type ViewProps,
} from 'react-native';

export type NativeValueChangeEvent = Readonly<{ index: CodegenTypes.Int32 }>;

export interface NativeProps extends ViewProps {
  labels: ReadonlyArray<string>;
  selectedIndex: CodegenTypes.Int32;
  textColor?: ColorValue;
  fontSize?: CodegenTypes.Float;
  accessibilityTitle?: string;
  onValueChange?: CodegenTypes.DirectEventHandler<NativeValueChangeEvent>;
}

export default codegenNativeComponent<NativeProps>('WheelPickerNativeView');
