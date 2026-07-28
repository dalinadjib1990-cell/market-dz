import { collection, addDoc, serverTimestamp, query, orderBy, limit, onSnapshot, where } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';

export type SecurityEventType = 'unauthorized_access' | 'suspicious_activity' | 'input_injection_attempt';

export interface SecurityEvent {
  id?: string;
  userId: string;
  userEmail: string | null;
  type: SecurityEventType;
  description: string;
  path: string;
  userAgent: string;
  timestamp: any;
  ipPlaceholder?: string; // Client-side cannot get real IP easily without external API
}

const COLLECTION_NAME = 'security_events';

export const securityService = {
  async logEvent(type: SecurityEventType, description: string, path: string) {
    const user = auth.currentUser;
    if (!user) return;

    try {
      await addDoc(collection(db, COLLECTION_NAME), {
        userId: user.uid,
        userEmail: user.email,
        type,
        description,
        path,
        userAgent: navigator.userAgent,
        timestamp: serverTimestamp(),
      });
    } catch (error) {
      console.error("Security logging failed:", error);
    }
  },

  subscribeToAlerts(callback: (events: SecurityEvent[]) => void) {
    const q = query(
      collection(db, COLLECTION_NAME),
      orderBy('timestamp', 'desc'),
      limit(20)
    );

    return onSnapshot(q, (snapshot) => {
      const events = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as SecurityEvent));
      callback(events);
    }, (error) => {
      console.error("Security alerts snapshot error:", error);
      if (error.code === 'permission-denied') {
        console.warn("Permission denied for security alerts. User may not have admin privileges yet.");
      }
    });
  }
};
