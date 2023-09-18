import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import './TaskApp.css';
import { MdEdit } from 'react-icons/md';

interface Task {
  id: number;
  text: string;
  completed: boolean;
}

const TaskApp: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filter, setFilter] = useState<string>('all');
  const [sortCriteria, setSortCriteria] = useState<string>('creation'); // Novo estado para ordenação
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const storedTasks = JSON.parse(localStorage.getItem('tasks') || '[]');
    setTasks(storedTasks);
  }, []);

  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }, [tasks]);

  const addTask = useCallback(() => {
    const text = inputRef.current?.value;
    if (text) {
      const newTask: Task = {
        id: Date.now(),
        text,
        completed: false,
      };
      setTasks(prevTasks => [...prevTasks, newTask]);
      if (inputRef.current) {
        inputRef.current.value = '';
      }
    }
  }, []);

  const toggleTask = useCallback(
    (id: number) => {
      setTasks(prevTasks =>
        prevTasks.map(task =>
          task.id === id ? { ...task, completed: !task.completed } : task
        )
      );
    },
    []
  );

  const filteredTasks = useMemo(() => {
    switch (filter) {
      case 'completed':
        return tasks.filter(task => task.completed);
      case 'active':
        return tasks.filter(task => !task.completed);
      default:
        return tasks;
    }
  }, [tasks, filter]);

  const sortTasks = useCallback((criteria: string) => {
    setSortCriteria(criteria);
  }, []);

  const sortedTasks = useMemo(() => {
    let sorted: Task[] = [...filteredTasks];

    switch (sortCriteria) {
      case 'creation':
        sorted = sorted.sort((a, b) => a.id - b.id);
        break;
      case 'alphabetical':
        sorted = sorted.sort((a, b) => a.text.localeCompare(b.text));
        break;
      case 'status':
        sorted = sorted.sort((a, b) => Number(a.completed) - Number(b.completed));
        break;
      default:
        break;
    }

    return sorted;
  }, [filteredTasks, sortCriteria]);

  const removeTask = useCallback(
    (id: number) => {
      setTasks(prevTasks => prevTasks.filter(task => task.id !== id));
    },
    []
  );

  const [editingTaskId, setEditingTaskId] = useState<number | null>(null);
  const [editedTaskText, setEditedTaskText] = useState<string>('');

  const editTask = (id: number, text: string) => {
    setEditingTaskId(id);
    setEditedTaskText(text);
  };

  const saveEditedTask = (id: number) => {
    setTasks(prevTasks =>
      prevTasks.map(task =>
        task.id === id ? { ...task, text: editedTaskText } : task
      )
    );
    setEditingTaskId(null);
  };

  return (
    <div className="task-app">
      <h1>Task App</h1>
      <div className="task-input">
        <input ref={inputRef} type="text" placeholder="Adicionar uma nova task" />
        <button onClick={addTask}>Adicionar</button>
      </div>
      <div className="filters">
        <select onChange={e => setFilter(e.target.value)} value={filter} className="task-select">
          <option value="all">Todas</option>
          <option value="completed">Completas</option>
          <option value="active">Pendentes</option>
        </select>
        <select onChange={e => sortTasks(e.target.value)} value={sortCriteria} className="task-select task-select-margin">
          <option value="creation">Data de Criação</option>
          <option value="alphabetical">Ordem Alfabética</option>
          <option value="status">Status</option>
        </select>
      </div>
      <ul className="task-list">
        {sortedTasks.map(task => (
          <li key={task.id} className={`task ${task.completed ? 'completed' : ''}`}>
            <div className="task-details">
              <input
                type="checkbox"
                checked={task.completed}
                onChange={() => toggleTask(task.id)}
              />
              {editingTaskId === task.id ? (
                <div className="task-edit">
                  <input
                    type="text"
                    value={editedTaskText}
                    onChange={e => setEditedTaskText(e.target.value)}
                  />
                  <button onClick={() => saveEditedTask(task.id)}>Salvar</button>
                </div>
              ) : (
                <span
                  className={task.completed ? 'completed-text' : ''}
                  onClick={() => toggleTask(task.id)}
                >
                  {task.completed ? <del>{task.text}</del> : task.text}
                </span>
              )}
              <button onClick={() => editTask(task.id, task.text)} className="task-edit-button">
                <MdEdit />
              </button>
              <button onClick={() => removeTask(task.id)} className="task-remover">
                Remover
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TaskApp;
