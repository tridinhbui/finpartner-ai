import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { ChatThread, Message } from '../types';

// Initialize Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder_key';

// Check if Supabase is properly configured
const isSupabaseConfigured = 
  supabaseUrl !== 'https://placeholder.supabase.co' && 
  supabaseAnonKey !== 'placeholder_key' &&
  !supabaseUrl.includes('placeholder') &&
  !supabaseAnonKey.includes('placeholder');

// Create client only if properly configured, otherwise use mock client
let supabase: SupabaseClient;

try {
  if (isSupabaseConfigured) {
    supabase = createClient(supabaseUrl, supabaseAnonKey);
    console.log('✅ Supabase connected');
  } else {
    console.warn('⚠️ Supabase not configured - using localStorage only');
    // Create a mock client that won't crash
    supabase = createClient('https://mock.supabase.co', 'mock_key');
  }
} catch (error) {
  console.error('❌ Supabase initialization failed:', error);
  supabase = createClient('https://mock.supabase.co', 'mock_key');
}

export { supabase };

// Database Service
class SupabaseService {
  
  // ==================== CHAT THREADS ====================
  
  async saveThread(thread: ChatThread, userId: string): Promise<void> {
    if (!isSupabaseConfigured) {
      console.log('💾 Supabase not configured - skipping cloud save');
      return;
    }
    
    try {
      const { error } = await supabase
        .from('chat_threads')
        .upsert({
          id: thread.id,
          user_id: userId,
          title: thread.title,
          created_at: thread.createdAt.toISOString(),
          updated_at: thread.updatedAt.toISOString(),
          workspace_state: thread.workspace,
          highlighted_numbers: thread.highlightedNumbers || []
        });

      if (error) throw error;
      console.log('✅ Thread saved:', thread.id);
    } catch (error) {
      console.error('Error saving thread:', error);
    }
  }

  async loadThreads(userId: string): Promise<ChatThread[]> {
    if (!isSupabaseConfigured) {
      console.log('💾 Supabase not configured - returning empty array');
      return [];
    }
    
    try {
      const { data, error } = await supabase
        .from('chat_threads')
        .select('*')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false });

      if (error) throw error;

      if (!data) return [];

      // Convert to ChatThread format
      const threads: ChatThread[] = await Promise.all(
        data.map(async (row) => {
          // Load messages for this thread
          const messages = await this.loadMessages(row.id);
          
          return {
            id: row.id,
            title: row.title,
            messages: messages,
            createdAt: new Date(row.created_at),
            updatedAt: new Date(row.updated_at),
            workspace: row.workspace_state,
            highlightedNumbers: row.highlighted_numbers || []
          };
        })
      );

      console.log('✅ Loaded', threads.length, 'threads');
      return threads;
    } catch (error) {
      console.error('Error loading threads:', error);
      return [];
    }
  }

  async deleteThread(threadId: string): Promise<void> {
    try {
      // Delete messages first (cascade should handle this but being explicit)
      await supabase
        .from('messages')
        .delete()
        .eq('thread_id', threadId);

      // Delete thread
      const { error } = await supabase
        .from('chat_threads')
        .delete()
        .eq('id', threadId);

      if (error) throw error;
      console.log('✅ Thread deleted:', threadId);
    } catch (error) {
      console.error('Error deleting thread:', error);
    }
  }

  // ==================== MESSAGES ====================

  async saveMessage(message: Message, threadId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          id: message.id,
          thread_id: threadId,
          role: message.role,
          content: message.text,
          timestamp: message.timestamp.toISOString(),
          related_chart: message.relatedChart || null,
          related_table: message.relatedTable || null,
          is_error: message.isError || false
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error saving message:', error);
    }
  }

  async loadMessages(threadId: string): Promise<Message[]> {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('thread_id', threadId)
        .order('timestamp', { ascending: true });

      if (error) throw error;
      if (!data) return [];

      const messages: Message[] = data.map((row) => ({
        id: row.id,
        role: row.role,
        text: row.content,
        timestamp: new Date(row.timestamp),
        relatedChart: row.related_chart,
        relatedTable: row.related_table,
        isError: row.is_error
      }));

      return messages;
    } catch (error) {
      console.error('Error loading messages:', error);
      return [];
    }
  }

  // ==================== FILE STORAGE ====================

  async uploadDocument(
    file: File, 
    threadId: string,
    userId: string
  ): Promise<string | null> {
    try {
      const fileName = `${userId}/${threadId}/${Date.now()}_${file.name}`;
      
      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('documents')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) throw error;

      // Save document metadata
      await supabase
        .from('documents')
        .insert({
          thread_id: threadId,
          file_name: file.name,
          file_type: file.type,
          file_size: file.size,
          storage_path: data.path,
          uploaded_at: new Date().toISOString()
        });

      console.log('✅ Document uploaded:', file.name);
      return data.path;
    } catch (error) {
      console.error('Error uploading document:', error);
      return null;
    }
  }

  async getDocumentUrl(storagePath: string): Promise<string | null> {
    try {
      const { data } = supabase.storage
        .from('documents')
        .getPublicUrl(storagePath);

      return data.publicUrl;
    } catch (error) {
      console.error('Error getting document URL:', error);
      return null;
    }
  }

  async listDocuments(threadId: string): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('thread_id', threadId)
        .order('uploaded_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error listing documents:', error);
      return [];
    }
  }

  // ==================== SYNC METHODS ====================

  async syncThreadToCloud(thread: ChatThread, userId: string): Promise<void> {
    try {
      // Save thread
      await this.saveThread(thread, userId);

      // Save all messages
      for (const message of thread.messages) {
        await this.saveMessage(message, thread.id);
      }

      console.log('✅ Thread synced to cloud:', thread.id);
    } catch (error) {
      console.error('Error syncing thread:', error);
    }
  }

  async clearLocalStorage(): Promise<void> {
    localStorage.removeItem('finpartner_threads');
    localStorage.removeItem('finpartner_user');
    console.log('✅ Local storage cleared');
  }
}

export const supabaseService = new SupabaseService();

