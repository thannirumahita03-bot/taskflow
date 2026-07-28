
type Task = {
  title: string;
  completed: boolean;
};

type TaskListProps = {
  tasks: Task[];
};

function TaskList({
  tasks,
}: TaskListProps) {
  return (
    <ul>
      {tasks.map((task) => (
        <TaskCard
          key={task.title}
          title={task.title}
          completed={task.completed}
        />
      ))}
    </ul>
  );
}

export default TaskList;