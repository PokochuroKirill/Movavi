
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Play, Share, Copy, Save, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface CodePlaygroundProps {
  initialCode?: string;
  initialLanguage?: string;
  readOnly?: boolean;
}

const CodePlayground: React.FC<CodePlaygroundProps> = ({
  initialCode = '',
  initialLanguage = 'javascript',
  readOnly = false
}) => {
  const [code, setCode] = useState(initialCode);
  const [language, setLanguage] = useState(initialLanguage);
  const [output, setOutput] = useState<string>('');
  const [isRunning, setIsRunning] = useState(false);
  const { toast } = useToast();
  
  // Languages supported by the playground
  const languages = [
    { id: 'javascript', name: 'JavaScript' },
    { id: 'html', name: 'HTML' },
    { id: 'css', name: 'CSS' },
    { id: 'typescript', name: 'TypeScript' }
  ];

  const runCode = () => {
    setIsRunning(true);
    setOutput(''); // Clear previous output
    
    try {
      // Create a safe environment to run the code
      const consoleOutput: string[] = [];
      
      // Create a sandbox iframe for safer code execution
      const iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      document.body.appendChild(iframe);
      
      if (!iframe.contentWindow) {
        throw new Error('Could not create iframe for code execution');
      }
      
      // Override console.log in the iframe
      iframe.contentWindow.console.log = (...args) => {
        consoleOutput.push(args.map(arg => 
          typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
        ).join(' '));
      };
      
      // Execute the code
      if (language === 'javascript') {
        const scriptContent = `
          try {
            ${code}
          } catch (error) {
            console.log('Error:', error.message);
          }
        `;
        
        const script = iframe.contentWindow.document.createElement('script');
        script.textContent = scriptContent;
        iframe.contentWindow.document.body.appendChild(script);
      } else if (language === 'html') {
        iframe.contentWindow.document.open();
        iframe.contentWindow.document.write(code);
        iframe.contentWindow.document.close();
        
        // Capture the rendered HTML
        consoleOutput.push(iframe.contentWindow.document.body.innerHTML);
      }
      
      // Show the output
      setOutput(consoleOutput.join('\n'));
      
      // Clean up
      document.body.removeChild(iframe);
      
      toast({
        title: 'Код выполнен',
        description: 'Код успешно выполнен в песочнице'
      });
    } catch (error: any) {
      setOutput(`Error: ${error.message}`);
      toast({
        title: 'Ошибка',
        description: 'Произошла ошибка при выполнении кода',
        variant: 'destructive'
      });
    } finally {
      setIsRunning(false);
    }
  };

  const copyCode = () => {
    navigator.clipboard.writeText(code);
    toast({
      title: 'Скопировано',
      description: 'Код скопирован в буфер обмена'
    });
  };

  const shareCode = () => {
    const shareData = {
      title: 'Code Playground',
      text: `Check out this ${language} code: ${code.substring(0, 50)}...`,
      url: window.location.href
    };
    
    if (navigator.share) {
      navigator.share(shareData)
        .then(() => {
          toast({
            title: 'Поделиться',
            description: 'Код успешно отправлен'
          });
        })
        .catch((error) => {
          console.error('Error sharing:', error);
        });
    } else {
      copyCode();
    }
  };

  return (
    <Card className="mb-6">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl">Интерактивный редактор кода</CardTitle>
          <Badge variant="outline" className="text-blue-500 border-blue-500">
            {languages.find(lang => lang.id === language)?.name || 'JavaScript'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="editor" className="space-y-4">
          <div className="flex justify-between items-center">
            <TabsList>
              <TabsTrigger value="editor">Редактор</TabsTrigger>
              <TabsTrigger value="output">Вывод</TabsTrigger>
            </TabsList>
            
            <div className="flex items-center space-x-2">
              {!readOnly && (
                <div className="flex items-center space-x-2">
                  <Select
                    value={language}
                    onValueChange={setLanguage}
                  >
                    <SelectTrigger className="w-[160px]">
                      <SelectValue placeholder="Язык" />
                    </SelectTrigger>
                    <SelectContent>
                      {languages.map(lang => (
                        <SelectItem key={lang.id} value={lang.id}>
                          {lang.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button 
                    onClick={runCode} 
                    disabled={isRunning || !code.trim()}
                    size="sm"
                  >
                    <Play className="h-4 w-4 mr-1" />
                    Выполнить
                  </Button>
                </div>
              )}
              <Button variant="ghost" size="icon" onClick={copyCode}>
                <Copy className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={shareCode}>
                <Share className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <TabsContent value="editor" className="mt-2">
            <div className="relative">
              <Textarea
                value={code}
                onChange={(e) => !readOnly && setCode(e.target.value)}
                placeholder="Напишите свой код здесь..."
                className="font-mono min-h-[300px] resize-y bg-gray-50 dark:bg-gray-900"
                readOnly={readOnly}
              />
              {code && !readOnly && (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="absolute top-2 right-2"
                  onClick={() => setCode('')}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="output" className="mt-2">
            <div className="bg-black text-green-400 font-mono p-4 rounded-md min-h-[300px] whitespace-pre-wrap">
              {output || 'Вывод появится здесь после выполнения кода...'}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default CodePlayground;
