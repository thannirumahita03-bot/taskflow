type TaskFormProps = {
  taskInput: string;
  setTaskInput: React.Dispatch<
    React.SetStateAction<string>
  >;
  addTask: () => void;
};

function TaskForm({
  taskInput,
  setTaskInput,
  addTask,
}: TaskFormProps) {
  return (
    <div>
      <input
        type="text"
        value={taskInput}
        placeholder="Enter task"
        onChange={(e) =>
          setTaskInput(e.target.value)
        }
      />

      <button onClick={addTask}>
        Add Task
      </button>
    </div>
  );
}

export default TaskForm;