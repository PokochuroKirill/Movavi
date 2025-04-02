
import { useState } from 'react';
import { Check, ChevronDown } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface ProjectFiltersProps {
  onFilterChange: (filters: ProjectFilters) => void;
  availableTechnologies: string[];
}

export interface ProjectFilters {
  technologies: string[];
  sortBy: 'latest' | 'popular' | 'views';
}

const ProjectFilters = ({ onFilterChange, availableTechnologies }: ProjectFiltersProps) => {
  const [filters, setFilters] = useState<ProjectFilters>({
    technologies: [],
    sortBy: 'latest'
  });
  
  const [open, setOpen] = useState(false);
  
  const toggleTechnology = (tech: string) => {
    let newTechnologies;
    if (filters.technologies.includes(tech)) {
      newTechnologies = filters.technologies.filter(t => t !== tech);
    } else {
      newTechnologies = [...filters.technologies, tech];
    }
    
    const newFilters = {
      ...filters,
      technologies: newTechnologies
    };
    
    setFilters(newFilters);
    onFilterChange(newFilters);
  };
  
  const setSortBy = (sort: 'latest' | 'popular' | 'views') => {
    const newFilters = {
      ...filters,
      sortBy: sort
    };
    
    setFilters(newFilters);
    onFilterChange(newFilters);
  };
  
  const clearFilters = () => {
    const newFilters = {
      technologies: [],
      sortBy: 'latest'
    };
    
    setFilters(newFilters);
    onFilterChange(newFilters);
    setOpen(false);
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="flex items-center">
            Фильтры
            <ChevronDown className="ml-2 h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        
        <DropdownMenuContent className="w-56">
          <DropdownMenuLabel>Сортировка</DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          <DropdownMenuCheckboxItem 
            checked={filters.sortBy === 'latest'}
            onCheckedChange={() => setSortBy('latest')}
          >
            По дате (новые)
          </DropdownMenuCheckboxItem>
          
          <DropdownMenuCheckboxItem 
            checked={filters.sortBy === 'popular'}
            onCheckedChange={() => setSortBy('popular')}
          >
            По популярности
          </DropdownMenuCheckboxItem>
          
          <DropdownMenuCheckboxItem 
            checked={filters.sortBy === 'views'}
            onCheckedChange={() => setSortBy('views')}
          >
            По просмотрам
          </DropdownMenuCheckboxItem>
          
          <DropdownMenuSeparator />
          <DropdownMenuLabel>Технологии</DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          <div className="max-h-[200px] overflow-y-auto">
            {availableTechnologies.map((tech) => (
              <DropdownMenuCheckboxItem 
                key={tech}
                checked={filters.technologies.includes(tech)}
                onCheckedChange={() => toggleTechnology(tech)}
              >
                {tech}
              </DropdownMenuCheckboxItem>
            ))}
          </div>
          
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={clearFilters}>
            Сбросить все фильтры
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      
      {/* Display active filters */}
      {filters.technologies.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {filters.technologies.map(tech => (
            <Badge 
              key={tech} 
              variant="outline" 
              className="flex items-center gap-1 bg-devhub-purple/10 text-devhub-purple border-devhub-purple/20"
              onClick={() => toggleTechnology(tech)}
            >
              {tech}
              <span className="cursor-pointer ml-1">×</span>
            </Badge>
          ))}
          
          {filters.technologies.length > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-6 py-0 px-2 text-xs"
              onClick={clearFilters}
            >
              Очистить
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default ProjectFilters;
