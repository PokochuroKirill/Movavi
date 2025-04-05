import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Check, Search, MessageSquare, UserCheck } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Profile } from '@/types/database';

interface SupportRequest {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: string;
  created_at: string;
  user_id: string | null;
}

const AdminProPage = () => {
  const [supportMessages, setSupportMessages] = useState<SupportRequest[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadSupportMessages();
    loadProfiles();
    verifyDevHub();
  }, []);

  const verifyDevHub = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('username', 'DevHub')
        .single();
        
      if (error) {
        console.error('Error finding DevHub profile:', error);
        return;
      }
      
      if (data && !data.is_verified) {
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ is_verified: true })
          .eq('id', data.id);
          
        if (updateError) {
          console.error('Error verifying DevHub:', updateError);
        } else {
          console.log('DevHub profile has been verified successfully');
          toast({
            title: 'Успех',
            description: '@DevHub получил верификацию',
          });
        }
      }
    } catch (error) {
      console.error('Error in DevHub verification:', error);
    }
  };

  const loadSupportMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('support_requests')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      setSupportMessages(data || []);
    } catch (error) {
      console.error('Error loading support messages:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить сообщения',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const loadProfiles = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      setProfiles(data || []);
      console.log("Loaded profiles:", data);
    } catch (error) {
      console.error('Error loading profiles:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить пользователей',
        variant: 'destructive',
      });
    }
  };

  const updateMessageStatus = async (id: string, status: string) => {
    try {
      const { error } = await supabase
        .from('support_requests')
        .update({ status })
        .eq('id', id);
        
      if (error) throw error;
      
      setSupportMessages(
        supportMessages.map(msg => 
          msg.id === id ? { ...msg, status } : msg
        )
      );
      
      toast({
        title: 'Успех',
        description: 'Статус сообщения обновлен',
      });
    } catch (error) {
      console.error('Error updating message status:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось обновить статус',
        variant: 'destructive',
      });
    }
  };

  const verifyProfile = async (id: string, isVerified: boolean) => {
    try {
      console.log(`Updating profile ${id} verification to ${isVerified}`);
      
      const { error } = await supabase
        .from('profiles')
        .update({ is_verified: isVerified })
        .eq('id', id);
        
      if (error) {
        console.error('Error in update query:', error);
        throw error;
      }
      
      setProfiles(
        profiles.map(profile => 
          profile.id === id ? { ...profile, is_verified: isVerified } : profile
        )
      );
      
      toast({
        title: 'Успех',
        description: isVerified ? 
          'Профиль верифицирован' : 
          'Верификация профиля отменена',
      });
    } catch (error) {
      console.error('Error updating verification status:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось обновить статус верификации',
        variant: 'destructive',
      });
    }
  };

  const filteredProfiles = profiles.filter(profile => 
    profile.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    profile.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-grow container mx-auto px-4 py-20">
        <h1 className="text-3xl font-bold mb-8 mt-8">Панель Администратора Pro</h1>
        
        <Tabs defaultValue="messages" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="messages">
              <MessageSquare className="h-4 w-4 mr-2" />
              Сообщения
            </TabsTrigger>
            <TabsTrigger value="verification">
              <UserCheck className="h-4 w-4 mr-2" />
              Верификация пользователей
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="messages">
            <Card>
              <CardHeader>
                <CardTitle>Сообщения от пользователей</CardTitle>
              </CardHeader>
              <CardContent>
                {supportMessages.length > 0 ? (
                  <div className="space-y-6 max-h-[600px] overflow-y-auto">
                    {supportMessages.map(request => (
                      <div 
                        key={request.id} 
                        className="p-4 border rounded-lg"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="font-bold">{request.subject}</h3>
                            <p className="text-sm">
                              От: {request.name} ({request.email})
                            </p>
                          </div>
                          <div>
                            <span 
                              className={`px-2 py-1 text-xs rounded-full ${
                                request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                                request.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                                request.status === 'resolved' ? 'bg-green-100 text-green-800' :
                                'bg-red-100 text-red-800'
                              }`}
                            >
                              {request.status === 'pending' ? 'В ожидании' : 
                               request.status === 'in_progress' ? 'В обработке' :
                               request.status === 'resolved' ? 'Решено' : 'Отклонено'}
                            </span>
                          </div>
                        </div>
                        <p className="text-sm text-gray-500 mb-2">
                          {formatDate(request.created_at)}
                        </p>
                        <p className="text-gray-800 dark:text-gray-200 mb-4 whitespace-pre-wrap">
                          {request.message}
                        </p>
                        
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant={request.status === 'in_progress' ? 'default' : 'outline'}
                            className={request.status === 'in_progress' ? 'bg-blue-500' : ''}
                            onClick={() => updateMessageStatus(request.id, 'in_progress')}
                          >
                            В обработке
                          </Button>
                          <Button
                            size="sm"
                            variant={request.status === 'resolved' ? 'default' : 'outline'}
                            className={request.status === 'resolved' ? 'bg-green-500' : ''}
                            onClick={() => updateMessageStatus(request.id, 'resolved')}
                          >
                            Решено
                          </Button>
                          <Button
                            size="sm"
                            variant={request.status === 'rejected' ? 'destructive' : 'outline'}
                            onClick={() => updateMessageStatus(request.id, 'rejected')}
                          >
                            Отклонено
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center py-8 text-gray-500">
                    Нет сообщений от пользователей
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="verification">
            <Card>
              <CardHeader>
                <CardTitle>Верификация пользователей</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-6">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <Input
                      className="pl-10"
                      placeholder="Поиск пользователей..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
                
                {filteredProfiles.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredProfiles.map(profile => (
                      <div key={profile.id} className="border rounded-lg p-4 flex items-center justify-between">
                        <div className="flex items-center">
                          <Avatar className="h-10 w-10 mr-3">
                            <AvatarImage src={profile.avatar_url || undefined} />
                            <AvatarFallback>
                              {(profile.full_name || profile.username || 'U').substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="flex items-center">
                              <h3 className="font-medium">
                                {profile.full_name || profile.username || 'Пользователь'}
                              </h3>
                              {profile.is_verified && (
                                <Badge className="ml-2 gradient-bg text-white">
                                  <Check className="h-3 w-3 mr-1" />
                                  Верифицирован
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-gray-500">
                              @{profile.username || 'username'}
                            </p>
                          </div>
                        </div>
                        
                        <Button
                          size="sm"
                          variant={profile.is_verified ? "destructive" : "default"}
                          className={!profile.is_verified ? "gradient-bg text-white" : ""}
                          onClick={() => verifyProfile(profile.id, !profile.is_verified)}
                        >
                          {profile.is_verified ? "Отменить верификацию" : "Верифицировать"}
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center py-8 text-gray-500">
                    {searchTerm ? "Пользователи не найдены" : "Нет зарегистрированных пользователей"}
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      <Footer />
    </div>
  );
};

export default AdminProPage;
