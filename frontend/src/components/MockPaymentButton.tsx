"use client";

import { useState } from "react";
// import axios from "axios"; // Not needed for mock
// import { useAuth } from "@/context/AuthContext"; // Not needed unless we want to log it

interface MockPaymentButtonProps {
    amount: number;
    description: string;
}

export default function MockPaymentButton({ amount, description }: MockPaymentButtonProps) {
    const [loading, setLoading] = useState(false);

    const handlePayment = () => {
        setLoading(true);

        // Simulate network delay
        setTimeout(() => {
            setLoading(false);
            alert("Payment Successful! (Prototype Mode)");
        }, 2000);
    };

    return (
        <button
            onClick={handlePayment}
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-xl font-bold hover:shadow-lg hover:shadow-indigo-600/30 transition-all transform hover:scale-[1.02] flex items-center justify-center gap-2"
            disabled={loading}
        >
            {loading ? (
                <div className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Processing...</span>
                </div>
            ) : (
                `Upgrade for ₹${amount}`
            )}
        </button>
    );
}
