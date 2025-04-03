
import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { X } from 'lucide-react';

export interface ProjectFiltersProps {
  technologies: string[];
  setTechnologies: (techs: string[]) => void;
  availableTechnologies: string[];
}

const ProjectFilters = ({ 
  technologies, 
  setTechnologies, 
  availableTechnologies 
}: ProjectFiltersProps) => {
  const [inputValue, setInputValue] = useState('');

  const addTech = (tech: string) => {
    if (!technologies.includes(tech)) {
      setTechnologies([...technologies, tech]);
    }
    setInputValue('');
  };

  const removeTech = (tech: string) => {
    setTechnologies(technologies.filter(t => t !== tech));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && inputValue.trim() !== '') {
      e.preventDefault();
      addTech(inputValue.trim());
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="technologies">Технологии</Label>
        <div className="flex flex-wrap gap-1 mt-2 mb-2">
          {technologies.map(tech => (
            <Badge key={tech} variant="secondary" className="flex items-center">
              {tech}
              <button 
                type="button"
                onClick={() => removeTech(tech)}
                className="ml-1 text-gray-500 hover:text-gray-700 rounded-full"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Добавить технологию"
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          />
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => inputValue.trim() && addTech(inputValue.trim())}
            className="h-10"
          >
            +
          </Button>
        </div>
      </div>

      <div className="mt-2">
        <p className="text-sm mb-1">Популярные:</p>
        <div className="flex flex-wrap gap-1">
          {availableTechnologies.slice(0, 8).map(tech => (
            <Badge
              key={tech}
              variant="outline"
              className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
              onClick={() => addTech(tech)}
            >
              {tech}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProjectFilters;
