
"use client";

import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import axios from "axios";

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
        <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-r from-orange-100 to-red-100 p-4">
            <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
                <h2 className="text-2xl font-bold mb-6 text-gray-800 text-center">Sign Up</h2>
                {error && <p className="text-red-500 mb-4">{error}</p>}
                <form onSubmit={handleSignup} className="space-y-4">
                    <input
                        type="text"
                        placeholder="Full Name"
                        className="w-full p-2 border border-gray-300 rounded text-black"
                        onChange={(e) => setName(e.target.value)}
                        required
                    />
                    <input
                        type="email"
                        placeholder="Email"
                        className="w-full p-2 border border-gray-300 rounded text-black"
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        className="w-full p-2 border border-gray-300 rounded text-black"
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />

                    <div className="grid grid-cols-2 gap-4">
                        <input
                            type="number"
                            placeholder="Age"
                            className="w-full p-2 border border-gray-300 rounded text-black"
                            onChange={(e) => setAge(Number(e.target.value))}
                            required
                        />
                        <input
                            type="number"
                            placeholder="Height (cm)"
                            className="w-full p-2 border border-gray-300 rounded text-black"
                            onChange={(e) => setHeight(Number(e.target.value))}
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <input
                            type="number"
                            placeholder="Weight (kg)"
                            className="w-full p-2 border border-gray-300 rounded text-black"
                            onChange={(e) => setWeight(Number(e.target.value))}
                            required
                        />
                        <input
                            type="number"
                            placeholder="Meals per day"
                            className="w-full p-2 border border-gray-300 rounded text-black"
                            onChange={(e) => setMeals(Number(e.target.value))}
                            required
                        />
                    </div>

                    <select
                        className="w-full p-2 border border-gray-300 rounded text-black"
                        value={sex}
                        onChange={(e) => setSex(e.target.value)}
                    >
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                    </select>

                    <select
                        className="w-full p-2 border border-gray-300 rounded text-black"
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
                        className="w-full bg-orange-500 hover:bg-orange-600 text-white p-2 rounded transition"
                    >
                        Sign Up
                    </button>
                </form>
                <p className="mt-4 text-center text-gray-600">
                    Already have an account?{" "}
                    <Link href="/login" className="text-orange-500 hover:underline">
                        Log in
                    </Link>
                </p>
            </div>
        </div>
    );
}
