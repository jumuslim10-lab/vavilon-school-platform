'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { formatDate } from '@/lib/utils'
import { Send, Search, User, MessageSquare, Clock } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface MessagesClientProps {
  userId: string
  conversations: any[]
  contacts: any[]
}

export default function MessagesClient({
  userId,
  conversations,
  contacts
}: MessagesClientProps) {
  const [selectedConversation, setSelectedConversation] = useState<any>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [sending, setSending] = useState(false)

  const loadMessages = async (conversationId: string) => {
    const supabase = createClient()
    const { data } = await supabase
      .from('messages')
      .select('*, sender:profiles!messages_sender_id_fkey(full_name)')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true })

    setMessages(data || [])
  }

  const handleSelectConversation = async (conversation: any) => {
    setSelectedConversation(conversation)
    await loadMessages(conversation.id)
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !selectedConversation) return

    setSending(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.from('messages').insert({
        conversation_id: selectedConversation.id,
        sender_id: userId,
        content: newMessage.trim()
      })

      if (!error) {
        setNewMessage('')
        await loadMessages(selectedConversation.id)
      }
    } catch (error) {
      console.error('Error sending message:', error)
    } finally {
      setSending(false)
    }
  }

  const filteredConversations = conversations.filter(conv =>
    conv.participant_name?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-[var(--font-size-3xl)] font-bold text-[rgb(var(--color-text-primary))] tracking-[var(--letter-spacing-tight)]">
          Сообщения
        </h1>
        <p className="text-[var(--font-size-sm)] text-[rgb(var(--color-text-secondary))]">Внутренняя переписка</p>
      </div>

      <div className="grid grid-cols-12 gap-6 h-[calc(100vh-250px)]">
        {/* Conversations list */}
        <Card className="col-span-4 flex flex-col">
          <CardHeader className="border-b border-[rgb(var(--color-border-subtle))]">
            <CardTitle className="text-[var(--font-size-lg)]">Диалоги</CardTitle>
            <div className="relative mt-3">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[rgb(var(--color-text-tertiary))]" />
              <Input
                type="text"
                placeholder="Поиск..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto p-0">
            <div className="divide-y divide-[rgb(var(--color-border-subtle))]">
              {filteredConversations.map(conv => (
                <button
                  key={conv.id}
                  onClick={() => handleSelectConversation(conv)}
                  className={`w-full text-left p-4 transition-colors duration-200 ${
                    selectedConversation?.id === conv.id
                      ? 'bg-[rgb(var(--color-accent-light))] border-l-2 border-[rgb(var(--color-accent))]'
                      : 'hover:bg-[rgb(var(--color-surface-hover))]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[rgb(var(--color-accent-light))] flex items-center justify-center flex-shrink-0">
                      <User className="h-5 w-5 text-[rgb(var(--color-accent))]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-[var(--font-size-sm)] text-[rgb(var(--color-text-primary))] truncate">{conv.participant_name}</p>
                      <p className="text-[var(--font-size-xs)] text-[rgb(var(--color-text-tertiary))] truncate">{conv.last_message}</p>
                    </div>
                    {conv.unread_count > 0 && (
                      <Badge variant="default" className="ml-2 flex-shrink-0">
                        {conv.unread_count}
                      </Badge>
                    )}
                  </div>
                </button>
              ))}

              {filteredConversations.length === 0 && (
                <div className="text-center py-12">
                  <MessageSquare className="h-12 w-12 text-[rgb(var(--color-text-tertiary))] mx-auto mb-3 opacity-50" />
                  <p className="text-[rgb(var(--color-text-tertiary))]">Диалогов нет</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Messages */}
        <Card className="col-span-8 flex flex-col">
          {selectedConversation ? (
            <>
              <CardHeader className="border-b border-[rgb(var(--color-border-subtle))]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[rgb(var(--color-accent-light))] flex items-center justify-center">
                    <User className="h-5 w-5 text-[rgb(var(--color-accent))]" />
                  </div>
                  <div>
                    <CardTitle className="text-[var(--font-size-lg)] text-[rgb(var(--color-text-primary))]">{selectedConversation.participant_name}</CardTitle>
                    <p className="text-[var(--font-size-xs)] text-[rgb(var(--color-text-tertiary))]">В сети</p>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map(msg => {
                  const isOwn = msg.sender_id === userId
                  return (
                    <div key={msg.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[70%] ${isOwn ? 'order-2' : 'order-1'}`}>
                        {!isOwn && (
                          <p className="text-[var(--font-size-xs)] text-[rgb(var(--color-text-tertiary))] mb-1">{msg.sender?.full_name}</p>
                        )}
                        <div className={`rounded-[var(--radius-md)] p-3 ${
                          isOwn
                            ? 'bg-[rgb(var(--color-accent))] text-white'
                            : 'bg-[rgb(var(--color-surface-hover))] text-[rgb(var(--color-text-primary))]'
                        }`}>
                          <p className="text-[var(--font-size-sm)]">{msg.content}</p>
                          <p className={`text-[var(--font-size-xs)] mt-1 ${isOwn ? 'text-white/70' : 'text-[rgb(var(--color-text-tertiary))]'}`}>
                            {new Date(msg.created_at).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </CardContent>

              <div className="border-t border-[rgb(var(--color-border-subtle))] p-4">
                <form onSubmit={handleSendMessage} className="flex gap-2">
                  <Input
                    type="text"
                    placeholder="Введите сообщение..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    disabled={sending}
                    className="flex-1"
                  />
                  <Button type="submit" disabled={sending || !newMessage.trim()}>
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
              </div>
            </>
          ) : (
            <CardContent className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <MessageSquare className="h-16 w-16 text-[rgb(var(--color-text-tertiary))] mx-auto mb-4 opacity-50" />
                <p className="text-[rgb(var(--color-text-tertiary))]">Выберите диалог для начала переписки</p>
              </div>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  )
}
