
import Link from 'next/link';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-white">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm lg:flex">
        <h1 className="text-6xl font-bold mb-8">Balance Bite</h1>
      </div>
      <p className="text-xl mb-12 text-center max-w-2xl">
        Your personal wellness companion. Track meals, workouts, and achieve your health goals with AI-driven insights.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Link href="/login" className="px-8 py-4 bg-white text-indigo-600 rounded-lg text-xl font-semibold shadow-lg hover:bg-gray-100 transition duration-300 text-center">
          Login
        </Link>
        <Link href="/signup" className="px-8 py-4 bg-transparent border-2 border-white text-white rounded-lg text-xl font-semibold hover:bg-white hover:text-indigo-600 transition duration-300 text-center">
          Sign Up
        </Link>
      </div>

    </main>
  );
}
