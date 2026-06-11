import AsyncStorage from "@react-native-async-storage/async-storage"

import { createPersistedStorageAdapter } from "@pasttime/storage"

export const mobileStorage = createPersistedStorageAdapter(AsyncStorage)
