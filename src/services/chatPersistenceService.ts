import { supabase } from '@/lib/supabaseClient';
import { Message } from '@/types/chat';

// Types for our chat persistence
export interface Conversation {
  id: string;
  user_id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

export interface ChatMessage {
  id: string;
  conversation_id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

/**
 * Create a new conversation for a user
 */
export const createConversation = async (userId: string, title: string = 'New Chat'): Promise<Conversation | null> => {
  try {
    const { data, error } = await supabase
      .from('conversations')
      .insert([
        {
          user_id: userId,
          title: title
        }
      ])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating conversation:', error);
    return null;
  }
};

/**
 * Get all conversations for a user
 */
export const getUserConversations = async (userId: string): Promise<Conversation[]> => {
  try {
    const { data, error } = await supabase
      .from('conversations')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching conversations:', error);
    return [];
  }
};

/**
 * Get messages for a conversation
 */
export const getConversationMessages = async (conversationId: string): Promise<Message[]> => {
  try {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    
    // Convert to our Message type
    return (data || []).map(msg => ({
      id: msg.id,
      role: msg.role as 'user' | 'assistant',
      content: msg.content,
      timestamp: new Date(msg.created_at)
    }));
  } catch (error) {
    console.error('Error fetching messages:', error);
    return [];
  }
};

/**
 * Save a message to a conversation
 */
export const saveMessage = async (
  conversationId: string,
  message: Omit<Message, 'timestamp'> & { timestamp?: Date }
): Promise<ChatMessage | null> => {
  try {
    const { data, error } = await supabase
      .from('messages')
      .insert([
        {
          conversation_id: conversationId,
          role: message.role,
          content: message.content
        }
      ])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error saving message:', error);
    return null;
  }
};

/**
 * Update conversation title
 */
export const updateConversationTitle = async (conversationId: string, title: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('conversations')
      .update({ title })
      .eq('id', conversationId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error updating conversation title:', error);
    return false;
  }
};

/**
 * Delete a conversation and all its messages
 */
export const deleteConversation = async (conversationId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('conversations')
      .delete()
      .eq('id', conversationId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting conversation:', error);
    return false;
  }
};

/**
 * Clear all conversations for a user (delete all chats)
 */
export const clearUserConversations = async (userId: string): Promise<boolean> => {
  try {
    // First, get all conversation IDs for the user
    const { data: conversations, error: fetchError } = await supabase
      .from('conversations')
      .select('id')
      .eq('user_id', userId);

    if (fetchError) throw fetchError;

    // If user has conversations, delete all of them (messages will be deleted due to CASCADE)
    if (conversations && conversations.length > 0) {
      const conversationIds = conversations.map(conv => conv.id);
      
      const { error: deleteError } = await supabase
        .from('conversations')
        .delete()
        .in('id', conversationIds);

      if (deleteError) throw deleteError;
    }

    return true;
  } catch (error) {
    console.error('Error clearing user conversations:', error);
    return false;
  }
};

/**
 * Get or create initial conversation for a user
 */
export const getOrCreateInitialConversation = async (userId: string): Promise<Conversation | null> => {
  try {
    // Try to get the most recent conversation
    const { data: conversations, error: fetchError } = await supabase
      .from('conversations')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false })
      .limit(1);

    if (fetchError) throw fetchError;

    // If user has conversations, return the most recent one
    if (conversations && conversations.length > 0) {
      return conversations[0];
    }

    // If no conversations exist, create a new one
    return await createConversation(userId, 'New Chat');
  } catch (error) {
    console.error('Error getting or creating initial conversation:', error);
    return null;
  }
};

export default {
  createConversation,
  getUserConversations,
  getConversationMessages,
  saveMessage,
  updateConversationTitle,
  deleteConversation,
  clearUserConversations,
  getOrCreateInitialConversation
};