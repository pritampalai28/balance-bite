
"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import axios from "axios";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

export default function Dashboard() {
    const { user, loading } = useAuth();
    const router = useRouter();
    const [userData, setUserData] = useState<any>(null);
    const [mealPlan, setMealPlan] = useState<any[]>([]);

    // Update forms state
    const [weight, setWeight] = useState("");
    const [meals, setMeals] = useState("");
    const [activityLevel, setActivityLevel] = useState("");

    // Workout form state
    const [workoutType, setWorkoutType] = useState("steps");
    const [weekStart, setWeekStart] = useState("");
    const [weekData, setWeekData] = useState({
        monday: 0, tuesday: 0, wednesday: 0, thursday: 0, friday: 0, saturday: 0, sunday: 0
    });

    const [suggestion, setSuggestion] = useState("");

    useEffect(() => {
        if (!loading && !user) {
            router.push("/login");
        } else if (user) {
            fetchUserData();
        }
    }, [user, loading]);

    const fetchUserData = async () => {
        if (!user) return;
        try {
            const token = await user.getIdToken();

            // Get Profile
            const profileRes = await axios.get("http://127.0.0.1:5001/api/user/profile", {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUserData(profileRes.data);
            setWeight(profileRes.data.weight);
            setMeals(profileRes.data.meals);
            setActivityLevel(profileRes.data.a_level);

            // Get Meal Plan
            const mealRes = await axios.get("http://127.0.0.1:5001/api/user/meal-plan", {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMealPlan(mealRes.data.meal_plan);

        } catch (error) {
            console.error("Error fetching data:", error);
        }
    };

    const handleUpdateDetails = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        try {
            const token = await user.getIdToken();
            const res = await axios.post("http://127.0.0.1:5001/api/user/update", {
                weight: Number(weight),
                meals: Number(meals),
                a_level: activityLevel
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUserData(res.data.user);
            setMealPlan(res.data.meal_plan);
            alert("Details updated!");
        } catch (error) {
            console.error(error);
            alert("Failed to update.");
        }
    };

    const handleAddWorkout = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        try {
            const token = await user.getIdToken();
            await axios.post("http://127.0.0.1:5001/api/workout", {
                workoutType,
                weekStart,
                weekData
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert("Workout added!");
        } catch (error) {
            console.error(error);
            alert("Failed to add workout.");
        }
    };

    const handleSuggestion = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        try {
            const token = await user.getIdToken();
            await axios.post("http://127.0.0.1:5001/api/suggestion", {
                suggestion
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSuggestion("");
            alert("Suggestion submitted!");
        } catch (error) {
            console.error(error);
        }
    };

    const downloadReport = async (type: string) => {
        if (!user) return;
        try {
            const token = await user.getIdToken();
            const url = type === 'user'
                ? "http://127.0.0.1:5001/api/report/user-updates"
                : "http://127.0.0.1:5001/api/report/weekly-workout"; // Note: Weekly report logic pending in backend? 

            // Using fetch to handle blob download
            const response = await fetch(url, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (!response.ok) throw new Error("Download failed");

            const blob = await response.blob();
            const downloadUrl = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = downloadUrl;
            a.download = type === 'user' ? "user_report.pdf" : "workout_report.pdf";
            document.body.appendChild(a);
            a.click();
            a.remove();
        } catch (error) {
            console.error(error);
            alert("Failed to download report. Ensure you have updates logged.");
        }
    };

    if (loading || !userData) return <div className="p-10">Loading Dashboard...</div>;

    // Chart Data Preparation
    const labels = mealPlan.map((_, index) => `Meal ${index + 1}`);
    const chartData = {
        labels,
        datasets: [
            {
                label: 'Carbs (g)',
                data: mealPlan.map(m => m.carbs),
                backgroundColor: 'rgba(255, 99, 132, 0.5)',
            },
            {
                label: 'Protein (g)',
                data: mealPlan.map(m => m.protein),
                backgroundColor: 'rgba(53, 162, 235, 0.5)',
            },
            {
                label: 'Fat (g)',
                data: mealPlan.map(m => m.fat),
                backgroundColor: 'rgba(255, 206, 86, 0.5)',
            },
        ],
    };

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <header className="flex justify-between items-center bg-white p-6 shadow-md rounded-lg mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Welcome, {userData.name}</h1>
                    <p className="text-gray-500">{userData.email}</p>
                </div>
                <button onClick={() => auth.signOut()} className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">
                    Logout
                </button>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Profile Stats */}
                <section className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-bold mb-4 text-gray-800">Your Stats</h2>
                    <div className="grid grid-cols-2 gap-4 text-gray-700">
                        <p><strong>Age:</strong> {userData.age}</p>
                        <p><strong>BMI:</strong> {(userData.weight / ((userData.height / 100) ** 2)).toFixed(1)}</p>
                        <p><strong>Weight:</strong> {userData.weight} kg</p>
                        <p><strong>TDEE:</strong> {Math.round(userData.tdee)} kcal</p>
                        <p><strong>Target:</strong> {userData.a_level}</p>
                    </div>
                </section>

                {/* Update Details */}
                <section className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-bold mb-4 text-gray-800">Update Targets</h2>
                    <form onSubmit={handleUpdateDetails} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <input type="number" value={weight} onChange={e => setWeight(e.target.value)} placeholder="Weight (kg)" className="p-2 border rounded" required />
                            <input type="number" value={meals} onChange={e => setMeals(e.target.value)} placeholder="Meals/day" className="p-2 border rounded" required />
                        </div>
                        <select value={activityLevel} onChange={e => setActivityLevel(e.target.value)} className="w-full p-2 border rounded">
                            <option value="sedentary">Sedentary</option>
                            <option value="lightly active">Lightly Active</option>
                            <option value="moderately active">Moderately Active</option>
                            <option value="very active">Very Active</option>
                            <option value="super active">Super Active</option>
                        </select>
                        <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600">Update & Recalculate</button>
                    </form>
                </section>

                {/* Meal Plan Chart */}
                <section className="bg-white p-6 rounded-lg shadow-md lg:col-span-2">
                    <h2 className="text-xl font-bold mb-4 text-gray-800">Current Meal Plan Distribution</h2>
                    <div className="h-64 flex justify-center">
                        <Bar options={{ responsive: true, maintainAspectRatio: false }} data={chartData} />
                    </div>
                    <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                        {mealPlan.map((meal, idx) => (
                            <div key={idx} className="bg-gray-100 p-4 rounded text-center">
                                <h4 className="font-bold">Meal {idx + 1}</h4>
                                <p className="text-sm">~{meal.calories} kcal</p>
                                <p className="text-xs text-gray-500">C:{meal.carbs}g P:{meal.protein}g F:{meal.fat}g</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Workout Data */}
                <section className="bg-white p-6 rounded-lg shadow-md lg:col-span-2">
                    <h2 className="text-xl font-bold mb-4 text-gray-800">Log Weekly Workout</h2>
                    <form onSubmit={handleAddWorkout} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <select value={workoutType} onChange={e => setWorkoutType(e.target.value)} className="p-2 border rounded">
                                <option value="steps">Steps</option>
                                <option value="cycling">Cycling (km)</option>
                                <option value="running">Running (km)</option>
                                <option value="yoga">Yoga (min)</option>
                                <option value="weightlifting">Weightlifting (kg)</option>
                            </select>
                            <input type="date" value={weekStart} onChange={e => setWeekStart(e.target.value)} className="p-2 border rounded" required />
                        </div>
                        <div className="grid grid-cols-7 gap-2">
                            {Object.keys(weekData).map(day => (
                                <div key={day}>
                                    <label className="block text-xs uppercase font-bold text-center mb-1">{day.slice(0, 3)}</label>
                                    <input
                                        type="number"
                                        className="w-full p-1 border rounded text-center"
                                        value={(weekData as any)[day]}
                                        onChange={e => setWeekData({ ...weekData, [day]: Number(e.target.value) })}
                                    />
                                </div>
                            ))}
                        </div>
                        <button type="submit" className="w-full bg-green-500 text-white p-2 rounded hover:bg-green-600">Log Workout</button>
                    </form>
                </section>

                {/* Footer Actions */}
                <section className="bg-white p-6 rounded-lg shadow-md lg:col-span-2 flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="w-full md:w-1/2">
                        <h3 className="font-bold mb-2">Submit Suggestion</h3>
                        <div className="flex gap-2">
                            <input type="text" value={suggestion} onChange={e => setSuggestion(e.target.value)} className="flex-1 p-2 border rounded" placeholder="Your feedback..." />
                            <button onClick={handleSuggestion} className="bg-purple-500 text-white px-4 rounded hover:bg-purple-600">Send</button>
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <button onClick={() => downloadReport('user')} className="bg-gray-800 text-white px-4 py-2 rounded hover:bg-gray-700">Download User Report</button>
                    </div>
                </section>

            </div>
        </div>
    );
}
