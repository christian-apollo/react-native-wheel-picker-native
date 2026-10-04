import { useMemo, useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {
  WheelPicker,
  type WheelPickerItem,
} from '@apolloscooters/react-native-wheel-picker-native';

type Unit = 'km/h' | 'mph';

const speedItems = (unit: Unit): WheelPickerItem<number>[] => {
  const max = unit === 'km/h' ? 60 : 37;
  const items: WheelPickerItem<number>[] = [];
  for (let speed = 6; speed <= max; speed++) {
    items.push({ label: `${speed} ${unit}`, value: speed });
  }
  return items;
};

const fruits: WheelPickerItem<string>[] = [
  { label: 'Apple', value: 'apple' },
  { label: 'Banana', value: 'banana' },
  { label: 'Cherry', value: 'cherry' },
  { label: 'Mango', value: 'mango' },
  { label: 'Peach', value: 'peach' },
];

export default function App() {
  const [unit, setUnit] = useState<Unit>('km/h');
  const [speed, setSpeed] = useState(25);
  const [fruit, setFruit] = useState('cherry');
  const [modalVisible, setModalVisible] = useState(false);
  const [modalSpeed, setModalSpeed] = useState(25);
  const [draftSpeed, setDraftSpeed] = useState(25);

  const items = useMemo(() => speedItems(unit), [unit]);

  return (
    <View style={styles.screen}>
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={styles.content}
      >
        <Text style={styles.title}>Wheel picker</Text>

        <Section title="Basic" caption={`Selected: ${speed} ${unit}`}>
          <WheelPicker
            items={items}
            selectedValue={speed}
            onValueChange={setSpeed}
            accessibilityLabel="Speed"
            testID="speed-wheel"
          />
          <Row>
            <Button label="Set to 15" onPress={() => setSpeed(15)} />
            <Button
              label={`Switch to ${unit === 'km/h' ? 'mph' : 'km/h'}`}
              onPress={() => {
                const next: Unit = unit === 'km/h' ? 'mph' : 'km/h';
                setUnit(next);
                setSpeed((current) =>
                  Math.min(current, next === 'mph' ? 37 : 60)
                );
              }}
            />
          </Row>
        </Section>

        <Section title="Styled" caption={`Selected: ${fruit}`}>
          <WheelPicker
            items={fruits}
            selectedValue={fruit}
            onValueChange={setFruit}
            textColor="#E4572E"
            fontSize={26}
            style={styles.styledWheel}
            accessibilityLabel="Fruit"
          />
        </Section>

        <Section
          title="In a modal"
          caption={`Saved: ${modalSpeed} km/h. Open, spin, tap Save, repeat.`}
        >
          <Button
            label="Open"
            testID="open-modal"
            onPress={() => {
              setDraftSpeed(modalSpeed);
              setModalVisible(true);
            }}
          />
        </Section>
      </ScrollView>

      {modalVisible && (
        <Modal
          visible
          transparent
          animationType="slide"
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.backdrop}>
            <View style={styles.sheet}>
              <Text style={styles.sheetTitle}>Set speed limit</Text>
              <WheelPicker
                items={speedItems('km/h')}
                selectedValue={draftSpeed}
                onValueChange={setDraftSpeed}
                accessibilityLabel="Speed limit"
                testID="modal-wheel"
              />
              <Row>
                <Button
                  label="Cancel"
                  testID="modal-cancel"
                  onPress={() => setModalVisible(false)}
                />
                <Button
                  label="Save"
                  testID="modal-save"
                  onPress={() => {
                    setModalSpeed(draftSpeed);
                    setModalVisible(false);
                  }}
                />
              </Row>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}

function Section({
  title,
  caption,
  children,
}: {
  title: string;
  caption: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
      <Text style={styles.caption}>{caption}</Text>
    </View>
  );
}

function Row({ children }: { children: React.ReactNode }) {
  return <View style={styles.row}>{children}</View>;
}

function Button({
  label,
  onPress,
  testID,
}: {
  label: string;
  onPress: () => void;
  testID?: string;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={styles.button}
      testID={testID}
    >
      <Text style={styles.buttonLabel}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F2F2F7' },
  content: { padding: 16, gap: 16 },
  title: { fontSize: 28, fontWeight: '700' },
  section: { backgroundColor: 'white', borderRadius: 12, padding: 16, gap: 8 },
  sectionTitle: { fontSize: 17, fontWeight: '600' },
  caption: { color: '#6E6E73', textAlign: 'center' },
  styledWheel: { height: 180 },
  row: { flexDirection: 'row', gap: 12, justifyContent: 'center' },
  button: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  buttonLabel: { color: 'white', fontWeight: '600' },
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  sheet: {
    backgroundColor: 'white',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 16,
    paddingBottom: 40,
    gap: 8,
  },
  sheetTitle: { fontSize: 17, fontWeight: '600', textAlign: 'center' },
});
