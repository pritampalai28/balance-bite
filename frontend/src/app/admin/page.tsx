"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/Toast";
import { useRouter } from "next/navigation";
import axios from "axios";
import { motion } from "framer-motion";
import { Users, MessageSquare, Shield, ArrowLeft, Calendar, Target } from "lucide-react";
import Link from "next/link";

const API_BASE = "http://127.0.0.1:5001";

interface User {
    _id: string;
    name: string;
    email: string;
    goal?: string;
    created_at?: string;
}

interface Suggestion {
    _id: string;
    user_id: string;
    suggestion: string;
    created_at?: string;
}

export default function AdminDashboard() {
    const { user, loading } = useAuth();
    const { showToast } = useToast();
    const router = useRouter();
    const [users, setUsers] = useState<User[]>([]);
    const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!loading && !user) {
            router.push("/login");
        } else if (user) {
            fetchAdminData();
        }
    }, [user, loading]);

    const fetchAdminData = async () => {
        if (!user) return;
        setIsLoading(true);
        setError(null);

        try {
            const token = await user.getIdToken();

            const [usersRes, suggestionsRes] = await Promise.all([
                axios.get(`${API_BASE}/api/admin/users`, {
                    headers: { Authorization: `Bearer ${token}` }
                }),
                axios.get(`${API_BASE}/api/admin/suggestions`, {
                    headers: { Authorization: `Bearer ${token}` }
                })
            ]);

            setUsers(usersRes.data.users || []);
            setSuggestions(suggestionsRes.data.suggestions || []);
        } catch (err: any) {
            console.error("Error fetching admin data:", err);
            if (err.response?.status === 403) {
                setError("Access denied. Admin privileges required.");
                showToast("Admin access required", "error");
            } else {
                setError("Failed to load admin data");
                showToast("Failed to load admin data", "error");
            }
        } finally {
            setIsLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#0B0D12] text-white">
                <div className="flex items-center gap-3">
                    <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                    Loading Admin Panel...
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0B0D12] text-white p-6 lg:p-10 relative overflow-hidden">
            {/* Background Glows */}
            <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-red-600/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-orange-600/10 rounded-full blur-[120px] pointer-events-none" />

            {/* Header */}
            <header className="flex items-center justify-between mb-10 relative z-10">
                <div className="flex items-center gap-4">
                    <Link
                        href="/dashboard"
                        className="p-2 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition"
                    >
                        <ArrowLeft size={20} />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold flex items-center gap-2">
                            <Shield className="text-red-500" size={24} /> Admin Dashboard
                        </h1>
                        <p className="text-gray-500 text-sm mt-1">Manage users and view feedback</p>
                    </div>
                </div>
            </header>

            {error ? (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-red-500/10 border border-red-500/20 rounded-2xl p-8 text-center max-w-md mx-auto"
                >
                    <Shield className="text-red-400 mx-auto mb-4" size={48} />
                    <h2 className="text-xl font-bold text-red-400 mb-2">Access Denied</h2>
                    <p className="text-gray-400">{error}</p>
                    <Link
                        href="/dashboard"
                        className="inline-block mt-6 px-6 py-3 bg-white/10 rounded-xl hover:bg-white/20 transition"
                    >
                        Back to Dashboard
                    </Link>
                </motion.div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 relative z-10">
                    {/* Users Section */}
                    <motion.section
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-[#13151B] border border-white/5 rounded-3xl p-6"
                    >
                        <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
                            <Users className="text-blue-400" size={20} />
                            Registered Users
                            <span className="ml-auto text-sm text-gray-500 font-normal">{users.length} total</span>
                        </h2>

                        {isLoading ? (
                            <div className="flex items-center justify-center py-12">
                                <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                            </div>
                        ) : users.length === 0 ? (
                            <p className="text-gray-500 text-center py-8">No users registered yet</p>
                        ) : (
                            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                                {users.map((u) => (
                                    <div
                                        key={u._id}
                                        className="bg-[#0B0D12] rounded-xl p-4 border border-white/5 hover:border-white/10 transition"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-sm font-bold">
                                                {u.name?.charAt(0) || "?"}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium text-white truncate">{u.name || "Unknown"}</p>
                                                <p className="text-xs text-gray-500 truncate">{u.email}</p>
                                            </div>
                                            <div className="text-right">
                                                {u.goal && (
                                                    <span className="inline-flex items-center gap-1 text-xs bg-indigo-500/20 text-indigo-300 px-2 py-1 rounded-full">
                                                        <Target size={12} /> {u.goal}
                                                    </span>
                                                )}
                                                {u.created_at && (
                                                    <p className="text-[10px] text-gray-600 mt-1 flex items-center gap-1 justify-end">
                                                        <Calendar size={10} />
                                                        {new Date(u.created_at).toLocaleDateString()}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </motion.section>

                    {/* Suggestions Section */}
                    <motion.section
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-[#13151B] border border-white/5 rounded-3xl p-6"
                    >
                        <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
                            <MessageSquare className="text-green-400" size={20} />
                            User Feedback
                            <span className="ml-auto text-sm text-gray-500 font-normal">{suggestions.length} total</span>
                        </h2>

                        {isLoading ? (
                            <div className="flex items-center justify-center py-12">
                                <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                            </div>
                        ) : suggestions.length === 0 ? (
                            <p className="text-gray-500 text-center py-8">No feedback received yet</p>
                        ) : (
                            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                                {suggestions.map((s) => (
                                    <div
                                        key={s._id}
                                        className="bg-[#0B0D12] rounded-xl p-4 border border-white/5 hover:border-white/10 transition"
                                    >
                                        <p className="text-sm text-gray-300 mb-2">{s.suggestion}</p>
                                        <div className="flex items-center justify-between text-xs text-gray-500">
                                            <span className="truncate max-w-[150px]">From: {s.user_id}</span>
                                            {s.created_at && (
                                                <span className="flex items-center gap-1">
                                                    <Calendar size={10} />
                                                    {new Date(s.created_at).toLocaleDateString()}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </motion.section>
                </div>
            )}
        </div>
    );
}
