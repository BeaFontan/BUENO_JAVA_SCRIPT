document.addEventListener("DOMContentLoaded", function () {
    const form = document.querySelector("#task-form-container form");
    const taskWrapper = document.querySelector(".tasks-wrapper");
    const showFormBtn = document.querySelector("#show-form-btn");
    const closeFormBtn = document.querySelector("#close-form-btn");
    const formContainer = document.querySelector("#task-form-container");
    const rightContent = document.querySelector(".right-content");
    const priorityFilters = document.querySelectorAll(".nav-item");
    const taskImageInput = document.querySelector("#task-image");

    let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
    let currentFilter = "all";
    let editIndex = null;
    document.querySelector("#opt-1").checked = true;

    showFormBtn.addEventListener("click", () => {
        editIndex = null;
        form.reset();
        formContainer.style.display = "block";
    });

    closeFormBtn.addEventListener("click", () => {
        formContainer.style.display = "none";
    });

    form.addEventListener("submit", function (event) {
        event.preventDefault();

        const taskData = {
            name: document.querySelector("#task-name").value,
            description: document.querySelector("#task-description").value,
            priority: document.querySelector("#task-priority").value,
            category: document.querySelector("#task-category").value,
            startDate: document.querySelector("#task-start-date").value,
            endDate: document.querySelector("#task-end-date").value,
            priorityClass: { alta: "red", media: "yellow", baja: "green" }[document.querySelector("#task-priority").value] || "",
            image: editIndex !== null ? tasks[editIndex].image : null
        };

        const file = taskImageInput.files[0];
        if (file) {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = function () {
                taskData.image = reader.result;
                saveTask(taskData);
            };
        } else {
            saveTask(taskData);
        }
    });

    function saveTask(taskData) {
        if (editIndex !== null) {
            tasks[editIndex] = taskData;
        } else {
            tasks.push(taskData);
        }
        localStorage.setItem("tasks", JSON.stringify(tasks));
        updateTasksDisplay();
        form.reset();
        formContainer.style.display = "none";
        editIndex = null;
    }

    function updateTasksDisplay() {
        taskWrapper.innerHTML = "";
        rightContent.innerHTML = "";
        tasks.sort((a, b) => new Date(a.endDate) - new Date(b.endDate));
        const filteredTasks = currentFilter === "all" ? tasks : tasks.filter(task => task.priority === currentFilter);

        filteredTasks.forEach((task, index) => {
            const taskBox = document.createElement("div");
            taskBox.classList.add("task-box", task.priorityClass);
            taskBox.dataset.index = index;
            taskBox.innerHTML = `
                <div class="task-content">
                    ${task.image ? `<div class="task-image-wrapper"><img src="${task.image}" alt="task-image" class="task-image"/></div>` : ""}
                    <div class="task-info">
                        <div class="members"><img src="images/1.png" alt="member-4" /></div>
                        <div class="time">Comienza: ${task.startDate} - Termina: ${task.endDate}</div>
                        <div class="task-name">${task.name}</div>
                        <div class="task-desc">${task.description}</div>
                        <div class="task-desc">${task.priority}</div>
                        <div class="task-desc">${task.category}</div>
                    </div>
                    <button class="more-button">⋮</button>
                    <div class="menu-options">
                        <ul>
                            <li class="edit-task">Editar</li>
                            <li class="delete-task">Eliminar</li>
                        </ul>
                    </div>
                </div>`;
            taskWrapper.appendChild(taskBox);
        });
        activateMoreButton();
        activateEditTask();
        activateDeleteTask();

        tasks.slice(0, 3).forEach(task => {
            const taskCard = document.createElement("div");
            taskCard.classList.add("task-card", task.priorityClass);
            taskCard.innerHTML = `
                <div class="task-name">${task.name}</div>
                <div class="task-time">Expira: ${task.endDate}</div>
            `;
            rightContent.appendChild(taskCard);
        });
    }

    function activateMoreButton() {
        document.querySelectorAll(".more-button").forEach(button => {
            button.addEventListener("click", function (event) {
                event.stopPropagation();
                let menu = this.nextElementSibling;
                menu.style.display = menu.style.display === "block" ? "none" : "block";
            });
        });

        document.addEventListener("click", function () {
            document.querySelectorAll(".menu-options").forEach(menu => {
                menu.style.display = "none";
            });
        });
    }

    function activateEditTask() {
        document.querySelectorAll(".edit-task").forEach(button => {
            button.addEventListener("click", function (event) {
                event.stopPropagation();
                let taskElement = this.closest(".task-box");
                editIndex = parseInt(taskElement.dataset.index, 10);
                let task = tasks[editIndex];
                document.querySelector("#task-name").value = task.name;
                document.querySelector("#task-description").value = task.description;
                document.querySelector("#task-priority").value = task.priority;
                document.querySelector("#task-category").value = task.category;
                document.querySelector("#task-start-date").value = task.startDate;
                document.querySelector("#task-end-date").value = task.endDate;
                formContainer.style.display = "block";
            });
        });
    }

    function activateDeleteTask() {
        document.querySelectorAll(".delete-task").forEach(button => {
            button.addEventListener("click", function (event) {
                event.stopPropagation();
                
                let taskElement = this.closest(".task-box");
                let taskIndex = parseInt(taskElement.dataset.index, 10);

                if (taskIndex > -1) {
                    tasks.splice(taskIndex, 1);
                    localStorage.setItem("tasks", JSON.stringify(tasks));
                    updateTasksDisplay();
                }
            });
        });
    }

    priorityFilters.forEach(filter => {
        filter.addEventListener("change", function () {
            const selectedId = this.id;
            switch (selectedId) {
                case "opt-1":
                    currentFilter = "all"; 
                    break;
                case "opt-2":
                    currentFilter = "alta"; 
                    break;
                case "opt-3":
                    currentFilter = "media"; 
                    break;
                case "opt-4":
                    currentFilter = "baja"; 
                    break;
            }
            updateTasksDisplay();
        });
    });

    updateTasksDisplay();
});
