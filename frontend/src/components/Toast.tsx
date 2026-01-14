"use client";

import { useState, useEffect, createContext, useContext, ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, XCircle, AlertCircle, X } from "lucide-react";

type ToastType = "success" | "error" | "info";

interface Toast {
    id: number;
    message: string;
    type: ToastType;
}

interface ToastContextType {
    showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const showToast = (message: string, type: ToastType = "info") => {
        const id = Date.now();
        setToasts((prev) => [...prev, { id, message, type }]);
    };

    const removeToast = (id: number) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
    };

    useEffect(() => {
        if (toasts.length > 0) {
            const timer = setTimeout(() => {
                setToasts((prev) => prev.slice(1));
            }, 4000);
            return () => clearTimeout(timer);
        }
    }, [toasts]);

    const getIcon = (type: ToastType) => {
        switch (type) {
            case "success":
                return <CheckCircle className="text-green-400" size={20} />;
            case "error":
                return <XCircle className="text-red-400" size={20} />;
            default:
                return <AlertCircle className="text-blue-400" size={20} />;
        }
    };

    const getBorderColor = (type: ToastType) => {
        switch (type) {
            case "success":
                return "border-green-500/30";
            case "error":
                return "border-red-500/30";
            default:
                return "border-blue-500/30";
        }
    };

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            <div className="fixed bottom-4 right-4 z-[100] space-y-2">
                <AnimatePresence>
                    {toasts.map((toast) => (
                        <motion.div
                            key={toast.id}
                            initial={{ opacity: 0, x: 100, scale: 0.9 }}
                            animate={{ opacity: 1, x: 0, scale: 1 }}
                            exit={{ opacity: 0, x: 100, scale: 0.9 }}
                            className={`flex items-center gap-3 bg-[#1A1D24] border ${getBorderColor(toast.type)} rounded-xl px-4 py-3 shadow-lg backdrop-blur-md min-w-[280px]`}
                        >
                            {getIcon(toast.type)}
                            <p className="text-sm text-gray-200 flex-1">{toast.message}</p>
                            <button
                                onClick={() => removeToast(toast.id)}
                                className="text-gray-500 hover:text-gray-300 transition"
                            >
                                <X size={16} />
                            </button>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </ToastContext.Provider>
    );
}

export function useToast() {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error("useToast must be used within a ToastProvider");
    }
    return context;
}
