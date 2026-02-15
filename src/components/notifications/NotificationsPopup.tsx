import {
    X, CheckCheck, Trash2, BellRing, Sparkles, BookOpen, GraduationCap, MessageSquare, FileText
} from 'lucide-react';
import type { Notification } from '../../context/NotificationContext';
import { useNotifications } from '../../context/NotificationContext';
import { useNavigate } from 'react-router-dom';

interface NotificationsPopupProps {
    onClose: () => void;
}

export const NotificationsPopup = ({ onClose }: NotificationsPopupProps) => {
    const { notifications, markAsRead, markAllAsRead, clearAll } = useNotifications();
    const navigate = useNavigate();

    const getIcon = (type: string) => {
        switch (type) {
            case 'message': return <MessageSquare className="w-4 h-4 text-blue-400" />;
            case 'achievement': return <Sparkles className="w-4 h-4 text-yellow-500" />;
            case 'course': return <BookOpen className="w-4 h-4 text-purple-400" />;
            case 'grade': return <GraduationCap className="w-4 h-4 text-green-400" />;
            case 'system': return <BellRing className="w-4 h-4 text-red-400" />;
            default: return <FileText className="w-4 h-4 text-gray-400" />;
        }
    };

    const getBgColor = (type: string) => {
        switch (type) {
            case 'message': return 'bg-blue-500/10';
            case 'achievement': return 'bg-yellow-500/10';
            case 'course': return 'bg-purple-500/10';
            case 'grade': return 'bg-green-500/10';
            case 'system': return 'bg-red-500/10';
            default: return 'bg-gray-500/10';
        }
    };

    const handleNotificationClick = (notif: Notification) => {
        markAsRead(notif.id);
        if (notif.link) {
            navigate(notif.link);
            onClose();
        }
    };

    return (
        <div className="absolute top-full right-0 mt-2 w-[400px] bg-[#0B0F1A] border border-gray-800 rounded-2xl shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
            <header className="p-5 border-b border-gray-800 flex items-center justify-between bg-[#0B0F1A]/80 backdrop-blur-xl">
                <div>
                    <h3 className="font-black text-white uppercase tracking-tighter text-sm">Activity Feed</h3>
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-0.5">Stay updated with your progress</p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={clearAll}
                        className="p-2 text-gray-500 hover:text-red-400 bg-white/5 rounded-lg transition-all"
                        title="Clear all"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-white bg-white/5 rounded-lg transition-all"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            </header>

            <div className="max-h-[450px] overflow-y-auto custom-scrollbar">
                {notifications.length > 0 ? (
                    notifications.map((notif) => (
                        <div
                            key={notif.id}
                            onClick={() => handleNotificationClick(notif)}
                            className={`flex gap-4 p-5 transition-all cursor-pointer relative group border-b border-gray-800/50 last:border-0 ${notif.isRead ? 'opacity-60 grayscale-[0.5]' : 'hover:bg-blue-600/5 bg-blue-600/[0.02]'}`}
                        >
                            <div className={`mt-1 w-10 h-10 rounded-xl ${getBgColor(notif.type)} flex items-center justify-center flex-shrink-0 border border-white/5`}>
                                {getIcon(notif.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start gap-2 mb-1">
                                    <h4 className={`text-sm font-bold truncate ${notif.isRead ? 'text-gray-400' : 'text-white'}`}>{notif.title}</h4>
                                    {!notif.isRead && <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5 shadow-[0_0_8px_rgba(59,130,246,0.5)]"></div>}
                                </div>
                                <p className="text-gray-400 text-xs mb-2 leading-relaxed line-clamp-2 font-medium">{notif.description}</p>
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-600 text-[10px] font-black uppercase tracking-tighter">{notif.timestamp}</span>
                                    {!notif.isRead && (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                markAsRead(notif.id);
                                            }}
                                            className="text-[10px] font-black text-blue-500 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            Mark read
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="p-12 text-center space-y-4">
                        <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                            <BellRing className="w-8 h-8 text-gray-700" />
                        </div>
                        <h4 className="text-sm font-bold text-gray-400">All caught up!</h4>
                        <p className="text-xs text-gray-600 max-w-[200px] mx-auto">When you have new updates, they'll show up here.</p>
                    </div>
                )}
            </div>

            {notifications.length > 0 && (
                <footer className="p-4 border-t border-gray-800 bg-[#0B0F1A] flex items-center justify-between">
                    <button
                        onClick={markAllAsRead}
                        className="flex items-center gap-2 text-gray-500 hover:text-blue-400 text-[10px] font-black uppercase tracking-widest transition-colors"
                    >
                        <CheckCheck className="w-3.5 h-3.5" />
                        Mark all as read
                    </button>
                    <button className="text-blue-500 hover:text-blue-400 text-[10px] font-black uppercase tracking-widest transition-colors">
                        View All Activity
                    </button>
                </footer>
            )}
        </div>
    );
};
