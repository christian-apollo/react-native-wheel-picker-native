import { render, screen } from '@testing-library/react-native';
import { Platform, StyleSheet, View } from 'react-native';
import { WheelPicker } from '../WheelPicker.native';

// Stand in for the native view with a plain host element, so the test can read the props it
// receives and fire its event.
jest.mock('../WheelPickerNativeViewNativeComponent', () => ({
  __esModule: true,
  default: 'WheelPickerNativeView',
}));

const items = [
  { label: 'Six', value: 6 },
  { label: 'Seven', value: 7 },
  { label: 'Eight', value: 8 },
];

const nativeProps = () => screen.getByTestId('native-wheel').props;

const fireNativeChange = (index: number) =>
  nativeProps().onValueChange({ nativeEvent: { index } });

describe('WheelPicker', () => {
  it('passes the item labels to the native wheel in order', async () => {
    await render(<WheelPicker testID="native-wheel" items={items} />);
    expect(nativeProps().labels).toEqual(['Six', 'Seven', 'Eight']);
  });

  it('selects the row whose value matches selectedValue', async () => {
    await render(
      <WheelPicker testID="native-wheel" items={items} selectedValue={8} />
    );
    expect(nativeProps().selectedIndex).toBe(2);
  });

  it('falls back to the first row when selectedValue is missing or unknown', async () => {
    const { rerender } = await render(
      <WheelPicker testID="native-wheel" items={items} />
    );
    expect(nativeProps().selectedIndex).toBe(0);
    await rerender(
      <WheelPicker testID="native-wheel" items={items} selectedValue={42} />
    );
    expect(nativeProps().selectedIndex).toBe(0);
  });

  it('reports the value and index of the row the wheel settled on', async () => {
    const onValueChange = jest.fn();
    await render(
      <WheelPicker
        testID="native-wheel"
        items={items}
        onValueChange={onValueChange}
      />
    );
    fireNativeChange(1);
    expect(onValueChange).toHaveBeenCalledWith(7, 1);
  });

  it('works with string values', async () => {
    const onValueChange = jest.fn();
    const fruits = [
      { label: 'Apple', value: 'apple' },
      { label: 'Pear', value: 'pear' },
    ];
    await render(
      <WheelPicker
        testID="native-wheel"
        items={fruits}
        selectedValue="pear"
        onValueChange={onValueChange}
      />
    );
    expect(nativeProps().selectedIndex).toBe(1);
    fireNativeChange(0);
    expect(onValueChange).toHaveBeenCalledWith('apple', 0);
  });

  it('ignores an index outside the items, for example from a wheel that was just replaced', async () => {
    const onValueChange = jest.fn();
    await render(
      <WheelPicker
        testID="native-wheel"
        items={items}
        onValueChange={onValueChange}
      />
    );
    fireNativeChange(9);
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it('passes styling and the accessibility name through', async () => {
    await render(
      <WheelPicker
        testID="native-wheel"
        items={items}
        textColor="#ff0000"
        fontSize={24}
        accessibilityLabel="Speed limit"
      />
    );
    expect(nativeProps().textColor).toBe('#ff0000');
    expect(nativeProps().fontSize).toBe(24);
    expect(nativeProps().accessibilityTitle).toBe('Speed limit');
  });

  it('sends 0 for the font size when none is set, which means the platform default', async () => {
    await render(<WheelPicker testID="native-wheel" items={items} />);
    expect(nativeProps().fontSize).toBe(0);
  });

  it('uses the platform height by default and lets style override it', async () => {
    const { rerender } = await render(
      <WheelPicker testID="native-wheel" items={items} />
    );
    expect(StyleSheet.flatten(nativeProps().style).height).toBe(
      Platform.OS === 'ios' ? 216 : 180
    );
    await rerender(
      <WheelPicker
        testID="native-wheel"
        items={items}
        style={{ height: 120 }}
      />
    );
    expect(StyleSheet.flatten(nativeProps().style).height).toBe(120);
  });

  it('renders inside other views', async () => {
    await render(
      <View>
        <WheelPicker testID="native-wheel" items={items} />
      </View>
    );
    expect(screen.getByTestId('native-wheel')).toBeTruthy();
  });
});
