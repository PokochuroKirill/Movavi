
import React, { useState, useEffect, useRef } from 'react';
import Editor from '@monaco-editor/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Play, Download, Copy, Save, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const LANGUAGE_OPTIONS = [
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'html', label: 'HTML' },
  { value: 'css', label: 'CSS' },
  { value: 'json', label: 'JSON' },
  { value: 'markdown', label: 'Markdown' },
  { value: 'python', label: 'Python' },
  { value: 'java', label: 'Java' },
  { value: 'csharp', label: 'C#' },
  { value: 'cpp', label: 'C++' },
  { value: 'go', label: 'Go' },
  { value: 'rust', label: 'Rust' },
  { value: 'php', label: 'PHP' },
  { value: 'ruby', label: 'Ruby' },
  { value: 'swift', label: 'Swift' },
];

const DEFAULT_CODE = {
  javascript: '// JavaScript code here\nconsole.log("Hello, world!");',
  typescript: '// TypeScript code here\nconst greeting: string = "Hello, world!";\nconsole.log(greeting);',
  html: '<!DOCTYPE html>\n<html>\n<head>\n  <title>Hello World</title>\n</head>\n<body>\n  <h1>Hello, world!</h1>\n</body>\n</html>',
  css: '/* CSS code here */\nbody {\n  font-family: Arial, sans-serif;\n  background-color: #f0f0f0;\n}\n\nh1 {\n  color: #333;\n}',
  python: '# Python code here\nprint("Hello, world!")',
  // Add more default code for other languages as needed
};

interface Output {
  type: 'log' | 'error' | 'result';
  content: string;
}

