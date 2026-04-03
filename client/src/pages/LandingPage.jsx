import React from 'react';
import { BrainCircuit, ArrowRight, ShieldCheck, TrendingUp, BarChart2 } from 'lucide-react';

const LandingPage = ({ onNavigate }) => {
    return (
        <div className="min-h-screen bg-[#0f172a] text-white font-sans overflow-x-hidden">

            {/* Navbar */}
            <nav className="fixed top-0 w-full z-50 bg-[#0f172a]/80 backdrop-blur-lg border-b border-slate-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-20">
                        <div className="flex items-center gap-2">
                            <BrainCircuit className="h-8 w-8 text-blue-400" />
                            <span className="text-2xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-300">
                                TradeMorph
                            </span>
                        </div>
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => onNavigate('login', false)}
                                className="text-slate-300 hover:text-white font-medium transition-colors"
                            >
                                Log In
                            </button>
                            <button
                                onClick={() => onNavigate('login', true)}
                                className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-6 rounded-full transition-all shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:shadow-[0_0_30px_rgba(37,99,235,0.5)]"
                            >
                                Sign Up
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <main className="pt-32 pb-16 sm:pt-40 sm:pb-24 lg:pb-32 px-4">
                <div className="max-w-7xl mx-auto text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-800/50 border border-slate-700 text-blue-400 mb-8 animate-fade-in-up">
                        <span className="flex h-2 w-2 rounded-full bg-blue-500 animate-pulse"></span>
                        Behavioral Insight Engine v2.0 Live
                    </div>

                    <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tight mb-8 leading-tight animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                        Trade Smarter with <br />
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-cyan-300 to-blue-500">
                            AI-Powered Psychology
                        </span>
                    </h1>

                    <p className="mt-4 max-w-2xl text-xl text-slate-400 mx-auto mb-12 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                        Don't let emotions dictate your trades. TradeMorph analyzes market sentiment, ROI, and your trading behavior to prevent emotional trading and maximize profits.
                    </p>

                    <div className="flex justify-center gap-6 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
                        <button
                            onClick={() => onNavigate('login', true)}
                            className="group flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-lg py-4 px-8 rounded-full transition-all shadow-[0_0_40px_rgba(37,99,235,0.4)] hover:shadow-[0_0_60px_rgba(37,99,235,0.6)]"
                        >
                            Start Trading Free
                            <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>
                </div>

                {/* Feature Dashboard Preview */}
                <div className="mt-24 max-w-6xl mx-auto animate-fade-in-up relative" style={{ animationDelay: '0.5s' }}>
                    {/* Glow Effect behind image */}
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 blur-[100px] -z-10 rounded-[3rem]"></div>

                    <div className="bg-slate-900 border border-slate-700 rounded-2xl p-2 sm:p-4 shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-cyan-400 to-blue-500"></div>
                        <div className="bg-[#0f172a] rounded-xl border border-slate-800 p-8 flex flex-col items-center justify-center min-h-[400px]">
                            <BarChart2 className="w-24 h-24 text-slate-700 mb-4" />
                            <h3 className="text-2xl font-bold text-slate-500">Advanced Terminal Interface</h3>
                            <p className="text-slate-600 max-w-md text-center mt-2">Real-time charts, predictive AI models, and portfolio tracking in one seamless dashboard.</p>
                        </div>
                    </div>
                </div>
            </main>

            {/* Features Grid */}
            <section className="py-24 bg-slate-900/50 border-t border-slate-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl sm:text-4xl font-bold">Why choose TradeMorph?</h2>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {/* Feature 1 */}
                        <div className="bg-slate-800/50 border border-slate-700 p-8 rounded-2xl hover:bg-slate-800 transition-colors">
                            <div className="h-14 w-14 bg-blue-500/20 rounded-xl flex items-center justify-center mb-6 border border-blue-500/30">
                                <TrendingUp className="h-7 w-7 text-blue-400" />
                            </div>
                            <h3 className="text-xl font-bold mb-3">Real-Time Analytics</h3>
                            <p className="text-slate-400">Track 100+ indicators instantly. Our engine crunches market data so you don't have to.</p>
                        </div>

                        {/* Feature 2 */}
                        <div className="bg-slate-800/50 border border-slate-700 p-8 rounded-2xl hover:bg-slate-800 transition-colors relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-10">
                                <BrainCircuit className="h-32 w-32" />
                            </div>
                            <div className="h-14 w-14 bg-orange-500/20 rounded-xl flex items-center justify-center mb-6 border border-orange-500/30">
                                <BrainCircuit className="h-7 w-7 text-orange-400" />
                            </div>
                            <h3 className="text-xl font-bold mb-3">Behavioral AI Alerts</h3>
                            <p className="text-slate-400">Our Python-powered AI detects FOMO and panic selling before you click confirm, saving your portfolio.</p>
                        </div>

                        {/* Feature 3 */}
                        <div className="bg-slate-800/50 border border-slate-700 p-8 rounded-2xl hover:bg-slate-800 transition-colors">
                            <div className="h-14 w-14 bg-green-500/20 rounded-xl flex items-center justify-center mb-6 border border-green-500/30">
                                <ShieldCheck className="h-7 w-7 text-green-400" />
                            </div>
                            <h3 className="text-xl font-bold mb-3">Risk-Free Paper Trading</h3>
                            <p className="text-slate-400">Test strategies with ₹100,000 in virtual funds. Master the market without risking real capital.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t border-slate-800 py-12 text-center text-slate-500">
                <div className="flex items-center justify-center gap-2 mb-4">
                    <BrainCircuit className="h-5 w-5" />
                    <span className="font-bold text-slate-300">TradeMorph</span>
                </div>
                <p>&copy; {new Date().getFullYear()} TradeMorph. All rights reserved.</p>
            </footer>
        </div>
    );
};

export default LandingPage;
