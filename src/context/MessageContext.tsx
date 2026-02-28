import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNotifications } from './NotificationContext';
import * as api from '../services/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

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
    totalUnreadCount: number;
}

const MessageContext = createContext<MessageContextType | undefined>(undefined);

export const MessageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { addNotification } = useNotifications();
    const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
    const queryClient = useQueryClient();

    // 1. Fetch Conversations
    const { data: conversations = [], refetch: refreshConversations } = useQuery({
        queryKey: ['conversations'],
        queryFn: async () => {
            const data = await api.getConversations();
            return data.map((conv: any) => ({
                id: conv.id.toString(),
                participantName: conv.participant_name,
                participantAvatar: conv.participant_avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=User', // Fallback
                participantRole: 'student',
                lastMessage: conv.last_message,
                lastMessageTime: conv.last_message_time,
                unreadCount: conv.unread_count,
                messages: []
            })) as Conversation[];
        },
        refetchInterval: 30000,
    });

    // 2. Fetch Messages for active conversation
    const { data: messages = [] } = useQuery({
        queryKey: ['messages', activeConversationId],
        queryFn: async () => {
            if (!activeConversationId) return [];
            const data = await api.getMessages(activeConversationId);
            return data.map((msg: any) => ({
                id: msg.id.toString(),
                senderId: msg.sender.toString(),
                senderName: msg.sender_name,
                senderAvatar: msg.sender_avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=User',
                text: msg.content,
                timestamp: new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                isMe: msg.is_me
            })) as Message[];
        },
        enabled: !!activeConversationId,
        refetchInterval: 5000,
    });

    // 3. Mark as Read Mutation
    const markAsReadMutation = useMutation({
        mutationFn: async (conversationId: string) => {
            await api.markMessagesRead(conversationId);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['conversations'] });
        }
    });

    useEffect(() => {
        if (activeConversationId) {
            markAsReadMutation.mutate(activeConversationId);
        }
    }, [activeConversationId, messages.length]);

    // 4. Send Message Mutation
    const sendMessageMutation = useMutation({
        mutationFn: async ({ conversationId, text }: { conversationId: string, text: string }) => {
            return await api.sendMessage(conversationId, text);
        },
        onMutate: async ({ conversationId, text }) => {
            await queryClient.cancelQueries({ queryKey: ['messages', conversationId] });
            const previousMessages = queryClient.getQueryData<Message[]>(['messages', conversationId]);

            const optimisticMsg: Message = {
                id: Date.now().toString(),
                senderId: 'temp',
                senderName: 'Me',
                senderAvatar: '',
                text: text,
                timestamp: 'Just now',
                isMe: true
            };

            queryClient.setQueryData<Message[]>(['messages', conversationId], old => old ? [...old, optimisticMsg] : [optimisticMsg]);
            return { previousMessages };
        },
        onError: (err, variables, context) => {
            if (context?.previousMessages) {
                queryClient.setQueryData(['messages', variables.conversationId], context.previousMessages);
            }
            console.error("Failed to send message", err);
            addNotification({
                type: 'system',
                title: 'Error',
                description: 'Failed to send message. Please try again.',
            });
        },
        onSettled: (_data: any, _error: any, variables: any) => {
            queryClient.invalidateQueries({ queryKey: ['messages', variables.conversationId] });
            queryClient.invalidateQueries({ queryKey: ['conversations'] });
        }
    });

    const sendMessage = (text: string) => {
        if (!activeConversationId || !text.trim()) return;
        sendMessageMutation.mutate({ conversationId: activeConversationId, text });
    };

    const markAsRead = (conversationId: string) => {
        markAsReadMutation.mutate(conversationId);
    };

    const createConversationMutation = useMutation({
        mutationFn: async (userId: string) => {
            const data = await api.createConversation(undefined, userId);
            return data.id.toString();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['conversations'] });
        }
    });

    const createConversation = async (userId: string): Promise<string | null> => {
        try {
            return await createConversationMutation.mutateAsync(userId);
        } catch (error) {
            console.error("Failed to create conversation", error);
            return null;
        }
    };

    const totalUnreadCount = conversations.reduce((acc, conv) => acc + (conv.unreadCount || 0), 0);

    const conversationsWithActiveMessages = conversations.map(conv => {
        if (conv.id === activeConversationId) {
            return { ...conv, messages };
        }
        return conv;
    });

    return (
        <MessageContext.Provider value={{
            conversations: conversationsWithActiveMessages,
            activeConversationId,
            setActiveConversationId,
            sendMessage,
            markAsRead,
            createConversation,
            refreshConversations: () => refreshConversations(),
            totalUnreadCount
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
