'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Mic, Volume2, Send } from 'lucide-react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface VoiceInterventionPanelProps {
  anomaly: any
  speakerZones: any[]
  userEmail: string
}

export function VoiceInterventionPanel({ anomaly, speakerZones, userEmail }: VoiceInterventionPanelProps) {
  const [message, setMessage] = useState('')
  const [selectedZone, setSelectedZone] = useState('')
  const [isRecording, setIsRecording] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const router = useRouter()
  
  const handleBroadcast = async () => {
    if (!message.trim() || !selectedZone) return
    
    setIsSending(true)
    try {
      const response = await fetch('/api/interventions/voice/broadcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          anomaly_id: anomaly.id,
          zone: selectedZone,
          message_text: message,
          admin_id: userEmail,
          admin_name: userEmail
        })
      })
      
      if (response.ok) {
        setMessage('')
        router.refresh()
      }
    } catch (error) {
      console.error('Error broadcasting:', error)
    } finally {
      setIsSending(false)
    }
  }
  
  const handleTTS = async () => {
    if (!message.trim() || !selectedZone) return
    
    setIsSending(true)
    try {
      const response = await fetch('/api/interventions/voice/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          anomaly_id: anomaly.id,
          zone: selectedZone,
          message_text: message,
          admin_id: userEmail,
          admin_name: userEmail
        })
      })
      
      if (response.ok) {
        setMessage('')
        router.refresh()
      }
    } catch (error) {
      console.error('Error with TTS:', error)
    } finally {
      setIsSending(false)
    }
  }
  
  const suggestedMessages = [
    `${anomaly.user_name}, please return to ${anomaly.expected_location} immediately.`,
    `${anomaly.user_name}, you are in an unauthorized area. Please proceed to ${anomaly.expected_location}.`,
    `Attention ${anomaly.user_name}, report to the administration office immediately.`
  ]
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mic className="w-5 h-5" />
          Voice Intervention System
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium mb-2 block">Select Speaker Zone</label>
          <Select value={selectedZone} onValueChange={setSelectedZone}>
            <SelectTrigger>
              <SelectValue placeholder="Choose a zone..." />
            </SelectTrigger>
            <SelectContent>
              {speakerZones.map(zone => (
                <SelectItem key={zone.id} value={zone.zone_code}>
                  {zone.zone_name} ({zone.speaker_count} speakers)
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <label className="text-sm font-medium mb-2 block">Message</label>
          <Textarea
            value={message}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setMessage(e.target.value)}
            placeholder="Type your message or select a suggested message below..."
            rows={4}
            className="resize-none"
          />
        </div>
        
        <div>
          <label className="text-sm font-medium mb-2 block">Suggested Messages</label>
          <div className="space-y-2">
            {suggestedMessages.map((msg, idx) => (
              <button
                key={idx}
                onClick={() => setMessage(msg)}
                className="w-full text-left p-3 text-sm bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors"
              >
                {msg}
              </button>
            ))}
          </div>
        </div>
        
        <div className="flex gap-3">
          <Button
            onClick={handleBroadcast}
            disabled={!message.trim() || !selectedZone || isSending}
            className="flex-1"
          >
            <Volume2 className="w-4 h-4 mr-2" />
            Live Broadcast
          </Button>
          
          <Button
            onClick={handleTTS}
            disabled={!message.trim() || !selectedZone || isSending}
            variant="outline"
            className="flex-1"
          >
            <Send className="w-4 h-4 mr-2" />
            Text-to-Speech
          </Button>
        </div>
        
        <div className="text-xs text-gray-500 bg-blue-50 p-3 rounded-lg">
          <strong>Note:</strong> Voice interventions are logged and can be reviewed in the intervention history.
        </div>
      </CardContent>
    </Card>
  )
}
