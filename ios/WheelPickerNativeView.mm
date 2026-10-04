#import "WheelPickerNativeView.h"

#import <React/RCTConversions.h>

#import <react/renderer/components/WheelPickerNativeSpec/ComponentDescriptors.h>
#import <react/renderer/components/WheelPickerNativeSpec/EventEmitters.h>
#import <react/renderer/components/WheelPickerNativeSpec/Props.h>
#import <react/renderer/components/WheelPickerNativeSpec/RCTComponentViewHelpers.h>

#import "RCTFabricComponentsPlugins.h"

using namespace facebook::react;

// A UIPickerView must never be rebuilt while a touch can reach it: reloading its rows releases the
// table cells that -[UIPickerView hitTest:withEvent:] is about to walk, and the app crashes in
// objc_msgSend. So this view
//   - is never recycled by Fabric (see +shouldBeRecycled),
//   - loads each wheel's rows once and, when the rows, colour or font change, replaces the whole
//     wheel with a fresh one instead of reloading the live one,
//   - only moves the selection from code while nobody is touching or spinning the wheel.
@interface WheelPickerNativeView () <UIPickerViewDataSource, UIPickerViewDelegate, UIPickerViewAccessibilityDelegate>
@end

@implementation WheelPickerNativeView {
  UIPickerView *_picker;
  NSArray<NSString *> *_labels;
  UIColor *_textColor;
  CGFloat _fontSize;
  UIFont *_font;
  NSInteger _desiredIndex;
  NSString *_accessibilityTitle;
}

+ (ComponentDescriptorProvider)componentDescriptorProvider
{
  return concreteComponentDescriptorProvider<WheelPickerNativeViewComponentDescriptor>();
}

// React Native reads this as a class method. A recycled view would carry an old wheel into a new
// mount, which is one of the ways the crash above happens.
+ (BOOL)shouldBeRecycled
{
  return NO;
}

- (instancetype)initWithFrame:(CGRect)frame
{
  if (self = [super initWithFrame:frame]) {
    static const auto defaultProps = std::make_shared<const WheelPickerNativeViewProps>();
    _props = defaultProps;
    _labels = @[];
    _desiredIndex = 0;
    _font = [self fontForSize:0];
    [self installFreshPicker];
  }
  return self;
}

- (void)updateProps:(Props::Shared const &)props oldProps:(Props::Shared const &)oldProps
{
  const auto &newProps = *std::static_pointer_cast<WheelPickerNativeViewProps const>(props);

  NSMutableArray<NSString *> *labels = [NSMutableArray arrayWithCapacity:newProps.labels.size()];
  for (const auto &label : newProps.labels) {
    [labels addObject:[NSString stringWithUTF8String:label.c_str()]];
  }
  UIColor *textColor = RCTUIColorFromSharedColor(newProps.textColor);
  CGFloat fontSize = newProps.fontSize;

  BOOL rowsChanged = ![labels isEqualToArray:_labels];
  BOOL colorChanged = !(textColor == _textColor || [textColor isEqual:_textColor]);
  BOOL fontChanged = fontSize != _fontSize;

  _labels = [labels copy];
  _textColor = textColor;
  _fontSize = fontSize;
  _font = [self fontForSize:fontSize];
  _desiredIndex = newProps.selectedIndex;

  NSString *title = newProps.accessibilityTitle.empty()
      ? nil
      : [NSString stringWithUTF8String:newProps.accessibilityTitle.c_str()];
  _accessibilityTitle = title;
  _picker.accessibilityLabel = title;

  if (rowsChanged || colorChanged || fontChanged) {
    [self installFreshPicker];
  } else {
    [self applyDesiredSelectionIfIdle];
  }

  [super updateProps:props oldProps:oldProps];
}

#pragma mark - Wheel lifecycle

- (UIFont *)fontForSize:(CGFloat)size
{
  if (size > 0) {
    return [UIFont systemFontOfSize:size];
  }
  return [[UIFontMetrics defaultMetrics] scaledFontForFont:[UIFont systemFontOfSize:21]];
}

