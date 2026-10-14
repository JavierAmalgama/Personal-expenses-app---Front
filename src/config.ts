import { Platform } from 'react-native';

// The Android emulator reaches the host machine at 10.0.2.2, not localhost.
// On a physical device set EXPO_PUBLIC_API_URL to your computer's LAN IP.
const defaultApiUrl = Platform.OS === 'android' ? 'http://10.0.2.2:3000' : 'http://localhost:3000';

export const API_URL = process.env.EXPO_PUBLIC_API_URL || defaultApiUrl;

// Until the API has a login endpoint, authenticated calls use the token created by `db:seed`.
export const API_TOKEN = process.env.EXPO_PUBLIC_API_TOKEN || null;
