'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

export default function Home() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const res = await fetch('/api/waitlist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });

    if (res.ok) {
      setSubmitted(true);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-white to-gray-100 text-gray-900 flex flex-col items-center justify-center px-4 py-16">
      {/* Hero Section */}
      <section className="max-w-xl text-center space-y-6 pt-24 animate-in fade-in duration-1000 ease-in">
        <div className="flex items-center justify-center mb-2 gap-2">
          <Image
            src="/checkmark.seal.fill.svg"
            alt="Promise Keeper"
            width={48}
            height={48}
            className="text-primary align-middle relative top-[2px]"
          />
          <h1 className="text-5xl font-bold bg-gradient-to-r from-primary to-primary/70 text-transparent bg-clip-text">
            Promise Keeper
          </h1>
        </div>
        <h2 className="text-2xl font-semibold">Never Drop a Commitment Again</h2>
        <p className="text-lg">
          Promise Keeper surfaces every promise you make in Slack, Gmail, and Basecamp through the power of AI — and helps you follow through.
        </p>
        {submitted ? (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 shadow-sm">
            <div className="text-green-600 text-lg font-semibold flex items-center justify-center">
              <Image src="/checkmark.seal.fill.svg" alt="Checkmark" width={20} height={20} className="mr-2" />
              You&apos;re on the waitlist!
            </div>
            <p className="text-green-600 text-sm mt-1">We&apos;ll notify you when Promise Keeper is ready.</p>
          </div>
        ) : (
          <div className="space-y-4">
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 items-center justify-center">
              <Input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full sm:w-auto shadow-sm"
              />
              <Button type="submit" className="w-full sm:w-auto shadow-sm transition-all hover:scale-105">
                Join the Waitlist
              </Button>
            </form>
            <p className="text-xs text-gray-500">Join 500+ people already on the waitlist</p>
          </div>
        )}
      </section>

      {/* Flow Diagram */}
      <section className="mt-20 max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <img 
            src="/promise-keeper-flow.png" 
            alt="Promise Keeper workflow showing how promises from Slack, Basecamp, and Gmail are captured" 
            className="w-full h-auto"
          />
        </div>
      </section>

      {/* How it works section */}
      <section className="mt-32 max-w-full text-center space-y-12 animate-in fade-in-50 duration-1000 ease-in">
        <h2 className="text-3xl font-semibold">How it works</h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          <div className="flex flex-col items-center space-y-3 p-4 sm:p-6 rounded-xl hover:bg-white/50 transition-colors">
            <Image src="/Detect Promises.png" alt="Detect Promises" width={480} height={480} className="rounded-lg w-full max-w-xs sm:max-w-md lg:max-w-lg xl:max-w-2xl h-auto" />
            <p className="text-base sm:text-lg font-medium text-gray-600">Promise Keeper automatically detects promises in your conversations and emails.</p>
          </div>
          <div className="flex flex-col items-center space-y-3 p-4 sm:p-6 rounded-xl hover:bg-white/50 transition-colors">
            <Image src="/Track Promises.png" alt="Track Promises" width={480} height={480} className="rounded-lg w-full max-w-xs sm:max-w-md lg:max-w-lg xl:max-w-2xl h-auto" />
            <p className="text-base sm:text-lg font-medium text-gray-600">They are then processed through AI and added to a private dashboard only you can see.</p>
          </div>
          <div className="flex flex-col items-center space-y-3 p-4 sm:p-6 rounded-xl hover:bg-white/50 transition-colors">
            <Image src="/Keep Promises.png" alt="Keep Promises" width={480} height={480} className="rounded-lg w-full max-w-xs sm:max-w-md lg:max-w-lg xl:max-w-2xl h-auto" />
            <p className="text-base sm:text-lg font-medium text-gray-600">Get all of the context you need to keep your promises.</p>
          </div>
        </div>
      </section>


      {/* CTA */}
      <section className="mt-32 max-w-2xl text-center bg-primary/5 p-10 rounded-2xl">
        <h2 className="text-2xl font-bold mb-4">Ready to keep every promise?</h2>
        <p className="mb-6">Join the waitlist today and be among the first to experience Promise Keeper.</p>
        {!submitted && (
          <Button size="lg" onClick={() => document.querySelector('input[type="email"]')?.scrollIntoView({ behavior: 'smooth' })}>
            Get Early Access
          </Button>
        )}
      </section>

      <footer className="mt-32 text-sm text-gray-500 flex flex-col items-center space-y-2">
        <div className="flex items-center">
          <Image src="/checkmark.seal.fill.svg" alt="Promise Keeper" width={16} height={16} className="mr-1" />
          <span className="font-medium">Promise Keeper</span>
        </div>
        <p>© 2025 Promise Keeper. All rights reserved.</p>
        <div className="flex gap-4 mt-2 text-xs">
          <a href="#" className="hover:text-primary">Privacy</a>
          <a href="#" className="hover:text-primary">Terms</a>
          <a href="#" className="hover:text-primary">Contact</a>
        </div>
      </footer>
    </main>
  );
}
