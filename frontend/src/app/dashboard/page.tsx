"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/Toast";
import axios from "axios";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler,
} from "chart.js";
import { Bar, Line } from "react-chartjs-2";
import MacroRing from "@/components/MacroRing";
import RecipeCard from "@/components/RecipeCard";
import MockPaymentButton from "@/components/MockPaymentButton";
import { motion, AnimatePresence } from "framer-motion";
import {
    LayoutDashboard,
    Utensils,
    Activity,
    User,
    LogOut,
    Flame,
    Download,
    Send,
    Zap,
    Menu,
    X,
    TrendingUp,
    Calendar,
    Target,
    ChefHat
} from "lucide-react";

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

const API_BASE = "http://127.0.0.1:5001";

export default function Dashboard() {
    const { user, loading } = useAuth();
    const { showToast } = useToast();
    const router = useRouter();
    const [userData, setUserData] = useState<any>(null);
    const [mealPlan, setMealPlan] = useState<any[]>([]);
    const [activeTab, setActiveTab] = useState("dashboard");
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    // Update forms state
    const [weight, setWeight] = useState("");
    const [meals, setMeals] = useState("");
    const [activityLevel, setActivityLevel] = useState("");
    const [goal, setGoal] = useState("maintenance");
    const [dietType, setDietType] = useState("Standard");
    const [dislikedIngredients, setDislikedIngredients] = useState("");

    // Feedback
    const [suggestion, setSuggestion] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    // AI Recipe State
    const [generatedRecipe, setGeneratedRecipe] = useState<any>(null);
    const [isGenerating, setIsGenerating] = useState<string | null>(null);

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
            const profileRes = await axios.get(`${API_BASE}/api/user/profile`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUserData(profileRes.data);
            setWeight(profileRes.data.weight);
            setMeals(profileRes.data.meals);
            setActivityLevel(profileRes.data.a_level);
            setGoal(profileRes.data.goal || "maintenance");
            setDietType(profileRes.data.diet_type || "Standard");
            setDislikedIngredients((profileRes.data.disliked_ingredients || []).join(", "));

            const mealRes = await axios.get(`${API_BASE}/api/user/meal-plan`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMealPlan(mealRes.data.meal_plan);

        } catch (error) {
            console.error("Error fetching data:", error);
            showToast("Failed to load profile data", "error");
        }
    };

    const handleUpdateDetails = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        setIsSubmitting(true);
        try {
            const token = await user.getIdToken();
            const res = await axios.post(`${API_BASE}/api/user/update`, {
                weight: Number(weight),
                meals: Number(meals),
                a_level: activityLevel,
                goal: goal,
                diet_type: dietType
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUserData(res.data.user);
            setMealPlan(res.data.meal_plan);
            showToast("Profile updated successfully!", "success");
        } catch (error) {
            console.error(error);
            showToast("Failed to update profile", "error");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleGenerateRecipe = async (mealName: string) => {
        if (!user) return;
        setIsGenerating(mealName);
        try {
            const token = await user.getIdToken();
            const res = await axios.post(`${API_BASE}/api/ai/generate-recipes`, {
                meal_name: mealName
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (res.data.recipe && !res.data.recipe.error) {
                setGeneratedRecipe(res.data.recipe);
                showToast("Recipe generated!", "success");
            } else {
                showToast("AI Error: " + (res.data.recipe?.error || "Unknown error"), "error");
            }
        } catch (error) {
            console.error(error);
            showToast("Failed to generate recipe. Is the AI service configured?", "error");
        } finally {
            setIsGenerating(null);
        }
    };

    const downloadReport = async (type: string) => {
        if (!user) return;
        try {
            const token = await user.getIdToken();
            const url = type === 'user'
                ? `${API_BASE}/api/report/user-updates`
                : `${API_BASE}/api/report/weekly-workout`;
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
            showToast("Report downloaded!", "success");
        } catch (error) {
            console.error(error);
            showToast("Failed to download report", "error");
        }
    };

    const handleSuggestion = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !suggestion.trim()) return;
        setIsSubmitting(true);
        try {
            const token = await user.getIdToken();
            await axios.post(`${API_BASE}/api/suggestion`, {
                suggestion: suggestion
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSuggestion("");
            showToast("Suggestion submitted! Thank you!", "success");
        } catch (error) {
            console.error(error);
            showToast("Failed to submit suggestion", "error");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading || !userData) return (
        <div className="min-h-screen flex items-center justify-center bg-[#0B0D12] text-white">
            <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="flex items-center gap-3"
            >
                <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                Loading Dashboard...
            </motion.div>
        </div>
    );

    // Sidebar Items
    const navItems = [
        { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
        { id: "nutrition", label: "Nutrition", icon: Utensils },
        { id: "analytics", label: "Analytics", icon: Activity },
        { id: "premium", label: "Premium", icon: Zap },
        { id: "profile", label: "Profile", icon: User },
    ];

    // Sample weekly data for charts
    const weeklyCaloriesData = {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        datasets: [{
            label: 'Calories',
            data: [2100, 2300, 1950, 2400, 2200, 2500, 2150],
            backgroundColor: 'rgba(99, 102, 241, 0.3)',
            borderColor: 'rgba(99, 102, 241, 1)',
            borderWidth: 2,
            fill: true,
            tension: 0.4,
        }]
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
        },
        scales: {
            x: {
                grid: { color: 'rgba(255,255,255,0.05)' },
                ticks: { color: 'rgba(255,255,255,0.5)' }
            },
            y: {
                grid: { color: 'rgba(255,255,255,0.05)' },
                ticks: { color: 'rgba(255,255,255,0.5)' }
            }
        }
    };

    return (
        <div className="min-h-screen bg-[#0B0D12] text-white font-sans selection:bg-indigo-500/30">

            {/* Mobile Menu Button */}
            <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-[#1A1D24] rounded-xl border border-white/10"
            >
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* Mobile Overlay */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="lg:hidden fixed inset-0 bg-black/60 z-30"
                        onClick={() => setMobileMenuOpen(false)}
                    />
                )}
            </AnimatePresence>

            {/* Sidebar */}
            <aside className={`fixed left-0 top-0 bottom-0 w-64 bg-[#111319] border-r border-white/5 flex flex-col p-6 z-40 transition-transform duration-300 ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
                <div className="flex items-center gap-3 mb-12">
                    <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
                        <Zap className="h-5 w-5 text-white" />
                    </div>
                    <span className="font-bold text-xl tracking-tight">BalanceBite</span>
                </div>

                <nav className="flex-1 space-y-2">
                    {navItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => {
                                setActiveTab(item.id);
                                setMobileMenuOpen(false);
                            }}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative
                            ${activeTab === item.id
                                    ? "text-white bg-white/5 shadow-[0_0_20px_rgba(79,70,229,0.15)] border border-white/5"
                                    : "text-gray-500 hover:text-white hover:bg-white/5"}`}
                        >
                            {activeTab === item.id && (
                                <motion.div
                                    layoutId="activeTab"
                                    className="absolute left-0 w-1 h-6 bg-indigo-500 rounded-r-full"
                                />
                            )}
                            <item.icon size={20} className={activeTab === item.id ? "text-indigo-400" : "text-gray-500 group-hover:text-white"} />
                            <span className="font-medium">{item.label}</span>
                        </button>
                    ))}
                </nav>

                <div className="mt-auto pt-6 border-t border-white/5">
                    <button onClick={() => auth.signOut()} className="flex items-center gap-3 text-gray-500 hover:text-red-400 transition ml-2">
                        <LogOut size={18} />
                        <span className="text-sm font-medium">Logout</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="lg:ml-64 p-6 lg:p-10 min-h-screen relative overflow-hidden">
                {/* Background Glows */}
                <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />
                <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />

                {/* Header */}
                <header className="flex justify-between items-center mb-10 relative z-10 pt-12 lg:pt-0">
                    <div>
                        <h1 className="text-2xl font-bold">Hello, {userData.name} 👋</h1>
                        <p className="text-gray-500 text-sm mt-1">Let's hit your targets today.</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="bg-[#1A1D24] px-4 py-2 rounded-full border border-white/5 text-sm text-gray-400">
                            <span className="text-indigo-400 font-bold">{goal.toUpperCase()}</span> MODE
                        </div>
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-sm font-bold shadow-lg shadow-indigo-500/20">
                            {userData.name.charAt(0)}
                        </div>
                    </div>
                </header>

                <AnimatePresence mode="wait">
                    {/* DASHBOARD TAB */}
                    {activeTab === "dashboard" && (
                        <motion.div
                            key="dashboard"
                            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
                            className="grid grid-cols-1 lg:grid-cols-3 gap-8"
                        >
                            {/* MACRO RINGS SECTION */}
                            <div className="lg:col-span-2 bg-[#13151b] border border-white/5 rounded-3xl p-8 relative overflow-hidden backdrop-blur-sm">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl -mr-10 -mt-10" />
                                <h2 className="text-lg font-bold mb-8 flex items-center gap-2">
                                    <Activity className="text-indigo-500" size={18} /> Daily Breakdown
                                </h2>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 justify-items-center">
                                    <MacroRing label="Calories" current={0} target={userData.target_calories || userData.tdee} color="#06b6d4" />
                                    <MacroRing label="Protein" current={0} target={userData.total_protein} color="#8b5cf6" />
                                    <MacroRing label="Carbs" current={0} target={userData.total_carbs} color="#eab308" />
                                    <MacroRing label="Fat" current={0} target={userData.total_fat} color="#f97316" />
                                </div>
                            </div>

                            {/* SMALL CHART / STATS */}
                            <div className="bg-[#13151b] border border-white/5 rounded-3xl p-8 flex flex-col justify-center relative backdrop-blur-sm">
                                <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                                    <TrendingUp className="text-green-500" size={18} /> Weekly Activity
                                </h2>
                                <div className="flex-1 min-h-[150px] flex items-end justify-center gap-2">
                                    {[40, 70, 50, 90, 60, 80, 50].map((h, i) => (
                                        <div key={i} className="w-1/7 h-full flex items-end group">
                                            <div
                                                style={{ height: `${h}%` }}
                                                className="w-full bg-indigo-500/20 rounded-t-sm border-t border-indigo-500/50 group-hover:bg-indigo-500/40 transition-all relative overflow-hidden"
                                            >
                                                <div className="absolute inset-x-0 bottom-0 top-0 bg-gradient-to-t from-indigo-600/50 to-transparent" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="flex justify-between text-xs text-gray-500 mt-2 px-1">
                                    <span>Mon</span><span>Wed</span><span>Fri</span><span>Sun</span>
                                </div>
                            </div>

                            {/* MEAL PREVIEW */}
                            <div className="lg:col-span-3">
                                <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
                                    <Utensils className="text-pink-500" size={18} /> Today's Menu
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    {mealPlan.map((meal, idx) => (
                                        <div key={idx} className="bg-[#13151B] border border-white/5 rounded-2xl p-4 flex gap-4 hover:border-white/10 transition-colors group">
                                            <div className="w-20 h-20 rounded-xl bg-gray-800 flex-shrink-0 relative overflow-hidden">
                                                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-purple-500/20" />
                                                {idx === 0 && <span className="absolute inset-0 flex items-center justify-center text-2xl">🍳</span>}
                                                {idx === 1 && <span className="absolute inset-0 flex items-center justify-center text-2xl">🥗</span>}
                                                {idx >= 2 && <span className="absolute inset-0 flex items-center justify-center text-2xl">🍗</span>}
                                            </div>
                                            <div className="flex-1 flex flex-col justify-center">
                                                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Meal {idx + 1}</span>
                                                <h4 className="font-bold text-gray-200 leading-tight mb-2 group-hover:text-indigo-400 transition-colors">{meal.name}</h4>
                                                <div className="flex gap-2">
                                                    <span className="text-[10px] bg-white/5 px-2 py-0.5 rounded text-gray-400">{meal.calories} kcal</span>
                                                    <span className="text-[10px] bg-white/5 px-2 py-0.5 rounded text-gray-400">{meal.protein}g P</span>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleGenerateRecipe(meal.name)}
                                                disabled={isGenerating === meal.name}
                                                className="w-10 h-10 rounded-full bg-white/5 border border-white/5 flex items-center justify-center hover:bg-indigo-600 hover:text-white transition-all text-gray-500 disabled:opacity-50"
                                            >
                                                {isGenerating === meal.name ? (
                                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                ) : (
                                                    <ChefHat size={16} />
                                                )}
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* NUTRITION TAB */}
                    {activeTab === "nutrition" && (
                        <motion.div
                            key="nutrition"
                            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
                            className="space-y-8"
                        >
                            {/* Daily Targets Summary */}
                            <div className="bg-[#13151B] border border-white/5 rounded-3xl p-8">
                                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                                    <Target className="text-cyan-500" size={20} /> Daily Targets
                                </h2>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                    <div className="bg-[#0B0D12] rounded-2xl p-6 border border-white/5">
                                        <p className="text-xs text-gray-500 uppercase mb-1">Calories</p>
                                        <p className="text-3xl font-bold text-cyan-400">{Math.round(userData.target_calories || userData.tdee)}</p>
                                        <p className="text-xs text-gray-500 mt-1">kcal/day</p>
                                    </div>
                                    <div className="bg-[#0B0D12] rounded-2xl p-6 border border-white/5">
                                        <p className="text-xs text-gray-500 uppercase mb-1">Protein</p>
                                        <p className="text-3xl font-bold text-violet-400">{Math.round(userData.total_protein)}</p>
                                        <p className="text-xs text-gray-500 mt-1">grams</p>
                                    </div>
                                    <div className="bg-[#0B0D12] rounded-2xl p-6 border border-white/5">
                                        <p className="text-xs text-gray-500 uppercase mb-1">Carbs</p>
                                        <p className="text-3xl font-bold text-yellow-400">{Math.round(userData.total_carbs)}</p>
                                        <p className="text-xs text-gray-500 mt-1">grams</p>
                                    </div>
                                    <div className="bg-[#0B0D12] rounded-2xl p-6 border border-white/5">
                                        <p className="text-xs text-gray-500 uppercase mb-1">Fat</p>
                                        <p className="text-3xl font-bold text-orange-400">{Math.round(userData.total_fat)}</p>
                                        <p className="text-xs text-gray-500 mt-1">grams</p>
                                    </div>
                                </div>
                            </div>

                            {/* Meal Cards with Generate Buttons */}
                            <div>
                                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                                    <Utensils className="text-pink-500" size={20} /> Your Meal Plan
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {mealPlan.map((meal, idx) => (
                                        <div key={idx} className="bg-[#13151B] border border-white/5 rounded-2xl p-6 hover:border-indigo-500/30 transition-all group">
                                            <div className="flex justify-between items-start mb-4">
                                                <div>
                                                    <span className="text-xs text-indigo-400 font-bold uppercase">Meal {idx + 1}</span>
                                                    <h3 className="text-lg font-bold text-white">{meal.name}</h3>
                                                </div>
                                                <div className="text-2xl">
                                                    {idx === 0 && "🍳"}
                                                    {idx === 1 && "🥗"}
                                                    {idx === 2 && "🍗"}
                                                    {idx > 2 && "🍽️"}
                                                </div>
                                            </div>

                                            <div className="space-y-3 mb-6">
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-gray-400">Calories</span>
                                                    <span className="text-white font-medium">{Math.round(meal.calories)} kcal</span>
                                                </div>
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-gray-400">Protein</span>
                                                    <span className="text-violet-400 font-medium">{Math.round(meal.protein)}g</span>
                                                </div>
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-gray-400">Carbs</span>
                                                    <span className="text-yellow-400 font-medium">{Math.round(meal.carbs)}g</span>
                                                </div>
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-gray-400">Fat</span>
                                                    <span className="text-orange-400 font-medium">{Math.round(meal.fat)}g</span>
                                                </div>
                                            </div>

                                            <button
                                                onClick={() => handleGenerateRecipe(meal.name)}
                                                disabled={isGenerating === meal.name}
                                                className="w-full bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 py-3 rounded-xl font-medium hover:bg-indigo-600 hover:text-white transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                                            >
                                                {isGenerating === meal.name ? (
                                                    <>
                                                        <div className="w-4 h-4 border-2 border-indigo-300/30 border-t-indigo-300 rounded-full animate-spin" />
                                                        Generating...
                                                    </>
                                                ) : (
                                                    <>
                                                        <ChefHat size={16} /> Generate Recipe
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* ANALYTICS TAB */}
                    {activeTab === "analytics" && (
                        <motion.div
                            key="analytics"
                            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
                            className="space-y-8"
                        >
                            {/* Weekly Calories Chart */}
                            <div className="bg-[#13151B] border border-white/5 rounded-3xl p-8">
                                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                                    <TrendingUp className="text-green-500" size={20} /> Weekly Calorie Intake
                                </h2>
                                <div className="h-[300px]">
                                    <Line data={weeklyCaloriesData} options={chartOptions} />
                                </div>
                            </div>

                            {/* Stats Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="bg-[#13151B] border border-white/5 rounded-2xl p-6">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center">
                                            <TrendingUp className="text-green-400" size={20} />
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500">Base Metabolic Rate</p>
                                            <p className="text-xl font-bold">{Math.round(userData.bmr)} kcal</p>
                                        </div>
                                    </div>
                                    <p className="text-xs text-gray-500">Calories burned at rest</p>
                                </div>

                                <div className="bg-[#13151B] border border-white/5 rounded-2xl p-6">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                                            <Flame className="text-blue-400" size={20} />
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500">Total Daily Energy</p>
                                            <p className="text-xl font-bold">{Math.round(userData.tdee)} kcal</p>
                                        </div>
                                    </div>
                                    <p className="text-xs text-gray-500">Based on activity level</p>
                                </div>

                                <div className="bg-[#13151B] border border-white/5 rounded-2xl p-6">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
                                            <Target className="text-purple-400" size={20} />
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500">Target Calories</p>
                                            <p className="text-xl font-bold">{Math.round(userData.target_calories || userData.tdee)} kcal</p>
                                        </div>
                                    </div>
                                    <p className="text-xs text-gray-500">Adjusted for {goal}</p>
                                </div>
                            </div>

                            {/* Activity Heatmap */}
                            <div className="bg-[#13151B] border border-white/5 rounded-3xl p-8">
                                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                                    <Calendar className="text-orange-500" size={20} /> Activity Heatmap
                                </h2>
                                <div className="grid grid-cols-7 gap-2">
                                    {Array.from({ length: 28 }).map((_, i) => {
                                        const intensity = Math.random();
                                        return (
                                            <div
                                                key={i}
                                                className="aspect-square rounded-lg transition-transform hover:scale-110"
                                                style={{
                                                    backgroundColor: `rgba(99, 102, 241, ${0.1 + intensity * 0.6})`
                                                }}
                                                title={`Day ${i + 1}`}
                                            />
                                        );
                                    })}
                                </div>
                                <div className="flex items-center justify-end gap-2 mt-4 text-xs text-gray-500">
                                    <span>Less</span>
                                    {[0.1, 0.3, 0.5, 0.7].map((intensity, i) => (
                                        <div
                                            key={i}
                                            className="w-4 h-4 rounded"
                                            style={{ backgroundColor: `rgba(99, 102, 241, ${intensity})` }}
                                        />
                                    ))}
                                    <span>More</span>
                                </div>
                            </div>

                            {/* Download Reports */}
                            <div className="bg-[#13151B] border border-white/5 rounded-3xl p-8">
                                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                                    <Download className="text-cyan-500" size={20} /> Download Reports
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <button
                                        onClick={() => downloadReport('user')}
                                        className="flex items-center gap-3 p-4 bg-[#0B0D12] border border-white/5 rounded-xl hover:border-indigo-500/30 transition-all group"
                                    >
                                        <div className="w-12 h-12 rounded-xl bg-indigo-500/20 flex items-center justify-center group-hover:bg-indigo-500/30 transition">
                                            <Download className="text-indigo-400" size={20} />
                                        </div>
                                        <div className="text-left">
                                            <p className="font-medium text-white">Profile Updates Report</p>
                                            <p className="text-xs text-gray-500">Download your progress history</p>
                                        </div>
                                    </button>
                                    <button
                                        onClick={() => downloadReport('workout')}
                                        className="flex items-center gap-3 p-4 bg-[#0B0D12] border border-white/5 rounded-xl hover:border-purple-500/30 transition-all group"
                                    >
                                        <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center group-hover:bg-purple-500/30 transition">
                                            <Download className="text-purple-400" size={20} />
                                        </div>
                                        <div className="text-left">
                                            <p className="font-medium text-white">Workout Report</p>
                                            <p className="text-xs text-gray-500">Download workout summary</p>
                                        </div>
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* PROFILE TAB */}
                    {activeTab === "profile" && (
                        <motion.div
                            key="profile"
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                            className="max-w-2xl mx-auto space-y-8"
                        >
                            <div className="bg-[#13151B] border border-white/5 rounded-3xl p-8">
                                <h2 className="text-xl font-bold mb-6">Profile Settings</h2>
                                <form onSubmit={handleUpdateDetails} className="space-y-6">
                                    <div className="grid grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-400 mb-2">Weight (kg)</label>
                                            <input
                                                type="number"
                                                value={weight}
                                                onChange={e => setWeight(e.target.value)}
                                                className="w-full bg-[#0B0D12] border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-indigo-500 transition"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-400 mb-2">Meals per Day</label>
                                            <select
                                                value={meals}
                                                onChange={e => setMeals(e.target.value)}
                                                className="w-full bg-[#0B0D12] border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-indigo-500 transition"
                                            >
                                                <option value="3">3 Meals</option>
                                                <option value="4">4 Meals</option>
                                                <option value="5">5 Meals</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-400 mb-2">Activity Level</label>
                                            <select
                                                value={activityLevel}
                                                onChange={e => setActivityLevel(e.target.value)}
                                                className="w-full bg-[#0B0D12] border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-indigo-500 transition"
                                            >
                                                <option value="sedentary">Sedentary</option>
                                                <option value="lightly active">Lightly Active</option>
                                                <option value="moderately active">Moderately Active</option>
                                                <option value="very active">Very Active</option>
                                                <option value="super active">Super Active</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-400 mb-2">Goal</label>
                                            <select
                                                value={goal}
                                                onChange={e => setGoal(e.target.value)}
                                                className="w-full bg-[#0B0D12] border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-indigo-500 transition"
                                            >
                                                <option value="cutting">Cutting</option>
                                                <option value="maintenance">Maintenance</option>
                                                <option value="bulking">Bulking</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-2">Diet Type</label>
                                        <select
                                            value={dietType}
                                            onChange={e => setDietType(e.target.value)}
                                            className="w-full bg-[#0B0D12] border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-indigo-500 transition"
                                        >
                                            <option value="Standard">Standard</option>
                                            <option value="Vegetarian">Vegetarian</option>
                                            <option value="Vegan">Vegan</option>
                                            <option value="Keto">Keto</option>
                                            <option value="Paleo">Paleo</option>
                                        </select>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="w-full bg-indigo-600 text-white p-4 rounded-xl font-bold hover:bg-indigo-500 transition shadow-lg shadow-indigo-600/20 disabled:opacity-50 flex items-center justify-center gap-2"
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                Saving...
                                            </>
                                        ) : (
                                            "Save Changes"
                                        )}
                                    </button>
                                </form>
                            </div>

                            {/* Suggestion Form */}
                            <div className="bg-[#13151B] border border-white/5 rounded-3xl p-8">
                                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                                    <Send className="text-green-500" size={20} /> Send Feedback
                                </h2>
                                <form onSubmit={handleSuggestion} className="space-y-4">
                                    <textarea
                                        value={suggestion}
                                        onChange={e => setSuggestion(e.target.value)}
                                        placeholder="Share your thoughts, suggestions, or report issues..."
                                        className="w-full bg-[#0B0D12] border border-white/10 rounded-xl p-4 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition min-h-[120px] resize-none"
                                    />
                                    <button
                                        type="submit"
                                        disabled={isSubmitting || !suggestion.trim()}
                                        className="w-full bg-green-600 text-white p-4 rounded-xl font-bold hover:bg-green-500 transition shadow-lg shadow-green-600/20 disabled:opacity-50 flex items-center justify-center gap-2"
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                Sending...
                                            </>
                                        ) : (
                                            <>
                                                <Send size={18} /> Submit Feedback
                                            </>
                                        )}
                                    </button>
                                </form>
                            </div>
                        </motion.div>
                    )}

                    {/* PREMIUM TAB */}
                    {activeTab === "premium" && (
                        <motion.div
                            key="premium"
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                            className="bg-[#13151B] border border-white/5 rounded-3xl p-8 max-w-2xl mx-auto text-center"
                        >
                            <div className="flex justify-center mb-6">
                                <div className="bg-indigo-600/20 p-6 rounded-full shadow-[0_0_40px_rgba(79,70,229,0.3)]">
                                    <Zap className="h-12 w-12 text-indigo-400" />
                                </div>
                            </div>
                            <h2 className="text-3xl font-bold mb-4 text-white">Unlock Premium Features</h2>
                            <p className="text-gray-400 mb-8 max-w-md mx-auto">
                                Get advanced AI meal generation, unlimited workout plans, and priority support.
                            </p>

                            <div className="bg-[#0B0D12] rounded-2xl p-6 border border-white/10 mb-8 text-left">
                                <ul className="space-y-4">
                                    <li className="flex items-center gap-3 text-gray-300">
                                        <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center"><span className="text-green-500 text-xs">✓</span></div>
                                        Unlimited AI Meal Plans
                                    </li>
                                    <li className="flex items-center gap-3 text-gray-300">
                                        <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center"><span className="text-green-500 text-xs">✓</span></div>
                                        Detailed Macro Analysis
                                    </li>
                                    <li className="flex items-center gap-3 text-gray-300">
                                        <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center"><span className="text-green-500 text-xs">✓</span></div>
                                        Weekly Progress Reports
                                    </li>
                                </ul>
                            </div>

                            <div className="max-w-xs mx-auto">
                                <MockPaymentButton amount={499} description="Premium Subscription - 1 Month" />
                                <p className="text-xs text-gray-500 mt-4">Simulated payment for prototype. Cancel anytime.</p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>

            {/* Recipe Modal */}
            <AnimatePresence>
                {generatedRecipe && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
                        onClick={() => setGeneratedRecipe(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={e => e.stopPropagation()}
                            className="bg-[#13151B] border border-white/10 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                        >
                            <RecipeCard recipe={generatedRecipe} onClose={() => setGeneratedRecipe(null)} />
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
