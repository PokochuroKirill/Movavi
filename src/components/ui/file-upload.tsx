
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, X, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FileUploadProps {
  label: string;
  accept?: string;
  multiple?: boolean;
  maxFiles?: number;
  maxSize?: number; // в байтах
  onFilesChange: (files: File[]) => void;
  disabled?: boolean;
  className?: string;
  preview?: boolean;
  currentImageUrl?: string;
  currentImageAlt?: string;
}

const FileUpload: React.FC<FileUploadProps> = ({
  label,
  accept = "image/*",
  multiple = false,
  maxFiles = 1,
  maxSize = 5 * 1024 * 1024, // 5MB по умолчанию
  onFilesChange,
  disabled = false,
  className,
  preview = true,
  currentImageUrl,
  currentImageAlt = "Текущее изображение"
}) => {
  const [files, setFiles] = useState<File[]>([]);
  const [dragOver, setDragOver] = useState(false);

  const handleFileChange = (selectedFiles: FileList | null) => {
    if (!selectedFiles) return;

    const fileArray = Array.from(selectedFiles);
    
    // Проверка количества файлов
    if (files.length + fileArray.length > maxFiles) {
      return;
    }

    // Проверка размера файлов
    const oversizedFiles = fileArray.filter(file => file.size > maxSize);
    if (oversizedFiles.length > 0) {
      return;
    }

    const newFiles = multiple ? [...files, ...fileArray] : fileArray;
    setFiles(newFiles);
    onFilesChange(newFiles);
  };

  const removeFile = (index: number) => {
    const newFiles = files.filter((_, i) => i !== index);
    setFiles(newFiles);
    onFilesChange(newFiles);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFileChange(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  return (
    <div className={cn("space-y-3", className)}>
      <Label>{label}</Label>
      
      <div
        className={cn(
          "border-2 border-dashed rounded-lg p-6 text-center transition-colors",
          dragOver ? "border-blue-500 bg-blue-50 dark:bg-blue-950/20" : "border-gray-300 dark:border-gray-600",
          disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:border-gray-400 dark:hover:border-gray-500"
        )}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => !disabled && document.getElementById(`file-upload-${label}`)?.click()}
      >
        <div className="flex flex-col items-center gap-2">
          <Upload className="h-8 w-8 text-gray-400" />
          <div className="text-sm text-gray-600 dark:text-gray-400">
            <span className="font-medium text-blue-600 dark:text-blue-400">
              Нажмите для выбора
            </span>
            {' '}или перетащите файлы сюда
          </div>
          <div className="text-xs text-gray-500">
            {multiple && `Максимум ${maxFiles} файлов, `}
            до {Math.round(maxSize / (1024 * 1024))}MB каждый
          </div>
        </div>
      </div>

      <input
        id={`file-upload-${label}`}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={(e) => handleFileChange(e.target.files)}
        className="hidden"
        disabled={disabled}
      />

      {/* Превью текущего изображения */}
      {currentImageUrl && files.length === 0 && preview && (
        <div className="space-y-2">
          <div className="text-sm text-gray-600 dark:text-gray-400">Текущее изображение:</div>
          <img 
            src={currentImageUrl} 
            alt={currentImageAlt}
            className="w-full max-w-xs h-32 object-cover rounded-md border"
          />
        </div>
      )}

      {/* Превью выбранных файлов */}
      {files.length > 0 && preview && (
        <div className="space-y-2">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Выбранные файлы ({files.length}):
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {files.map((file, index) => (
              <div key={index} className="relative group">
                {file.type.startsWith('image/') ? (
                  <img
                    src={URL.createObjectURL(file)}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-24 object-cover rounded-md border"
                  />
                ) : (
                  <div className="w-full h-24 bg-gray-100 dark:bg-gray-800 rounded-md border flex items-center justify-center">
                    <span className="text-xs text-gray-500 text-center p-2">
                      {file.name}
                    </span>
                  </div>
                )}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile(index);
                  }}
                  className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                  disabled={disabled}
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUpload;
