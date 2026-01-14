"use client";

import { X, Clock, ShoppingCart, ChefHat } from "lucide-react";

interface Recipe {
    name: string;
    description: string;
    ingredients: string[];
    instructions: string[];
    prep_time: string;
    macros: {
        protein: number;
        fat: number;
        carbs: number;
        calories: number;
    };
}

interface RecipeCardProps {
    recipe: Recipe;
    onClose: () => void;
}

export default function RecipeCard({ recipe, onClose }: RecipeCardProps) {
    return (
        <div className="relative">
            {/* Header */}
            <div className="p-6 border-b border-white/10 bg-gradient-to-r from-indigo-900/30 to-purple-900/30 rounded-t-3xl">
                <div className="flex justify-between items-start">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <ChefHat className="text-indigo-400" size={20} />
                            <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">AI Generated</span>
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-1">{recipe.name}</h2>
                        <p className="text-gray-400 text-sm flex items-center gap-2">
                            {recipe.description}
                            <span className="flex items-center gap-1 text-indigo-300">
                                <Clock size={14} /> {recipe.prep_time}
                            </span>
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-white transition p-2 hover:bg-white/10 rounded-full"
                    >
                        <X size={24} />
                    </button>
                </div>
            </div>

            <div className="p-6 space-y-6">
                {/* Macros Grid */}
                <div className="grid grid-cols-4 gap-3">
                    <div className="text-center bg-[#0B0D12] rounded-xl p-4 border border-white/5">
                        <p className="text-xs text-gray-500 uppercase mb-1">Calories</p>
                        <p className="text-xl font-bold text-cyan-400">{recipe.macros.calories}</p>
                    </div>
                    <div className="text-center bg-[#0B0D12] rounded-xl p-4 border border-white/5">
                        <p className="text-xs text-gray-500 uppercase mb-1">Protein</p>
                        <p className="text-xl font-bold text-violet-400">{recipe.macros.protein}g</p>
                    </div>
                    <div className="text-center bg-[#0B0D12] rounded-xl p-4 border border-white/5">
                        <p className="text-xs text-gray-500 uppercase mb-1">Carbs</p>
                        <p className="text-xl font-bold text-yellow-400">{recipe.macros.carbs}g</p>
                    </div>
                    <div className="text-center bg-[#0B0D12] rounded-xl p-4 border border-white/5">
                        <p className="text-xs text-gray-500 uppercase mb-1">Fat</p>
                        <p className="text-xl font-bold text-orange-400">{recipe.macros.fat}g</p>
                    </div>
                </div>

                {/* Content Grid */}
                <div className="grid md:grid-cols-2 gap-6">
                    {/* Ingredients */}
                    <div className="bg-[#0B0D12] rounded-2xl p-5 border border-white/5">
                        <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                            <ShoppingCart className="text-green-400" size={18} />
                            Ingredients
                        </h3>
                        <ul className="space-y-2">
                            {recipe.ingredients.map((ing, i) => (
                                <li key={i} className="flex items-start text-sm text-gray-300">
                                    <span className="w-2 h-2 rounded-full bg-indigo-500 mr-3 mt-1.5 flex-shrink-0"></span>
                                    {ing}
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Instructions */}
                    <div className="bg-[#0B0D12] rounded-2xl p-5 border border-white/5">
                        <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                            <ChefHat className="text-purple-400" size={18} />
                            Instructions
                        </h3>
                        <ol className="space-y-3">
                            {recipe.instructions.map((step, i) => (
                                <li key={i} className="flex gap-3 text-sm">
                                    <span className="flex-shrink-0 w-6 h-6 bg-indigo-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                                        {i + 1}
                                    </span>
                                    <span className="text-gray-300 pt-0.5">{step}</span>
                                </li>
                            ))}
                        </ol>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-white/5 flex justify-end">
                <button
                    onClick={onClose}
                    className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-500 transition shadow-lg shadow-indigo-600/20"
                >
                    Close Recipe
                </button>
            </div>
        </div>
    );
}
