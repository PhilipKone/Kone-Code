import React, { createContext, useContext, useEffect, useState, useCallback, useRef, ReactNode } from 'react';
import {
    onAuthStateChanged,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    GoogleAuthProvider,
    signInWithPopup,
    User,
    UserCredential
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/config';
import SessionWarningModal from '../components/SessionWarningModal';
import { AuthContextType } from '@academy/index';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

// 30 minutes total timeout
const INACTIVITY_LIMIT_MS = 30 * 60 * 1000;
// Show warning 2 minutes before logout
const WARNING_BEFORE_MS = 2 * 60 * 1000;

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [showSessionWarning, setShowSessionWarning] = useState<boolean>(false);
    
    const warningTimerRef = useRef<NodeJS.Timeout | null>(null);
    const logoutTimerRef = useRef<NodeJS.Timeout | null>(null);

    const logout = useCallback(async (): Promise<void> => {
        await signOut(auth);
        setShowSessionWarning(false);
        window.location.href = '/';
    }, []);

    const resetInactivityTimer = useCallback(() => {
        if (!currentUser) return;

        if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
        if (logoutTimerRef.current) clearTimeout(logoutTimerRef.current);
        
        setShowSessionWarning(false);

        warningTimerRef.current = setTimeout(() => {
            setShowSessionWarning(true);
        }, INACTIVITY_LIMIT_MS - WARNING_BEFORE_MS);

        logoutTimerRef.current = setTimeout(() => {
            logout();
        }, INACTIVITY_LIMIT_MS);
    }, [currentUser, logout]);

    const login = (email: string, password: string): Promise<UserCredential> => {
        return signInWithEmailAndPassword(auth, email, password);
    };

    const signup = async (email: string, password: string, name?: string): Promise<UserCredential> => {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const { user } = userCredential;

        await setDoc(doc(db, 'users', user.uid), {
            uid: user.uid,
            email: user.email,
            name: name || user.email?.split('@')[0] || 'User',
            role: 'user',
            createdAt: new Date().toISOString()
        });

        return userCredential;
    };

    const googleSignIn = async (): Promise<UserCredential> => {
        const provider = new GoogleAuthProvider();
        const result = await signInWithPopup(auth, provider);
        const { user } = result;

        const userRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
            await setDoc(userRef, {
                uid: user.uid,
                email: user.email,
                name: user.displayName || user.email?.split('@')[0] || 'User',
                role: 'user',
                createdAt: new Date().toISOString()
            });
        }

        return result;
    };

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setCurrentUser(user);
            setLoading(false);
        });

        return unsubscribe;
    }, []);

    useEffect(() => {
        if (!currentUser) return;

        const events = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart'];
        const handleActivity = () => resetInactivityTimer();

        events.forEach(event => window.addEventListener(event, handleActivity));
        resetInactivityTimer();

        return () => {
            events.forEach(event => window.removeEventListener(event, handleActivity));
            if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
            if (logoutTimerRef.current) clearTimeout(logoutTimerRef.current);
        };
    }, [currentUser, resetInactivityTimer]);

    const value: AuthContextType = {
        currentUser,
        loading,
        login,
        signup,
        logout,
        googleSignIn
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
            <SessionWarningModal 
                isOpen={showSessionWarning}
                onStay={resetInactivityTimer}
                onLogout={logout}
                timeoutSeconds={WARNING_BEFORE_MS / 1000}
            />
        </AuthContext.Provider>
    );
};
