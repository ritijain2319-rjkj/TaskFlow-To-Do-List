// ==========================================
// TASKFLOW - TO-DO LIST
// ==========================================


// ================================
// VARIABLES
// ================================

let tasks = JSON.parse(localStorage.getItem("taskflowTasks")) || [];

let currentFilter = "all";

let editingTaskId = null;


// ================================
// DOM ELEMENTS
// ================================

const taskForm = document.getElementById("taskForm");

const taskInput = document.getElementById("taskInput");

const priority = document.getElementById("priority");

const dueDate = document.getElementById("dueDate");

const taskList = document.getElementById("taskList");

const emptyState = document.getElementById("emptyState");

const searchInput = document.getElementById("searchInput");

const filterButtons = document.querySelectorAll(".filter-btn");

const totalTasks = document.getElementById("totalTasks");

const activeTasks = document.getElementById("activeTasks");

const completedTasks = document.getElementById("completedTasks");

const highPriorityTasks =
    document.getElementById("highPriorityTasks");

const taskSummary =
    document.getElementById("taskSummary");

const progressFill =
    document.getElementById("progressFill");

const progressText =
    document.getElementById("progressText");

const progressMessage =
    document.getElementById("progressMessage");

const themeToggle =
    document.getElementById("themeToggle");

const editModal =
    document.getElementById("editModal");

const editForm =
    document.getElementById("editForm");

const editTaskInput =
    document.getElementById("editTaskInput");

const editPriority =
    document.getElementById("editPriority");

const editDueDate =
    document.getElementById("editDueDate");

const closeModal =
    document.getElementById("closeModal");

const cancelEdit =
    document.getElementById("cancelEdit");

const toast =
    document.getElementById("toast");


// ================================
// INITIAL SETUP
// ================================

document.addEventListener("DOMContentLoaded", function () {

    loadTheme();

    setMinimumDate();

    renderTasks();

});


// ================================
// ADD TASK
// ================================

taskForm.addEventListener("submit", function (event) {

    event.preventDefault();

    const title = taskInput.value.trim();

    if (title === "") {
        showToast("Please enter a task.");
        return;
    }


    const newTask = {

        id: Date.now(),

        title: title,

        priority: priority.value,

        dueDate: dueDate.value,

        completed: false,

        createdAt: new Date().toISOString()

    };


    tasks.push(newTask);

    saveTasks();

    renderTasks();

    taskForm.reset();

    priority.value = "medium";

    showToast("Task added successfully!");

});


// ================================
// DISPLAY TASKS
// ================================

function renderTasks() {

    taskList.innerHTML = "";


    let filteredTasks = getFilteredTasks();


    if (filteredTasks.length === 0) {

        emptyState.style.display = "block";

    } else {

        emptyState.style.display = "none";

    }


    filteredTasks.forEach(function (task) {

        const taskElement =
            createTaskElement(task);

        taskList.appendChild(taskElement);

    });


    updateStatistics();

}


// ================================
// FILTER TASKS
// ================================

function getFilteredTasks() {

    const searchTerm =
        searchInput.value.toLowerCase().trim();


    let filtered = tasks.filter(function (task) {

        return task.title
            .toLowerCase()
            .includes(searchTerm);

    });


    if (currentFilter === "active") {

        filtered = filtered.filter(function (task) {

            return !task.completed;

        });

    }


    if (currentFilter === "completed") {

        filtered = filtered.filter(function (task) {

            return task.completed;

        });

    }


    return filtered;

}


// ================================
// CREATE TASK ELEMENT
// ================================

