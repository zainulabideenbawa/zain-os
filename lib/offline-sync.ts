'use client';

import { get, set, del } from 'idb-keyval';

export interface PendingAction {
  id: string;
  action: 'toggleHabit' | 'toggleBadDay' | 'parkIdea';
  payload: Record<string, unknown>;
  createdAt: number;
}

const QUEUE_KEY = 'zain_os_offline_queue';

export async function getPendingActions(): Promise<PendingAction[]> {
  try {
    const queue = await get<PendingAction[]>(QUEUE_KEY);
    return queue || [];
  } catch {
    return [];
  }
}

export async function enqueueOfflineAction(action: Omit<PendingAction, 'id' | 'createdAt'>): Promise<void> {
  try {
    const queue = await getPendingActions();
    const item: PendingAction = {
      ...action,
      id: `${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      createdAt: Date.now(),
    };
    queue.push(item);
    await set(QUEUE_KEY, queue);
  } catch (err) {
    console.warn('[OfflineQueue] Failed to enqueue action:', err);
  }
}

export async function clearPendingActions(): Promise<void> {
  try {
    await del(QUEUE_KEY);
  } catch (err) {
    console.warn('[OfflineQueue] Failed to clear queue:', err);
  }
}
