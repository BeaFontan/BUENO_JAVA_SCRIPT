// Ejecutamos el código una vez que el DOM esté completamente cargado
document.addEventListener("DOMContentLoaded", function () {
  // Referencias a los elementos del DOM que se van a manipular
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

  // Input para cargar la imagen de la tarea
  const taskImageInput = document.querySelector("#task-image");

  // Se obtienen las tareas almacenadas en localStorage; si no hay, se inicializa un array vacío
  let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
  // Variable para almacenar el filtro de prioridad seleccionado. Valores posibles: "all", "alta", "media", "baja"
  let currentFilter = "all";
  // Variable para almacenar el filtro de categoría seleccionado. Valores posibles: "all", "Reunións", etc.
  let currentCategoryFilter = "all";
  // Índice de la tarea que se está editando; null indica que no se está editando ninguna tarea
  let editIndex = null;

  // Por defecto se marca el primer filtro (Listar todas las tareas)
  document.querySelector("input[name='nav'][id='opt-1']").checked = true;

  // ----- Filtro de Prioridad -----
  // Se añade un event listener a cada input del grupo de filtros de prioridad
  priorityFilters.forEach(filter => {
    filter.addEventListener("change", function () {
      const selectedId = this.id;
      // Dependiendo del id seleccionado, se actualiza el filtro actual
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
      // Se actualiza la visualización de las tareas aplicando el filtro de prioridad
      updateTasksDisplay();
    });
  });

  // ----- Filtro de Categoría -----
  // Se añade un event listener a cada input del grupo de filtros de categoría
  categoryFilters.forEach(filter => {
    filter.addEventListener("change", function () {
      // Se obtiene el texto del label adyacente y se limpia de espacios en blanco
      const selectedLabel = this.nextElementSibling.textContent.trim();
      // Se actualiza el filtro de categoría según el texto seleccionado
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
      // Se actualiza la visualización de las tareas aplicando el filtro de categoría
      updateTasksDisplay();
    });
  });

  // Manejador para mostrar el formulario (al hacer clic en el botón de mostrar formulario)
  showFormBtn.addEventListener("click", () => {
    editIndex = null; // Se resetea el índice de edición
    form.reset();     // Se reinician los campos del formulario
    formContainer.style.display = "block"; // Se muestra el contenedor del formulario
  });

  // Manejador para cerrar el formulario (al hacer clic en el botón de cerrar formulario)
  closeFormBtn.addEventListener("click", () => {
    formContainer.style.display = "none"; // Se oculta el contenedor del formulario
  });

  // Manejador para el envío del formulario de tarea
  form.addEventListener("submit", function (event) {
    event.preventDefault(); // Se previene la acción por defecto de enviar el formulario

    // Se crea un objeto con los datos introducidos en el formulario
    const taskData = {
      name: document.querySelector("#task-name").value,
      description: document.querySelector("#task-description").value,
      priority: document.querySelector("#task-priority").value,
      category: document.querySelector("#task-category").value,
      startDate: document.querySelector("#task-start-date").value,
      endDate: document.querySelector("#task-end-date").value,
      // Se asigna una clase de prioridad para aplicar estilos (colores) según la prioridad seleccionada
      priorityClass: {
        alta: "red",
        media: "yellow",
        baja: "green"
      }[document.querySelector("#task-priority").value] || "",
      // Si se está editando, se mantiene la imagen anterior; si no, se inicializa en null
      image: editIndex !== null ? tasks[editIndex].image : null
    };

    // Se comprueba si se ha seleccionado un archivo de imagen
    const file = taskImageInput.files[0];
    if (file) {
      // Si hay un archivo, se utiliza FileReader para convertirlo en una URL base64
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = function () {
        // Una vez cargada la imagen, se asigna al objeto taskData
        taskData.image = reader.result;
        // Se guarda la tarea (ya sea nueva o editada)
        saveTask(taskData);
      };
    } else {
      // Si no se seleccionó imagen, se guarda la tarea directamente
      saveTask(taskData);
    }
  });

  // Función para guardar una tarea (ya sea nueva o editada)
  function saveTask(taskData) {
    if (editIndex !== null) {
      // Si editIndex no es null, significa que se está editando una tarea existente
      tasks[editIndex] = taskData;
    } else {
      // Si es una nueva tarea, se añade al principio del array de tareas
      tasks.unshift(taskData);
    }
    // Se guarda el array actualizado en localStorage
    localStorage.setItem("tasks", JSON.stringify(tasks));
    // Se actualiza la visualización de las tareas en el DOM
    updateTasksDisplay();
    // Se reinicia el formulario y se oculta su contenedor
    form.reset();
    formContainer.style.display = "none";
    // Se resetea el índice de edición
    editIndex = null;
  }

  // Función para actualizar el contador de tareas (elemento con clase .count)
  function updateTaskCount() {
    const countElement = document.querySelector(".count");
    countElement.textContent = tasks.length;
  }

  // Función que actualiza la visualización de las tareas en el DOM
  function updateTasksDisplay() {
    // Se limpia el contenido de los contenedores de tareas y del contenido derecho
    taskWrapper.innerHTML = "";
    rightContent.innerHTML = "";

    // Aquí se podría ordenar por fecha de fin (comentado, pero se puede implementar)
    // Ejemplo: tasks.sort((a, b) => new Date(a.endDate) - new Date(b.endDate));

    // Se aplica el filtrado por prioridad
    let filteredTasks = currentFilter === "all"
      ? tasks
      : tasks.filter(task => task.priority === currentFilter);

    // Se aplica el filtrado adicional por categoría
    filteredTasks = currentCategoryFilter === "all"
      ? filteredTasks
      : filteredTasks.filter(task => task.category === currentCategoryFilter);

    // Se itera sobre cada tarea filtrada para construir su representación en el DOM
    filteredTasks.forEach((task, index) => {
      // Se crea un contenedor para la tarea y se le añaden las clases necesarias
      const taskBox = document.createElement("div");
      taskBox.classList.add("task-box", task.priorityClass);
      // Se guarda el índice de la tarea en un atributo de datos para referencias posteriores (editar/eliminar)
      taskBox.dataset.index = index;

      // Se define un objeto con imágenes por defecto según la categoría de la tarea
      const categoryImages = {
        "Reunións": "images/reuniones.jpg",
        "Desarrollo de páxinas Web": "images/web.jpg",
        "Desarrollo Aplicación Móbil": "images/aplicaciones.jpg",
        "Despregamento": "images/despliegue.jpg"
      };
      // Si no se encuentra la imagen para la categoría, se usa una imagen por defecto
      let taskImageCategory = categoryImages[task.category] || "images/despliegue.jpg";

      // Se define el contenido HTML de la tarea
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
      // Se añade el elemento creado al contenedor principal de tareas
      taskWrapper.appendChild(taskBox);
    });

    // Se activan las funcionalidades de los botones de 'Más', 'Editar' y 'Eliminar'
    activateMoreButton();
    activateEditTask();
    activateDeleteTask();
    // Se actualiza el contador de tareas
    updateTaskCount();

    // Se crea un array de tareas ordenadas por fecha de fin para mostrar en la sección derecha
    let expiringTasks = [...tasks].sort((a, b) => new Date(a.endDate) - new Date(b.endDate));

    // Se itera sobre las tareas ordenadas para crear una tarjeta para cada tarea en la sección derecha
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

  // Función que activa el botón de 'Más' para mostrar/ocultar el menú de opciones de cada tarea
  function activateMoreButton() {
    // Se añade un listener a cada botón 'Más'
    document.querySelectorAll(".more-button").forEach(button => {
      button.addEventListener("click", function (event) {
        event.stopPropagation(); // Se previene la propagación para que el clic no se interprete en otro contenedor
        let menu = this.nextElementSibling; // Se obtiene el menú de opciones contiguo al botón
        // Se alterna la visibilidad del menú (mostrar/ocultar)
        menu.style.display = menu.style.display === "block" ? "none" : "block";
      });
    });
    // Listener global para cerrar cualquier menú de opciones si se hace clic fuera de ellos
    document.addEventListener("click", function () {
      document.querySelectorAll(".menu-options").forEach(menu => {
        menu.style.display = "none";
      });
    });
  }

  // Función que activa la funcionalidad de edición de tareas
  function activateEditTask() {
    document.querySelectorAll(".edit-task").forEach(button => {
      button.addEventListener("click", function (event) {
        event.stopPropagation(); // Se evita que el clic se propague a otros elementos
        let taskElement = this.closest(".task-box"); // Se obtiene el contenedor de la tarea correspondiente
        editIndex = parseInt(taskElement.dataset.index, 10); // Se guarda el índice de la tarea a editar
        let task = tasks[editIndex]; // Se obtiene la tarea correspondiente
        // Se rellenan los campos del formulario con los datos de la tarea a editar
        document.querySelector("#task-name").value = task.name;
        document.querySelector("#task-description").value = task.description;
        document.querySelector("#task-priority").value = task.priority;
        document.querySelector("#task-category").value = task.category;
        document.querySelector("#task-start-date").value = task.startDate;
        document.querySelector("#task-end-date").value = task.endDate;
        // Se muestra el formulario para que el usuario pueda editar la tarea
        formContainer.style.display = "block";
      });
    });
  }

  // Función que activa la funcionalidad de eliminación de tareas
  function activateDeleteTask() {
    document.querySelectorAll(".delete-task").forEach(button => {
      button.addEventListener("click", function (event) {
        event.stopPropagation(); // Se evita la propagación del clic
        let taskElement = this.closest(".task-box"); // Se obtiene el contenedor de la tarea correspondiente
        let taskIndex = parseInt(taskElement.dataset.index, 10); // Se obtiene el índice de la tarea a eliminar
        if (taskIndex > -1) {
          // Se elimina la tarea del array
          tasks.splice(taskIndex, 1);
          // Se actualiza el localStorage con el array modificado
          localStorage.setItem("tasks", JSON.stringify(tasks));
          // Se actualiza la visualización de las tareas
          updateTasksDisplay();
        }
      });
    });
  }

  // Se inicializa la visualización de las tareas cuando se carga la página
  updateTasksDisplay();
});