const CodePlayground: React.FC = () => {
  const { toast } = useToast();
  const [language, setLanguage] = useState<string>('javascript');
  const [code, setCode] = useState<string>(DEFAULT_CODE.javascript || '// Start coding here');
  const [output, setOutput] = useState<Output[]>([]);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const outputRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    // Reset code when language changes
    setCode(DEFAULT_CODE[language as keyof typeof DEFAULT_CODE] || '// Start coding here');
  }, [language]);

  const runCode = () => {
    setIsRunning(true);
    setOutput([]);

    try {
      if (language === 'javascript' || language === 'typescript') {
        // For JS/TS, run in a sandbox
        const logs: Output[] = [];
        const originalConsole = window.console;
        
        // Create a safe environment to execute code
        const sandbox = document.createElement('iframe');
        sandbox.style.display = 'none';
        document.body.appendChild(sandbox);
        
        if (sandbox.contentWindow) {
          // Override console methods
          sandbox.contentWindow.console = {
            log: (...args: any[]) => {
              const message = args.map(arg => 
                typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
              ).join(' ');
              logs.push({ type: 'log', content: message });
              originalConsole.log(...args);
            },
            error: (...args: any[]) => {
              const message = args.map(arg => 
                typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
              ).join(' ');
              logs.push({ type: 'error', content: message });
              originalConsole.error(...args);
            },
            warn: (...args: any[]) => {
              originalConsole.warn(...args);
            },
            info: (...args: any[]) => {
              originalConsole.info(...args);
            }
          };
          
          try {
            // Execute the code
            const fn = new Function(code);
            const result = fn.call(sandbox.contentWindow);
            
            // If there is a meaningful result, add it to the output
            if (result !== undefined) {
              logs.push({ 
                type: 'result', 
                content: typeof result === 'object' ? JSON.stringify(result, null, 2) : String(result)
              });
            }
            
            setOutput(logs);
          } catch (err: any) {
            logs.push({ type: 'error', content: `Error: ${err.message}` });
            setOutput(logs);
          }
          
          // Clean up
          document.body.removeChild(sandbox);
        }
      } else if (language === 'html') {
        // For HTML, render in the iframe
        if (iframeRef.current) {
          const iframe = iframeRef.current;
          const iframeDocument = iframe.contentDocument || iframe.contentWindow?.document;

          if (iframeDocument) {
            iframeDocument.open();
            iframeDocument.write(code);
            iframeDocument.close();
          }
        }
      } else {
        // For other languages, just show a message
        setOutput([{ 
          type: 'log', 
          content: `Execution of ${language} code is not supported in the browser. This is just a code editor.` 
        }]);
      }
    } catch (err: any) {
      setOutput([{ type: 'error', content: `Error: ${err.message}` }]);
    } finally {
      setIsRunning(false);
    }
  };

  const downloadCode = () => {
    let extension = '.txt';
    switch (language) {
      case 'javascript': extension = '.js'; break;
      case 'typescript': extension = '.ts'; break;
      case 'html': extension = '.html'; break;
      case 'css': extension = '.css'; break;
      case 'python': extension = '.py'; break;
      default: extension = `.${language}`; break;
    }

    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `code${extension}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: 'Файл скачан',
      description: `Код сохранен как code${extension}`,
    });
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(code).then(() => {
      toast({
        title: 'Код скопирован',
        description: 'Код скопирован в буфер обмена',
      });
    }, (err) => {
      console.error('Could not copy text: ', err);
      toast({
        title: 'Ошибка',
        description: 'Не удалось скопировать код',
        variant: 'destructive',
      });
    });
  };

  const saveToLocalStorage = () => {
    try {
      localStorage.setItem(`savedCode_${language}`, code);
      toast({
        title: 'Код сохранен',
        description: `Код для языка ${language} сохранен в браузере`,
      });
    } catch (err) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось сохранить код',
        variant: 'destructive',
      });
    }
  };

  const loadFromLocalStorage = () => {
    const savedCode = localStorage.getItem(`savedCode_${language}`);
    if (savedCode) {
      setCode(savedCode);
      toast({
        title: 'Код загружен',
        description: `Загружен сохраненный код для языка ${language}`,
      });
    } else {
      toast({
        title: 'Нет сохранений',
        description: `Нет сохраненного кода для языка ${language}`,
      });
    }
  };

  const resetCode = () => {
    setCode(DEFAULT_CODE[language as keyof typeof DEFAULT_CODE] || '// Start coding here');
    toast({
      title: 'Код сброшен',
      description: 'Код возвращен к исходному состоянию',
    });
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Интерактивная среда разработки</h1>
        <p className="text-gray-500 dark:text-gray-400">
          Пишите, тестируйте и делитесь кодом прямо в браузере.
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="mb-6">
            <CardHeader className="pb-3">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <CardTitle className="text-lg">Редактор кода</CardTitle>
                <div className="flex items-center space-x-2">
                  <Select value={language} onValueChange={setLanguage}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Выберите язык" />
                    </SelectTrigger>
                    <SelectContent>
                      {LANGUAGE_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="border rounded-md overflow-hidden" style={{ height: '400px' }}>
                <Editor
                  height="400px"
                  language={language}
                  value={code}
                  onChange={(value) => setCode(value || '')}
                  options={{
                    minimap: { enabled: false },
                    fontSize: 14,
                    wordWrap: 'on',
                    automaticLayout: true,
                  }}
                  theme="vs-dark"
                />
              </div>
              
              <div className="flex flex-wrap gap-2 justify-between mt-4">
                <div className="flex flex-wrap gap-2">
                  <Button onClick={runCode} disabled={isRunning} className="flex items-center">
                    <Play className="mr-2 h-4 w-4" />
                    {isRunning ? 'Выполнение...' : 'Запустить'}
                  </Button>
                  <Button variant="outline" onClick={resetCode} className="flex items-center">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Сбросить
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" onClick={saveToLocalStorage} className="flex items-center">
                    <Save className="mr-2 h-4 w-4" />
                    Сохранить
                  </Button>
                  <Button variant="outline" onClick={loadFromLocalStorage} className="flex items-center">
                    Загрузить
                  </Button>
                  <Button variant="outline" onClick={copyToClipboard} className="flex items-center">
                    <Copy className="mr-2 h-4 w-4" />
                    Копировать
                  </Button>
                  <Button variant="outline" onClick={downloadCode} className="flex items-center">
                    <Download className="mr-2 h-4 w-4" />
                    Скачать
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="lg:col-span-1">
          <Tabs defaultValue="output">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="output">Вывод</TabsTrigger>
              <TabsTrigger value="preview">Предпросмотр</TabsTrigger>
            </TabsList>
            <TabsContent value="output">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Результат выполнения</CardTitle>
                </CardHeader>
                <CardContent>
                  <div 
                    ref={outputRef}
                    className="bg-black text-green-400 p-4 rounded-md font-mono text-sm h-[300px] overflow-auto"
                  >
                    {output.length > 0 ? (
                      output.map((item, index) => (
                        <div key={index} className={`mb-1 ${item.type === 'error' ? 'text-red-400' : ''}`}>
                          {item.content}
                        </div>
                      ))
                    ) : (
                      <div className="text-gray-500">Запустите код для получения результата...</div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="preview">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Предпросмотр HTML</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="border rounded-md h-[300px] overflow-auto bg-white">
                    <iframe 
                      ref={iframeRef} 
                      title="HTML Preview"
                      className="w-full h-full"
                      sandbox="allow-scripts allow-same-origin"
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default CodePlayground;
