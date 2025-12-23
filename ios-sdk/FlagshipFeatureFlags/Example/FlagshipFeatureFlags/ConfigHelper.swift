//
//  ConfigHelper.swift
//  FlagshipFeatureFlags
//
//  Created on 2025.
//

import Foundation

struct ConfigHelper {
    struct Config: Codable {
        let baseUrl: String
        let flagshipApiKey: String
    }
    
    static func loadConfig() -> Config {
        guard let url = Bundle.main.url(forResource: "config", withExtension: "json"),
              let data = try? Data(contentsOf: url),
              let config = try? JSONDecoder().decode(Config.self, from: data) else {
            // Fallback to default values if config file is not found
            return Config(
                baseUrl: "https://dream11.flagshiphq.io",
                flagshipApiKey: "XPCkqeT39sOH5WIUUvljJ11QhRjw6QeE"
            )
        }
        return config
    }
}

