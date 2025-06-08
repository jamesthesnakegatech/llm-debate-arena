#!/bin/bash

# Risograph Makeover Script for LLM Debate Arena
# This script will update all the necessary files with the risograph design

echo "🎨 Starting Risograph Makeover for LLM Debate Arena..."

# Create backup directory
echo "📁 Creating backup directory..."
mkdir -p backup_original
cp styles/globals.css backup_original/globals.css.backup 2>/dev/null
cp pages/index.tsx backup_original/index.tsx.backup 2>/dev/null
cp pages/debate/\[id\].tsx backup_original/\[id\].tsx.backup 2>/dev/null
cp components/EloLeaderboard.tsx backup_original/EloLeaderboard.tsx.backup 2>/dev/null
cp components/TypingIndicator.tsx backup_original/TypingIndicator.tsx.backup 2>/dev/null
cp components/TurnVoteButtons.tsx backup_original/TurnVoteButtons.tsx.backup 2>/dev/null

# Update globals.css
echo "🎨 Updating styles/globals.css..."
cat > styles/globals.css << 'EOF'
@tailwind base;
@tailwind components;
@tailwind utilities;

/* Risograph Color Palette */
:root {
  /* Primary risograph colors */
  --riso-blue: #0078BF;
  --riso-pink: #FF48B0;
  --riso-yellow: #FFD900;
  --riso-green: #00A95C;
  --riso-orange: #FF6C2F;
  --riso-purple: #765BA7;
  --riso-red: #FF665E;
  
  /* Background and neutrals */
  --riso-paper: #FFF8F3;
  --riso-black: #1A1A1A;
  --riso-overlay: rgba(255, 72, 176, 0.15);
}

/* Global Risograph Styles */
body {
  background-color: var(--riso-paper);
  background-image: 
    repeating-linear-gradient(
      45deg,
      transparent,
      transparent 2px,
      rgba(255, 72, 176, 0.03) 2px,
      rgba(255, 72, 176, 0.03) 4px
    );
  position: relative;
}

/* Paper texture overlay */
body::before {
  content: '';
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: 
    url("data:image/svg+xml,%3Csvg width='100' height='100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' /%3E%3C/filter%3E%3Crect width='100' height='100' filter='url(%23noise)' opacity='0.02'/%3E%3C/svg%3E");
  pointer-events: none;
  z-index: 1;
  mix-blend-mode: multiply;
}

/* All content should be above the texture */
* {
  position: relative;
  z-index: 2;
}

/* Risograph Typography */
h1, h2, h3, h4, h5, h6 {
  font-family: 'Arial Black', 'Helvetica Neue', sans-serif;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

/* Risograph Container Styles */
.riso-container {
  background: var(--riso-paper);
  border: 3px solid var(--riso-black);
  box-shadow: 
    5px 5px 0 var(--riso-pink),
    5px 5px 0 1px var(--riso-black),
    10px 10px 0 var(--riso-blue),
    10px 10px 0 1px var(--riso-black);
  position: relative;
  overflow: hidden;
}

.riso-container::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: repeating-radial-gradient(
    circle at center,
    transparent 0,
    transparent 2px,
    var(--riso-overlay) 2px,
    var(--riso-overlay) 4px
  );
  transform: rotate(15deg);
  pointer-events: none;
}

/* Header Risograph Style */
.riso-header {
  background: var(--riso-yellow);
  border-bottom: 4px solid var(--riso-black);
  position: relative;
  overflow: hidden;
}

.riso-header::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: repeating-linear-gradient(
    90deg,
    transparent,
    transparent 10px,
    rgba(0, 120, 191, 0.1) 10px,
    rgba(0, 120, 191, 0.1) 20px
  );
}

/* Risograph Buttons */
.riso-button {
  background: var(--riso-blue);
  color: var(--riso-paper);
  border: 3px solid var(--riso-black);
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  position: relative;
  transition: all 0.2s ease;
  box-shadow: 
    3px 3px 0 var(--riso-black);
}

.riso-button:hover {
  transform: translate(-2px, -2px);
  box-shadow: 
    5px 5px 0 var(--riso-black),
    5px 5px 20px rgba(255, 72, 176, 0.3);
}

.riso-button:active {
  transform: translate(1px, 1px);
  box-shadow: 
    2px 2px 0 var(--riso-black);
}

.riso-button:disabled {
  background: var(--riso-overlay);
  cursor: not-allowed;
  transform: none;
}

/* Risograph Select/Input Fields */
.riso-input,
.riso-select {
  background: var(--riso-paper);
  border: 3px solid var(--riso-black);
  box-shadow: inset 2px 2px 0 rgba(0, 120, 191, 0.1);
  font-weight: 700;
  transition: all 0.2s ease;
}

.riso-input:focus,
.riso-select:focus {
  outline: none;
  box-shadow: 
    inset 2px 2px 0 rgba(0, 120, 191, 0.1),
    0 0 0 3px var(--riso-pink);
}

/* Risograph Cards */
.riso-card {
  background: var(--riso-paper);
  border: 3px solid var(--riso-black);
  position: relative;
  overflow: hidden;
}

.riso-card-pink {
  box-shadow: 
    -5px 5px 0 var(--riso-pink),
    -5px 5px 0 1px var(--riso-black);
}

.riso-card-blue {
  box-shadow: 
    5px 5px 0 var(--riso-blue),
    5px 5px 0 1px var(--riso-black);
}

.riso-card-yellow {
  background: var(--riso-yellow);
  box-shadow: 
    5px -5px 0 var(--riso-green),
    5px -5px 0 1px var(--riso-black);
}

.riso-card-green {
  box-shadow: 
    5px 5px 0 var(--riso-green),
    5px 5px 0 1px var(--riso-black);
}

.riso-card-purple {
  box-shadow: 
    -5px -5px 0 var(--riso-purple),
    -5px -5px 0 1px var(--riso-black);
}

/* Halftone Pattern Overlays */
.halftone-overlay {
  position: relative;
}

.halftone-overlay::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: radial-gradient(circle, var(--riso-black) 1px, transparent 1px);
  background-size: 4px 4px;
  opacity: 0.03;
  pointer-events: none;
}

/* Misalignment Effects */
.riso-misalign {
  position: relative;
}

.riso-misalign::before {
  content: attr(data-text);
  position: absolute;
  top: 2px;
  left: 2px;
  color: var(--riso-pink);
  opacity: 0.8;
  z-index: -1;
}

/* Risograph Badge */
.riso-badge {
  background: var(--riso-orange);
  color: var(--riso-paper);
  border: 2px solid var(--riso-black);
  padding: 0.25rem 0.75rem;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  display: inline-block;
  transform: rotate(-2deg);
}

/* Leaderboard Risograph Styles */
.riso-leaderboard {
  background: var(--riso-paper);
  border: 3px solid var(--riso-black);
}

.riso-leaderboard-header {
  background: var(--riso-green);
  border-bottom: 3px solid var(--riso-black);
  padding: 1rem;
}

