import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

// Database service functions
export const databaseService = {
  // User operations
  async createUser(userData) {
    const { data, error } = await supabase
      .from('users')
      .insert([userData])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async getUser(userId) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('userId', userId)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  async updateUser(userId, updates) {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('userId', userId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Symptom entry operations
  async createSymptomEntry(entryData) {
    const { data, error } = await supabase
      .from('symptom_entries')
      .insert([entryData])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async getSymptomEntries(userId, limit = 50) {
    const { data, error } = await supabase
      .from('symptom_entries')
      .select('*')
      .eq('userId', userId)
      .order('timestamp', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    return data || [];
  },

  async deleteSymptomEntry(entryId) {
    const { error } = await supabase
      .from('symptom_entries')
      .delete()
      .eq('entryId', entryId);
    
    if (error) throw error;
  },

  // Health recommendation operations
  async createHealthRecommendation(recommendationData) {
    const { data, error } = await supabase
      .from('health_recommendations')
      .insert([recommendationData])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async getHealthRecommendations(userId, limit = 20) {
    const { data, error } = await supabase
      .from('health_recommendations')
      .select('*')
      .eq('userId', userId)
      .order('timestamp', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    return data || [];
  },

  async deleteHealthRecommendation(recommendationId) {
    const { error } = await supabase
      .from('health_recommendations')
      .delete()
      .eq('recommendationId', recommendationId);
    
    if (error) throw error;
  },

  // Pattern analysis operations
  async getSymptomPatterns(userId, days = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    const { data, error } = await supabase
      .from('symptom_entries')
      .select('*')
      .eq('userId', userId)
      .gte('timestamp', startDate.toISOString())
      .order('timestamp', { ascending: true });
    
    if (error) throw error;
    return data || [];
  },

  // Subscription operations
  async updateSubscription(userId, subscriptionData) {
    const { data, error } = await supabase
      .from('users')
      .update({
        subscriptionStatus: subscriptionData.status,
        subscriptionId: subscriptionData.subscriptionId,
        subscriptionEndDate: subscriptionData.endDate
      })
      .eq('userId', userId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
};

// Authentication helpers
export const authService = {
  async signUp(email, password, userData = {}) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData
      }
    });
    
    if (error) throw error;
    return data;
  },

  async signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) throw error;
    return data;
  },

  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  async getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    return user;
  },

  async resetPassword(email) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${import.meta.env.VITE_APP_URL}/reset-password`
    });
    
    if (error) throw error;
  }
};
