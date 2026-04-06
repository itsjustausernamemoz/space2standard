import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { Bell, ShoppingCart, X, Check } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';

export interface AppNotification {
  id: string;
  type: 'order';
  title: string;
  message: string;
  payload?: any;
  created_at: Date;
  read: boolean;
}

export const NotificationPanel = () => {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if ('Notification' in window && Notification.permission !== 'granted' && Notification.permission !== 'denied') {
      Notification.requestPermission();
    }

    // Use a unique channel name to avoid conflicts on re-mount
    const channelName = `order-notifications-${Date.now()}`;
    
    let channel: ReturnType<typeof supabase.channel> | null = null;

    try {
      channel = supabase.channel(channelName)
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'orders' },
          (payload) => {
            const newOrder = payload.new;
            const notification: AppNotification = {
              id: newOrder.id,
              type: 'order',
              title: 'New Order Received',
              message: `${newOrder.customer_name} has just dispatched an order.`,
              payload: newOrder,
              created_at: new Date(),
              read: false
            };

            // Trigger aggressive visually distinct Toast
            toast.custom((t) => (
              <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-sm w-full bg-navy-900 border-2 border-gold-500 shadow-2xl rounded-xl pointer-events-auto flex ring-1 ring-black ring-opacity-5`}>
                <div className="flex-1 w-0 p-4">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 pt-0.5">
                      <div className="h-10 w-10 bg-gold-500/20 rounded-full flex items-center justify-center border border-gold-500/50">
                         <ShoppingCart className="h-5 w-5 text-gold-500 animate-bounce" />
                      </div>
                    </div>
                    <div className="ml-3 flex-1">
                      <p className="text-[10px] uppercase tracking-widest font-bold text-gold-500">
                        Incoming Order!
                      </p>
                      <p className="mt-1 text-sm font-medium text-white">
                        From {newOrder.customer_name}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex border-l border-navy-800">
                  <button
                    onClick={() => {
                      toast.dismiss(t.id);
                      navigate('/orders');
                    }}
                    className="w-full border border-transparent rounded-none rounded-r-xl p-4 flex items-center justify-center text-[10px] uppercase tracking-widest font-bold text-navy-400 hover:text-white hover:bg-navy-800 transition-colors"
                  >
                    View
                  </button>
                </div>
              </div>
            ), { duration: 6000, position: 'top-center' });

            // Fire native OS notification
            if ('Notification' in window && Notification.permission === 'granted') {
               new Notification('Space2Standard: New Order', {
                  body: `${newOrder.customer_name} has just dispatched an order.`,
                  icon: '/favicon.ico'
               });
            }

            setNotifications(prev => [notification, ...prev]);
          }
        );
      
      channel.subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('Realtime: Listening for new orders.');
        }
      });
    } catch (err) {
      console.warn('Realtime subscription failed (non-fatal):', err);
    }

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [navigate]);

  // Click Outside to close
  useEffect(() => {
     function handleClickOutside(event: MouseEvent) {
       if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
         setIsOpen(false);
       }
     }
     document.addEventListener('mousedown', handleClickOutside);
     return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [panelRef]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllRead = () => {
     setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const handleNotificationClick = (id: string, path: string) => {
     setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
     setIsOpen(false);
     navigate(path);
  };

  return (
    <div className="relative z-50 flex items-center" ref={panelRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2.5 bg-navy-900 border border-navy-800 rounded-xl text-navy-400 hover:text-white hover:bg-navy-800 transition-all focus:outline-none"
      >
        <Bell size={20} className={unreadCount > 0 ? "animate-pulse text-white" : ""} />
        {unreadCount > 0 && (
          <span className="absolute -top-2 -right-2 w-5 h-5 bg-error border-2 border-navy-950 text-white text-[9px] font-bold flex items-center justify-center rounded-full shadow-[0_0_10px_rgba(239,68,68,0.5)]">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute top-14 right-[-10px] md:right-0 mt-2 w-80 md:w-96 bg-navy-900 border border-navy-800 shadow-2xl rounded-2xl overflow-hidden origin-top-right animate-in fade-in zoom-in-95 duration-200">
          <div className="p-4 border-b border-navy-800 flex justify-between items-center bg-navy-950/50">
            <h3 className="text-xs font-bold uppercase tracking-widest text-white">Notifications</h3>
            {unreadCount > 0 && (
              <button onClick={markAllRead} className="text-[9px] font-bold uppercase tracking-widest text-gold-500 hover:text-gold-400 transition-colors flex items-center gap-1">
                <Check size={12} /> Mark Read
              </button>
            )}
          </div>
          
          <div className="max-h-96 overflow-y-auto divide-y divide-navy-800">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-navy-500 flex flex-col items-center gap-3">
                <Bell size={24} className="opacity-20" />
                <p className="text-[10px] font-bold uppercase tracking-widest">No recent alerts</p>
              </div>
            ) : (
              notifications.map((notif) => (
                <div 
                  key={notif.id} 
                  onClick={() => handleNotificationClick(notif.id, '/orders')}
                  className={`p-4 hover:bg-navy-800/50 transition-colors cursor-pointer flex gap-4 ${!notif.read ? 'bg-gold-500/5' : ''}`}
                >
                  <div className={`mt-1 flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${!notif.read ? 'bg-gold-500 text-navy-950 shadow-[0_0_15px_rgba(193,155,58,0.4)]' : 'bg-navy-800 text-navy-400'}`}>
                    <ShoppingCart size={14} />
                  </div>
                  <div className="space-y-1">
                    <p className={`text-sm ${!notif.read ? 'text-white font-bold' : 'text-cream-100/70'}`}>
                      {notif.title}
                    </p>
                    <p className="text-xs text-navy-400 line-clamp-2 leading-relaxed">
                      {notif.message}
                    </p>
                    <p className="text-[9px] font-bold uppercase tracking-widest text-navy-600">
                      {formatDistanceToNow(notif.created_at, { addSuffix: true })}
                    </p>
                  </div>
                  {!notif.read && (
                    <div className="w-2 h-2 rounded-full bg-gold-500 self-center ml-auto flex-shrink-0" />
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
