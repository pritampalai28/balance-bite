
"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "../lib/firebase";
import { useRouter, usePathname } from "next/navigation";

interface AuthContextType {
    user: User | null;
    loading: boolean;
}

const AuthContext = createContext<AuthContextType>({ user: null, loading: true });

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setUser(user);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    useEffect(() => {
        // Optional: Protect routes logic can go here or in middleware
        // For now, we prefer handling it in specific page components or layout for flexibility
        if (!loading && !user && pathname !== '/login' && pathname !== '/signup' && pathname !== '/') {
            router.push('/login');
        }
    }, [user, loading, pathname, router]);


    return (
        <AuthContext.Provider value={{ user, loading }}>
            {loading ? <div className="flex h-screen w-full items-center justify-center">Loading...</div> : children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