.riso-leaderboard-item {
  border-bottom: 2px solid var(--riso-black);
  position: relative;
  transition: all 0.2s ease;
}

.riso-leaderboard-item:nth-child(odd) {
  background: rgba(255, 217, 0, 0.1);
}

.riso-leaderboard-item:nth-child(even) {
  background: rgba(0, 120, 191, 0.05);
}

.riso-leaderboard-item:hover {
  background: var(--riso-pink);
  color: var(--riso-paper);
  transform: translateX(5px);
}

/* Typing Indicator Risograph */
.riso-typing {
  display: inline-flex;
  gap: 0.5rem;
}

.riso-typing-dot {
  width: 12px;
  height: 12px;
  background: var(--riso-black);
  border: 2px solid var(--riso-black);
  animation: riso-bounce 1.4s infinite ease-in-out both;
}

.riso-typing-dot:nth-child(1) {
  background: var(--riso-pink);
  animation-delay: -0.32s;
}

.riso-typing-dot:nth-child(2) {
  background: var(--riso-blue);
  animation-delay: -0.16s;
}

.riso-typing-dot:nth-child(3) {
  background: var(--riso-yellow);
}

@keyframes riso-bounce {
  0%, 80%, 100% {
    transform: scale(0.8) rotate(0deg);
  }
  40% {
    transform: scale(1.2) rotate(180deg);
  }
}

/* Vote Button Risograph Styles */
.riso-vote-button {
  background: var(--riso-paper);
  border: 3px solid var(--riso-black);
  position: relative;
  overflow: hidden;
  transition: all 0.2s ease;
}

.riso-vote-button:hover {
  background: var(--riso-yellow);
  transform: rotate(-1deg) scale(1.05);
}

.riso-vote-button.selected {
  background: var(--riso-green);
  color: var(--riso-paper);
  box-shadow: 
    3px 3px 0 var(--riso-black),
    inset 0 0 20px rgba(0, 0, 0, 0.1);
}

/* Gradient Replacements */
.riso-gradient-bg {
  background-color: var(--riso-paper);
  background-image: 
    repeating-linear-gradient(
      -45deg,
      var(--riso-pink),
      var(--riso-pink) 20px,
      transparent 20px,
      transparent 40px
    ),
    repeating-linear-gradient(
      45deg,
      var(--riso-blue),
      var(--riso-blue) 20px,
      transparent 20px,
      transparent 40px
    );
  background-size: 100% 100%;
  background-position: 0 0, 0 0;
  opacity: 0.05;
}

/* Info Box Risograph Style */
.riso-info-box {
  background: var(--riso-yellow);
  border: 3px solid var(--riso-black);
  position: relative;
  padding: 1.5rem;
  transform: rotate(-1deg);
}

.riso-info-box::before {
  content: '';
  position: absolute;
  top: 5px;
  left: 5px;
  right: -5px;
  bottom: -5px;
  background: var(--riso-pink);
  z-index: -1;
  transform: rotate(1deg);
}

/* Animations */
@keyframes riso-shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-2px) rotate(-1deg); }
  75% { transform: translateX(2px) rotate(1deg); }
}

.riso-shake:hover {
  animation: riso-shake 0.5s ease-in-out;
}

/* Existing animations enhanced */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px) rotate(-2deg);
  }
  to {
    opacity: 1;
    transform: translateY(0) rotate(0deg);
  }
}

/* Debate specific risograph styles */
.riso-debate-turn {
  background: var(--riso-paper);
  border: 3px solid var(--riso-black);
  margin-bottom: 1.5rem;
  position: relative;
}

.riso-debate-turn:nth-child(odd) {
  box-shadow: 
    -5px 5px 0 var(--riso-pink),
    -5px 5px 0 1px var(--riso-black);
}

.riso-debate-turn:nth-child(even) {
  box-shadow: 
    5px 5px 0 var(--riso-blue),
    5px 5px 0 1px var(--riso-black);
}

/* Risograph glitch effect */
@keyframes riso-glitch {
  0%, 100% {
    transform: translate(0);
    filter: hue-rotate(0deg);
  }
  20% {
    transform: translate(-2px, 2px);
    filter: hue-rotate(90deg);
  }
  40% {
    transform: translate(-2px, -2px);
    filter: hue-rotate(180deg);
  }
  60% {
    transform: translate(2px, 2px);
    filter: hue-rotate(270deg);
  }
  80% {
    transform: translate(2px, -2px);
    filter: hue-rotate(360deg);
  }
}

.riso-glitch:hover {
  animation: riso-glitch 0.3s ease-in-out;
}

/* Existing styles preserved below */

/* Fade in animation for analysis components */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fadeIn {
  animation: fadeIn 0.3s ease-out;
}

/* Shimmer effect for argument strength bars */
@keyframes shimmer {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}

.animate-shimmer {
  animation: shimmer 2s infinite;
}

/* Fact check indicator hover effects */
.fact-check-indicator {
  transition: all 0.2s ease;
}

.fact-check-indicator:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

/* Argument strength meter animations */
.strength-meter-fill {
  transition: width 0.7s ease-out;
}

/* Tooltip styles */
.tooltip {
  position: relative;
}

.tooltip-content {
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  padding: 0.5rem 1rem;
  background-color: rgba(0, 0, 0, 0.8);
  color: white;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  white-space: nowrap;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.2s ease;
  margin-bottom: 0.5rem;
}

.tooltip:hover .tooltip-content {
  opacity: 1;
}

/* Color utilities for dynamic confidence levels */
.confidence-high {
  @apply text-red-600 bg-red-50 border-red-200;
}

.confidence-medium {
  @apply text-yellow-600 bg-yellow-50 border-yellow-200;
}

.confidence-low {
  @apply text-blue-600 bg-blue-50 border-blue-200;
}

/* Smooth transitions for expandable content */
.expandable-content {
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.3s ease-out;
}

.expandable-content.expanded {
  max-height: 500px;
  transition: max-height 0.3s ease-in;
}
EOF

# Update pages/index.tsx
echo "🎨 Updating pages/index.tsx..."
cat > pages/index.tsx << 'EOF'
// pages/index.tsx

import { useState } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import EloLeaderboard from '../components/EloLeaderboard'

const DEBATE_TOPICS = [
  "AI development should be heavily regulated by governments",
  "Remote work is more productive than office work",
  "Social media platforms should ban users under 16",
  "Nuclear energy is the best solution to climate change",
  "Universal Basic Income should be implemented"
]

const AVAILABLE_LLMS = [
  { id: 'gpt4', name: 'GPT-4' },
  { id: 'claude', name: 'Claude 3 Sonnet' },
  { id: 'gpt35', name: 'GPT-3.5 Turbo' },
  { id: 'hf-llama', name: 'Llama 2 (Free)' },
  { id: 'gemini', name: 'Gemini Pro (Free)' },
  { id: 'groq-llama', name: 'Llama 3.1 (Fast)' },
  { id: 'groq-mixtral', name: 'Mixtral (Fast)' }
]

