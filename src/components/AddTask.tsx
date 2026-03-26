import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface AddTaskProps {
  onAdd: (title: string) => void;
}

const AddTask = ({ onAdd }: AddTaskProps) => {
  const [title, setTitle] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onAdd(title.trim());
    setTitle('');
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <Input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Add a task... (e.g. Apply 5 jobs)"
        className="flex-1 bg-secondary border-border text-foreground placeholder:text-muted-foreground min-h-[44px] text-base"
      />
      <Button 
        type="submit" 
        onClick={handleSubmit}
        className="bg-primary text-primary-foreground hover:bg-primary/80 active:scale-95 transition-transform glow-primary min-h-[44px] px-6 font-bold touch-manipulation"
      >
        <Plus className="w-5 h-5 sm:mr-1" />
        <span className="hidden sm:inline">Add</span>
      </Button>
    </form>
  );
};

export default AddTask;
