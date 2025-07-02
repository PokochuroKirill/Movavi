import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Download, File, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ProjectFile {
  id: string;
  file_url: string;
  file_name: string;
  file_size: number;
  created_at: string;
}

interface ProjectFilesListProps {
  projectId: string;
}

const ProjectFilesList: React.FC<ProjectFilesListProps> = ({ projectId }) => {
  const [files, setFiles] = useState<ProjectFile[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const { data, error } = await supabase
          .from('project_files')
          .select('*')
          .eq('project_id', projectId)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setFiles(data || []);
      } catch (error) {
        console.error('Error fetching project files:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFiles();
  }, [projectId]);

  const handleDownload = async (file: ProjectFile) => {
    try {
      const { data, error } = await supabase.storage
        .from('project-files')
        .download(file.file_url);

      if (error) throw error;

      // Создаем URL для скачивания
      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.file_name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        description: `Файл "${file.file_name}" успешно скачан`
      });
    } catch (error: any) {
      console.error('Error downloading file:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось скачать файл",
        variant: "destructive"
      });
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (files.length === 0) {
    return null;
  }

  return (
    <div className="mt-6">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <File className="h-5 w-5" />
        Прикрепленные файлы
      </h3>
      
      <div className="space-y-3">
        {files.map((file) => (
          <div key={file.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="flex items-center gap-3">
              <File className="h-5 w-5 text-gray-500" />
              <div>
                <p className="font-medium text-gray-900 dark:text-white">{file.file_name}</p>
                <p className="text-sm text-gray-500">{formatFileSize(file.file_size)}</p>
              </div>
            </div>
            
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Скачать
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-orange-500" />
                    Предупреждение о безопасности
                  </AlertDialogTitle>
                  <AlertDialogDescription className="text-left">
                    <strong>Внимание!</strong> Вы собираетесь скачать файл <strong>"{file.file_name}"</strong>.
                    <br /><br />
                    Пожалуйста, учтите:
                    <ul className="list-disc list-inside mt-2 space-y-1">
                      <li>Содержимое файлов не модерируется администрацией</li>
                      <li>Скачивайте файлы только от доверенных источников</li>
                      <li>Проверьте файл антивирусом перед запуском</li>
                      <li>Администрация не несет ответственности за содержимое файлов</li>
                    </ul>
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Отмена</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={() => handleDownload(file)}
                    className="bg-orange-500 hover:bg-orange-600"
                  >
                    Всё равно скачать
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProjectFilesList;