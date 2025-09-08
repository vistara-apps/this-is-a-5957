import React, { useState } from 'react'
import { Send } from 'lucide-react'
import Button from './Button'

const ChatInput = ({ onSubmit, disabled = false, placeholder = "Type your message..." }) => {
  const [input, setInput] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (input.trim() && !disabled) {
      onSubmit(input.trim())
      setInput('')
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex space-x-2">
      <div className="flex-1">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={placeholder}
          disabled={disabled}
          rows={3}
          className="w-full px-4 py-3 bg-bg border border-text-secondary border-opacity-30 rounded-lg 
            text-text-primary placeholder-text-secondary resize-none focus:outline-none focus:ring-2 
            focus:ring-primary focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
        />
      </div>
      <div className="flex-shrink-0 flex items-end">
        <Button
          type="submit"
          variant="primary"
          disabled={disabled || !input.trim()}
          className="px-4 py-3 h-fit"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </form>
  )
}

export default ChatInput