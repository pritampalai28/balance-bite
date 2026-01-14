
"use client";

import { Dumbbell, Twitter, Github, Linkedin, Heart } from 'lucide-react';

export default function Footer() {
    return (
        <footer className="bg-gray-50 border-t border-gray-200 pt-16 pb-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">

                    {/* Brand */}
                    <div className="col-span-1 md:col-span-2">
                        <div className="flex items-center gap-2 mb-4">
                            <Dumbbell className="h-6 w-6 text-indigo-600" />
                            <span className="text-xl font-bold text-gray-900">BalanceBite</span>
                        </div>
                        <p className="text-gray-500 max-w-sm">
                            Your personal AI fitness chef and coach. Track macros, generate recipes, and reach your goals with intelligent guidance.
                        </p>
                    </div>

                    {/* Links */}
                    <div>
                        <h3 className="font-semibold text-gray-900 mb-4">Product</h3>
                        <ul className="space-y-3">
                            <li><a href="#" className="text-gray-500 hover:text-indigo-600 transition">Features</a></li>
                            <li><a href="#" className="text-gray-500 hover:text-indigo-600 transition">Pricing</a></li>
                            <li><a href="#" className="text-gray-500 hover:text-indigo-600 transition">Testimonials</a></li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="font-semibold text-gray-900 mb-4">Company</h3>
                        <ul className="space-y-3">
                            <li><a href="#" className="text-gray-500 hover:text-indigo-600 transition">About</a></li>
                            <li><a href="#" className="text-gray-500 hover:text-indigo-600 transition">Blog</a></li>
                            <li><a href="#" className="text-gray-500 hover:text-indigo-600 transition">Contact</a></li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-gray-200 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-gray-400 text-sm flex items-center gap-1">
                        © 2025 BalanceBite. Made with <Heart className="h-3 w-3 text-red-500 fill-current" /> by the Team.
                    </p>
                    <div className="flex space-x-6">
                        <a href="#" className="text-gray-400 hover:text-indigo-600 transition"><Twitter className="h-5 w-5" /></a>
                        <a href="#" className="text-gray-400 hover:text-indigo-600 transition"><Github className="h-5 w-5" /></a>
                        <a href="#" className="text-gray-400 hover:text-indigo-600 transition"><Linkedin className="h-5 w-5" /></a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
