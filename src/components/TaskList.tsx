import type { Task } from '@/types';
import { Check, X, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TaskListProps {
  tasks: Task[];
  onComplete: (id: string) => void;
  onMiss: (id: string) => void;
  onDelete: (id: string) => void;
  onReset: (id: string) => void;
}

const statusStyles = {
  pending: 'border-border',
  completed: 'border-success/50 bg-success/5',
  missed: 'border-roast/50 bg-roast/5',
};

const TaskList = ({ tasks, onComplete, onMiss, onDelete, onReset }: TaskListProps) => {
  if (tasks.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground bg-secondary/20 rounded-xl border border-dashed border-border">
        <p className="text-lg font-semibold">Empty, just like your ambition.</p>
        <p className="text-sm">Add a task before we find you another bed to sleep in.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {tasks.map((task) => (
        <div
          key={task.id}
          className={`group flex items-center justify-between p-4 rounded-xl border transition-all duration-300 animate-slide-up hover:shadow-lg ${statusStyles[task.status]}`}
        >
          <div className="flex flex-col gap-0.5 flex-1 min-w-0 pr-4">
            <span className={`font-semibold truncate text-sm sm:text-base ${task.status === 'completed' ? 'line-through text-muted-foreground/50' : task.status === 'missed' ? 'text-roast font-bold italic' : 'text-foreground'}`}>
              {task.title}
            </span>
            {task.status !== 'pending' && (
              <span className={`text-[10px] font-bold uppercase tracking-widest ${task.status === 'completed' ? 'text-success/70' : 'text-roast/70'}`}>
                {task.status}
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-1.5 shrink-0 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
            {task.status === 'pending' ? (
              <>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onComplete(task.id)}
                  className="text-success hover:text-white hover:bg-success h-9 w-9 p-0 rounded-full border border-success/20"
                >
                  <Check className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onMiss(task.id)}
                  className="text-roast hover:text-white hover:bg-roast h-9 w-9 p-0 rounded-full border border-roast/20"
                >
                  <X className="w-4 h-4" />
                </Button>
              </>
            ) : (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onReset(task.id)}
                className="text-muted-foreground hover:text-foreground h-9 w-9 p-0 rounded-full border border-border"
                title="Reset to Pending"
              >
                <Check className="w-4 h-4 rotate-180 opacity-50" />
              </Button>
            )}
            
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onDelete(task.id)}
              className="text-muted-foreground hover:text-roast hover:bg-roast/10 h-9 w-9 p-0 rounded-full border border-border"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default TaskList;
