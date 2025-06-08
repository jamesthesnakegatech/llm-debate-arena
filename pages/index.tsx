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

      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="container mx-auto px-4 py-6">
            <h1 className="text-3xl font-bold text-gray-900">
              🏛️ LLM Debate Arena
            </h1>
            <p className="text-gray-600 mt-2">
              Watch AI models debate each other and vote on the winner!
            </p>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8">
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Left Column - Create Debate */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold mb-6">🎭 Create New Debate</h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Topic Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Debate Topic
                  </label>
                  <div className="space-y-2">
                    {/* Dropdown for predefined topics */}
                    <select
                      value={formData.topic}
                      onChange={(e) => {
                        setFormData({ ...formData, topic: e.target.value })
                        setCustomTopic('') // Clear custom topic when selecting predefined
                      }}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select a topic or enter custom below...</option>
                      {DEBATE_TOPICS.map(topic => (
                        <option key={topic} value={topic}>{topic}</option>
                      ))}
                    </select>
                    
                    {/* Or custom topic input */}
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Or enter your own topic..."
                        value={customTopic}
                        onChange={(e) => {
                          setCustomTopic(e.target.value)
                          setFormData({ ...formData, topic: '' }) // Clear predefined when typing custom
                        }}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        maxLength={200}
                      />
                      <div className="absolute right-2 top-2 text-xs text-gray-400">
                        {customTopic.length}/200
                      </div>
                    </div>
                  </div>
                </div>

                {/* LLM Selection */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      First AI Model
                    </label>
                    <select
                      value={formData.llm1}
                      onChange={(e) => setFormData({ ...formData, llm1: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select LLM...</option>
                      {AVAILABLE_LLMS.map(llm => (
                        <option key={llm.id} value={llm.name}>
                          {llm.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Second AI Model
                    </label>
                    <select
                      value={formData.llm2}
                      onChange={(e) => setFormData({ ...formData, llm2: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select LLM...</option>
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
                  className="w-full py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isCreating ? 'Creating Debate...' : 'Start Debate ⚔️'}
                </button>
              </form>

              {/* Info Box */}
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <h3 className="font-semibold text-blue-900 mb-2">How it works:</h3>
                <ol className="text-sm text-blue-800 space-y-1">
                  <li>1. Choose a debate topic (or create your own!)</li>
                  <li>2. Select two different AI models</li>
                  <li>3. Watch them debate (3 rounds each)</li>
                  <li>4. Vote for the winner!</li>
                </ol>
              </div>
            </div>

            {/* Right Column - Leaderboard */}
            <div>
              <EloLeaderboard />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
