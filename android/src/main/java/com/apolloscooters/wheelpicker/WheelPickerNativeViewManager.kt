package com.apolloscooters.wheelpicker

import com.facebook.react.bridge.ReadableArray
import com.facebook.react.module.annotations.ReactModule
import com.facebook.react.uimanager.SimpleViewManager
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.UIManagerHelper
import com.facebook.react.uimanager.ViewManagerDelegate
import com.facebook.react.uimanager.annotations.ReactProp
import com.facebook.react.viewmanagers.WheelPickerNativeViewManagerDelegate
import com.facebook.react.viewmanagers.WheelPickerNativeViewManagerInterface

@ReactModule(name = WheelPickerNativeViewManager.NAME)
class WheelPickerNativeViewManager :
  SimpleViewManager<WheelPickerNativeView>(),
  WheelPickerNativeViewManagerInterface<WheelPickerNativeView> {

  private val delegate = WheelPickerNativeViewManagerDelegate(this)

  override fun getDelegate(): ViewManagerDelegate<WheelPickerNativeView> = delegate

  override fun getName() = NAME

  override fun createViewInstance(context: ThemedReactContext): WheelPickerNativeView {
    val view = WheelPickerNativeView(context)
    view.onIndexChange = { index ->
      val surfaceId = UIManagerHelper.getSurfaceId(context)
      UIManagerHelper.getEventDispatcherForReactTag(context, view.id)
        ?.dispatchEvent(ValueChangeEvent(surfaceId, view.id, index))
    }
    return view
  }

  @ReactProp(name = "labels")
  override fun setLabels(view: WheelPickerNativeView, value: ReadableArray?) {
    val labels = ArrayList<String>(value?.size() ?: 0)
    if (value != null) {
      for (i in 0 until value.size()) {
        labels.add(value.getString(i) ?: "")
      }
    }
    view.setLabels(labels)
  }

  @ReactProp(name = "selectedIndex")
  override fun setSelectedIndex(view: WheelPickerNativeView, value: Int) {
    view.setSelectedIndex(value)
  }

  @ReactProp(name = "textColor", customType = "Color")
  override fun setTextColor(view: WheelPickerNativeView, value: Int?) {
    view.setTextColor(value)
  }

  @ReactProp(name = "fontSize")
  override fun setFontSize(view: WheelPickerNativeView, value: Float) {
    view.setFontSize(value)
  }

  @ReactProp(name = "accessibilityTitle")
  override fun setAccessibilityTitle(view: WheelPickerNativeView, value: String?) {
    view.setAccessibilityTitle(value)
  }

  override fun onAfterUpdateTransaction(view: WheelPickerNativeView) {
    super.onAfterUpdateTransaction(view)
    view.commitProps()
  }

  override fun getExportedCustomDirectEventTypeConstants(): MutableMap<String, Any> =
    mutableMapOf(ValueChangeEvent.EVENT_NAME to mutableMapOf("registrationName" to "onValueChange"))

  companion object {
    const val NAME = "WheelPickerNativeView"
  }
}
