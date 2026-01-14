"use client";

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dumbbell, Menu, X } from 'lucide-react';

export default function Navbar() {
    const { user } = useAuth();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const scrollToSection = (id: string) => {
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
        setMobileMenuOpen(false);
    };

    return (
        <>
            <nav className="fixed w-full z-50 bg-[#0B0D12]/70 backdrop-blur-md border-b border-white/5 transition-all duration-300">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16 items-center">

                        {/* Logo */}
                        <Link href="/" className="flex items-center gap-2 group">
                            <div className="bg-indigo-600 p-2 rounded-lg group-hover:bg-indigo-700 transition shadow-[0_0_15px_rgba(79,70,229,0.5)]">
                                <Dumbbell className="h-6 w-6 text-white" />
                            </div>
                            <span className="text-2xl font-bold text-white tracking-tight">
                                BalanceBite
                            </span>
                        </Link>

                        {/* Desktop Links */}
                        <div className="hidden md:flex items-center space-x-8">
                            <button
                                onClick={() => scrollToSection('features')}
                                className="text-gray-400 hover:text-white font-medium transition"
                            >
                                Features
                            </button>
                            <button
                                onClick={() => scrollToSection('pricing')}
                                className="text-gray-400 hover:text-white font-medium transition"
                            >
                                Pricing
                            </button>

                            {user ? (
                                <Link
                                    href="/dashboard"
                                    className="bg-indigo-600 text-white px-5 py-2 rounded-full font-medium hover:bg-indigo-500 transition shadow-[0_0_20px_rgba(79,70,229,0.3)]"
                                >
                                    Go to Dashboard
                                </Link>
                            ) : (
                                <div className="flex items-center gap-4">
                                    <Link href="/login" className="text-gray-400 font-medium hover:text-white transition">Login</Link>
                                    <Link
                                        href="/signup"
                                        className="bg-white text-black px-5 py-2 rounded-full font-bold hover:bg-gray-200 transition"
                                    >
                                        Get Started
                                    </Link>
                                </div>
                            )}
                        </div>

                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="md:hidden p-2 text-gray-400 hover:text-white transition"
                        >
                            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>
            </nav>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setMobileMenuOpen(false)}
                            className="fixed inset-0 bg-black/60 z-40 md:hidden"
                        />
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'tween', duration: 0.3 }}
                            className="fixed right-0 top-0 bottom-0 w-64 bg-[#111319] border-l border-white/5 z-50 p-6 md:hidden"
                        >
                            <div className="flex justify-end mb-8">
                                <button
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="p-2 text-gray-400 hover:text-white"
                                >
                                    <X size={24} />
                                </button>
                            </div>

                            <nav className="space-y-4">
                                <button
                                    onClick={() => scrollToSection('features')}
                                    className="block w-full text-left px-4 py-3 text-gray-300 hover:text-white hover:bg-white/5 rounded-xl transition"
                                >
                                    Features
                                </button>
                                <button
                                    onClick={() => scrollToSection('pricing')}
                                    className="block w-full text-left px-4 py-3 text-gray-300 hover:text-white hover:bg-white/5 rounded-xl transition"
                                >
                                    Pricing
                                </button>

                                <div className="pt-4 border-t border-white/10 space-y-3">
                                    {user ? (
                                        <Link
                                            href="/dashboard"
                                            onClick={() => setMobileMenuOpen(false)}
                                            className="block w-full bg-indigo-600 text-white px-4 py-3 rounded-xl font-medium text-center hover:bg-indigo-500 transition"
                                        >
                                            Go to Dashboard
                                        </Link>
                                    ) : (
                                        <>
                                            <Link
                                                href="/login"
                                                onClick={() => setMobileMenuOpen(false)}
                                                className="block w-full px-4 py-3 text-gray-300 hover:text-white hover:bg-white/5 rounded-xl transition text-center"
                                            >
                                                Login
                                            </Link>
                                            <Link
                                                href="/signup"
                                                onClick={() => setMobileMenuOpen(false)}
                                                className="block w-full bg-white text-black px-4 py-3 rounded-xl font-bold text-center hover:bg-gray-200 transition"
                                            >
                                                Get Started
                                            </Link>
                                        </>
                                    )}
                                </div>
                            </nav>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}
