import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import 'react-native-url-polyfill/auto';
import * as hidden from '../env';

const supabaseUrl = hidden.supabaseUrl;
const supabaseAnonKey = hidden.supabaseAnonKey;
const supabaseRoleKey = hidden.supabaseRoleKey;

export const supabase = createClient(supabaseUrl, supabaseRoleKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});
