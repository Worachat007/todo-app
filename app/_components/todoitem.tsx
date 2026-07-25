import { useEffect, useState } from "react";
import type { ITodo } from "../../types/iTodo";

type TodoItemProps = {
  todo: ITodo;
  onToggle: (id: string, checked: boolean) => void;
  onDelete: (id: string) => void;
  onEdit: (id: string, updates: Partial<ITodo>) => void;
};

function formatDate(value?: string) {
  if (!value) {
    return "ไม่ระบุ";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("th-TH", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

export default function TodoItem({ todo, onToggle, onDelete, onEdit }: TodoItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [draftValue, setDraftValue] = useState(todo.value);
  const [draftDueDate, setDraftDueDate] = useState(todo.dueDate ?? "");

  useEffect(() => {
    setDraftValue(todo.value);
    setDraftDueDate(todo.dueDate ?? "");
  }, [todo.value, todo.dueDate]);

  const isOverdue =
    Boolean(todo.dueDate && !todo.isCompleted) &&
    (() => {
      if (!todo.dueDate) {
        return false;
      }
      const dueDate = new Date(todo.dueDate);
      const today = new Date();
      return dueDate.setHours(0, 0, 0, 0) < today.setHours(0, 0, 0, 0);
    })();

  const handleSave = () => {
    const trimmedValue = draftValue.trim();
    if (!trimmedValue) {
      return;
    }

    onEdit(todo.id, {
      value: trimmedValue,
      dueDate: draftDueDate || undefined,
    });
    setIsEditing(false);
  };

  return (
    <article
      className={`rounded-2xl border p-4 shadow-sm transition ${
        todo.isCompleted
          ? "border-emerald-200 bg-emerald-50/80"
          : isOverdue
            ? "border-rose-200 bg-rose-50/80"
            : "border-slate-200 bg-white"
      }`}
    >
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div className="flex flex-1 gap-3">
          <input
            type="checkbox"
            checked={todo.isCompleted}
            onChange={(event) => onToggle(todo.id, event.target.checked)}
            className="mt-1 h-5 w-5 rounded border-slate-300"
          />
          <div className="flex-1">
            {isEditing ? (
              <div className="flex flex-col gap-2">
                <input
                  type="text"
                  value={draftValue}
                  onChange={(event) => setDraftValue(event.target.value)}
                  className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
                />
                <input
                  type="date"
                  value={draftDueDate}
                  onChange={(event) => setDraftDueDate(event.target.value)}
                  className="w-fit rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
                />
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <p
                    className={`text-base font-semibold ${
                      todo.isCompleted ? "text-slate-500 line-through" : "text-slate-800"
                    }`}
                  >
                    {todo.value}
                  </p>
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                      todo.isCompleted
                        ? "bg-emerald-600 text-white"
                        : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {todo.isCompleted ? "ทำแล้ว" : "ยังไม่ได้ทำ"}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2 text-sm">
                  <span
                    className={`rounded-full px-2.5 py-1 ${
                      isOverdue
                        ? "bg-rose-100 text-rose-700"
                        : "bg-slate-100 text-slate-700"
                    }`}
                  >
                    {todo.dueDate ? `กำหนดส่ง: ${formatDate(todo.dueDate)}` : "ไม่มีกำหนดเวลา"}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-2">
          {isEditing ? (
            <button
              type="button"
              onClick={handleSave}
              className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700"
            >
              บันทึก
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                setDraftValue(todo.value);
                setDraftDueDate(todo.dueDate ?? "");
                setIsEditing(true);
              }}
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              แก้ไข
            </button>
          )}
          <button
            type="button"
            onClick={() => onDelete(todo.id)}
            className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-100"
          >
            ลบ
          </button>
        </div>
      </div>
    </article>
  );
}
