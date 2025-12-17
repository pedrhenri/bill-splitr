import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: "Bill Splitr - The Easiest Way to Split Expenses",
  description: "Manage shared expenses for travel, roommates, and groups. Track bills, settle debts, and split costs fairly without the math.",
  openGraph: {
    title: "Bill Splitr - Split Expenses Fairness",
    description: "The modern way to track shared expenses and settle debts with friends and roommates.",
    type: 'website',
  },
};

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Navbar */}
      <header className="border-b border-gray-100 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-black text-primary bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary-light">
              Bill Splitr
            </span>
          </div>
          <nav className="flex items-center gap-6">
            <Link href="/dashboard" className="text-sm font-medium text-gray-600 hover:text-primary transition-colors">
              Sign In
            </Link>
            <Link
              href="/dashboard"
              className="px-5 py-2.5 text-sm font-bold text-white bg-primary rounded-full hover:bg-primary-dark transition-all transform hover:scale-105 shadow-lg shadow-primary/20"
            >
              Get Started
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative pt-20 pb-32 overflow-hidden">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/10 via-white to-white"></div>
          <div className="px-6 mx-auto max-w-7xl text-center">
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-gray-900 mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
              Split bills <span className="text-primary">without the math.</span>
            </h1>
            <p className="max-w-2xl mx-auto text-xl text-gray-600 mb-10 leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-1000">
              Stop fighting over spreadsheets. Bill Splitr helps roommates, travelers, and couples track shared expenses and settle up stress-free.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
              <Link
                href="/dashboard"
                className="w-full sm:w-auto px-8 py-4 text-lg font-bold text-white bg-primary rounded-xl hover:bg-primary-dark transition-all shadow-xl shadow-primary/30"
              >
                Start Splitting for Free
              </Link>
              <a
                href="#features"
                className="w-full sm:w-auto px-8 py-4 text-lg font-bold text-gray-700 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all border border-gray-200"
              >
                How it works
              </a>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-24 bg-gray-50">
          <div className="px-6 mx-auto max-w-7xl">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl mb-4">Everything you need to stay fair</h2>
              <p className="text-gray-500 text-lg">Powerful features wrapped in a simple design.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-6 text-blue-600">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Group Management</h3>
                <p className="text-gray-500 leading-relaxed">Create groups for trips, households, or events. Add friends and start tracking expenses instantly.</p>
              </div>

              {/* Feature 2 */}
              <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-6 text-green-600">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Smart Settlements</h3>
                <p className="text-gray-500 leading-relaxed">The algorithm calculates the most efficient way for everyone to pay back, minimizing transactions.</p>
              </div>

              {/* Feature 3 */}
              <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-6 text-purple-600">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Expense Tracking</h3>
                <p className="text-gray-500 leading-relaxed">Log expenses in seconds. Split equally, unequally, or by shares. Keep a history of all payments.</p>
              </div>
            </div>
          </div>
        </section>

        {/* SEO Content Section */}
        <section className="py-24 bg-white">
          <div className="px-6 mx-auto max-w-4xl text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Why use a Bill Splitter?</h2>
            <div className="prose prose-lg mx-auto text-gray-600">
              <p>
                Tracking shared expenses can be a hassle. Whether you are splitting rent with roommates, planning a group vacation, or managing couple finances, manual calculations are prone to errors and awkward conversations.
              </p>
              <p className="mt-4">
                Bill Splitr is the <strong>best free app to split bills</strong> online. We ensure everyone pays their fair share with transparent expense tracking and automatic debt calculation. No more "I'll Venmo you later" without a record.
              </p>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-gray-50 border-t border-gray-200 py-12">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center text-gray-500 text-sm">
          <p>&copy; {new Date().getFullYear()} Bill Splitr. All rights reserved.</p>
          <div className="flex gap-6 mt-4 md:mt-0">
            <Link href="/dashboard" className="hover:text-gray-900">Login</Link>
            <Link href="#" className="hover:text-gray-900">Privacy Policy</Link>
            <Link href="#" className="hover:text-gray-900">Terms of Service</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
