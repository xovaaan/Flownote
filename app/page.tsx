import Link from "next/link";
import { SignInButton, Show } from "@clerk/nextjs";
import { Mic, Sparkles, Search, Lock, MessageSquare, FileText, ChevronRight, Play, CheckCircle2, Zap, BarChart2, Briefcase, Users, Laptop } from "lucide-react";
import { FaqAccordion } from "@/components/faq-accordion";
import { LandingBarChart, LandingLineChart } from "@/components/landing-charts";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#F9FAFB] overflow-hidden text-ink-900 font-sans selection:bg-ink-900 selection:text-white">
      {/* GLOBAL NAVBAR */}
      <div className="sticky top-0 z-50 px-4 md:px-8 py-4 w-full">
        <nav className="flex items-center justify-between px-6 py-3 max-w-7xl mx-auto w-full bg-white/70 backdrop-blur-xl border border-white/50 shadow-sm rounded-2xl animate-fade-in-up">
          <div className="flex items-center gap-2">
            <img src="/note.png" alt="Flownote" className="w-6 h-6 object-contain" />
            <span className="font-bold text-xl tracking-tight text-ink-950">Flownote</span>
          </div>
          <div className="flex items-center gap-6">
            <Show when="signed-out">
              <SignInButton mode="modal">
                <button className="text-sm font-semibold text-ink-600 hover:text-ink-900 transition-colors">Log in</button>
              </SignInButton>
              <SignInButton mode="modal">
                <button className="text-sm font-bold bg-ink-950 text-white px-5 py-2 rounded-full hover:bg-ink-900 transition-all shadow-sm">Get Started</button>
              </SignInButton>
            </Show>
            <Show when="signed-in">
              <Link href="/dashboard" className="text-sm font-bold bg-ink-950 text-white px-5 py-2 rounded-full hover:bg-ink-900 transition-all shadow-sm">Dashboard</Link>
            </Show>
          </div>
        </nav>
      </div>

      <main className="flex-1 flex flex-col">
        {/* HERO SECTION */}
        <section className="px-6 pt-24 pb-20 text-center max-w-4xl mx-auto space-y-8 relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-gray-200/40 via-gray-100/40 to-transparent blur-3xl rounded-full -z-10 pointer-events-none" />

          <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-md border border-gray-200 text-ink-700 px-4 py-1.5 rounded-full text-xs font-semibold shadow-sm animate-fade-in-up uppercase tracking-widest">
            <img src="/note.png" alt="AI" className="w-3.5 h-3.5 object-contain" /> Flownote 2.0 is live
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-ink-950 leading-[1.1] animate-fade-in-up" style={{ animationDelay: '100ms' }}>
            The professional's choice for <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-600 to-ink-950">meeting intelligence.</span>
          </h1>
          
          <p className="text-lg md:text-xl text-ink-500 max-w-2xl mx-auto leading-relaxed animate-fade-in-up font-medium" style={{ animationDelay: '200ms' }}>
            Capture system audio natively. Annotate in real-time. Search across weeks of conversations. Your private knowledge base, built effortlessly.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6 animate-fade-in-up" style={{ animationDelay: '300ms' }}>
            <Show when="signed-out">
              <SignInButton mode="modal">
                <button className="bg-ink-950 text-white px-8 py-3.5 rounded-full text-base font-semibold hover:bg-ink-900 transition-all shadow-lg hover:shadow-xl active:scale-95 flex items-center gap-2">
                  Start for free <ChevronRight className="w-4 h-4" />
                </button>
              </SignInButton>
            </Show>
            <Show when="signed-in">
              <Link href="/dashboard" className="bg-ink-950 text-white px-8 py-3.5 rounded-full text-base font-semibold hover:bg-ink-900 transition-all shadow-lg hover:shadow-xl active:scale-95 flex items-center gap-2">
                Go to Dashboard <ChevronRight className="w-4 h-4" />
              </Link>
            </Show>
          </div>
        </section>

        {/* MOCKUP SECTION */}
        <section className="px-4 md:px-8 pb-32 max-w-6xl mx-auto w-full animate-fade-in-up" style={{ animationDelay: '400ms' }}>
          <div className="bg-white rounded-[2rem] border border-gray-200 shadow-2xl p-2 group">
            <div className="bg-gray-50 rounded-[1.5rem] border border-gray-100 aspect-[16/10] md:aspect-video flex flex-col items-center justify-center relative overflow-hidden shadow-inner">
              <div className="absolute top-0 w-full h-12 bg-white/40 backdrop-blur-md border-b border-white/20 flex items-center px-6 gap-2 z-20">
                <div className="flex gap-1.5"><div className="w-3 h-3 rounded-full bg-red-400" /><div className="w-3 h-3 rounded-full bg-yellow-400" /><div className="w-3 h-3 rounded-full bg-green-400" /></div>
              </div>
              <img src="/ss.png" alt="Flownote Analytics Dashboard" className="absolute inset-0 w-full h-full object-cover rounded-[1.5rem] object-top opacity-95 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>
        </section>

        {/* LOGOS / SOCIAL PROOF */}
        <section className="py-12 border-y border-gray-200 bg-white text-center">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-8">Trusted by teams at</p>
          <div className="flex flex-wrap justify-center items-center gap-12 md:gap-24 opacity-50 grayscale">
            <div className="font-bold text-xl tracking-tighter">ACME Corp</div>
            <div className="font-black text-xl italic">Globex</div>
            <div className="font-semibold text-xl tracking-widest">INITECH</div>
            <div className="font-bold text-xl">Soylent</div>
            <div className="font-medium text-xl tracking-tight">Hooli</div>
          </div>
        </section>

        {/* FEATURE: ENHANCE YOUR MEETING */}
        <section className="py-32 px-4 md:px-8 bg-white border-y border-gray-200">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <div className="order-2 md:order-1 relative group">
              <div className="absolute inset-0 bg-gradient-to-tr from-gray-200 to-transparent rounded-[2rem] transform translate-y-4 translate-x-4 -z-10 group-hover:translate-y-6 group-hover:translate-x-6 transition-transform duration-500" />
              <div className="bg-gradient-to-br from-ink-950 to-ink-900 text-white rounded-[2rem] p-10 border border-ink-800 shadow-2xl relative overflow-hidden">
                <div className="relative z-10 space-y-6">
                  <div className="flex items-center gap-4 border-b border-white/10 pb-4">
                    <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center">
                      <Mic className="w-5 h-5 text-gray-300" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-gray-300">Live Recording</div>
                      <div className="text-xs text-gray-500">System Audio • In Progress</div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                      <p className="text-sm font-medium text-gray-200">- Discussed Q3 pipeline</p>
                      <p className="text-sm font-medium text-gray-200">- Need to hire 2 engineers</p>
                    </div>
                    <div className="flex justify-center">
                      <img src="/note.png" alt="AI" className="w-6 h-6 object-contain brightness-0 invert animate-pulse" />
                    </div>
                    <div className="bg-white/10 rounded-xl p-6 border border-white/20 shadow-inner">
                      <h4 className="font-bold mb-2">Meeting Summary</h4>
                      <p className="text-sm text-gray-300 leading-relaxed">The team agreed to expand the engineering org by two headcounts to support the Q3 pipeline rollout. HR will open the reqs tomorrow.</p>
                    </div>
                  </div>
                </div>
                <div className="absolute -bottom-12 -right-12 w-64 h-64 bg-gray-600 rounded-full mix-blend-screen filter blur-[4rem] opacity-30 pointer-events-none" />
              </div>
            </div>
            <div className="order-1 md:order-2 space-y-6">
              <div className="inline-flex items-center gap-2 bg-gray-100 text-ink-700 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest">
                <img src="/note.png" alt="AI" className="w-3.5 h-3.5 object-contain opacity-70" /> AI Enhance
              </div>
              <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-ink-950 leading-[1.1]">Enhance your Meeting.</h2>
              <p className="text-xl text-ink-500 leading-relaxed font-medium">
                Type shorthand notes during your call. When you finish, Flownote's AI weaves the raw transcript with your jots into a perfectly formatted, structured document automatically.
              </p>
            </div>
          </div>
        </section>

        {/* FEATURE: CHAT WITH YOUR MEETING */}
        <section className="py-32 px-4 md:px-8 bg-gray-50">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 bg-white border border-gray-200 text-ink-700 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest shadow-sm">
                <MessageSquare className="w-3.5 h-3.5" /> Contextual AI
              </div>
              <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-ink-950 leading-[1.1]">Chat with your meeting.</h2>
              <p className="text-xl text-ink-500 leading-relaxed font-medium">
                Stop skimming transcripts. Chat directly with the context of a single meeting to extract action items, summaries, and key decisions instantly.
              </p>
            </div>
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-tl from-gray-200 to-transparent rounded-[2rem] transform translate-y-4 -translate-x-4 -z-10 group-hover:translate-y-6 group-hover:-translate-x-6 transition-transform duration-500" />
              <div className="bg-white rounded-[2rem] p-8 border border-gray-200 shadow-xl relative overflow-hidden">
                <div className="space-y-6">
                  <div className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-ink-900 text-white flex items-center justify-center font-bold text-xs shrink-0">You</div>
                    <div className="bg-gray-100 rounded-2xl rounded-tl-none p-4 text-sm font-medium text-ink-800">
                      What did we decide about the new marketing budget?
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center shrink-0 border border-gray-200"><img src="/note.png" alt="AI" className="w-4 h-4 object-contain opacity-80" /></div>
                    <div className="bg-white border border-gray-200 shadow-sm rounded-2xl rounded-tl-none p-4 text-sm font-medium text-ink-600 leading-relaxed">
                      Sarah approved a 15% increase for Q3, specifically allocating $50k towards the new LinkedIn ad campaign. John is responsible for drafting the brief by Friday.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FEATURE: SEARCH ACROSS MEETING */}
        <section className="py-32 px-4 md:px-8 bg-white border-y border-gray-200">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <div className="order-2 md:order-1 relative group">
              <div className="absolute inset-0 bg-gradient-to-tr from-gray-200 to-transparent rounded-[2rem] transform translate-y-4 translate-x-4 -z-10 group-hover:translate-y-6 group-hover:translate-x-6 transition-transform duration-500" />
              <div className="bg-gray-50 rounded-[2rem] p-10 border border-gray-200 shadow-xl relative overflow-hidden">
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 text-sm font-medium text-ink-700">
                  <div className="flex items-center gap-3 text-ink-400 mb-6 pb-4 border-b border-gray-100">
                    <Search className="w-5 h-5 text-ink-900" /> <span className="text-lg">What were the main blockers for Project X?</span>
                  </div>
                  <div className="space-y-4">
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                      <div className="text-xs text-gray-400 mb-2 font-bold uppercase tracking-widest">Found in "Weekly Sync" (Oct 12)</div>
                      <p className="text-ink-600">The API dependency from the core team is delayed by two weeks.</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                      <div className="text-xs text-gray-400 mb-2 font-bold uppercase tracking-widest">Found in "Design Review" (Oct 14)</div>
                      <p className="text-ink-600">We are waiting on final copy approval from Legal.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="order-1 md:order-2 space-y-6">
              <div className="inline-flex items-center gap-2 bg-gray-100 text-ink-700 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest">
                <Search className="w-3.5 h-3.5" /> Semantic Knowledge
              </div>
              <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-ink-950 leading-[1.1]">Search Across Meeting.</h2>
              <p className="text-xl text-ink-500 leading-relaxed font-medium">
                Don't just search for keywords. Ask semantic questions across your entire meeting history to find patterns, decisions, and action items instantly.
              </p>
            </div>
          </div>
        </section>

        {/* FEATURE: DETAILED ANALYTICS */}
        <section className="py-32 px-4 md:px-8 bg-gray-50">
          <div className="max-w-7xl mx-auto flex flex-col items-center text-center">
            <div className="inline-flex items-center gap-2 bg-white border border-gray-200 text-ink-700 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest shadow-sm mb-6">
              <BarChart2 className="w-3.5 h-3.5" /> Data Driven
            </div>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-ink-950 leading-[1.1] mb-6">Detailed Analytics.</h2>
            <p className="text-xl text-ink-500 leading-relaxed font-medium max-w-2xl mb-16">
              Track your meeting activity over time. Visualize the volume of knowledge you are capturing and understand your collaboration patterns at a glance.
            </p>
            
            <div className="w-full bg-white rounded-[2rem] p-8 md:p-12 border border-gray-200 shadow-xl flex flex-col md:flex-row gap-8">
              <div className="flex-1 bg-gray-50/50 rounded-2xl border border-gray-100 p-8">
                <div className="flex justify-between items-end mb-8">
                  <div>
                    <p className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-1">Meetings Recorded</p>
                    <div className="text-3xl font-black text-ink-950">15</div>
                  </div>
                  <div className="text-sm font-bold text-green-600 bg-green-50 px-2 py-1 rounded-md">+20%</div>
                </div>
                <LandingBarChart />
              </div>
              <div className="flex-1 bg-gray-50/50 rounded-2xl border border-gray-100 p-8">
                <div className="flex justify-between items-end mb-8">
                  <div>
                    <p className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-1">Words Captured</p>
                    <div className="text-3xl font-black text-ink-950">4,650</div>
                  </div>
                  <div className="text-sm font-bold text-green-600 bg-green-50 px-2 py-1 rounded-md">+12%</div>
                </div>
                <LandingLineChart />
              </div>
            </div>
          </div>
        </section>

        {/* USE CASES */}
        <section className="py-32 px-4 md:px-8 bg-white border-y border-gray-200">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-20">
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-ink-950 mb-6">Built for professionals.</h2>
              <p className="text-lg text-ink-500 max-w-2xl mx-auto">Flownote adapts to how you work, saving hours of manual documentation every week.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="p-8">
                <Briefcase className="w-10 h-10 text-ink-900 mb-6" />
                <h3 className="text-xl font-bold text-ink-950 mb-3">Product Managers</h3>
                <p className="text-ink-500 leading-relaxed">Turn hour-long user interviews into structured requirement documents in seconds. Never lose track of a feature request again.</p>
              </div>
              <div className="p-8">
                <Users className="w-10 h-10 text-ink-900 mb-6" />
                <h3 className="text-xl font-bold text-ink-950 mb-3">Founders & Executives</h3>
                <p className="text-ink-500 leading-relaxed">Back-to-back meetings without losing context. Search your entire week to remember what you promised to whom.</p>
              </div>
              <div className="p-8">
                <Laptop className="w-10 h-10 text-ink-900 mb-6" />
                <h3 className="text-xl font-bold text-ink-950 mb-3">Sales & Success</h3>
                <p className="text-ink-500 leading-relaxed">Focus on the prospect, not your notepad. Let AI log the pain points and generate follow-up emails automatically.</p>
              </div>
            </div>
          </div>
        </section>

        {/* PRICING */}
        <section className="py-32 px-4 md:px-8 bg-gray-50 relative overflow-hidden">
          <div className="max-w-5xl mx-auto w-full relative z-10">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">Simple, transparent pricing.</h2>
              <p className="text-lg text-ink-500">Start for free. Upgrade when you need more power.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              {/* Free Tier */}
              <div className="bg-white rounded-3xl p-10 border border-gray-200 shadow-sm">
                <h3 className="text-2xl font-bold text-ink-950 mb-2">Basic</h3>
                <p className="text-ink-500 mb-8 text-sm">Perfect for trying it out.</p>
                <div className="text-5xl font-bold text-ink-950 mb-10">$0<span className="text-base text-ink-400 font-normal">/mo</span></div>
                <ul className="space-y-4 mb-10 text-ink-700 font-medium">
                  <li className="flex items-center gap-3"><CheckCircle2 className="w-5 h-5 text-gray-400" /> 10 meetings per month</li>
                  <li className="flex items-center gap-3"><CheckCircle2 className="w-5 h-5 text-gray-400" /> Basic AI enhancement</li>
                  <li className="flex items-center gap-3"><CheckCircle2 className="w-5 h-5 text-gray-400" /> Local recording</li>
                </ul>
                <SignInButton mode="modal">
                  <button className="w-full py-3.5 rounded-xl bg-gray-100 text-ink-900 font-bold hover:bg-gray-200 transition-colors">Get Started</button>
                </SignInButton>
              </div>
              
              {/* Pro Tier */}
              <div className="bg-ink-950 rounded-3xl p-10 border border-ink-800 shadow-xl relative text-white">
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-white text-ink-950 px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest shadow-md">Most Popular</div>
                <h3 className="text-2xl font-bold mb-2">Pro</h3>
                <p className="text-gray-400 mb-8 text-sm">For power users and professionals.</p>
                <div className="text-5xl font-bold mb-10">$15<span className="text-base text-gray-400 font-normal">/mo</span></div>
                <ul className="space-y-4 mb-10 text-gray-200 font-medium">
                  <li className="flex items-center gap-3"><CheckCircle2 className="w-5 h-5 text-gray-500" /> Unlimited meetings</li>
                  <li className="flex items-center gap-3"><CheckCircle2 className="w-5 h-5 text-gray-500" /> Advanced AI models</li>
                  <li className="flex items-center gap-3"><CheckCircle2 className="w-5 h-5 text-gray-500" /> Cross-meeting search</li>
                  <li className="flex items-center gap-3"><CheckCircle2 className="w-5 h-5 text-gray-500" /> Detailed analytics</li>
                </ul>
                <SignInButton mode="modal">
                  <button className="w-full py-3.5 rounded-xl bg-white text-ink-950 font-bold hover:bg-gray-100 transition-colors shadow-lg">Upgrade to Pro</button>
                </SignInButton>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-32 px-4 md:px-8 max-w-3xl mx-auto w-full">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-ink-950 mb-12 text-center">Frequently asked questions</h2>
          <FaqAccordion />
        </section>

        {/* FINAL CTA */}
        <section className="py-32 px-4 md:px-8 bg-white border-t border-gray-200 text-center relative overflow-hidden">
          <div className="max-w-3xl mx-auto space-y-8 relative z-10">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-ink-950 leading-[1.1]">
              Ready to upgrade your meetings?
            </h2>
            <p className="text-lg md:text-xl text-ink-500 font-medium">
              Join thousands of professionals capturing knowledge effortlessly.
            </p>
            <div className="pt-6 flex justify-center">
              <Show when="signed-out">
                <SignInButton mode="modal">
                  <button className="bg-ink-950 text-white px-8 py-4 rounded-full text-lg font-bold hover:bg-ink-900 transition-all shadow-xl hover:scale-105 active:scale-95 flex items-center gap-2">
                    Start using Flownote <ChevronRight className="w-5 h-5" />
                  </button>
                </SignInButton>
              </Show>
              <Show when="signed-in">
                <Link href="/dashboard" className="bg-ink-950 text-white px-8 py-4 rounded-full text-lg font-bold hover:bg-ink-900 transition-all shadow-xl hover:scale-105 active:scale-95 flex items-center gap-2">
                  Go to Dashboard <ChevronRight className="w-5 h-5" />
                </Link>
              </Show>
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="bg-white border-t border-gray-200 text-ink-500 py-16 px-4 md:px-8 relative z-10">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <img src="/note.png" alt="Flownote" className="w-6 h-6 object-contain" />
              <span className="font-bold text-xl tracking-tight text-ink-950">Flownote</span>
            </div>
            <p className="text-sm max-w-sm leading-relaxed">The professional's choice for meeting intelligence. Secure, private, and effortlessly powerful.</p>
          </div>
          <div>
            <h4 className="text-ink-950 font-bold mb-4 tracking-wide uppercase text-xs">Product</h4>
            <ul className="space-y-3 font-medium text-sm">
              <li><Link href="#" className="hover:text-ink-900 transition-colors">Features</Link></li>
              <li><Link href="#" className="hover:text-ink-900 transition-colors">Pricing</Link></li>
              <li><Link href="#" className="hover:text-ink-900 transition-colors">Security</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-ink-950 font-bold mb-4 tracking-wide uppercase text-xs">Company</h4>
            <ul className="space-y-3 font-medium text-sm">
              <li><Link href="#" className="hover:text-ink-900 transition-colors">About</Link></li>
              <li><Link href="#" className="hover:text-ink-900 transition-colors">Blog</Link></li>
              <li><Link href="#" className="hover:text-ink-900 transition-colors">Contact</Link></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-16 pt-8 border-t border-gray-200 text-xs flex flex-col md:flex-row justify-between items-center gap-4 font-medium">
          <p>© {new Date().getFullYear()} Flownote Demo. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="#" className="hover:text-ink-900 transition-colors">Privacy Policy</Link>
            <Link href="#" className="hover:text-ink-900 transition-colors">Terms of Service</Link>
          </div>
        </div>

        {/* GIANT FOOTER BRANDING */}
        <div className="mt-24 w-full flex justify-center items-center overflow-hidden select-none pointer-events-none">
          <h1 className="text-[20vw] font-black tracking-tighter leading-none text-transparent bg-clip-text bg-gradient-to-b from-gray-100 to-white">
            FLOWNOTE
          </h1>
        </div>
      </footer>
    </div>
  );
}
