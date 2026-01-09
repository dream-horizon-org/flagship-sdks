package com.flagship.androidsdk

import android.content.Context
import org.json.JSONObject
import java.io.IOException

object ConfigHelper {
    data class Config(
        val baseUrl: String,
        val flagshipApiKey: String
    )

    fun loadConfig(context: Context): Config {
        return try {
            val jsonString = context.assets.open("config.json").bufferedReader().use { it.readText() }
            val jsonObject = JSONObject(jsonString)
            Config(
                baseUrl = jsonObject.getString("baseUrl"),
                flagshipApiKey = jsonObject.getString("flagshipApiKey")
            )
        } catch (e: IOException) {
            // Fallback to default values if config file is not found
            Config(
                baseUrl = "http://10.0.2.2:8080",
                flagshipApiKey = "tenant1"
            )
        }
    }
}

