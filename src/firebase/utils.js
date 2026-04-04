import { db } from './config';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

/**
 * Logs a user activity event to Firestore.
 */
export const logActivity = async (user, activityType, details = {}) => {
    try {
        const logEntry = {
            userId: user?.uid || 'guest',
            userEmail: user?.email || 'Guest',
            activityType,
            details,
            timestamp: serverTimestamp(),
            platform: details.platform || 'Kone Code'
        };
        
        await addDoc(collection(db, 'activity_logs'), logEntry);
    } catch (err) {
        console.warn("Activity logging failed:", err);
    }
};