function createTaskElement(task) {

    const div = document.createElement("div");

    div.className = "task-item";


    if (task.completed) {

        div.classList.add("completed");

    }


    // Check Button

    const checkButton =
        document.createElement("button");

    checkButton.className = "check-btn";

    checkButton.title =
        task.completed
            ? "Mark as active"
            : "Mark as completed";

    checkButton.addEventListener(
        "click",
        function () {

            toggleTask(task.id);

        }
    );


    // Content

    const content =
        document.createElement("div");

    content.className = "task-content";


    const title =
        document.createElement("div");

    title.className = "task-title";

    title.textContent = task.title;


    const meta =
        document.createElement("div");

    meta.className = "task-meta";


    // Priority

    const priorityTag =
        document.createElement("span");

    priorityTag.className =
        "priority priority-" + task.priority;

    priorityTag.textContent =
        capitalize(task.priority);


    meta.appendChild(priorityTag);


    // Due date

    if (task.dueDate !== "") {

        const dateTag =
            document.createElement("span");

        dateTag.className = "due-date";

        dateTag.textContent =
            "📅 " + formatDate(task.dueDate);


        if (
            !task.completed &&
            isOverdue(task.dueDate)
        ) {

            dateTag.classList.add("overdue");

            dateTag.textContent =
                "⚠ " + formatDate(task.dueDate) +
                " • Overdue";

        }


        meta.appendChild(dateTag);

    }


    content.appendChild(title);

    content.appendChild(meta);


    // Buttons

    const buttons =
        document.createElement("div");

    buttons.className = "task-buttons";


    const editButton =
        document.createElement("button");

    editButton.className =
        "task-btn edit-btn";

    editButton.innerHTML = "✏️";

    editButton.title = "Edit task";

    editButton.addEventListener(
        "click",
        function () {

            openEditModal(task.id);

        }
    );


    const deleteButton =
        document.createElement("button");

    deleteButton.className =
        "task-btn delete-btn";

    deleteButton.innerHTML = "🗑️";

    deleteButton.title = "Delete task";

    deleteButton.addEventListener(
        "click",
        function () {

            deleteTask(task.id);

        }
    );


    buttons.appendChild(editButton);

    buttons.appendChild(deleteButton);


    // Final task element

    div.appendChild(checkButton);

    div.appendChild(content);

    div.appendChild(buttons);


    return div;

}


// ================================
// TOGGLE TASK
// ================================

function toggleTask(id) {

    const task =
        tasks.find(function (item) {

            return item.id === id;

        });


    if (!task) {
        return;
    }


    task.completed = !task.completed;


    saveTasks();

    renderTasks();


    if (task.completed) {

        showToast("Task completed! 🎉");

    } else {

        showToast("Task marked as active.");

    }

}


// ================================
// DELETE TASK
// ================================

function deleteTask(id) {

    const task =
        tasks.find(function (item) {

            return item.id === id;

        });


    if (!task) {
        return;
    }


    const confirmDelete =
        confirm(
            "Are you sure you want to delete this task?"
        );


    if (!confirmDelete) {
        return;
    }


    tasks =
        tasks.filter(function (item) {

            return item.id !== id;

        });


    saveTasks();

    renderTasks();

    showToast("Task deleted.");

}


// ================================
// EDIT TASK
// ================================

function openEditModal(id) {

    const task =
        tasks.find(function (item) {

            return item.id === id;

        });


    if (!task) {
        return;
    }


    editingTaskId = id;


    editTaskInput.value = task.title;

    editPriority.value = task.priority;

    editDueDate.value = task.dueDate;


    editModal.classList.add("show");

}


editForm.addEventListener("submit", function (event) {

    event.preventDefault();


    const task =
        tasks.find(function (item) {

            return item.id === editingTaskId;

        });


    if (!task) {
        return;
    }


    const newTitle =
        editTaskInput.value.trim();


    if (newTitle === "") {

        showToast("Task name cannot be empty.");

        return;

    }


    task.title = newTitle;

    task.priority = editPriority.value;

    task.dueDate = editDueDate.value;


    saveTasks();

    renderTasks();

    closeEditModal();

    showToast("Task updated successfully!");

});


function closeEditModal() {

    editModal.classList.remove("show");

    editingTaskId = null;

}


closeModal.addEventListener(
    "click",
    closeEditModal
);