- (void)installFreshPicker
{
  UIPickerView *picker = [[UIPickerView alloc] initWithFrame:self.bounds];
  picker.dataSource = self;
  picker.delegate = self;
  picker.accessibilityLabel = _accessibilityTitle;

  UIPickerView *old = _picker;
  _picker = picker;
  // setContentView removes the old wheel from the hierarchy, so no touch can reach it any more.
  self.contentView = picker;
  old.delegate = nil;
  old.dataSource = nil;

  if (_labels.count > 0) {
    [picker selectRow:[self clampedIndex:_desiredIndex] inComponent:0 animated:NO];
  }
}

- (NSInteger)clampedIndex:(NSInteger)index
{
  return MIN(MAX(index, 0), (NSInteger)_labels.count - 1);
}

- (void)applyDesiredSelectionIfIdle
{
  if (_labels.count == 0) {
    return;
  }
  NSInteger index = [self clampedIndex:_desiredIndex];
  if ([_picker selectedRowInComponent:0] == index || [self isUserInteracting]) {
    return;
  }
  [_picker selectRow:index inComponent:0 animated:NO];
}

- (BOOL)isUserInteracting
{
  return [self anyScrollViewIsMovingIn:_picker];
}

- (BOOL)anyScrollViewIsMovingIn:(UIView *)view
{
  for (UIView *subview in view.subviews) {
    if ([subview isKindOfClass:[UIScrollView class]]) {
      UIScrollView *scrollView = (UIScrollView *)subview;
      if (scrollView.isTracking || scrollView.isDragging || scrollView.isDecelerating) {
        return YES;
      }
    }
    if ([self anyScrollViewIsMovingIn:subview]) {
      return YES;
    }
  }
  return NO;
}

#pragma mark - UIPickerViewDataSource

- (NSInteger)numberOfComponentsInPickerView:(UIPickerView *)pickerView
{
  return 1;
}

- (NSInteger)pickerView:(UIPickerView *)pickerView numberOfRowsInComponent:(NSInteger)component
{
  return pickerView == _picker ? (NSInteger)_labels.count : 0;
}

#pragma mark - UIPickerViewDelegate

- (CGFloat)pickerView:(UIPickerView *)pickerView rowHeightForComponent:(NSInteger)component
{
  return _font.lineHeight + 20;
}

- (UIView *)pickerView:(UIPickerView *)pickerView
            viewForRow:(NSInteger)row
          forComponent:(NSInteger)component
           reusingView:(UIView *)view
{
  UILabel *label = [view isKindOfClass:[UILabel class]] ? (UILabel *)view : [UILabel new];
  label.text = row < (NSInteger)_labels.count ? _labels[row] : @"";
  label.font = _font;
  label.textColor = _textColor ?: UIColor.labelColor;
  label.textAlignment = NSTextAlignmentCenter;
  label.adjustsFontSizeToFitWidth = YES;
  label.minimumScaleFactor = 0.6;
  return label;
}

- (void)pickerView:(UIPickerView *)pickerView didSelectRow:(NSInteger)row inComponent:(NSInteger)component
{
  if (pickerView != _picker || !_eventEmitter) {
    return;
  }
  std::static_pointer_cast<const WheelPickerNativeViewEventEmitter>(_eventEmitter)
      ->onValueChange(WheelPickerNativeViewEventEmitter::OnValueChange{.index = (int)row});
}

#pragma mark - UIPickerViewAccessibilityDelegate

// VoiceOver lands on the wheel column, not the picker, so the name is given per component.
- (NSString *)pickerView:(UIPickerView *)pickerView accessibilityLabelForComponent:(NSInteger)component
{
  return _accessibilityTitle;
}

@end

Class<RCTComponentViewProtocol> WheelPickerNativeViewCls(void)
{
  return WheelPickerNativeView.class;
}
