interface TaskListProps {
  tasks: { id: string; text: string; done: boolean }[];
  projectId: string;
  color: string;
  onToggle: (pid: string, tid: string) => void;
  onDelete: (pid: string, tid: string) => void;
  limit?: number;
}

export function TaskList({ tasks, projectId, color, onToggle, onDelete, limit }: TaskListProps) {
  const pending = tasks.filter((t) => !t.done);
  const done = tasks.filter((t) => t.done);
  const show = limit
    ? [...pending, ...done.slice(0, Math.max(0, limit - pending.length))]
    : [...pending, ...done];

  if (show.length === 0) return null;

  return (
    <div className="mt-3">
      {show.map((task) => (
        <div
          key={task.id}
          className="flex items-center gap-2.5 py-2 border-b border-bg-elevated/30"
        >
          <button
            onClick={() => onToggle(projectId, task.id)}
            className="w-[18px] h-[18px] rounded flex-shrink-0 border-[1.5px] flex items-center justify-center text-[10px]"
            style={{
              borderColor: task.done ? color : "#333",
              backgroundColor: task.done ? color + "25" : "transparent",
              color,
            }}
          >
            {task.done ? "✓" : ""}
          </button>
          <span
            className={`flex-1 text-xs ${
              task.done ? "text-text-dark line-through" : "text-text-primary"
            }`}
          >
            {task.text}
          </span>
          <button
            onClick={() => onDelete(projectId, task.id)}
            className="text-text-dark hover:text-[#FF6B6B] text-xs px-1 transition-colors"
          >
            x
          </button>
        </div>
      ))}
    </div>
  );
}
