document.addEventListener("DOMContentLoaded", function () {
  const form = document.querySelector("#task-form-container form");
  const taskWrapper = document.querySelector(".tasks-wrapper");
  const showFormBtn = document.querySelector("#show-form-btn");
  const closeFormBtn = document.querySelector("#close-form-btn");
  const formContainer = document.querySelector("#task-form-container");
  const rightContent = document.querySelector(".right-content");

  // Grupo de filtros de prioridad (en la sección de categorías, a la derecha)
  const priorityFilters = document.querySelectorAll("input[name='nav']");
  // Grupo de filtros de categoría (en la barra izquierda)
  const categoryFilters = document.querySelectorAll("input[name='category-filter']");

  const taskImageInput = document.querySelector("#task-image");

  let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
  let currentFilter = "all"; // "all", "alta", "media", "baja"
  let currentCategoryFilter = "all"; // "all", "Reunións", etc.
  let editIndex = null;

  // Por defecto se marca el primer filtro (Listar todas)
  document.querySelector("input[name='nav'][id='opt-1']").checked = true;

  // ----- Filtro de Prioridad -----
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

  // ----- Filtro de Categoría -----
  categoryFilters.forEach(filter => {
    filter.addEventListener("change", function () {
      const selectedLabel = this.nextElementSibling.textContent.trim();
      switch (selectedLabel) {
        case "Todas":
          currentCategoryFilter = "all";
          break;
        case "Reunións":
          currentCategoryFilter = "Reunións";
          break;
        case "Páxinas web":
          currentCategoryFilter = "Desarrollo de páxinas Web";
          break;
        case "Aplicacións móbiles":
          currentCategoryFilter = "Desarrollo Aplicación Móbil";
          break;
        case "Despregue":
          currentCategoryFilter = "Despregamento";
          break;
        default:
          currentCategoryFilter = "all";
      }
      updateTasksDisplay();
    });
  });

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
      priorityClass: {
        alta: "red",
        media: "yellow",
        baja: "green"
      }[document.querySelector("#task-priority").value] || "",
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
      tasks.unshift(taskData);
    }
    localStorage.setItem("tasks", JSON.stringify(tasks));
    updateTasksDisplay();
    form.reset();
    formContainer.style.display = "none";
    editIndex = null;
  }

  function updateTaskCount() {
    const countElement = document.querySelector(".count");
    countElement.textContent = tasks.length;
  }

  function updateTasksDisplay() {
    taskWrapper.innerHTML = "";
    rightContent.innerHTML = "";

    // Ordenar por fecha de fin


    // Filtrado por prioridad
    let filteredTasks = currentFilter === "all"
      ? tasks
      : tasks.filter(task => task.priority === currentFilter);

    // Filtrado por categoría
    filteredTasks = currentCategoryFilter === "all"
      ? filteredTasks
      : filteredTasks.filter(task => task.category === currentCategoryFilter);

    filteredTasks.forEach((task, index) => {
      const taskBox = document.createElement("div");
      taskBox.classList.add("task-box", task.priorityClass);
      taskBox.dataset.index = index;

      const categoryImages = {
        "Reunións": "images/reuniones.jpg",
        "Desarrollo de páxinas Web": "images/web.jpg",
        "Desarrollo Aplicación Móbil": "images/aplicaciones.jpg",
        "Despregamento": "images/despliegue.jpg"
      };
      let taskImageCategory = categoryImages[task.category] || "images/despliegue.jpg";

      taskBox.innerHTML = `
      <div class="task-content">
        <div class="task-image-wrapper">
          ${task.image ? `<img src="${task.image}" alt="Imagen de la tarea" class="task-image" />` : ""}
        </div>
        <div class="task-info">
          <div class="task-dates">
            <i class="fas fa-calendar-alt"></i> 
            <span class="task-start">📅 Inicio: ${task.startDate}</span>
            <span class="task-end">⏳ Fin: ${task.endDate}</span>
          </div>
          <div class="task-name">${task.name}</div>
          <div class="task-desc">${task.description}</div>
          <div class="task-priority">🔥 <span class="priority-${task.priority}">${task.priority}</span></div>
          <div class="task-category">📂 ${task.category}</div>
        </div>
        <button class="more-button">⋮</button>
        <div class="menu-options">
          <ul>
            <li class="edit-task">✏️ Editar</li>
            <li class="delete-task">🗑 Eliminar</li>
          </ul>
        </div>
      </div>`;
      taskWrapper.appendChild(taskBox);
    });

    activateMoreButton();
    activateEditTask();
    activateDeleteTask();
    updateTaskCount();

    let expiringTasks = [...tasks].sort((a, b) => new Date(a.endDate) - new Date(b.endDate));

    expiringTasks.forEach(task => {
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

  updateTasksDisplay();
});
