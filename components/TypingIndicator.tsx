interface TypingIndicatorProps {
  llmName: string
  color: 'blue' | 'red'
}

export default function TypingIndicator({ llmName, color }: TypingIndicatorProps) {
  return (
    <div className={`flex ${color === 'blue' ? 'justify-start' : 'justify-end'} mb-4`}>
      <div className={`max-w-3xl ${color === 'blue' ? 'mr-12' : 'ml-12'}`}>
        <div className={`p-4 rounded-lg ${
          color === 'blue' ? 'bg-blue-50 border-l-4 border-blue-300' : 
          'bg-red-50 border-r-4 border-red-300'
        }`}>
          <div className="flex items-center space-x-2">
            <span className={`font-medium ${
              color === 'blue' ? 'text-blue-700' : 'text-red-700'
            }`}>
              {llmName}
            </span>
            <span className="text-gray-500 text-sm">is thinking...</span>
          </div>
          
          <div className="flex items-center space-x-1 mt-2">
            <div className={`w-2 h-2 rounded-full animate-bounce ${
              color === 'blue' ? 'bg-blue-400' : 'bg-red-400'
            }`} style={{ animationDelay: '0ms' }}></div>
            <div className={`w-2 h-2 rounded-full animate-bounce ${
              color === 'blue' ? 'bg-blue-400' : 'bg-red-400'
            }`} style={{ animationDelay: '150ms' }}></div>
            <div className={`w-2 h-2 rounded-full animate-bounce ${
              color === 'blue' ? 'bg-blue-400' : 'bg-red-400'
            }`} style={{ animationDelay: '300ms' }}></div>
          </div>
        </div>
      </div>
    </div>
  )
}
