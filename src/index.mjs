const taskInput = document.getElementById("taskInput");
const addTaskBtn = document.getElementById("addTaskBtn");
const taskList = document.getElementById("taskList");
const counter = document.getElementById("counter");
const API_URL = "https://jsonplaceholder.typicode.com/todos";

let tasks = [];

/**
 * Рендер завдань на сторінку
 */
function renderTasks() {
  taskList.innerHTML = "";
  let completed = 0;

  tasks.forEach((task) => {
    const li = document.createElement("li");
    li.className = task.completed ? "completed" : "";
    li.innerHTML = `
      <span contenteditable="true" onblur="dispatchEdit(${task.id}, this.innerText)">${task.title}</span>
      <div>
        <button data-id="${task.id}" class="completeBtn">✔️</button>
        <button data-id="${task.id}" class="deleteBtn">🗑️</button>
      </div>
    `;
    taskList.appendChild(li);
    if (task.completed) completed++;
  });

  counter.textContent = `Виконано: ${completed} | Невиконано: ${
    tasks.length - completed
  }`;
}

/**
 * Отримати початкові завдання з API
 */
function fetchTasks() {
  fetch(`${API_URL}?_limit=5`)
    .then((res) => res.json())
    .then((data) => {
      tasks = data;
      renderTasks();
    })
    .catch((err) => alert("Помилка завантаження: " + err));
}

/**
 * Додати нове завдання
 */
function addTask() {
  const title = taskInput.value.trim();
  if (!title) return;

  const newTask = {
    title,
    completed: false,
    userId: 1,
  };

  fetch(API_URL, {
    method: "POST",
    body: JSON.stringify(newTask),
    headers: { "Content-Type": "application/json" },
  })
    .then((res) => res.json())
    .then((task) => {
      tasks.push(task);
      renderTasks();
      taskInput.value = "";
    })
    .catch((err) => alert("Не вдалося додати завдання: " + err));
}

/**
 * Видалити завдання
 */
function deleteTask(id) {
  fetch(`${API_URL}/${id}`, {
    method: "DELETE",
  })
    .then(() => {
      tasks = tasks.filter((t) => t.id !== id);
      renderTasks();
    })
    .catch((err) => alert("Помилка видалення: " + err));
}

/**
 * Змінити статус виконання завдання
 */
function toggleComplete(id) {
  const task = tasks.find((t) => t.id === id);
  if (!task) return;

  const updated = { completed: !task.completed };

  fetch(`${API_URL}/${id}`, {
    method: "PATCH",
    body: JSON.stringify(updated),
    headers: { "Content-Type": "application/json" },
  })
    .then((res) => res.json())
    .then((data) => {
      task.completed = data.completed;
      renderTasks();
    })
    .catch((err) => alert("Помилка зміни статусу: " + err));
}

/**
 * Редагування назви завдання
 */
function editTask(id, newText) {
  const task = tasks.find((t) => t.id === id);
  if (!task || task.title === newText.trim()) return;

  fetch(`${API_URL}/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ title: newText }),
    headers: { "Content-Type": "application/json" },
  })
    .then(() => {
      task.title = newText;
    })
    .catch((err) => alert("Помилка редагування: " + err));
}

/**
 * Проксі-функція для виклику editTask з inline HTML
 */
window.dispatchEdit = (id, text) => {
  editTask(id, text);
};

// Обробка натискань на кнопки (делегування)
taskList.addEventListener("click", (e) => {
  const id = parseInt(e.target.dataset.id);
  if (e.target.classList.contains("completeBtn")) {
    toggleComplete(id);
  } else if (e.target.classList.contains("deleteBtn")) {
    deleteTask(id);
  }
});

// Події
addTaskBtn.addEventListener("click", addTask);
window.addEventListener("DOMContentLoaded", fetchTasks);
