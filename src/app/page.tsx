"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Wallet,
  TrendingUp,
  Shield,
  PieChart,
  ArrowRight,
  Sparkles,
  BarChart3,
  Target,
  Zap,
} from "lucide-react";
import Link from "next/link";

function AnimatedCounter({ end, duration = 2000, suffix = "" }: { end: number; duration?: number; suffix?: string }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime: number;
    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      setCount(Math.floor(progress * end));
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    requestAnimationFrame(animate);
  }, [end, duration]);

  return <span>{count.toLocaleString()}{suffix}</span>;
}

function FloatingCard({ className, children, delay = 0 }: { className?: string; children: React.ReactNode; delay?: number }) {
  return (
    <div
      className={`glass-card rounded-2xl p-4 ${className}`}
      style={{ animationDelay: `${delay}s` }}
    >
      {children}
    </div>
  );
}

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return;
    if (session) {
      router.push("/dashboard");
    }
  }, [session, status, router]);

  if (status === "loading") {
    return (
      <div className="flex h-screen items-center justify-center hero-gradient">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-2 border-[#5DD62C] border-t-transparent" />
          <div className="absolute inset-0 animate-ping rounded-full h-16 w-16 border border-[#5DD62C] opacity-20" />
        </div>
      </div>
    );
  }

  if (session) {
    return null;
  }

  return (
    <div className="min-h-screen hero-gradient text-[#F8F8F8] overflow-hidden">
      <header className="relative z-10 px-6 py-5 flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <div className="absolute inset-0 bg-[#5DD62C] blur-lg opacity-50" />
            <Wallet className="relative h-9 w-9 text-[#5DD62C]" />
          </div>
          <span className="text-2xl font-bold tracking-tight">
            Money<span className="text-[#5DD62C]">Tracker</span>
          </span>
        </div>
        <div className="flex items-center space-x-3">
          <Link href="/auth/signin">
            <Button
              variant="ghost"
              className="text-[#F8F8F8] hover:text-[#5DD62C] hover:bg-[#5DD62C]/10 transition-all duration-300"
            >
              Sign In
            </Button>
          </Link>
          <Link href="/auth/signup">
            <Button className="bg-[#5DD62C] text-[#0F0F0F] hover:bg-[#5DD62C]/90 font-semibold px-6 transition-all duration-300 hover:shadow-[0_0_20px_rgba(93,214,44,0.4)]">
              Get Started
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </header>

      <main className="relative">
        <section className="relative px-6 pt-16 pb-32">
          <div className="absolute top-20 left-10 w-72 h-72 bg-[#5DD62C]/10 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#337418]/10 rounded-full blur-3xl" />

          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div className="relative z-10">
                <div className="inline-flex items-center space-x-2 glass-card rounded-full px-4 py-2 mb-6 animate-slide-up">
                  <Sparkles className="h-4 w-4 text-[#5DD62C]" />
                  <span className="text-sm text-[#A0A0A0]">Smart financial tracking for everyone</span>
                </div>

                <h1 className="text-5xl md:text-7xl font-bold leading-tight mb-6 animate-slide-up">
                  Take Control of
                  <br />
                  <span className="gradient-text">Your Money</span>
                </h1>

                <p className="text-xl text-[#A0A0A0] mb-8 max-w-lg animate-slide-up-delay">
                  Track expenses, manage income, and visualize your financial health
                  with beautiful charts and AI-powered insights.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 animate-slide-up-delay-2">
                  <Link href="/auth/signup">
                    <Button
                      size="lg"
                      className="bg-[#5DD62C] text-[#0F0F0F] hover:bg-[#5DD62C]/90 font-semibold text-lg px-8 py-6 transition-all duration-300 hover:shadow-[0_0_30px_rgba(93,214,44,0.5)] animate-pulse-glow"
                    >
                      Start Tracking Free
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                  <Link href="/auth/signin">
                    <Button
                      variant="outline"
                      size="lg"
                      className="border-[#5DD62C]/30 bg-transparent text-[#5DD62C] hover:bg-[#5DD62C]/10 hover:border-[#5DD62C] hover:text-[#F8F8F8] text-lg px-8 py-6 transition-all duration-300"
                    >
                      Watch Demo
                    </Button>
                  </Link>
                </div>

                <div className="flex items-center gap-8 mt-12 animate-slide-up-delay-2">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-[#5DD62C]">
                      <AnimatedCounter end={50} suffix="K+" />
                    </div>
                    <div className="text-sm text-[#A0A0A0]">Active Users</div>
                  </div>
                  <div className="w-px h-12 bg-[#5DD62C]/20" />
                  <div className="text-center">
                    <div className="text-3xl font-bold text-[#5DD62C]">
                      <AnimatedCounter end={2} suffix="M+" />
                    </div>
                    <div className="text-sm text-[#A0A0A0]">Transactions</div>
                  </div>
                  <div className="w-px h-12 bg-[#5DD62C]/20" />
                  <div className="text-center">
                    <div className="text-3xl font-bold text-[#5DD62C]">4.9</div>
                    <div className="text-sm text-[#A0A0A0]">User Rating</div>
                  </div>
                </div>
              </div>

              <div className="relative lg:h-[600px] hidden lg:block">
                <FloatingCard className="absolute top-0 right-0 w-64 animate-float" delay={0}>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-[#A0A0A0]">Monthly Savings</span>
                    <TrendingUp className="h-4 w-4 text-[#5DD62C]" />
                  </div>
                  <div className="text-2xl font-bold">$2,450.00</div>
                  <div className="text-sm text-[#5DD62C] mt-1">+12.5% from last month</div>
                </FloatingCard>

                <FloatingCard className="absolute top-32 left-0 w-56 animate-float-delay" delay={0.5}>
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-[#5DD62C]/20 flex items-center justify-center">
                      <PieChart className="h-5 w-5 text-[#5DD62C]" />
                    </div>
                    <div>
                      <div className="text-sm text-[#A0A0A0]">Budget Used</div>
                      <div className="font-semibold">68%</div>
                    </div>
                  </div>
                  <div className="mt-3 h-2 bg-[#202020] rounded-full overflow-hidden">
                    <div className="h-full w-[68%] bg-gradient-to-r from-[#5DD62C] to-[#337418] rounded-full" />
                  </div>
                </FloatingCard>

                <FloatingCard className="absolute top-64 right-8 w-72 animate-float-delay-2" delay={1}>
                  <div className="text-sm text-[#A0A0A0] mb-3">Spending Overview</div>
                  <div className="flex items-end space-x-2 h-24">
                    {[40, 65, 45, 80, 55, 70, 90].map((height, i) => (
                      <div key={i} className="flex-1 flex flex-col justify-end">
                        <div
                          className="bg-gradient-to-t from-[#337418] to-[#5DD62C] rounded-t transition-all duration-500"
                          style={{ height: `${height}%` }}
                        />
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between mt-2 text-xs text-[#A0A0A0]">
                    <span>Mon</span>
                    <span>Tue</span>
                    <span>Wed</span>
                    <span>Thu</span>
                    <span>Fri</span>
                    <span>Sat</span>
                    <span>Sun</span>
                  </div>
                </FloatingCard>

                <FloatingCard className="absolute bottom-20 left-10 w-48 animate-float" delay={1.5}>
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-full bg-[#5DD62C] flex items-center justify-center">
                      <Zap className="h-4 w-4 text-[#0F0F0F]" />
                    </div>
                    <div className="text-sm">
                      <span className="text-[#5DD62C] font-semibold">+$340</span>
                      <span className="text-[#A0A0A0]"> saved this week</span>
                    </div>
                  </div>
                </FloatingCard>
              </div>
            </div>
          </div>
        </section>

        <section className="relative px-6 py-24">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-4">
                Everything you need to
                <span className="gradient-text"> manage money</span>
              </h2>
              <p className="text-xl text-[#A0A0A0] max-w-2xl mx-auto">
                Powerful features designed to help you take control of your finances
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  icon: BarChart3,
                  title: "Smart Analytics",
                  description: "Get insights into your spending patterns with beautiful charts and detailed analytics.",
                  color: "#5DD62C",
                },
                {
                  icon: Target,
                  title: "Budget Goals",
                  description: "Set and track financial goals with smart reminders and progress tracking.",
                  color: "#337418",
                },
                {
                  icon: Shield,
                  title: "Bank-Level Security",
                  description: "Your data is encrypted and secure. We never share your information.",
                  color: "#5DD62C",
                },
                {
                  icon: Zap,
                  title: "Instant Sync",
                  description: "Real-time updates across all your devices with automatic categorization.",
                  color: "#337418",
                },
              ].map((feature, i) => (
                <div
                  key={i}
                  className="glass-card rounded-2xl p-6 card-hover group cursor-pointer"
                >
                  <div
                    className="w-14 h-14 rounded-xl flex items-center justify-center mb-4 transition-all duration-300 group-hover:scale-110"
                    style={{ backgroundColor: `${feature.color}20` }}
                  >
                    <feature.icon className="h-7 w-7" style={{ color: feature.color }} />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-[#A0A0A0]">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="relative px-6 py-24">
          <div className="max-w-7xl mx-auto">
            <div className="glass-card rounded-3xl p-12 md:p-16 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-96 h-96 bg-[#5DD62C]/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#337418]/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

              <div className="relative z-10 text-center">
                <h2 className="text-4xl md:text-5xl font-bold mb-4">
                  Ready to Start Your
                  <span className="gradient-text"> Financial Journey?</span>
                </h2>
                <p className="text-xl text-[#A0A0A0] mb-8 max-w-2xl mx-auto">
                  Join thousands of users who are already taking control of their finances.
                  It&apos;s free to get started.
                </p>
                <Link href="/auth/signup">
                  <Button
                    size="lg"
                    className="bg-[#5DD62C] text-[#0F0F0F] hover:bg-[#5DD62C]/90 font-semibold text-lg px-10 py-6 transition-all duration-300 hover:shadow-[0_0_40px_rgba(93,214,44,0.5)]"
                  >
                    Create Free Account
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        <footer className="relative px-6 py-12 border-t border-[#5DD62C]/10">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <Wallet className="h-6 w-6 text-[#5DD62C]" />
              <span className="font-semibold">MoneyTracker</span>
            </div>
            <p className="text-sm text-[#A0A0A0]">
              &copy; {new Date().getFullYear()} MoneyTracker. All rights reserved.
            </p>
          </div>
        </footer>
      </main>
    </div>
  );
}
