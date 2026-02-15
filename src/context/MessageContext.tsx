import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNotifications } from './NotificationContext';
import * as api from '../services/api';

export interface Message {
    id: string;
    senderId: string;
    senderName: string;
    senderAvatar: string;
    text: string;
    timestamp: string;
    isMe: boolean;
}

export interface Conversation {
    id: string;
    participantName: string;
    participantAvatar: string;
    participantRole: 'teacher' | 'student';
    lastMessage: string;
    lastMessageTime: string;
    unreadCount: number;
    messages: Message[];
}

interface MessageContextType {
    conversations: Conversation[];
    activeConversationId: string | null;
    setActiveConversationId: (id: string | null) => void;
    sendMessage: (text: string) => void;
    markAsRead: (conversationId: string) => void;
    createConversation: (userId: string) => Promise<string | null>;
    refreshConversations: () => void;
}

const MessageContext = createContext<MessageContextType | undefined>(undefined);

export const MessageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { addNotification } = useNotifications();
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [activeConversationId, setActiveConversationId] = useState<string | null>(null);

    const fetchConversations = async () => {
        try {
            const data = await api.getConversations();
            // Map API response to frontend interface
            const mappedConversations: Conversation[] = data.map((conv: any) => ({
                id: conv.id.toString(),
                participantName: conv.participant_name,
                participantAvatar: conv.participant_avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=User', // Fallback
                participantRole: 'student', // Default/Placeholder as API doesn't return this yet
                lastMessage: conv.last_message,
                lastMessageTime: conv.last_message_time,
                unreadCount: conv.unread_count,
                messages: [] // Initial empty messages
            }));
            setConversations(mappedConversations);
        } catch (error) {
            console.error("Failed to fetch conversations", error);
        }
    };

    const fetchMessages = async (conversationId: string) => {
        try {
            const data = await api.getMessages(conversationId);
            const mappedMessages: Message[] = data.map((msg: any) => ({
                id: msg.id.toString(),
                senderId: msg.sender.toString(),
                senderName: msg.sender_name,
                senderAvatar: msg.sender_avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=User',
                text: msg.content,
                timestamp: new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                isMe: msg.is_me
            }));

            setConversations(prev => prev.map(conv => {
                if (conv.id === conversationId) {
                    return { ...conv, messages: mappedMessages };
                }
                return conv;
            }));
        } catch (error) {
            console.error("Failed to fetch messages", error);
        }
    };

    useEffect(() => {
        fetchConversations();
        // Poll for new messages every 30 seconds
        const interval = setInterval(fetchConversations, 30000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (activeConversationId) {
            fetchMessages(activeConversationId);
            // Mark as read when opening
            markAsRead(activeConversationId);
        }
    }, [activeConversationId]);

    const sendMessage = async (text: string) => {
        if (!activeConversationId || !text.trim()) return;

        try {
            const apiMsg = await api.sendMessage(activeConversationId, text);
            const newMessage: Message = {
                id: apiMsg.id.toString(),
                senderId: apiMsg.sender.toString(),
                senderName: apiMsg.sender_name,
                senderAvatar: apiMsg.sender_avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=User',
                text: apiMsg.content,
                timestamp: new Date(apiMsg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                isMe: true
            };

            setConversations(prev => prev.map(conv => {
                if (conv.id === activeConversationId) {
                    return {
                        ...conv,
                        lastMessage: text.trim(),
                        lastMessageTime: 'Just now',
                        messages: [...conv.messages, newMessage]
                    };
                }
                return conv;
            }));
        } catch (error) {
            console.error("Failed to send message", error);
            addNotification({
                type: 'system',
                title: 'Error',
                description: 'Failed to send message. Please try again.',
            });
        }
    };

    const markAsRead = async (conversationId: string) => {
        try {
            await api.markMessagesRead(conversationId);
            setConversations(prev => prev.map(conv =>
                conv.id === conversationId ? { ...conv, unreadCount: 0 } : conv
            ));
        } catch (error) {
            console.error("Failed to mark messages as read", error);
        }
    };

    const createConversation = async (userId: string): Promise<string | null> => {
        try {
            const data = await api.createConversation(undefined, userId);
            const newConvId = data.id.toString();
            await fetchConversations(); // Refresh list to include new conversation
            return newConvId;
        } catch (error) {
            console.error("Failed to create conversation", error);
            return null;
        }
    }

    return (
        <MessageContext.Provider value={{
            conversations,
            activeConversationId,
            setActiveConversationId,
            sendMessage,
            markAsRead,
            createConversation,
            refreshConversations: fetchConversations
        }}>
            {children}
        </MessageContext.Provider>
    );
};

export const useMessages = () => {
    const context = useContext(MessageContext);
    if (context === undefined) {
        throw new Error('useMessages must be used within a MessageProvider');
    }
    return context;
};
