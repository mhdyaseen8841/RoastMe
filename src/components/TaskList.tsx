import type { Task } from '@/types';
import { Check, X, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TaskListProps {
  tasks: Task[];
  onComplete: (id: string) => void;
  onMiss: (id: string) => void;
  onDelete: (id: string) => void;
}

const statusStyles = {
  pending: 'border-border',
  completed: 'border-success/50 bg-success/5',
  missed: 'border-roast/50 bg-roast/5',
};

const TaskList = ({ tasks, onComplete, onMiss, onDelete }: TaskListProps) => {
  if (tasks.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p className="text-lg font-semibold">No tasks yet.</p>
        <p className="text-sm">Add one above. Unless you're too lazy for that too.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {tasks.map((task) => (
        <div
          key={task.id}
          className={`flex items-center justify-between p-3 rounded-lg border animate-slide-up ${statusStyles[task.status]}`}
        >
          <span className={`flex-1 font-medium ${task.status === 'completed' ? 'line-through text-muted-foreground' : task.status === 'missed' ? 'text-roast' : 'text-foreground'}`}>
            {task.title}
          </span>
          {task.status === 'pending' && (
            <div className="flex gap-1">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onComplete(task.id)}
                className="text-success hover:text-success hover:bg-success/10 h-8 w-8 p-0"
              >
                <Check className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onMiss(task.id)}
                className="text-roast hover:text-roast hover:bg-roast/10 h-8 w-8 p-0"
              >
                <X className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onDelete(task.id)}
                className="text-muted-foreground hover:text-foreground h-8 w-8 p-0"
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>
          )}
          {task.status !== 'pending' && (
            <span className={`text-xs font-semibold uppercase tracking-wider ${task.status === 'completed' ? 'text-success' : 'text-roast'}`}>
              {task.status}
            </span>
          )}
        </div>
      ))}
    </div>
  );
};

export default TaskList;
