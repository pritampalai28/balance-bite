"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import { motion, useScroll, useTransform, Variants } from "framer-motion";
import { ArrowRight, ChefHat, Activity, BarChart3, PieChart, Sparkles } from "lucide-react";
import { useRef } from "react";

// --- Animation Variants ---
const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: "easeOut" }
  }
};

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2
    }
  }
};

const floatAnimation: Variants = {
  animate: {
    y: [0, -15, 0],
    transition: {
      duration: 5,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};

export default function Home() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"]
  });

  const heroY = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  return (
    <div className="min-h-screen bg-[#0B0D12] text-white overflow-hidden selection:bg-indigo-500/30">
      <Navbar />

      {/* Hero Section with Parallax & Spotlight */}
      <section ref={ref} className="relative pt-32 pb-32 lg:pt-48 lg:pb-40 overflow-hidden">
        {/* Dynamic Background */}
        <div className="absolute inset-0 -z-10 bg-[#0B0D12]">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/20 via-[#0B0D12] to-[#0B0D12] opacity-70" />
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.1, 0.2, 0.1],
              rotate: [0, 10, -10, 0]
            }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
            className="absolute -top-20 -right-20 w-[600px] h-[600px] bg-indigo-600 rounded-full blur-[120px] opacity-20 mix-blend-screen"
          />
          <motion.div
            animate={{
              scale: [1.2, 1, 1.2],
              opacity: [0.1, 0.3, 0.1],
              x: [0, 50, 0]
            }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute top-40 -left-20 w-[500px] h-[500px] bg-purple-600 rounded-full blur-[120px] opacity-20 mix-blend-screen"
          />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="max-w-4xl mx-auto"
          >
            <motion.div variants={fadeInUp} className="flex justify-center mb-6">
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 backdrop-blur-md border border-white/10 text-indigo-300 text-sm font-semibold shadow-lg shadow-indigo-500/10">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                <span>AI-Powered Nutrition V2.0 is Live</span>
              </span>
            </motion.div>

            <motion.h1
              variants={fadeInUp}
              className="text-6xl md:text-8xl font-extrabold text-white tracking-tight mb-8 leading-tight"
            >
              Master Your Macros with <br />
              <span className="relative inline-block">
                <span className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 blur-3xl opacity-20"></span>
                <span className="relative text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 animate-gradient-x">
                  AI Precision
                </span>
              </span>
            </motion.h1>

            <motion.p
              variants={fadeInUp}
              className="text-xl md:text-2xl text-gray-400 mb-12 leading-relaxed max-w-2xl mx-auto"
            >
              Stop guessing. Start transforming. Whether cutting, bulking, or maintaining—let our intelligent chef generate the perfect meal plan for your body.
            </motion.p>

            <motion.div
              variants={fadeInUp}
              className="flex flex-col sm:flex-row justify-center gap-5"
            >
              <Link href="/signup">
                <motion.button
                  whileHover={{ scale: 1.05, boxShadow: "0 0 30px rgba(79, 70, 229, 0.4)" }}
                  whileTap={{ scale: 0.95 }}
                  className="w-full sm:w-auto bg-indigo-600 text-white px-8 py-5 rounded-full font-bold text-lg transition-all relative overflow-hidden group shadow-[0_0_20px_rgba(79,70,229,0.3)]"
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    Start Free Trial <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="absolute top-0 -left-full w-full h-full bg-white/20 skew-x-12 group-hover:animate-shine" />
                </motion.button>
              </Link>
              <Link href="#features">
                <motion.button
                  whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.1)" }}
                  whileTap={{ scale: 0.95 }}
                  className="w-full sm:w-auto bg-white/5 text-white px-8 py-5 rounded-full font-bold text-lg border border-white/10 hover:border-white/20 transition-all backdrop-blur-sm"
                >
                  How it Works
                </motion.button>
              </Link>
            </motion.div>
          </motion.div>

          {/* 3D Floating Dashboard Preview */}
          <motion.div
            style={{ y: heroY, opacity: heroOpacity }}
            initial={{ opacity: 0, rotateX: 20, y: 100 }}
            animate={{ opacity: 1, rotateX: 0, y: 0 }}
            transition={{ delay: 0.5, duration: 1.2, type: "spring" }}
            className="mt-24 mx-auto max-w-6xl relative perspective-1000"
          >
            <div className="relative rounded-2xl shadow-2xl shadow-indigo-500/10 bg-[#13151b] p-2 md:p-4 border border-white/10 rotate-x-12 hover:rotate-x-0 transition-transform duration-700 ease-out">
              {/* Screen Glare */}
              <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent pointer-events-none rounded-xl z-20" />

              {/* Content Mockup with Real Image */}
              <div className="aspect-[16/10] bg-gray-950 rounded-lg overflow-hidden relative group">
                <img
                  src="/dashboard-preview.png"
                  alt="BalanceBite Dashboard"
                  className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                />

                {/* Overlay Text */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300 bg-black/60 backdrop-blur-[2px]">
                  <motion.div
                    variants={floatAnimation}
                    animate="animate"
                    className="text-center"
                  >
                    <PieChart className="h-24 w-24 text-indigo-400 mx-auto mb-4 drop-shadow-[0_0_15px_rgba(129,140,248,0.5)]" />
                    <p className="text-white text-lg font-medium tracking-wide drop-shadow-md">Interactive Dashboard Experience</p>
                  </motion.div>
                </div>
              </div>
            </div>

            {/* Background Glows under dashboard */}
            <div className="absolute -inset-4 bg-indigo-500/20 blur-[60px] -z-10 rounded-[50%]" />
          </motion.div>
        </div>
      </section>

      {/* Feature Section with Cards */}
      <section id="features" className="py-32 bg-[#0B0D12] relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-4xl md:text-5xl font-black text-white mb-6">Why BalanceBite?</h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">We combine cutting-edge AI with nutritional science to deliver plans that actually work.</p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="grid md:grid-cols-3 gap-8"
          >
            {/* Feature 1 */}
            <motion.div
              variants={fadeInUp}
              whileHover={{ y: -10, transition: { duration: 0.2 } }}
              className="p-10 rounded-3xl bg-white/5 border border-white/5 shadow-[0_10px_40px_-15px_rgba(0,0,0,0.5)] hover:bg-white/10 hover:border-indigo-500/30 transition-all group"
            >
              <div className="w-16 h-16 rounded-2xl bg-indigo-600/20 flex items-center justify-center mb-8 shadow-lg shadow-indigo-600/10 group-hover:scale-110 transition-transform duration-300">
                <ChefHat className="h-8 w-8 text-indigo-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-indigo-400 transition-colors">AI Chef</h3>
              <p className="text-gray-400 leading-relaxed">
                Forget generic recipes. Our AI creates unique meals based on your leftovers, preferences, and exact macro targets instantly.
              </p>
            </motion.div>

            {/* Feature 2 */}
            <motion.div
              variants={fadeInUp}
              whileHover={{ y: -10, transition: { duration: 0.2 } }}
              className="p-10 rounded-3xl bg-white/5 border border-white/5 shadow-[0_10px_40px_-15px_rgba(0,0,0,0.5)] hover:bg-white/10 hover:border-purple-500/30 transition-all group"
            >
              <div className="w-16 h-16 rounded-2xl bg-purple-600/20 flex items-center justify-center mb-8 shadow-lg shadow-purple-600/10 group-hover:scale-110 transition-transform duration-300">
                <Activity className="h-8 w-8 text-purple-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-purple-400 transition-colors">Smart Tracking</h3>
              <p className="text-gray-400 leading-relaxed">
                Dynamic metabolic adjustment. As you lose weight or gain muscle, our algorithms adjust your daily targets automatically.
              </p>
            </motion.div>

            {/* Feature 3 */}
            <motion.div
              variants={fadeInUp}
              whileHover={{ y: -10, transition: { duration: 0.2 } }}
              className="p-10 rounded-3xl bg-white/5 border border-white/5 shadow-[0_10px_40px_-15px_rgba(0,0,0,0.5)] hover:bg-white/10 hover:border-pink-500/30 transition-all group"
            >
              <div className="w-16 h-16 rounded-2xl bg-pink-600/20 flex items-center justify-center mb-8 shadow-lg shadow-pink-600/10 group-hover:scale-110 transition-transform duration-300">
                <BarChart3 className="h-8 w-8 text-pink-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-pink-400 transition-colors">Visual Analytics</h3>
              <p className="text-gray-400 leading-relaxed">
                Track your consistency with beautiful heatmaps and ring charts. Export professional PDF reports for your coach.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>



      {/* Pricing Section */}
      <section id="pricing" className="py-32 bg-[#0B0D12] relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-600/5 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-4xl md:text-5xl font-black text-white mb-6">Simple, Transparent Pricing</h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">Choose the plan that fits your goals. Upgrade or cancel anytime.</p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={staggerContainer}
            className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto"
          >
            {/* Free Plan */}
            <motion.div
              variants={fadeInUp}
              className="p-8 rounded-3xl bg-white/5 border border-white/5 hover:border-white/10 transition-all flex flex-col"
            >
              <div className="mb-8">
                <h3 className="text-xl font-bold text-gray-300 mb-2">Starter</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black text-white">$0</span>
                  <span className="text-gray-500">/month</span>
                </div>
                <p className="text-gray-400 mt-4 text-sm">Perfect for tracking basic macros and logging meals.</p>
              </div>

              <ul className="space-y-4 mb-8 flex-1">
                {['Basic Macro Tracking', 'Library of 100+ Recipes', 'Weight Logging', 'Community Support'].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-gray-300 text-sm">
                    <div className="w-5 h-5 rounded-full bg-indigo-500/20 flex items-center justify-center flex-shrink-0">
                      <span className="text-indigo-400 text-xs">✓</span>
                    </div>
                    {item}
                  </li>
                ))}
              </ul>

              <Link href="/signup" className="block">
                <button className="w-full py-4 rounded-xl border border-white/10 text-white font-bold hover:bg-white/5 transition">
                  Get Started Free
                </button>
              </Link>
            </motion.div>

            {/* Pro Plan (Highlighted) */}
            <motion.div
              variants={fadeInUp}
              className="p-8 rounded-3xl bg-gradient-to-b from-indigo-900/20 to-white/5 border border-indigo-500/30 hover:border-indigo-500/50 transition-all flex flex-col relative shadow-[0_0_40px_rgba(79,70,229,0.15)] transform scale-105 z-10"
            >
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-indigo-600 text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wide shadow-lg">
                Most Popular
              </div>

              <div className="mb-8">
                <h3 className="text-xl font-bold text-indigo-300 mb-2">Pro</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black text-white">$19</span>
                  <span className="text-gray-500">/month</span>
                </div>
                <p className="text-indigo-200/60 mt-4 text-sm">Level up with AI-powered meal plans and analytics.</p>
              </div>

              <ul className="space-y-4 mb-8 flex-1">
                {['Everything in Starter', 'Unlimited AI Meal Generation', 'Advanced Analytics & Heatmaps', 'Weekly Progress Reports', 'Priority Support'].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-white text-sm">
                    <div className="w-5 h-5 rounded-full bg-indigo-500 flex items-center justify-center flex-shrink-0 shadow-lg shadow-indigo-500/30">
                      <span className="text-white text-xs">✓</span>
                    </div>
                    {item}
                  </li>
                ))}
              </ul>

              <Link href="/signup" className="block">
                <button className="w-full py-4 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-500 transition shadow-lg shadow-indigo-600/25">
                  Try Pro Free
                </button>
              </Link>
            </motion.div>

            {/* Elite Plan */}
            <motion.div
              variants={fadeInUp}
              className="p-8 rounded-3xl bg-white/5 border border-white/5 hover:border-purple-500/30 transition-all flex flex-col group"
            >
              <div className="mb-8">
                <h3 className="text-xl font-bold text-purple-300 mb-2">Elite</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black text-white">$49</span>
                  <span className="text-gray-500">/month</span>
                </div>
                <p className="text-gray-400 mt-4 text-sm">For athletes who demand precision and 1:1 coaching.</p>
              </div>

              <ul className="space-y-4 mb-8 flex-1">
                {['Everything in Pro', '1-on-1 Nutritionist Chat', 'Personalized Workout Plans', 'DNA-Based Logic', 'Early Access to Features'].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-gray-300 text-sm">
                    <div className="w-5 h-5 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0 group-hover:bg-purple-500/30 transition">
                      <span className="text-purple-400 text-xs">✓</span>
                    </div>
                    {item}
                  </li>
                ))}
              </ul>

              <Link href="/signup" className="block">
                <button className="w-full py-4 rounded-xl border border-white/10 text-white font-bold hover:bg-white/5 hover:border-purple-500/30 transition">
                  Contact Sales
                </button>
              </Link>
            </motion.div>

          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-indigo-950/20 -z-20" />
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-900/20 to-purple-900/20 -z-10" />
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-white mb-8">Ready to transform your diet?</h2>
          <Link href="/signup">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-white text-gray-900 px-10 py-4 rounded-full font-bold text-lg shadow-[0_0_30px_rgba(255,255,255,0.1)] hover:shadow-[0_0_50px_rgba(255,255,255,0.2)] transition-shadow"
            >
              Get Started Now
            </motion.button>
          </Link>
        </div>
      </section>

      <Footer />
    </div >
  );
}
