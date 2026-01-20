import Foundation
import CoreData

public class CoreDataUtility {
    
    private var persistentContainer: NSPersistentContainer
    private static let currentModelVersion = 2
    private static let modelVersionKey = "flagship_coredata_model_version"
    
    public static let shared = CoreDataUtility()
    
    private init() {
        let storedVersion = Self.getStoredModelVersion()
        
        if Self.shouldDropAndReload() {
            Self.deleteDatabaseFiles()
        }
        
        let model = Self.createModel()
        persistentContainer = NSPersistentContainer(name: "FeatureFlagDataModel", managedObjectModel: model)
        
        persistentContainer.loadPersistentStores { storeDescription, error in
            if let error = error {
                print("CoreData: Initialization failed - \(error.localizedDescription)")
            } else {
                self.storeModelVersion(Self.currentModelVersion)
            }
        }
        
        persistentContainer.viewContext.automaticallyMergesChangesFromParent = true
    }
    
    private static func createModel() -> NSManagedObjectModel {
        let model = NSManagedObjectModel()
        
        let entity = NSEntityDescription()
        entity.name = "FeatureFlagEntity"
        entity.managedObjectClassName = "FeatureFlagEntity"
        
        let keyAttribute = NSAttributeDescription()
        keyAttribute.name = "key"
        keyAttribute.attributeType = .stringAttributeType
        keyAttribute.isOptional = false
        
        let jsonDataAttribute = NSAttributeDescription()
        jsonDataAttribute.name = "jsonData"
        jsonDataAttribute.attributeType = .binaryDataAttributeType
        jsonDataAttribute.isOptional = false
        
        let createdAtAttribute = NSAttributeDescription()
        createdAtAttribute.name = "createdAt"
        createdAtAttribute.attributeType = .dateAttributeType
        createdAtAttribute.isOptional = false
        
        let updatedAtAttribute = NSAttributeDescription()
        updatedAtAttribute.name = "updatedAt"
        updatedAtAttribute.attributeType = .dateAttributeType
        updatedAtAttribute.isOptional = false
        
        entity.properties = [keyAttribute, jsonDataAttribute, createdAtAttribute, updatedAtAttribute]
        model.entities = [entity]
        
        return model
    }
    
    private static func shouldDropAndReload() -> Bool {
        let storedVersion = getStoredModelVersion()
        
        if storedVersion == nil {
            return checkDatabaseExists()
        }
        
        if storedVersion != currentModelVersion {
            return true
        }
        
        return false
    }
    
    private static func checkDatabaseExists() -> Bool {
        let fileManager = FileManager.default
        let storeName = "FeatureFlagDataModel"
        
        let urls = fileManager.urls(for: .applicationSupportDirectory, in: .userDomainMask)
        guard let applicationSupportURL = urls.first else { return false }
        
        let storeURL = applicationSupportURL.appendingPathComponent("\(storeName).sqlite")
        return fileManager.fileExists(atPath: storeURL.path)
    }
    
    private static func getStoredModelVersion() -> Int? {
        return UserDefaults.standard.object(forKey: modelVersionKey) as? Int
    }
    
    private func storeModelVersion(_ version: Int) {
        UserDefaults.standard.set(version, forKey: Self.modelVersionKey)
        UserDefaults.standard.synchronize()
    }
    
    private static func deleteDatabaseFiles() {
        let fileManager = FileManager.default
        let storeName = "FeatureFlagDataModel"
        
        let urls = fileManager.urls(for: .applicationSupportDirectory, in: .userDomainMask)
        guard let applicationSupportURL = urls.first else {
            return
        }
        
        let storeURL = applicationSupportURL.appendingPathComponent("\(storeName).sqlite")
        let walURL = applicationSupportURL.appendingPathComponent("\(storeName).sqlite-wal")
        let shmURL = applicationSupportURL.appendingPathComponent("\(storeName).sqlite-shm")
        
        if fileManager.fileExists(atPath: storeURL.path) {
            try? fileManager.removeItem(at: storeURL)
        }
        
        if fileManager.fileExists(atPath: walURL.path) {
            try? fileManager.removeItem(at: walURL)
        }
        
        if fileManager.fileExists(atPath: shmURL.path) {
            try? fileManager.removeItem(at: shmURL)
        }
    }
    
    public var context: NSManagedObjectContext {
        return persistentContainer.viewContext
    }
    
    public func saveContext() {
        let context = persistentContainer.viewContext
        
        guard context.persistentStoreCoordinator != nil else {
            print("CoreData: Persistent store coordinator is nil, skipping save")
            return
        }
        
        if context.hasChanges {
            do {
                try context.save()
            } catch {
                print("CoreData: Save error - \(error.localizedDescription)")
                context.rollback()
            }
        }
    }
    
    public func clearAllData() {
        let context = persistentContainer.viewContext
        
        guard context.persistentStoreCoordinator != nil else {
            print("CoreData: Persistent store coordinator is nil, skipping clear")
            return
        }
        
        let fetchRequest: NSFetchRequest<NSFetchRequestResult> = FeatureFlagEntity.fetchRequest()
        let deleteRequest = NSBatchDeleteRequest(fetchRequest: fetchRequest)
        
        do {
            try context.execute(deleteRequest)
            saveContext()
        } catch {
            print("CoreData: Clear error - \(error.localizedDescription)")
            context.rollback()
        }
    }
    
    public func fetchEntity(for key: String) -> FeatureFlagEntity? {
        let context = persistentContainer.viewContext
        
        guard context.persistentStoreCoordinator != nil else {
            print("CoreData: Persistent store coordinator is nil, skipping fetch for key: \(key)")
            return nil
        }
        
        let fetchRequest: NSFetchRequest<FeatureFlagEntity> = FeatureFlagEntity.fetchRequest()
        fetchRequest.predicate = NSPredicate(format: "key == %@", key)
        fetchRequest.fetchLimit = 1
        
        do {
            let results = try context.fetch(fetchRequest)
            return results.first
        } catch {
            print("CoreData: Fetch error for key '\(key)' - \(error.localizedDescription)")
            return nil
        }
    }
    
    public func createOrUpdateEntity(for key: String, jsonData: Data) -> FeatureFlagEntity? {
        let context = persistentContainer.viewContext
        
        guard context.persistentStoreCoordinator != nil else {
            print("CoreData: Persistent store coordinator is nil, skipping entity creation for key: \(key)")
            return nil
        }
        
        guard !key.isEmpty, !jsonData.isEmpty else {
            print("CoreData: Invalid key or empty data, skipping entity creation for key: \(key)")
            return nil
        }
        
        if let existingEntity = fetchEntity(for: key) {
            existingEntity.jsonData = jsonData
            existingEntity.updatedAt = Date()
            return existingEntity
        } else {
            let entity = FeatureFlagEntity(context: context)
            entity.key = key
            entity.jsonData = jsonData
            entity.createdAt = Date()
            entity.updatedAt = Date()
            return entity
        }
    }
}
