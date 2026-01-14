"use client";

import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import { motion } from "framer-motion";
import { Dumbbell, User, Ruler, Weight, Utensils } from "lucide-react";

export default function Signup() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");
    const [age, setAge] = useState<number | "">("");
    const [height, setHeight] = useState<number | "">("");
    const [weight, setWeight] = useState<number | "">("");
    const [meals, setMeals] = useState<number | "">("");
    const [sex, setSex] = useState("male");
    const [activityLevel, setActivityLevel] = useState("sedentary");
    const [error, setError] = useState("");
    const router = useRouter();

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            const token = await user.getIdToken();

            // Sync with backend
            await axios.post(
                "http://127.0.0.1:5001/api/signup",
                {
                    name,
                    age: Number(age),
                    height: Number(height),
                    weight: Number(weight),
                    meals: Number(meals),
                    sex,
                    a_level: activityLevel,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            router.push("/dashboard");
        } catch (err: any) {
            console.error(err);
            setError(err.message);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-[#0B0D12] p-4 relative overflow-hidden">
            {/* Background Glows */}
            <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-2xl w-full max-w-md relative z-10 my-10"
            >
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-white">Get Started</h2>
                    <p className="text-gray-400 mt-2">Create your account to start your journey.</p>
                </div>

                {error && <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl mb-4 text-sm text-center">{error}</div>}

                <form onSubmit={handleSignup} className="space-y-4">
                    <div className="relative">
                        <User className="absolute left-4 top-4 text-gray-500 h-5 w-5" />
                        <input
                            type="text"
                            placeholder="Full Name"
                            className="w-full pl-12 p-4 bg-[#13151b] border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-colors"
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </div>

                    <input
                        type="email"
                        placeholder="Email"
                        className="w-full p-4 bg-[#13151b] border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-colors"
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        className="w-full p-4 bg-[#13151b] border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-colors"
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />

                    <div className="grid grid-cols-2 gap-4">
                        <input
                            type="number"
                            placeholder="Age"
                            className="w-full p-4 bg-[#13151b] border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-colors"
                            onChange={(e) => setAge(Number(e.target.value))}
                            required
                        />
                        <div className="relative">
                            <Ruler className="absolute left-4 top-4 text-gray-500 h-4 w-4" />
                            <input
                                type="number"
                                placeholder="Height (cm)"
                                className="w-full pl-10 p-4 bg-[#13151b] border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-colors"
                                onChange={(e) => setHeight(Number(e.target.value))}
                                required
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="relative">
                            <Weight className="absolute left-4 top-4 text-gray-500 h-4 w-4" />
                            <input
                                type="number"
                                placeholder="Weight (kg)"
                                className="w-full pl-10 p-4 bg-[#13151b] border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-colors"
                                onChange={(e) => setWeight(Number(e.target.value))}
                                required
                            />
                        </div>
                        <div className="relative">
                            <Utensils className="absolute left-4 top-4 text-gray-500 h-4 w-4" />
                            <input
                                type="number"
                                placeholder="Meals/day"
                                className="w-full pl-10 p-4 bg-[#13151b] border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-colors"
                                onChange={(e) => setMeals(Number(e.target.value))}
                                required
                            />
                        </div>
                    </div>

                    <select
                        className="w-full p-4 bg-[#13151b] border border-white/10 rounded-xl text-white focus:outline-none focus:border-indigo-500 transition-colors"
                        value={sex}
                        onChange={(e) => setSex(e.target.value)}
                    >
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                    </select>

                    <select
                        className="w-full p-4 bg-[#13151b] border border-white/10 rounded-xl text-white focus:outline-none focus:border-indigo-500 transition-colors"
                        value={activityLevel}
                        onChange={(e) => setActivityLevel(e.target.value)}
                    >
                        <option value="sedentary">Sedentary</option>
                        <option value="lightly active">Lightly Active</option>
                        <option value="moderately active">Moderately Active</option>
                        <option value="very active">Very Active</option>
                        <option value="super active">Super Active</option>
                    </select>

                    <button
                        type="submit"
                        className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-4 rounded-xl font-bold hover:shadow-lg hover:shadow-indigo-600/20 transition-all transform hover:scale-[1.02]"
                    >
                        Create Account
                    </button>
                </form>
                <div className="mt-6 text-center text-sm text-gray-500">
                    Already have an account?{" "}
                    <Link href="/login" className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors">
                        Log in
                    </Link>
                </div>
            </motion.div>
        </div>
    );
}
