import './App.css'
import { useState,useEffect,useMemo } from 'react'

function useStickyState(defaultValue,key){
  const [value,setValue] = useState(()=>{
    try {
      const stickyValue = window.localStorage.getItem(key);
      return stickyValue !== null
        ? JSON.parse(stickyValue)
        : defaultValue;
    } catch (error) {
      console.warn(`Error reading localStorage key “${key}”:`, error);
      return defaultValue;
    }
  });

  useEffect(()=>{
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.warn(`Error writing to localStorage key “${key}”:`, error);
    }
  },[value,setValue]);

  return [value,setValue];
}

const TrashIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

const CheckIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
  </svg>
);

function formatDate(dateString){
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const date = new Date(dateString + 'T00:00:00');

  const options = {weekday : 'long',month:'short',day:'numeric'};
  
  if(date.toDateString() === today.toDateString()){
    return 'Today';
  }
  else if (date.toDateString() === tomorrow.toDateString()){
    return 'Tomorrow';
  }
  else{
    return date.toLocaleDateString(undefined,options);
  }
}

function App() {
  const[todos,setTodos] = useStickyState([],'todos');
  const[newTask,setNewTask] = useState("");
  const[newDate,setNewDate] = useState(new Date().toISOString().split('T')[0]);

  const handleAddTask = (e) => {
    e.preventDefault();

    if(newTask.trim() === "")
      return;

    const newTodo = {
      id: Date.now(),
      text: newTask,
      date: newDate,
      completed: false
    };

    setTodos([newTodo, ...todos]);
    setNewTask("");
  }

  const handleToggleComplete = (id) => {
    setTodos(
      todos.map(todo=>
        todo.id === id ? { ...todo,completed: !todo.completed } : todo
      )
    );
  };

  const handleDeleteTask = (id) => {
    setTodos(todos.filter(todo=>todo.id!==id));
  };

  const completedCount = todos.filter(todo => todo.completed).length;

  const groupedTodos = useMemo(() => {
    const groups = todos.reduce((acc,todo) => {
      const date = todo.date || new Date().toISOString().split('T')[0];
      if(!acc[date]){
        acc[date] = [];
      }
      acc[date].push(todo);
      return acc;
    },{});

    Object.keys(groups).forEach(date => {
      groups[date].sort((a,b)=>a.id-b.id);
    });

    const sortedDates = Object.keys(groups).sort((a,b) => new Date(a) - new Date(b));

    return { groups,sortedDates };
  },[todos]);

  return (
    <main className='min-h-screen w-full bg-slate-100 text-gray-900 flex justify-center p-4 font-sans'>
      <div className='w-full max-w-2xl bg-white shadow-xl rounded-2xl p-6 md:p-8 border border-gray-200 my-8'>
        <h1 className='text-4xl md:text-txl font-bold text-center mb-2 text-indigo-600 '>
          My Todo List
        </h1>
        <p className='text-center text-gray-600 mb-6'>
          0 of 0 tasks completed
        </p>
        <form onSubmit={handleAddTask} className='flex flex-col sm:flex-row gap-3 mb-8'>
          <input 
            type='text'
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            placeholder='Add a new task...'
            className='grow bg-gray-50 border border-gray-700 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500'
          />
          <input 
            type = 'date'
            value={newDate}
            onChange={(e) => setNewDate(e.target.value)}
            className='bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 sm:w-auto'
          />
          <button 
            type='submit'
            className='bg-indigo-600 text-white font-semibold px-6 py-3 rounded-lg shadow-lg hover:bg-indigo-700 transform hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-slate-100'
          >
            Add
          </button>
        </form>
        <div className='space-y-6 max-h-[60vh] overflow-y-auto pr-2'>
          {todos.length === 0 && (
            <p className='text-gray-500 text-center py-4'>No tasks yet. Add one!</p>
          )}

          {groupedTodos.sortedDates.map(date => (
            <section key={date}>
              <h2 className='text-xl font-semibold text-indigo-500 mb-3 border-b border-gray-200 pb-2'>
                {formatDate(date)}
              </h2>
              <ul className='space-y-3'>
                {groupedTodos.groups[date].map(todo => (
                  <li
                    key={todo.id}
                    className='flex items-center justify-between bg-white rounded-lg p-4 shadow-sm border border-gray-100'
                  >
                    <div className='flex items-center gap-3 cursor-pointer' onClick={() => handleToggleComplete(todo.id)}>
                      <button
                        aria-label='Toggle Complete'
                        className = {`flex items-center justify-center w-6 h-6 rounded-full border-2 
                                    ${todo.completed ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-gray-400'}
                                    transition-all duration-200`}
                      >
                        {todo.completed && <CheckIcon />}
                      </button>
                      <span
                        className={`text-lg ${todo.completed ? 'line-through text-gray-400' : 'text-gray-800'}`}
                      >
                        {todo.text}
                      </span>
                    </div>
                    <button
                      onClick={() => handleDeleteTask(todo.id)}
                      aria-label="Delete task"
                      className="text-gray-400 hover:text-red-500 transition-colors duration-200 p-1"
                    >
                      <TrashIcon />
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </div>
    </main>
  )
}

export default App
