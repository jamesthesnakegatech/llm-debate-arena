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
