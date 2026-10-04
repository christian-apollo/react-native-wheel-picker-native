package com.apolloscooters.wheelpicker

import android.content.Context
import android.os.Build
import android.util.TypedValue
import android.view.ViewGroup
import android.widget.FrameLayout
import android.widget.NumberPicker

/**
 * The platform wheel (NumberPicker), held to the same rules as the iOS view:
 * - each wheel's rows are set once; when the rows, colour or font size change, the wheel is
 *   replaced by a fresh one instead of being changed under a finger,
 * - the selection is only moved from code while the wheel is at rest,
 * - a value is reported when the wheel comes to rest, not on every row it passes.
 */
class WheelPickerNativeView(context: Context) : FrameLayout(context) {
  var onIndexChange: ((Int) -> Unit)? = null

  private var picker: NumberPicker? = null
  private var labels: List<String> = emptyList()
  private var textColor: Int? = null
  private var fontSize = 0f
  private var desiredIndex = 0
  private var accessibilityTitle: String? = null
  private var needsRebuild = true
  private var scrollState = NumberPicker.OnScrollListener.SCROLL_STATE_IDLE
  private var lastReportedIndex = -1

  fun setLabels(value: List<String>) {
    if (value != labels) {
      labels = value
      needsRebuild = true
    }
  }

  fun setTextColor(value: Int?) {
    if (value != textColor) {
      textColor = value
      needsRebuild = true
    }
  }

  fun setFontSize(value: Float) {
    if (value != fontSize) {
      fontSize = value
      needsRebuild = true
    }
  }

  fun setSelectedIndex(value: Int) {
    desiredIndex = value
  }

  fun setAccessibilityTitle(value: String?) {
    accessibilityTitle = value
    picker?.contentDescription = value
  }

  /** Called once per React update, after every prop of that update has been set. */
  fun commitProps() {
    if (needsRebuild) {
      rebuild()
    } else {
      applyDesiredSelectionIfIdle()
    }
  }

  private fun clamped(index: Int) = index.coerceIn(0, (labels.size - 1).coerceAtLeast(0))

  private fun rebuild() {
    needsRebuild = false
    picker?.let {
      it.setOnScrollListener(null)
      it.setOnValueChangedListener(null)
      removeView(it)
    }
    scrollState = NumberPicker.OnScrollListener.SCROLL_STATE_IDLE

    val wheel = NumberPicker(context)
    wheel.descendantFocusability = ViewGroup.FOCUS_BLOCK_DESCENDANTS
    wheel.wrapSelectorWheel = false
    wheel.minValue = 0
    wheel.maxValue = (labels.size - 1).coerceAtLeast(0)
    wheel.displayedValues = if (labels.isEmpty()) arrayOf("") else labels.toTypedArray()
    wheel.contentDescription = accessibilityTitle
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
      textColor?.let { wheel.textColor = it }
      if (fontSize > 0) {
        wheel.textSize = TypedValue.applyDimension(TypedValue.COMPLEX_UNIT_SP, fontSize, resources.displayMetrics)
      }
    }
    wheel.value = clamped(desiredIndex)
    lastReportedIndex = wheel.value
    wheel.setOnScrollListener { view, state ->
      scrollState = state
      if (state == NumberPicker.OnScrollListener.SCROLL_STATE_IDLE) {
        report(view.value)
      }
    }
    wheel.setOnValueChangedListener { view, _, _ ->
      // A tap on the row above or below moves the wheel without a scroll gesture.
      if (scrollState == NumberPicker.OnScrollListener.SCROLL_STATE_IDLE) {
        report(view.value)
      }
    }
    picker = wheel
    addView(wheel, LayoutParams(LayoutParams.MATCH_PARENT, LayoutParams.MATCH_PARENT))
  }

  private fun report(index: Int) {
    if (labels.isEmpty() || index == lastReportedIndex) {
      return
    }
    lastReportedIndex = index
    onIndexChange?.invoke(index)
  }

  private fun applyDesiredSelectionIfIdle() {
    val wheel = picker ?: return
    if (labels.isEmpty() || scrollState != NumberPicker.OnScrollListener.SCROLL_STATE_IDLE) {
      return
    }
    val index = clamped(desiredIndex)
    if (wheel.value != index) {
      wheel.value = index
      lastReportedIndex = index
    }
  }

  // React Native lays out its own children only; native children need an explicit pass.
  private val measureAndLayout = Runnable {
    measure(
      MeasureSpec.makeMeasureSpec(width, MeasureSpec.EXACTLY),
      MeasureSpec.makeMeasureSpec(height, MeasureSpec.EXACTLY)
    )
    layout(left, top, right, bottom)
  }

  override fun requestLayout() {
    super.requestLayout()
    post(measureAndLayout)
  }
}