export default function Home() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    topic: '',
    llm1: '',
    llm2: ''
  })
  const [isCreating, setIsCreating] = useState(false)
  const [customTopic, setCustomTopic] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Use custom topic if no predefined topic selected
    const topicToUse = formData.topic || customTopic
    
    if (!topicToUse || !formData.llm1 || !formData.llm2) {
      alert('Please fill in all fields')
      return
    }

    if (formData.llm1 === formData.llm2) {
      alert('Please select two different LLMs')
      return
    }

    setIsCreating(true)

    try {
      const response = await fetch('/api/debate/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          topic: topicToUse,
          llm1: formData.llm1,
          llm2: formData.llm2
        })
      })

      const data = await response.json()

      if (data.success) {
        router.push(`/debate/${data.debateId}`)
      } else {
        alert('Failed to create debate: ' + data.error)
      }
    } catch (error) {
      alert('Failed to create debate')
      console.error(error)
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <>
      <Head>
        <title>LLM Debate Arena - Watch AI Models Debate</title>
        <meta name="description" content="Watch different AI models debate each other on any topic" />
      </Head>

      <div className="min-h-screen riso-gradient-bg">
        {/* Risograph texture overlay */}
        <div className="fixed inset-0 pointer-events-none z-10 opacity-30">
          <div className="absolute inset-0 halftone-overlay"></div>
        </div>

        {/* Header */}
        <header className="riso-header relative z-20">
          <div className="container mx-auto px-4 py-6">
            <h1 className="text-4xl font-black riso-misalign" data-text="🏛️ LLM DEBATE ARENA">
              🏛️ LLM DEBATE ARENA
            </h1>
            <p className="text-xl font-bold mt-2 uppercase tracking-wider">
              Watch AI models battle it out!
            </p>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8 relative z-20">
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Left Column - Create Debate */}
            <div className="riso-card riso-card-pink p-6 transform -rotate-1 hover:rotate-0 transition-transform">
              <h2 className="text-2xl font-black mb-6 flex items-center gap-2">
                <span className="riso-badge">NEW!</span>
                🎭 CREATE DEBATE
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Topic Selection */}
                <div>
                  <label className="block text-sm font-black uppercase tracking-wider mb-2">
                    Pick Your Battle Topic
                  </label>
                  <div className="space-y-2">
                    {/* Dropdown for predefined topics */}
                    <select
                      value={formData.topic}
                      onChange={(e) => {
                        setFormData({ ...formData, topic: e.target.value })
                        setCustomTopic('') // Clear custom topic when selecting predefined
                      }}
                      className="w-full px-4 py-3 riso-select font-bold"
                    >
                      <option value="">Choose a hot topic...</option>
                      {DEBATE_TOPICS.map(topic => (
                        <option key={topic} value={topic}>{topic}</option>
                      ))}
                    </select>
                    
                    {/* Or custom topic input */}
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="OR CREATE YOUR OWN CHAOS..."
                        value={customTopic}
                        onChange={(e) => {
                          setCustomTopic(e.target.value)
                          setFormData({ ...formData, topic: '' }) // Clear predefined when typing custom
                        }}
                        className="w-full px-4 py-3 riso-input font-bold uppercase"
                        maxLength={200}
                      />
                      <div className="absolute right-2 top-3 text-xs font-black">
                        {customTopic.length}/200
                      </div>
                    </div>
                  </div>
                </div>

                {/* LLM Selection */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="transform rotate-1">
                    <label className="block text-sm font-black uppercase tracking-wider mb-2">
                      Fighter One
                    </label>
                    <select
                      value={formData.llm1}
                      onChange={(e) => setFormData({ ...formData, llm1: e.target.value })}
                      className="w-full px-4 py-3 riso-select font-bold"
                      style={{ backgroundColor: 'var(--riso-pink)', opacity: 0.8 }}
                    >
                      <option value="">Pick AI...</option>
                      {AVAILABLE_LLMS.map(llm => (
                        <option key={llm.id} value={llm.name}>
                          {llm.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="transform -rotate-1">
                    <label className="block text-sm font-black uppercase tracking-wider mb-2">
                      Fighter Two
                    </label>
                    <select
                      value={formData.llm2}
                      onChange={(e) => setFormData({ ...formData, llm2: e.target.value })}
                      className="w-full px-4 py-3 riso-select font-bold"
                      style={{ backgroundColor: 'var(--riso-blue)', opacity: 0.8 }}
                    >
                      <option value="">Pick AI...</option>
                      {AVAILABLE_LLMS.map(llm => (
                        <option 
                          key={llm.id} 
                          value={llm.name}
                          disabled={llm.name === formData.llm1}
                        >
                          {llm.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isCreating}
                  className="w-full py-4 riso-button text-xl riso-shake"
                >
                  {isCreating ? 'PREPARING ARENA...' : 'START THE BATTLE ⚔️'}
                </button>
              </form>

              {/* Info Box */}
              <div className="mt-6 riso-info-box">
                <h3 className="font-black text-lg mb-2 uppercase">Battle Rules:</h3>
                <ol className="text-sm font-bold space-y-1 uppercase">
                  <li>→ Pick a spicy topic!</li>
                  <li>→ Choose two AI fighters</li>
                  <li>→ Watch 3 rounds of mayhem</li>
                  <li>→ Crown the champion!</li>
                </ol>
              </div>
            </div>

            {/* Right Column - Leaderboard */}
            <div className="transform rotate-1 hover:rotate-0 transition-transform">
              <EloLeaderboard />
            </div>
          </div>

          {/* Decorative elements */}
          <div className="absolute top-20 right-10 text-6xl transform rotate-12 opacity-20">
            ⚡
          </div>
          <div className="absolute bottom-20 left-10 text-6xl transform -rotate-12 opacity-20">
            💥
          </div>
          <div className="absolute top-40 left-20 text-4xl transform rotate-45 opacity-20">
            ✨
          </div>
        </div>
      </div>
    </>
  )
}
EOF

# Create the full debate page file
echo "🎨 Creating pages/debate/[id].tsx..."
# Note: The debate page is too long for a single heredoc, so we'll create it in parts
cat > pages/debate/\[id\].tsx << 'EOF_PART1'
// pages/debate/[id].tsx
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { GetServerSideProps } from 'next';
import { prisma } from '@/lib/prisma';
import { useSocket } from '@/hooks/useSocket';
import { FactChecker } from '@/components/FactChecker';
import { CheckCircle, XCircle, AlertCircle, Info, Loader2 } from 'lucide-react';
import TurnVoteButtons from '@/components/TurnVoteButtons';
import { useTurnVoting } from '@/hooks/useTurnVoting';
import type { FactCheckResult } from '@/components/FactChecker/types';
import TypingIndicator from '@/components/TypingIndicator';

interface Turn {
  id: string;
  llmName: string;
  message: string;
  turnNumber: number;
  createdAt: string;
  argumentStrength?: number;
  strengthBreakdown?: string;
  factClaims?: string;
}

interface DebateData {
  id: string;
  topic: string;
  llm1Name: string;
  llm2Name: string;
  llm1Position: string;
  llm2Position: string;
  status: string;
  winner?: string;
  turns: Turn[];
  voteCount: {
    llm1: number;
    llm2: number;
    tie: number;
    bothBad: number;
  };
}

interface Props {
  debate: DebateData;
}

export default function DebatePage({ debate: initialDebate }: Props) {
  const router = useRouter();
  const [debate, setDebate] = useState<DebateData>(initialDebate);
  const [isStarting, setIsStarting] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showVoting, setShowVoting] = useState(false);
  const [selectedWinner, setSelectedWinner] = useState<string>('');
  const [voteReasoning, setVoteReasoning] = useState('');
  const [hasVoted, setHasVoted] = useState(false);
  
  // Fact checking states
  const [factCheckResults, setFactCheckResults] = useState<Map<string, FactCheckResult[]>>(new Map());
  const [showFactChecker, setShowFactChecker] = useState(false);
  const [isFactCheckingEnabled, setIsFactCheckingEnabled] = useState(true);

  // Real-time updates
  const socket = useSocket(debate.id);

  const MAX_TURNS = 6;

  // Turn voting
  const { turnVotes, handleVote: handleTurnVote } = useTurnVoting(debate.id);

  // Function to fetch latest debate data
  const fetchDebateData = async () => {
    try {
      const response = await fetch(`/api/debate/${debate.id}`);
      const data = await response.json();
      if (data.success && data.debate) {
        console.log('Fetched debate data:', data.debate);
        setDebate(data.debate);
      }
    } catch (error) {
      console.error('Error fetching debate data:', error);
    }
  };

  useEffect(() => {
    // Check if user has already voted
    const votedDebates = JSON.parse(sessionStorage.getItem('votedDebates') || '[]');
    if (votedDebates.includes(debate.id)) {
      setHasVoted(true);
    }
    
    // Auto-show voting if debate is complete
    if (debate.status === 'completed' && debate.turns.length >= MAX_TURNS) {
      setShowVoting(true);
    }
  }, [debate.id, debate.status, debate.turns.length]);

  // Socket event listeners
  useEffect(() => {
    if (!socket) return;

    socket.on('debate-updated', (updatedDebate: any) => {
      console.log('Socket: debate-updated', updatedDebate);
      const debate = updatedDebate.debate || updatedDebate;
      if (debate && debate.turns) {
        debate.turns = debate.turns.filter((turn: Turn) => turn && turn.id);
        setDebate(debate);
      } else {
        fetchDebateData();
      }
      setIsGenerating(false);
    });

    socket.on('new-turn', (newTurn: Turn) => {
      console.log('Socket: new-turn', newTurn);
      if (newTurn && newTurn.id && newTurn.llmName && newTurn.message) {
        setDebate(prev => {
          const updatedDebate = {
            ...prev,
            turns: [...(prev.turns || []), newTurn]
          };
          console.log('Updated debate after new turn:', updatedDebate);
          return updatedDebate;
        });
        
        if (newTurn.turnNumber >= MAX_TURNS) {
          setTimeout(() => setShowVoting(true), 1000);
        }
      } else {
        console.error('Invalid turn data received:', newTurn);
        fetchDebateData();
      }
      setIsGenerating(false);
    });

    socket.on('vote-updated', (voteData: any) => {
      setDebate(prev => ({
        ...prev,
        voteCount: voteData.voteCount
      }));
    });

    return () => {
      socket.off('debate-updated');
      socket.off('new-turn');
      socket.off('vote-updated');
    };
  }, [socket, debate.id]);

  // Handle fact check completion
  const handleFactCheckComplete = (result: FactCheckResult) => {
    const turnId = result.claimId.split('-')[0];
    
    setFactCheckResults(prev => {
      const newMap = new Map(prev);
      const existing = newMap.get(turnId) || [];
      newMap.set(turnId, [...existing, result]);
      return newMap;
    });

    saveFactCheckToTurn(turnId, result);
  };

  const saveFactCheckToTurn = async (turnId: string, result: FactCheckResult) => {
    try {
      const turn = debate.turns.find(t => t.id === turnId);
      if (!turn) return;

      const existingClaims = turn.factClaims ? JSON.parse(turn.factClaims) : {};
      existingClaims[result.claimId] = result;

      await fetch(`/api/debate/${debate.id}/turn/${turnId}/fact-check`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ factClaims: existingClaims })
      });
    } catch (error) {
      console.error('Error saving fact check:', error);
    }
  };
EOF_PART1

# Continue with the rest of the debate page
cat >> pages/debate/\[id\].tsx << 'EOF_PART2'

  // Transform turns for fact checker
  const factCheckerMessages = debate.turns
    .filter(turn => turn && turn.id && turn.llmName && turn.message)
    .map(turn => ({
      id: turn.id,
      speaker: turn.llmName,
      content: turn.message,
      timestamp: new Date(turn.createdAt)
    }));

  // Get verdict summary for a turn
  const getVerdictSummary = (turnId: string) => {
    const results = factCheckResults.get(turnId) || [];
    if (results.length === 0) return null;

    const summary = {
      verified: 0,
      false: 0,
      'partially-true': 0,
      unverifiable: 0
    };

    results.forEach(result => {
      summary[result.verdict]++;
    });

    return summary;
  };

  const getVerdictIcon = (verdict: FactCheckResult['verdict']) => {
    switch (verdict) {
      case 'verified': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'false': return <XCircle className="w-4 h-4 text-red-600" />;
      case 'partially-true': return <AlertCircle className="w-4 h-4 text-yellow-600" />;
      default: return <Info className="w-4 h-4 text-gray-600" />;
    }
  };

  const startDebate = async () => {
    setIsStarting(true);
    try {
      const response = await fetch(`/api/debate/${debate.id}/start`, {
        method: 'POST'
      });
      const data = await response.json();
      
      console.log('Start debate response:', data);
      
      if (data.success) {
        if (data.turn && data.turn.id && data.turn.llmName && data.turn.message) {
          setDebate(prev => {
            const updatedDebate = {
              ...prev,
              status: "in_progress",
              turns: [data.turn]
            };
            console.log('Updated debate after start:', updatedDebate);
            return updatedDebate;
          });
        } else if (data.debate) {
          setDebate(data.debate);
        } else {
          fetchDebateData();
        }
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      alert('Failed to start debate');
      console.error(error);
    } finally {
      setIsStarting(false);
    }
  };

  const continueDebate = async () => {
    if (debate.turns.length >= MAX_TURNS) {
      setShowVoting(true);
      return;
    }

    setIsGenerating(true);
    try {
      const response = await fetch(`/api/debate/${debate.id}/continue`, {
        method: 'POST'
      });
      const data = await response.json();
      
      if (data.success) {
        console.log('Continue debate response:', data);
        
        if (data.newTurn && data.newTurn.id && data.newTurn.llmName && data.newTurn.message) {
          setDebate(prev => {
            const updatedDebate = {
              ...prev,
              turns: [...(prev.turns || []), data.newTurn]
            };
            console.log('Updated debate state:', updatedDebate);
            return updatedDebate;
          });
          
          if (debate.turns.length + 1 >= MAX_TURNS) {
            setTimeout(() => setShowVoting(true), 1000);
          }
        } else {
          console.error('Invalid turn data:', data.newTurn);
          fetchDebateData();
        }
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      alert('Failed to continue debate');
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  const submitVote = async () => {
    if (!selectedWinner) {
      alert('Please select a winner');
      return;
    }

    const judgeId = `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    try {
      const response = await fetch(`/api/debate/${debate.id}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          winner: selectedWinner,
          judgeId: judgeId,
          reasoning: voteReasoning || '',
        }),
      });

      const data = await response.json();
      
      if (response.ok && data.success) {
        const votedDebates = JSON.parse(sessionStorage.getItem('votedDebates') || '[]');
        votedDebates.push(debate.id);
        sessionStorage.setItem('votedDebates', JSON.stringify(votedDebates));
        
        setHasVoted(true);
        setShowVoting(false);
        
        if (data.voteCount) {
          setDebate(prev => ({
            ...prev,
            voteCount: data.voteCount,
          }));
        }
      } else {
        alert(`Error: ${data.error || 'Failed to submit vote'}`);
      }
    } catch (error) {
      console.error('Vote submission error:', error);
      alert('Failed to submit vote. Please try again.');
    }
  };

  const getLLMColor = (llmName: string) => {
    return llmName === debate.llm1Name ? 'pink' : 'blue';
  };

  const getPositionBadge = (llmName: string) => {
    const position = llmName === debate.llm1Name ? debate.llm1Position : debate.llm2Position;
    const isPro = position === 'pro';
    return (
      <span className={`riso-badge ${isPro ? 'bg-green-500' : 'bg-orange-500'} text-white`}>
        {position.toUpperCase()}
      </span>
    );
  };

  // Ensure turns is always an array
  const safeTurns = Array.isArray(debate.turns) ? debate.turns : [];
EOF_PART2

# Continue with the JSX return
cat >> pages/debate/\[id\].tsx << 'EOF_PART3'

  return (
    <>
      <Head>
        <title>Battle: {debate.topic.slice(0, 50)}... | LLM Arena</title>
      </Head>

      <div className="min-h-screen riso-gradient-bg">
        {/* Risograph texture overlay */}
        <div className="fixed inset-0 pointer-events-none z-10 opacity-30">
          <div className="absolute inset-0 halftone-overlay"></div>
        </div>

        <div className="container mx-auto px-4 py-8 max-w-6xl relative z-20">
          {/* Header */}
          <div className="riso-card riso-card-yellow p-6 mb-6 transform -rotate-1">
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() => router.push('/')}
                className="riso-button px-4 py-2 text-sm"
              >
                ← BACK TO ARENA
              </button>
              <div className="flex items-center gap-4">
                <span className={`riso-badge ${
                  (debate.status === 'created' || debate.status === 'pending') ? 'bg-yellow-500' :
                  (debate.status === 'in_progress' || debate.status === 'active') ? 'bg-green-500' :
                  'bg-gray-500'
                } text-white`}>
                  {debate.status.toUpperCase()}
                </span>
                
                {/* Fact Checking Controls */}
                {safeTurns.length > 0 && (
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-2 font-bold uppercase text-sm cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isFactCheckingEnabled}
                        onChange={(e) => setIsFactCheckingEnabled(e.target.checked)}
                        className="w-4 h-4 accent-pink-500"
                      />
                      <span>Fact Check</span>
                    </label>
                    
                    {isFactCheckingEnabled && (
                      <label className="flex items-center gap-2 font-bold uppercase text-sm cursor-pointer">
                        <input
                          type="checkbox"
                          checked={showFactChecker}
                          onChange={(e) => setShowFactChecker(e.target.checked)}
                          className="w-4 h-4 accent-pink-500"
                        />
                        <span>Show Panel</span>
                      </label>
                    )}
                  </div>
                )}
              </div>
            </div>
            
            <h1 className="text-3xl font-black uppercase riso-misalign mb-4" data-text={debate.topic}>
              {debate.topic}
            </h1>

            {/* Debaters */}
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 riso-card transform rotate-1" style={{ backgroundColor: 'var(--riso-pink)', opacity: 0.9 }}>
                <div className="text-xl font-black uppercase">
                  {debate.llm1Name}
                </div>
                {getPositionBadge(debate.llm1Name)}
              </div>
              <div className="text-center p-4 riso-card transform -rotate-1" style={{ backgroundColor: 'var(--riso-blue)', opacity: 0.9 }}>
                <div className="text-xl font-black uppercase">
                  {debate.llm2Name}
                </div>
                {getPositionBadge(debate.llm2Name)}
              </div>
            </div>
          </div>

          <div className={`grid ${showFactChecker && isFactCheckingEnabled ? 'lg:grid-cols-3' : 'lg:grid-cols-1'} gap-6`}>
            {/* Main Debate Area */}
            <div className={`${showFactChecker && isFactCheckingEnabled ? 'lg:col-span-2' : ''}`}>
              {/* Start Debate Button */}
              {(debate.status === 'created' || debate.status === 'pending') && (
                <div className="riso-card riso-card-green p-6 mb-6 text-center transform rotate-1">
                  <h2 className="text-2xl font-black uppercase mb-4">Ready to Rumble?</h2>
                  <p className="font-bold uppercase mb-4">
                    The AI warriors will clash for {MAX_TURNS / 2} epic rounds!
                  </p>
                  <button
                    onClick={startDebate}
                    disabled={isStarting}
                    className="riso-button px-8 py-4 text-xl riso-shake"
                    style={{ backgroundColor: 'var(--riso-red)' }}
                  >
                    {isStarting ? 'PREPARING ARENA...' : 'START THE BATTLE 🚀'}
                  </button>
                </div>
              )}
EOF_PART3

# Continue with debate turns and the rest of the component
cat >> pages/debate/\[id\].tsx << 'EOF_PART4'

              {/* Debate Turns */}
              {safeTurns.length > 0 && (
                <div className="space-y-6 mb-6">
                  {safeTurns.map((turn, index) => {
                    const color = getLLMColor(turn.llmName);
                    const isLlm1 = turn.llmName === debate.llm1Name;
                    const verdictSummary = getVerdictSummary(turn.id);
                    const turnFactChecks = factCheckResults.get(turn.id) || [];
                    
                    return (
                      <div
                        key={turn.id}
                        className={`flex ${isLlm1 ? 'justify-start' : 'justify-end'} debate-message`}
                      >
                        <div className={`max-w-3xl ${isLlm1 ? 'mr-12' : 'ml-12'}`}>
                          <div className={`riso-debate-turn p-6 ${
                            index % 2 === 0 ? 'transform -rotate-1' : 'transform rotate-1'
                          }`} style={{
                            backgroundColor: color === 'pink' ? 'var(--riso-pink)' : 'var(--riso-blue)',
                            opacity: 0.9
                          }}>
                            <div className="flex items-center justify-between mb-3">
                              <span className="font-black uppercase text-xl">
                                {turn.llmName}
                              </span>
                              <div className="flex items-center gap-2">
                                <span className="riso-badge bg-black text-white">
                                  ROUND {Math.ceil(turn.turnNumber / 2)}
                                </span>
                                
                                {/* Fact Check Summary */}
                                {isFactCheckingEnabled && verdictSummary && (
                                  <div className="flex items-center gap-1">
                                    {verdictSummary.verified > 0 && (
                                      <div className="flex items-center gap-0.5 riso-badge bg-green-500 text-white">
                                        <CheckCircle className="w-3 h-3" />
                                        <span className="text-xs">{verdictSummary.verified}</span>
                                      </div>
                                    )}
                                    {verdictSummary.false > 0 && (
                                      <div className="flex items-center gap-0.5 riso-badge bg-red-500 text-white">
                                        <XCircle className="w-3 h-3" />
                                        <span className="text-xs">{verdictSummary.false}</span>
                                      </div>
                                    )}
                                    {verdictSummary['partially-true'] > 0 && (
                                      <div className="flex items-center gap-0.5 riso-badge bg-yellow-500 text-white">
                                        <AlertCircle className="w-3 h-3" />
                                        <span className="text-xs">{verdictSummary['partially-true']}</span>
                                      </div>
                                    )}
                                    {verdictSummary.unverifiable > 0 && (
                                      <div className="flex items-center gap-0.5 riso-badge bg-gray-500 text-white">
                                        <Info className="w-3 h-3" />
                                        <span className="text-xs">{verdictSummary.unverifiable}</span>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                            <p className="font-medium text-lg leading-relaxed whitespace-pre-wrap" style={{ color: 'var(--riso-black)' }}>
                              {turn.message}
                            </p>
                            
                            {/* Inline Fact Check Results */}
                            {isFactCheckingEnabled && turnFactChecks.length > 0 && (
                              <div className="mt-4 pt-4 border-t-4 border-black border-dashed">
                                <div className="space-y-2">
                                  {turnFactChecks.slice(0, 2).map((result, idx) => (
                                    <div key={idx} className="flex items-start gap-2 font-bold">
                                      {getVerdictIcon(result.verdict)}
                                      <span className="text-sm">
                                        {result.explanation.slice(0, 80)}...
                                      </span>
                                    </div>
                                  ))}
                                  {turnFactChecks.length > 2 && (
                                    <span className="text-sm font-bold pl-6 uppercase">
                                      +{turnFactChecks.length - 2} more checks
                                    </span>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  
                  {/* Typing Indicator */}
                  {isGenerating && (
                    <div className="flex justify-center">
                      <TypingIndicator
                        llmName={safeTurns.length % 2 === 0 ? debate.llm1Name : debate.llm2Name}
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Continue Button */}
              {(debate.status === 'in_progress' || debate.status === 'active') && 
               safeTurns.length > 0 && 
               safeTurns.length < MAX_TURNS && 
               !showVoting && (
                <div className="riso-card riso-card-purple p-6 text-center mb-6 transform -rotate-1">
                  <button
                    onClick={continueDebate}
                    disabled={isGenerating}
                    className="riso-button px-6 py-4 text-xl"
                    style={{ backgroundColor: 'var(--riso-purple)' }}
                  >
                    {isGenerating ? (
                      <span className="flex items-center justify-center">
                        <Loader2 className="animate-spin -ml-1 mr-3 h-5 w-5" />
                        GENERATING COMEBACK...
                      </span>
                    ) : (
                      `NEXT ROUND (${Math.ceil((safeTurns.length + 1) / 2)}/${MAX_TURNS/2})`
                    )}
                  </button>
                </div>
              )}
EOF_PART4

# Continue with voting interface and closing
cat >> pages/debate/\[id\].tsx << 'EOF_PART5'

              {/* Voting Interface */}
              {showVoting && !hasVoted && (
                <div className="riso-card riso-card-pink p-6 mb-6 transform rotate-1">
                  <h2 className="text-2xl font-black uppercase mb-4">CAST YOUR VOTE! 🗳️</h2>
                  <p className="font-bold uppercase mb-4">
                    Who won this epic battle?
                  </p>
                  
                  <div className="space-y-3 mb-4">
                    <label className="flex items-center space-x-3 cursor-pointer p-4 riso-card hover:transform hover:scale-105 transition-transform">
                      <input
                        type="radio"
                        name="winner"
                        value="llm1"
                        checked={selectedWinner === 'llm1'}
                        onChange={(e) => setSelectedWinner(e.target.value)}
                        className="h-5 w-5 accent-pink-500"
                      />
                      <span className="font-black uppercase">{debate.llm1Name} WINS!</span>
                    </label>
                    
                    <label className="flex items-center space-x-3 cursor-pointer p-4 riso-card hover:transform hover:scale-105 transition-transform">
                      <input
                        type="radio"
                        name="winner"
                        value="llm2"
                        checked={selectedWinner === 'llm2'}
                        onChange={(e) => setSelectedWinner(e.target.value)}
                        className="h-5 w-5 accent-blue-500"
                      />
                      <span className="font-black uppercase">{debate.llm2Name} WINS!</span>
                    </label>
                    
                    <label className="flex items-center space-x-3 cursor-pointer p-4 riso-card hover:transform hover:scale-105 transition-transform">
                      <input
                        type="radio"
                        name="winner"
                        value="tie"
                        checked={selectedWinner === 'tie'}
                        onChange={(e) => setSelectedWinner(e.target.value)}
                        className="h-5 w-5 accent-gray-500"
                      />
                      <span className="font-black uppercase">IT'S A TIE!</span>
                    </label>
                    
                    <label className="flex items-center space-x-3 cursor-pointer p-4 riso-card hover:transform hover:scale-105 transition-transform">
                      <input
                        type="radio"
                        name="winner"
                        value="bothBad"
                        checked={selectedWinner === 'bothBad'}
                        onChange={(e) => setSelectedWinner(e.target.value)}
                        className="h-5 w-5 accent-orange-500"
                      />
                      <span className="font-black uppercase">BOTH WERE WEAK 👎</span>
                    </label>
                  </div>

                  <textarea
                    placeholder="TELL US WHY! (OPTIONAL)"
                    value={voteReasoning}
                    onChange={(e) => setVoteReasoning(e.target.value)}
                    className="w-full p-4 riso-input font-bold uppercase h-24 resize-none mb-4"
                  />

                  <button
                    onClick={submitVote}
                    disabled={!selectedWinner}
                    className="w-full py-4 riso-button text-xl"
                    style={{ backgroundColor: 'var(--riso-green)' }}
                  >
                    SUBMIT VOTE
                  </button>
                </div>
              )}

              {/* Vote Results */}
              {hasVoted && (
                <div className="riso-card riso-card-yellow p-6 transform -rotate-1">
                  <h2 className="text-2xl font-black uppercase mb-4">BATTLE RESULTS 📊</h2>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 riso-card">
                      <span className="font-black uppercase">{debate.llm1Name}</span>
                      <span className="riso-badge bg-pink-500 text-white">
                        {debate.voteCount.llm1} VOTES
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 riso-card">
                      <span className="font-black uppercase">{debate.llm2Name}</span>
                      <span className="riso-badge bg-blue-500 text-white">
                        {debate.voteCount.llm2} VOTES
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 riso-card">
                      <span className="font-black uppercase">TIE</span>
                      <span className="riso-badge bg-gray-500 text-white">
                        {debate.voteCount.tie} VOTES
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 riso-card">
                      <span className="font-black uppercase">BOTH WEAK 👎</span>
                      <span className="riso-badge bg-orange-500 text-white">
                        {debate.voteCount.bothBad || 0} VOTES
                      </span>
                    </div>
                  </div>
                  
                  <div className="mt-6 pt-6 border-t-4 border-black border-dashed">
                    <button
                      onClick={() => router.push('/')}
                      className="w-full py-4 riso-button text-xl riso-shake"
                    >
                      START ANOTHER BATTLE ⚔️
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Fact Checker Panel */}
            {showFactChecker && isFactCheckingEnabled && safeTurns.length > 0 && (
              <div className="lg:col-span-1">
                <div className="sticky top-4">
                  <div className="riso-card riso-card-green p-4 transform rotate-1">
                    <h3 className="font-black uppercase text-lg mb-4">FACT CHECKER</h3>
                    <FactChecker
                      messages={factCheckerMessages}
                      apiKey={process.env.NEXT_PUBLIC_OPENAI_API_KEY!}
                      searchApiKey={process.env.NEXT_PUBLIC_BING_API_KEY}
                      onFactCheckComplete={handleFactCheckComplete}
                      className="max-h-[calc(100vh-12rem)]"
                      autoCheckDelay={2000}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Decorative battle elements */}
          <div className="absolute top-10 right-10 text-8xl transform rotate-12 opacity-10">
            ⚔️
          </div>
          <div className="absolute bottom-20 left-10 text-6xl transform -rotate-12 opacity-10">
            💥
          </div>
          <div className="absolute top-40 left-20 text-5xl transform rotate-45 opacity-10">
            ⚡
          </div>
        </div>
      </div>
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { id } = context.params!;
  
  try {
    const debate = await prisma.debate.findUnique({
      where: { id: id as string },
      include: {
        turns: {
          orderBy: { turnNumber: 'asc' }
        },
        votes: true
      }
    });

    if (!debate) {
      return {
        notFound: true
      };
    }

    // Calculate vote counts
    const voteCount = {
      llm1: debate.votes.filter(v => v.winner === 'llm1').length,
      llm2: debate.votes.filter(v => v.winner === 'llm2').length,
      tie: debate.votes.filter(v => v.winner === 'tie').length,
      bothBad: debate.votes.filter(v => v.winner === 'bothBad').length
    };

    // Properly serialize all dates and omit votes
    const { votes, ...debateWithoutVotes } = debate;
    const serializedDebate = {
      ...debateWithoutVotes,
      createdAt: debate.createdAt.toISOString(),
      updatedAt: debate.updatedAt.toISOString(),
      turns: debate.turns.map(turn => ({
        ...turn,
        createdAt: turn.createdAt.toISOString()
      })),
      voteCount
    };

    return {
      props: {
        debate: serializedDebate
      }
    };
  } catch (error) {
    console.error('Error fetching debate:', error);
    return {
      notFound: true
    };
  }
};
EOF_PART5

# Update components/EloLeaderboard.tsx
echo "🎨 Updating components/EloLeaderboard.tsx..."
cat > components/EloLeaderboard.tsx << 'EOF'
// components/EloLeaderboard.tsx

import { useState, useEffect } from 'react'

interface LeaderboardEntry {
  llm: string
  elo: number
  wins: number
  losses: number
  debates: number
}

export default function EloLeaderboard() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchLeaderboard()
  }, [])

  const fetchLeaderboard = async () => {
    try {
      const response = await fetch('/api/leaderboard')
      const data = await response.json()
      setLeaderboard(data.leaderboard || [])
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error)
    } finally {
      setLoading(false)
    }
  }

  const getPlaceEmoji = (index: number) => {
    switch (index) {
      case 0: return '🏆'
      case 1: return '🥈'
      case 2: return '🥉'
      default: return '🎯'
    }
  }

  const getPlaceColor = (index: number) => {
    switch (index) {
      case 0: return 'var(--riso-yellow)'
      case 1: return 'var(--riso-pink)'
      case 2: return 'var(--riso-orange)'
      default: return 'var(--riso-paper)'
    }
  }

  return (
    <div className="riso-card riso-card-blue transform -rotate-1">
      {/* Header */}
      <div className="riso-leaderboard-header">
        <h2 className="text-2xl font-black uppercase tracking-wider flex items-center gap-2">
          <span className="inline-block animate-pulse">⚡</span>
          CHAMPION RANKINGS
          <span className="inline-block animate-pulse">⚡</span>
        </h2>
      </div>

      {/* Leaderboard Content */}
      <div className="p-4">
        {loading ? (
          <div className="text-center py-8">
            <div className="riso-typing">
              <div className="riso-typing-dot"></div>
              <div className="riso-typing-dot"></div>
              <div className="riso-typing-dot"></div>
            </div>
            <p className="mt-4 font-bold uppercase">Loading Warriors...</p>
          </div>
        ) : leaderboard.length === 0 ? (
          <div className="text-center py-8 riso-info-box">
            <p className="font-black uppercase">No battles yet!</p>
            <p className="text-sm mt-2 font-bold">Be the first to start a debate!</p>
          </div>
        ) : (
          <div className="space-y-2">
            {leaderboard.map((entry, index) => (
              <div
                key={entry.llm}
                className={`riso-leaderboard-item p-4 flex items-center gap-4 ${
                  index < 3 ? 'riso-glitch' : ''
                }`}
                style={{
                  backgroundColor: index < 3 ? getPlaceColor(index) : undefined,
                  transform: `rotate(${index % 2 === 0 ? '-0.5deg' : '0.5deg'})`,
                }}
              >
                {/* Place */}
                <div className="text-2xl">
                  {getPlaceEmoji(index)}
                </div>

                {/* LLM Name */}
                <div className="flex-1">
                  <h3 className="font-black uppercase tracking-wide">
                    {entry.llm}
                  </h3>
                  <div className="text-xs font-bold uppercase opacity-80 mt-1">
                    {entry.wins}W - {entry.losses}L ({entry.debates} battles)
                  </div>
                </div>

                {/* ELO Score */}
                <div className="text-right">
                  <div className="text-2xl font-black" style={{ fontFamily: 'monospace' }}>
                    {entry.elo}
                  </div>
                  <div className="text-xs font-bold uppercase">
                    ELO
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Stats Summary */}
        {leaderboard.length > 0 && (
          <div className="mt-6 p-4 border-4 border-dashed border-black transform rotate-1">
            <p className="text-xs font-black uppercase text-center">
              Total Battles: {leaderboard.reduce((sum, e) => sum + e.debates, 0) / 2}
            </p>
          </div>
        )}
      </div>

      {/* Decorative corner stamps */}
      <div className="absolute -top-2 -right-2 w-16 h-16 bg-red-500 transform rotate-12 flex items-center justify-center border-2 border-black">
        <span className="text-white font-black text-xs transform -rotate-12">HOT!</span>
      </div>
    </div>
  )
}
EOF

# Update components/TypingIndicator.tsx
echo "🎨 Updating components/TypingIndicator.tsx..."
cat > components/TypingIndicator.tsx << 'EOF'
// components/TypingIndicator.tsx

import React from 'react'

interface TypingIndicatorProps {
  llmName: string
}

export default function TypingIndicator({ llmName }: TypingIndicatorProps) {
  return (
    <div className="flex items-center gap-3 p-4 riso-card transform -rotate-1 animate-pulse">
      <div className="flex items-center gap-2">
        <span className="font-black uppercase text-sm tracking-wider">
          {llmName} is thinking
        </span>
        <div className="riso-typing">
          <div className="riso-typing-dot"></div>
          <div className="riso-typing-dot"></div>
          <div className="riso-typing-dot"></div>
        </div>
      </div>
      
      {/* Random decorative elements that appear */}
      <div className="flex gap-1 opacity-50">
        {['💭', '⚡', '🤔', '✨'].map((emoji, i) => (
          <span
            key={i}
            className="text-lg animate-bounce"
            style={{
              animationDelay: `${i * 0.1}s`,
              transform: `rotate(${Math.random() * 30 - 15}deg)`
            }}
          >
            {emoji}
          </span>
        ))}
      </div>
    </div>
  )
}
EOF

# Update components/TurnVoteButtons.tsx
echo "🎨 Updating components/TurnVoteButtons.tsx..."
cat > components/TurnVoteButtons.tsx << 'EOF'
// components/TurnVoteButtons.tsx

import React, { useState } from 'react'
import { ThumbsUp, ThumbsDown, Sparkles } from 'lucide-react'

interface TurnVoteButtonsProps {
  turnId: string
  onVote: (turnId: string, vote: 'up' | 'down') => void
  initialVotes?: { up: number; down: number }
  userVote?: 'up' | 'down' | null
}

export default function TurnVoteButtons({ 
  turnId, 
  onVote, 
  initialVotes = { up: 0, down: 0 },
  userVote = null 
}: TurnVoteButtonsProps) {
  const [votes, setVotes] = useState(initialVotes)
  const [currentUserVote, setCurrentUserVote] = useState<'up' | 'down' | null>(userVote)
  const [isAnimating, setIsAnimating] = useState(false)

  const handleVote = (voteType: 'up' | 'down') => {
    // Trigger animation
    setIsAnimating(true)
    setTimeout(() => setIsAnimating(false), 500)

    // If clicking the same vote, remove it
    if (currentUserVote === voteType) {
      setCurrentUserVote(null)
      setVotes(prev => ({
        ...prev,
        [voteType]: Math.max(0, prev[voteType] - 1)
      }))
      onVote(turnId, voteType) // You might want to handle unvoting differently
      return
    }

    // Update votes
    const newVotes = { ...votes }
    
    // Remove previous vote if exists
    if (currentUserVote) {
      newVotes[currentUserVote] = Math.max(0, newVotes[currentUserVote] - 1)
    }
    
    // Add new vote
    newVotes[voteType] = newVotes[voteType] + 1
    
    setVotes(newVotes)
    setCurrentUserVote(voteType)
    onVote(turnId, voteType)
  }

  return (
    <div className="flex items-center gap-3 mt-4">
      {/* Upvote Button */}
      <button
        onClick={() => handleVote('up')}
        className={`riso-vote-button px-4 py-2 flex items-center gap-2 transform transition-all ${
          currentUserVote === 'up' 
            ? 'riso-vote-button selected rotate-2 scale-110' 
            : 'hover:rotate-2 hover:scale-105'
        } ${isAnimating && currentUserVote === 'up' ? 'riso-shake' : ''}`}
        style={{
          backgroundColor: currentUserVote === 'up' ? 'var(--riso-green)' : 'var(--riso-paper)',
          color: currentUserVote === 'up' ? 'var(--riso-paper)' : 'var(--riso-black)'
        }}
      >
        <ThumbsUp className="w-5 h-5" />
        <span className="font-black text-sm">{votes.up}</span>
      </button>

      {/* Downvote Button */}
      <button
        onClick={() => handleVote('down')}
        className={`riso-vote-button px-4 py-2 flex items-center gap-2 transform transition-all ${
          currentUserVote === 'down' 
            ? 'riso-vote-button selected -rotate-2 scale-110' 
            : 'hover:-rotate-2 hover:scale-105'
        } ${isAnimating && currentUserVote === 'down' ? 'riso-shake' : ''}`}
        style={{
          backgroundColor: currentUserVote === 'down' ? 'var(--riso-red)' : 'var(--riso-paper)',
          color: currentUserVote === 'down' ? 'var(--riso-paper)' : 'var(--riso-black)'
        }}
      >
        <ThumbsDown className="w-5 h-5" />
        <span className="font-black text-sm">{votes.down}</span>
      </button>

      {/* Decorative element that appears on vote */}
      {isAnimating && (
        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 pointer-events-none">
          <Sparkles 
            className="w-8 h-8 animate-ping" 
            style={{ color: currentUserVote === 'up' ? 'var(--riso-green)' : 'var(--riso-red)' }}
          />
        </div>
      )}

      {/* Score indicator */}
      <div className="ml-4 flex items-center gap-1">
        <span className="font-black text-xs uppercase tracking-wider">Score:</span>
        <span 
          className="riso-badge text-xs"
          style={{
            backgroundColor: votes.up > votes.down ? 'var(--riso-green)' : 
                           votes.down > votes.up ? 'var(--riso-red)' : 
                           'var(--riso-yellow)',
            color: 'var(--riso-paper)'
          }}
        >
          {votes.up - votes.down > 0 ? '+' : ''}{votes.up - votes.down}
        </span>
      </div>
    </div>
  )
}
EOF

echo "✨ Risograph makeover complete!"
echo "📁 Original files backed up in ./backup_original/"
echo ""
echo "🎨 Files updated:"
echo "  - styles/globals.css"
echo "  - pages/index.tsx"
echo "  - pages/debate/[id].tsx"
echo "  - components/EloLeaderboard.tsx"
echo "  - components/TypingIndicator.tsx"
echo "  - components/TurnVoteButtons.tsx"
echo ""
echo "🚀 Run 'npm run dev' to see your risograph-styled LLM Debate Arena!"
