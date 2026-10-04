package com.apolloscooters.wheelpicker

import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.WritableMap
import com.facebook.react.uimanager.events.Event

class ValueChangeEvent(surfaceId: Int, viewId: Int, private val index: Int) :
  Event<ValueChangeEvent>(surfaceId, viewId) {

  override fun getEventName() = EVENT_NAME

  override fun getEventData(): WritableMap = Arguments.createMap().apply { putInt("index", index) }

  companion object {
    const val EVENT_NAME = "topValueChange"
  }
}
