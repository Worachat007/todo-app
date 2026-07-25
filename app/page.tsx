"use client";
import { useEffect, useMemo, useState } from "react";
import TodoItem from "./_components/todoitem";
import type { ITodo } from "../types/iTodo";

type Filter = "all" | "active" | "completed";

const STORAGE_KEY = "todo_datastorage";

function createTodoId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export default function Home() {
  const [inputValue, setInputValue] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [todos, setTodos] = useState<ITodo[]>([]);
  const [filter, setFilter] = useState<Filter>("all");
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    try {
      const savedTodos = window.localStorage.getItem(STORAGE_KEY);
      if (savedTodos) {
        const parsedTodos = JSON.parse(savedTodos) as ITodo[];
        setTodos(parsedTodos);
      }
    } catch (error) {
      console.error("Failed to load todos", error);
    } finally {
      setIsHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
  }, [todos, isHydrated]);

  const completedCount = todos.filter((todo) => todo.isCompleted).length;
  const activeCount = todos.length - completedCount;

  const visibleTodos = useMemo(() => {
    switch (filter) {
      case "active":
        return todos.filter((todo) => !todo.isCompleted);
      case "completed":
        return todos.filter((todo) => todo.isCompleted);
      default:
        return todos;
    }
  }, [filter, todos]);

  const addTodo = () => {
    const trimmedValue = inputValue.trim();
    if (!trimmedValue) {
      return;
    }

    const newTodo: ITodo = {
      id: createTodoId(),
      value: trimmedValue,
      isCompleted: false,
      dueDate: dueDate || undefined,
    };

    setTodos((currentTodos) => [newTodo, ...currentTodos]);
    setInputValue("");
    setDueDate("");
  };

  const toggleTodo = (id: string, checked: boolean) => {
    setTodos((currentTodos) =>
      currentTodos.map((todo) =>
        todo.id === id ? { ...todo, isCompleted: checked } : todo,
      ),
    );
  };

  const deleteTodo = (id: string) => {
    setTodos((currentTodos) => currentTodos.filter((todo) => todo.id !== id));
  };

  const editTodo = (id: string, updates: Partial<ITodo>) => {
    setTodos((currentTodos) =>
      currentTodos.map((todo) => (todo.id === id ? { ...todo, ...updates } : todo)),
    );
  };

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_#fef3c7,_#eff6ff_45%,_#f8fafc_100%)] px-4 py-8 text-slate-800">
      <div className="mx-auto flex max-w-5xl flex-col gap-6 rounded-[32px] border border-slate-200/80 bg-white/85 p-6 shadow-[0_20px_60px_-20px_rgba(15,23,42,0.35)] backdrop-blur md:p-8">
        <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.35em] text-sky-600">
              Todo Planner
            </p>
            <h1 className="text-3xl font-semibold text-slate-900">จัดการงานของคุณให้เรียบร้อย</h1>
          </div>
          <div className="flex flex-wrap gap-2 text-sm">
            <span className="rounded-full bg-slate-100 px-3 py-1 font-medium text-slate-700">
              ยังไม่เสร็จ {activeCount}
            </span>
            <span className="rounded-full bg-emerald-100 px-3 py-1 font-medium text-emerald-700">
              เสร็จแล้ว {completedCount}
            </span>
          </div>
        </header>

        <section className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 shadow-sm">
          <div className="flex flex-col gap-3 md:flex-row md:items-end">
            <div className="flex-1">
              <label className="mb-1 block text-sm font-medium text-slate-700">
                ชื่องาน
              </label>
              <input
                type="text"
                value={inputValue}
                onChange={(event) => setInputValue(event.target.value)}
                placeholder="เพิ่มงานใหม่"
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                กำหนดเวลา
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(event) => setDueDate(event.target.value)}
                className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
              />
            </div>
            <button
              type="button"
              onClick={addTodo}
              className="rounded-xl bg-sky-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-700"
            >
              เพิ่มงาน
            </button>
          </div>
        </section>

        <div className="flex flex-wrap gap-2">
          {[
            { label: "ทั้งหมด", value: "all" },
            { label: "ยังไม่ได้ทำ", value: "active" },
            { label: "ทำแล้ว", value: "completed" },
          ].map((item) => {
            const isActive = filter === item.value;
            return (
              <button
                key={item.value}
                type="button"
                onClick={() => setFilter(item.value as Filter)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                  isActive
                    ? "bg-slate-900 text-white shadow-sm"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>

        <section className="flex flex-col gap-3">
          {visibleTodos.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm text-slate-500">
              ไม่มีงานในหมวดนี้
            </div>
          ) : (
            visibleTodos.map((todo) => (
              <TodoItem
                key={todo.id}
                todo={todo}
                onToggle={toggleTodo}
                onDelete={deleteTodo}
                onEdit={editTodo}
              />
            ))
          )}
        </section>
      </div>
    </main>
  );
}
