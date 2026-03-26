# TaskFlow — CRUD Task Manager

> A fully functional, browser-based Task Manager implementing **Create, Read, Update, and Delete (CRUD)** operations using JavaScript arrays as in-memory data storage, with LocalStorage persistence across sessions.

---

## 📋 Project Overview

**TaskFlow** is a console-style task management application built with vanilla HTML, CSS, and JavaScript. It was created as part of the Cognifyz Task 3 assignment — to implement all four fundamental CRUD operations on a list of tasks stored in arrays/lists.

---

## 🗂 File Structure

```
task-manager/
├── index.html      ← Main application entry point
├── style.css       ← Complete UI styling (dark industrial aesthetic)
├── app.js          ← All JavaScript logic (Task class + TaskManager + UI)
└── README.md       ← This file
```

---

## 🚀 How to Run

1. **Double-click** `index.html` — it opens directly in any modern browser.
2. No server, build tool, or internet connection required (fonts load from Google Fonts).
3. Your tasks are automatically **saved to LocalStorage** and persist across page reloads.

---

## ✅ Features & CRUD Operations

### ➕ CREATE
- Fill in the **Title** (required), optional Description, Priority, and Due Date.
- Click **Add Task** or press `Enter` in the title field.
- A new `Task` object is instantiated with a unique ID and pushed to the tasks array.

### 📖 READ
- All tasks are immediately rendered as cards in the **Task List** panel.
- **Filter** by: All / Pending / Completed.
- **Search** by keyword — matches title, description, and priority in real time.
- Stats bar shows live counts: Total, Pending, Done.

### ✏️ UPDATE
- Click the **✎ edit button** on any task card to open the edit modal.
- Modify Title, Description, Priority, Due Date, and Status.
- Click **Save Changes** — the task is updated in the array and re-rendered.
- Alternatively, click the **checkbox** on a task card to toggle its status instantly.

### 🗑 DELETE
- Click the **✕ delete button** on any task card.
- The task is removed from the array with a smooth animation.
- Deletion is reflected immediately in the stats bar.

---

## 🏗 Architecture

### `Task` Class
```javascript
class Task {
  constructor(title, description, priority, dueDate)
  // Properties: id, title, description, priority, dueDate, status, createdAt, updatedAt
}
```

### `TaskManager` Class (Data Layer)
| Method | CRUD | Description |
|---|---|---|
| `create(title, desc, priority, due)` | **C** | Validates and creates a new Task |
| `readAll()` | **R** | Returns a copy of all tasks |
| `readById(id)` | **R** | Finds a task by unique ID |
| `readFiltered(filter, query)` | **R** | Filter by status + keyword search |
| `update(id, changes)` | **U** | Applies allowed field changes |
| `toggleStatus(id)` | **U** | Flips pending ↔ completed |
| `delete(id)` | **D** | Removes task from array |
| `getStats()` | **R** | Returns total/pending/completed counts |

---

## 🎨 UI Highlights

- **Dark industrial terminal aesthetic** with cyan accent glow
- **Priority color-coded** left border: 🟢 Low / 🟡 Medium / 🔴 High
- **Overdue badge** appears automatically for past-due tasks
- **Toast notifications** for every action (create, update, delete, toggle)
- **Animated stats counter** on every state change
- **Keyboard shortcuts**: `Enter` to add task, `Escape` to close modal
- Fully **responsive** on mobile
- Custom scrollbar, background grid, and glow effect

---

## 🧪 Test Scenarios

| # | Scenario | Expected Behaviour |
|---|---|---|
| 1 | Add a task with title only | Task created with default medium priority |
| 2 | Add a task with empty title | Error toast: "Task title is required." |
| 3 | Edit a task's priority to High | Card left border turns red |
| 4 | Check the checkbox on a task | Status toggles to Completed, card fades |
| 5 | Delete a task | Slides out, removed from list and stats |
| 6 | Search "design" | Only matching tasks shown |
| 7 | Filter → Completed | Only done tasks visible |
| 8 | Reload the page | All tasks still present (LocalStorage) |
| 9 | Set a past due date | Orange ⚠ overdue badge appears |
| 10 | Edit a task's title to empty | Error toast: "Title cannot be empty." |

---

## 🔧 Technologies Used

| Technology | Purpose |
|---|---|
| HTML5 | Semantic structure |
| CSS3 | Styling, animations, responsive layout |
| Vanilla JavaScript (ES6+) | Classes, array methods, DOM manipulation |
| LocalStorage API | Persistent data storage across sessions |
| Google Fonts | Syne + DM Mono typefaces |

---

## 📝 Notes

- No external JavaScript frameworks or libraries are used.
- Data is stored purely in a JavaScript array (`TaskManager.tasks`) and mirrored to LocalStorage.
- The `Task` class acts as the data model; `TaskManager` encapsulates all array operations.
- Three sample tasks are seeded automatically on first load.

---

*Built for Cognifyz Task 3 — CRUD Operations on a Task List.*