cancelEdit.addEventListener(
    "click",
    closeEditModal
);


// Close modal by clicking outside

editModal.addEventListener(
    "click",
    function (event) {

        if (event.target === editModal) {

            closeEditModal();

        }

    }
);


// ================================
// SEARCH
// ================================

searchInput.addEventListener(
    "input",
    function () {

        renderTasks();

    }
);


// ================================
// FILTER BUTTONS
// ================================

filterButtons.forEach(function (button) {

    button.addEventListener(
        "click",
        function () {

            filterButtons.forEach(
                function (btn) {

                    btn.classList.remove("active");

                }
            );


            button.classList.add("active");


            currentFilter =
                button.dataset.filter;


            renderTasks();

        }
    );

});


// ================================
// STATISTICS
// ================================

function updateStatistics() {

    const total = tasks.length;


    const completed =
        tasks.filter(function (task) {

            return task.completed;

        }).length;


    const active = total - completed;


    const highPriority =
        tasks.filter(function (task) {

            return (
                task.priority === "high" &&
                !task.completed
            );

        }).length;


    totalTasks.textContent = total;

    activeTasks.textContent = active;

    completedTasks.textContent = completed;

    highPriorityTasks.textContent =
        highPriority;


    taskSummary.textContent =
        total === 1
            ? "1 task"
            : total + " tasks";


    updateProgress(
        total,
        completed
    );

}


// ================================
// PROGRESS
// ================================

function updateProgress(total, completed) {

    let percentage = 0;


    if (total > 0) {

        percentage =
            Math.round(
                (completed / total) * 100
            );

    }


    progressFill.style.width =
        percentage + "%";


    progressText.textContent =
        percentage + "%";


    if (total === 0) {

        progressMessage.textContent =
            "Let's get started!";

    } else if (percentage === 100) {

        progressMessage.textContent =
            "Amazing! All tasks completed! 🎉";

    } else if (percentage >= 75) {

        progressMessage.textContent =
            "Almost there! Keep going!";

    } else if (percentage >= 50) {

        progressMessage.textContent =
            "Great progress!";

    } else {

        progressMessage.textContent =
            "Keep working on your tasks!";

    }

}


// ================================
// LOCAL STORAGE
// ================================

function saveTasks() {

    localStorage.setItem(
        "taskflowTasks",
        JSON.stringify(tasks)
    );

}


// ================================
// DARK MODE
// ================================

themeToggle.addEventListener(
    "click",
    function () {

        document.body.classList.toggle("dark");


        const isDark =
            document.body.classList.contains("dark");


        localStorage.setItem(
            "taskflowDarkMode",
            isDark
        );


        themeToggle.textContent =
            isDark ? "☀️" : "🌙";

    }
);


function loadTheme() {

    const darkMode =
        localStorage.getItem("taskflowDarkMode");


    if (darkMode === "true") {

        document.body.classList.add("dark");

        themeToggle.textContent = "☀️";

    }

}


// ================================
// DATE FUNCTIONS
// ================================

function setMinimumDate() {

    const today =
        new Date()
            .toISOString()
            .split("T")[0];


    dueDate.min = today;

    editDueDate.min = today;

}


function formatDate(dateString) {

    const date =
        new Date(
            dateString + "T00:00:00"
        );


    return date.toLocaleDateString(
        "en-IN",
        {
            day: "numeric",
            month: "short",
            year: "numeric"
        }
    );

}


function isOverdue(dateString) {

    const today =
        new Date();

    today.setHours(
        0,
        0,
        0,
        0
    );


    const due =
        new Date(
            dateString + "T00:00:00"
        );


    return due < today;

}


// ================================
// UTILITY
// ================================

function capitalize(text) {

    return text.charAt(0).toUpperCase() +
           text.slice(1);

}


// ================================
// TOAST MESSAGE
// ================================

function showToast(message) {

    toast.textContent = message;

    toast.classList.add("show");


    setTimeout(function () {

        toast.classList.remove("show");

    }, 2500);

}