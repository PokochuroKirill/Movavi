
import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Bell, Send, Users, Star, CheckCircle } from "lucide-react";

const NotificationCenter: React.FC = () => {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [type, setType] = useState("info");
  const [targetVerified, setTargetVerified] = useState(false);
  const [targetPro, setTargetPro] = useState(false);
  const [sendToAll, setSendToAll] = useState(true);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const sendNotificationMutation = useMutation({
    mutationFn: async ({ title, message, type, targetVerified, targetPro }: {
      title: string;
      message: string;
      type: string;
      targetVerified: boolean;
      targetPro: boolean;
    }) => {
      const { data, error } = await supabase.rpc('send_mass_notification', {
        notification_title: title,
        notification_message: message,
        notification_type: type,
        target_verified_only: targetVerified,
        target_pro_only: targetPro
      });
      
      if (error) throw error;
      return data;
    },
    onSuccess: (count) => {
      toast({
        title: "Уведомления отправлены",
        description: `Уведомление получили ${count} пользователей`,
      });
      setTitle("");
      setMessage("");
      setType("info");
      setTargetVerified(false);
      setTargetPro(false);
    },
    onError: (error) => {
      toast({
        title: "Ошибка",
        description: "Не удалось отправить уведомления",
        variant: "destructive",
      });
      console.error('Error sending notifications:', error);
    },
  });

  const handleSendNotification = () => {
    if (!title.trim() || !message.trim()) {
      toast({
        title: "Ошибка",
        description: "Заполните заголовок и сообщение",
        variant: "destructive",
      });
      return;
    }

    sendNotificationMutation.mutate({
      title,
      message,
      type,
      targetVerified,
      targetPro
    });
  };

  const getTypeIcon = (notificationType: string) => {
    switch (notificationType) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'error':
        return <Bell className="w-5 h-5 text-red-600" />;
      case 'warning':
        return <Bell className="w-5 h-5 text-yellow-600" />;
      default:
        return <Bell className="w-5 h-5 text-blue-600" />;
    }
  };

  const handleVerifiedChange = (checked: boolean | "indeterminate") => {
    setTargetVerified(checked === true);
  };

  const handleProChange = (checked: boolean | "indeterminate") => {
    setTargetPro(checked === true);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Центр уведомлений
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block mb-2 text-sm font-medium">Заголовок</label>
                <Input
                  placeholder="Введите заголовок уведомления"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
              
              <div>
                <label className="block mb-2 text-sm font-medium">Тип уведомления</label>
                <Select value={type} onValueChange={setType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="info">
                      <div className="flex items-center gap-2">
                        <Bell className="w-4 h-4 text-blue-600" />
                        Информация
                      </div>
                    </SelectItem>
                    <SelectItem value="success">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        Успех
                      </div>
                    </SelectItem>
                    <SelectItem value="warning">
                      <div className="flex items-center gap-2">
                        <Bell className="w-4 h-4 text-yellow-600" />
                        Предупреждение
                      </div>
                    </SelectItem>
                    <SelectItem value="error">
                      <div className="flex items-center gap-2">
                        <Bell className="w-4 h-4 text-red-600" />
                        Ошибка
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <label className="block text-sm font-medium">Целевая аудитория</label>
                
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="sendToAll" 
                    checked={sendToAll}
                    onCheckedChange={(checked) => setSendToAll(checked === true)}
                  />
                  <label htmlFor="sendToAll" className="flex items-center gap-2 text-sm font-medium">
                    <Users className="w-4 h-4" />
                    Отправить всем пользователям
                  </label>
                </div>
                
                {!sendToAll && (
                  <>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="verified" 
                        checked={targetVerified}
                        onCheckedChange={handleVerifiedChange}
                      />
                      <label htmlFor="verified" className="flex items-center gap-2 text-sm">
                        <Star className="w-4 h-4" />
                        Только верифицированные пользователи
                      </label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="pro" 
                        checked={targetPro}
                        onCheckedChange={handleProChange}
                      />
                      <label htmlFor="pro" className="flex items-center gap-2 text-sm">
                        <Users className="w-4 h-4" />
                        Только PRO пользователи
                      </label>
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block mb-2 text-sm font-medium">Сообщение</label>
                <Textarea
                  placeholder="Введите текст уведомления"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={8}
                />
              </div>

              <Button 
                onClick={() => sendNotificationMutation.mutate({
                  title,
                  message,
                  type,
                  targetVerified: sendToAll ? false : targetVerified,
                  targetPro: sendToAll ? false : targetPro
                })}
                disabled={sendNotificationMutation.isPending || !title.trim() || !message.trim()}
                className="w-full"
              >
                <Send className="mr-2 h-4 w-4" />
                {sendNotificationMutation.isPending ? "Отправка..." : "Отправить уведомление"}
              </Button>
            </div>
          </div>

          {title && message && (
            <div className="mt-6 p-4 border rounded-lg bg-muted/50">
              <h4 className="font-medium mb-2">Предварительный просмотр:</h4>
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border">
                <div className="flex items-start gap-3">
                  {getTypeIcon(type)}
                  <div className="flex-1">
                    <h5 className="font-semibold text-sm">{title}</h5>
                    <p className="text-sm text-muted-foreground mt-1">{message}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default NotificationCenter;
