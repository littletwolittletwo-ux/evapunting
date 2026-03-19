import { useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

/**
 * Subscribes to Supabase Realtime on the `bets` table,
 * filtered by the current user's ID.
 *
 * Calls `onWin` whenever a new bet is inserted with status = 'won'.
 * Cleans up the subscription on unmount.
 */
export function useRealtimeBets(onWin: (bet: any) => void): void {
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel(`bets:user:${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'bets',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const bet = payload.new;
          if (bet && bet.status === 'won') {
            onWin(bet);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, onWin]);
}
