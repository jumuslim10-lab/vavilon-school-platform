'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatDate } from '@/lib/utils'
import { Bell, Check, Trash2, Filter, BookOpen, ClipboardList, Users, AlertCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface NotificationsClientProps {
  notifications: any[]
  userId: string
}

export default function NotificationsClient({
  notifications,
  userId
}: NotificationsClientProps) {
  const [filter, setFilter] = useState<string>('all')
  const [items, setItems] = useState(notifications)

  const handleMarkAsRead = async (notificationId: string) => {
    const supabase = createClient()
    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId)

    setItems(items.map(item =>
      item.id === notificationId ? { ...item, is_read: true } : item
    ))
  }

  const handleMarkAllAsRead = async () => {
    const supabase = createClient()
    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', userId)
      .eq('is_read', false)

    setItems(items.map(item => ({ ...item, is_read: true })))
  }

  const handleDelete = async (notificationId: string) => {
    const supabase = createClient()
    await supabase
      .from('notifications')
      .delete()
      .eq('id', notificationId)

    setItems(items.filter(item => item.id !== notificationId))
  }

  const filteredNotifications = items.filter(notif => {
    if (filter === 'unread') return !notif.is_read
    if (filter === 'read') return notif.is_read
    return true
  })

  const unreadCount = items.filter(n => !n.is_read).length

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'grade': return <BookOpen className="h-5 w-5 text-blue-500" />
      case 'assignment': return <ClipboardList className="h-5 w-5 text-green-500" />
      case 'attendance': return <Users className="h-5 w-5 text-yellow-500" />
      case 'announcement': return <Bell className="h-5 w-5 text-purple-500" />
      default: return <AlertCircle className="h-5 w-5 text-gray-500" />
    }
  }

  const getNotificationTypeName = (type: string) => {
    switch (type) {
      case 'grade': return 'Оценка'
      case 'assignment': return 'Задание'
      case 'attendance': return 'Посещаемость'
      case 'announcement': return 'Объявление'
      default: return 'Уведомление'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Уведомления</h1>
          <p className="text-gray-500 mt-1">
            {unreadCount > 0 ? `${unreadCount} непрочитанных` : 'Все прочитано'}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button onClick={handleMarkAllAsRead}>
            <Check className="h-4 w-4 mr-2" />
            Прочитать все
          </Button>
        )}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-gray-500" />
            <div className="flex gap-2">
              <Button
                variant={filter === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('all')}
              >
                Все ({items.length})
              </Button>
              <Button
                variant={filter === 'unread' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('unread')}
              >
                Непрочитанные ({unreadCount})
              </Button>
              <Button
                variant={filter === 'read' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('read')}
              >
                Прочитанные ({items.length - unreadCount})
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notifications list */}
      <Card>
        <CardContent className="p-0">
          <div className="divide-y divide-gray-200">
            {filteredNotifications.map(notif => (
              <div
                key={notif.id}
                className={`p-4 hover:bg-gray-50 transition-colors ${
                  !notif.is_read ? 'bg-blue-50' : ''
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 mt-1">
                    {getNotificationIcon(notif.notification_type)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="default" className="text-xs">
                        {getNotificationTypeName(notif.notification_type)}
                      </Badge>
                      {!notif.is_read && (
                        <Badge variant="info" className="text-xs">
                          Новое
                        </Badge>
                      )}
                    </div>

                    <h3 className="font-semibold text-sm mb-1">{notif.title}</h3>
                    <p className="text-sm text-gray-600 mb-2">{notif.content}</p>

                    <div className="flex items-center justify-between">
                      <p className="text-xs text-gray-500">
                        {formatDate(notif.created_at, 'long')}
                      </p>

                      <div className="flex items-center gap-2">
                        {!notif.is_read && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleMarkAsRead(notif.id)}
                          >
                            <Check className="h-4 w-4 mr-1" />
                            Прочитано
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(notif.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {filteredNotifications.length === 0 && (
              <div className="text-center py-12">
                <Bell className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-400">
                  {filter === 'unread'
                    ? 'Нет непрочитанных уведомлений'
                    : filter === 'read'
                    ? 'Нет прочитанных уведомлений'
                    : 'Уведомлений нет'}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
