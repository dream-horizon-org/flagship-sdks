package com.flagshiprnsdk

import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReadableMap
import com.flagshiprnsdk.config.FlagshipConfigManager
import com.flagshiprnsdk.context.FlagshipContextManager
import com.flagshiprnsdk.evaluation.FlagshipEvaluationManager
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.launch

class FlagshipRnSdkModuleImpl(
  private val reactContext: ReactApplicationContext,
) {
  private val backgroundScope = CoroutineScope(Dispatchers.IO + SupervisorJob())

  fun multiply(
    a: Double,
    b: Double,
  ): Double = a * b

  fun initializeAsync(
    config: ReadableMap,
    promise: Promise?,
  ) {
    backgroundScope.launch {
      try {
        FlagshipConfigManager.initializeAsync(reactContext, config)
        promise?.resolve(true)
      } catch (e: Exception) {
        promise?.reject("INIT_ERROR", e.message ?: "Initialization failed", e)
      }
    }
  }

  fun initializeSync(config: ReadableMap): Boolean {
    return try {
      FlagshipConfigManager.initialize(reactContext, config)
      true
    } catch (e: Exception) {
      false
    }
  }

  fun setContext(context: ReadableMap): Boolean = try {
    FlagshipContextManager.setContext(context)
    true
  } catch (e: Exception) {
    println("FlagshipRnSdk: setContext failed: ${e.message}")
    false
  }

  fun getBooleanValue(
    key: String?,
    defaultValue: Boolean,
  ): Boolean {
    return FlagshipEvaluationManager.getBooleanValue(key, defaultValue)
  }

  fun getStringValue(
    key: String?,
    defaultValue: String?,
  ): String {
    return FlagshipEvaluationManager.getStringValue(key, defaultValue)
  }

  fun getIntegerValue(
    key: String?,
    defaultValue: Double,
  ): Double {
    return FlagshipEvaluationManager.getIntegerValue(key, defaultValue).toDouble()
  }

  fun getDoubleValue(
    key: String?,
    defaultValue: Double,
  ): Double {
    return FlagshipEvaluationManager.getDoubleValue(key, defaultValue)
  }

  fun getObjectValue(
    key: String?,
    defaultValue: ReadableMap?,
  ): Any? {
    return FlagshipEvaluationManager.getObjectValue(key, defaultValue)
  }

  companion object {
    const val NAME = "FlagshipRnSdk"
  }
}

