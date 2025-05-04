
import React, { useState } from 'react';
import Layout from '@/components/Layout';
import CodePlayground from '@/components/playground/CodePlayground';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';

const PlaygroundPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [code, setCode] = useState('// Напишите свой код здесь\nconsole.log("Hello world!");');
  const [language, setLanguage] = useState('javascript');
  const [tags, setTags] = useState('');
  const [saving, setSaving] = useState(false);

  const examples = [
    {
      name: 'Hello World',
      language: 'javascript',
      code: '// Простой пример вывода в консоль\nconsole.log("Hello, DevHub!");'
    },
    {
      name: 'Счетчик',
      language: 'javascript',
      code: `// Пример простого счетчика
let count = 0;

// Функция для увеличения счетчика
function increment() {
  count++;
  console.log("Текущий счет:", count);
}

// Увеличиваем счетчик
increment();
increment();
increment();`
    },
    {
      name: 'Калькулятор',
      language: 'javascript',
      code: `// Простой калькулятор
function calculate(a, b, operation) {
  switch (operation) {
    case 'add':
      return a + b;
    case 'subtract':
      return a - b;
    case 'multiply':
      return a * b;
    case 'divide':
      if (b === 0) {
        throw new Error('Деление на ноль!');
      }
      return a / b;
    default:
      throw new Error('Неизвестная операция');
  }
}

// Примеры использования
console.log('2 + 3 =', calculate(2, 3, 'add'));
console.log('5 - 2 =', calculate(5, 2, 'subtract'));
console.log('4 * 3 =', calculate(4, 3, 'multiply'));
console.log('8 / 2 =', calculate(8, 2, 'divide'));
`
    },
    {
      name: 'Todo List',
      language: 'javascript',
      code: `// Пример реализации простого Todo списка
class TodoList {
  constructor() {
    this.todos = [];
  }
  
  addTodo(text) {
    this.todos.push({
      id: this.todos.length + 1,
      text,
      completed: false
    });
    console.log(\`Добавлена задача: \${text}\`);
  }
  
  completeTodo(id) {
    const todo = this.todos.find(todo => todo.id === id);
    if (todo) {
      todo.completed = true;
      console.log(\`Задача выполнена: \${todo.text}\`);
    }
  }
  
  listTodos() {
    console.log('Список задач:');
    this.todos.forEach(todo => {
      console.log(\`[\${todo.completed ? 'x' : ' '}] \${todo.id}. \${todo.text}\`);
    });
  }
}

// Использование
const myTodoList = new TodoList();
myTodoList.addTodo('Изучить JavaScript');
myTodoList.addTodo('Создать проект');
myTodoList.addTodo('Опубликовать на GitHub');

// Отметить задачу как выполненную
myTodoList.completeTodo(1);

// Вывести список задач
myTodoList.listTodos();`
    }
  ];

  const loadExample = (example: { name: string, language: string, code: string }) => {
    setCode(example.code);
    setLanguage(example.language);
    toast({
      title: 'Пример загружен',
      description: `Загружен пример: ${example.name}`
    });
  };

  const saveAsSnippet = async () => {
    if (!user) {
      toast({
        title: 'Необходима авторизация',
        description: 'Чтобы сохранить код как сниппет, необходимо войти в систему',
        variant: 'destructive'
      });
      return;
    }
    
    if (!title.trim()) {
      toast({
        title: 'Необходимо название',
        description: 'Пожалуйста, укажите название для вашего сниппета',
        variant: 'destructive'
      });
      return;
    }
    
    if (!code.trim()) {
      toast({
        title: 'Пустой код',
        description: 'Пожалуйста, добавьте код в ваш сниппет',
        variant: 'destructive'
      });
      return;
    }
    
    setSaving(true);
    
    try {
      const tagsArray = tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);
      
      const { data, error } = await supabase
        .from('snippets')
        .insert({
          title,
          description,
          code,
          language,
          tags: tagsArray.length > 0 ? tagsArray : null,
          user_id: user.id
        })
        .select()
        .single();
      
      if (error) throw error;
      
      toast({
        title: 'Сниппет сохранен',
        description: 'Ваш код успешно сохранен как сниппет'
      });
      
      navigate(`/snippets/${data.id}`);
    } catch (error: any) {
      console.error('Error saving snippet:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось сохранить сниппет. Пожалуйста, попробуйте еще раз.',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Layout>
      <div className="container max-w-6xl py-8">
        <div className="flex flex-col md:flex-row justify-between items-start gap-8">
          {/* Main playground */}
          <div className="flex-1 w-full">
            <h1 className="text-3xl font-bold mb-6">Интерактивная песочница</h1>
            
            <CodePlayground 
              initialCode={code} 
              initialLanguage={language}
            />

            {/* Save snippet form */}
            <Card>
              <CardHeader>
                <CardTitle>Сохранить как сниппет</CardTitle>
                <CardDescription>
                  Сохраните ваш код как сниппет для последующего использования
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Название</Label>
                      <Input
                        id="title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Название сниппета"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="language">Язык</Label>
                      <Select
                        value={language}
                        onValueChange={setLanguage}
                      >
                        <SelectTrigger id="language">
                          <SelectValue placeholder="Выберите язык" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="javascript">JavaScript</SelectItem>
                          <SelectItem value="typescript">TypeScript</SelectItem>
                          <SelectItem value="html">HTML</SelectItem>
                          <SelectItem value="css">CSS</SelectItem>
                          <SelectItem value="python">Python</SelectItem>
                          <SelectItem value="java">Java</SelectItem>
                          <SelectItem value="csharp">C#</SelectItem>
                          <SelectItem value="cpp">C++</SelectItem>
                          <SelectItem value="php">PHP</SelectItem>
                          <SelectItem value="ruby">Ruby</SelectItem>
                          <SelectItem value="go">Go</SelectItem>
                          <SelectItem value="swift">Swift</SelectItem>
                          <SelectItem value="kotlin">Kotlin</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="description">Описание</Label>
                    <Textarea
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Краткое описание сниппета"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="tags">Теги (через запятую)</Label>
                    <Input
                      id="tags"
                      value={tags}
                      onChange={(e) => setTags(e.target.value)}
                      placeholder="javascript, react, hooks"
                    />
                  </div>
                  
                  <Button 
                    onClick={saveAsSnippet} 
                    disabled={saving}
                    className="w-full"
                  >
                    {saving ? 'Сохранение...' : 'Сохранить как сниппет'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Examples sidebar */}
          <div className="w-full md:w-80">
            <Card>
              <CardHeader>
                <CardTitle>Примеры кода</CardTitle>
                <CardDescription>
                  Выберите пример для начала работы
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {examples.map((example, index) => (
                    <React.Fragment key={index}>
                      <div 
                        className="p-3 border rounded-md cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                        onClick={() => loadExample(example)}
                      >
                        <div className="font-medium">{example.name}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {example.language}
                        </div>
                      </div>
                      {index < examples.length - 1 && (
                        <Separator className="my-2" />
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default PlaygroundPage;
