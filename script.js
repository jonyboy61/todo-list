    
const input = document.getElementById("todo-input");
const button = document.getElementById("add-btn");
const list = document.getElementById("todo-list");
let tasks = [];
const filterButtons = document.querySelectorAll(".filter-btn");

// Exexuting AddTask()
function handleAddTask() {
  const task = input.value.trim();

  if (task === "") return;

  // Verifica se a tarefa já existe (ignorando maiúsculas/minúsculas)
  const existe = tasks.some((t) => t.text.toLowerCase() === task.toLowerCase());
  if (existe) {
    alert("Not possible to add duplicated tasks!");
    return;
  }

  addTask(task);
  mostrarMensagem("Tarefa adicionada!")
  input.value = "";
}

//Click Event
button.addEventListener("click", handleAddTask);
//Enter Event
input.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
            handleAddTask();
    }
});
//Save Tasks on Local Storage
function saveTasks() {
localStorage.setItem("tasks", JSON.stringify(tasks));
}

//Function AddTask()
function addTask(text, done = false, save = true) {
  const li = document.createElement("li");
  let originalText = text;

  const span = document.createElement("span");
  span.textContent = text;
  li.appendChild(span);

  // Editar ao dar duplo clique
  li.addEventListener("dblclick", function (e) {
  if (e.target.tagName.toLowerCase() === "button") return; // Ignora se for o botão "X"
    const inputEdit = document.createElement("input");
    inputEdit.type = "text";
    inputEdit.value = span.textContent;
    inputEdit.classList.add("edit-input");

    li.replaceChild(inputEdit, span);
    inputEdit.focus();

    // Confirmar com Enter ou blur
    inputEdit.addEventListener("blur", salvarEdicao);
    inputEdit.addEventListener("keydown", function (e) {
      if (e.key === "Enter") salvarEdicao();
    });

    function salvarEdicao() {
      const novoTexto = inputEdit.value.trim();

      if (novoTexto === "") {
        mostrarMensagem("O texto não pode ficar vazio.");
        li.replaceChild(span, inputEdit);
        return;
      }

      // Verifica duplicado (exceto se for igual ao original)
      const existe = tasks.some((t) =>
        t.text.toLowerCase() === novoTexto.toLowerCase() && t.text !== originalText
      );

      if (existe) {
        mostrarMensagem("Já existe uma tarefa com esse nome.");
        li.replaceChild(span, inputEdit);
        return;
      }

      // Atualiza visualmente
      span.textContent = novoTexto;
      li.replaceChild(span, inputEdit);

      // Atualiza no array
      tasks = tasks.map((t) =>
        t.text === originalText ? { ...t, text: novoTexto } : t
      );

      originalText = novoTexto; // Atualiza a referência
      saveTasks();
      mostrarMensagem("Tarefa editada!");
    }
  });

  if (done) li.classList.add("done");

  const deletebtn = document.createElement("button");
  deletebtn.textContent = "X";
  deletebtn.classList.add("delete");

  deletebtn.addEventListener("click", function () {
    li.remove();
    tasks = tasks.filter((t) => t.text !== originalText);
    saveTasks();
    mostrarMensagem("Task Deleted!");
  });

  li.addEventListener("click", function (e) {
    if (e.target !== deletebtn && e.target !== span) {
      li.classList.toggle("done");
      const estado = li.classList.contains("done") ? "Done!" : "Pending...";

      tasks = tasks.map((t) =>
        t.text === originalText ? { ...t, done: li.classList.contains("done") } : t
      );

      saveTasks();
      mostrarMensagem(`Task is ${estado}`);
    }
  });

  list.appendChild(li);
  li.appendChild(deletebtn);

  if (save) {
    tasks.push({ text, done });
    saveTasks();
  }
}



filterButtons.forEach((btn) => {
  btn.addEventListener("click", function () {
    // Remove classe active de todos
    filterButtons.forEach((b) => b.classList.remove("active"));
    // Add active ao clicked button
    this.classList.add("active");
    const filtro = this.dataset.filter;
    aplicarFiltro(filtro);
    
  });
});

function aplicarFiltro(filtro) {
  const items = document.querySelectorAll("#todo-list li");
  let algumaVisivel = false;

  items.forEach((li) => {
    const concluida = li.classList.contains("done");

    if (filtro === "all") {
      li.style.display = "flex";
      algumaVisivel = true;
    } else if (filtro === "done") {
      li.style.display = concluida ? "flex" : "none";
      if (concluida) algumaVisivel = true;
    } else if (filtro === "pending") {
      li.style.display = !concluida ? "flex" : "none";
      if (!concluida) algumaVisivel = true;
    }
  });

  // 🟡 Guarda o filtro no localStorage
  localStorage.setItem("filtroAtivo", filtro);

  // 🟢 Atualiza visualmente os botões de filtro
  document.querySelectorAll(".filter-btn").forEach((btn) => {
  btn.classList.toggle("active", btn.dataset.filter === filtro);
});




  // 🔵 Verifica se a lista está vazia
  verificarListaVazia(algumaVisivel);
}

  function mostrarMensagem(texto) {
  const msg = document.getElementById("mensagem-feedback");
  msg.textContent = texto;
  msg.style.display = "block";

    setTimeout(() => {
      msg.style.display = "none";
    }, 2000);
  }



function verificarListaVazia(algumaVisivel) {
  const mensagem = document.getElementById("mensagem-vazia");

  if (!mensagem) return; // Evita erros se não existir

  if (!algumaVisivel) {
    mensagem.style.display = "block";
  } else {
    mensagem.style.display = "none";
  }
}



//Delete All Tasks
const clearAllBtn = document.getElementById("clear-all-btn");

clearAllBtn.addEventListener("click", function () {
  if (tasks.length === 0) {
    alert("You have no task to delete");
    return;
  }

  const confirmar = confirm("Are you sure that you want to delete ALL tasks?");
  if (!confirmar) return;

  tasks = [];
  saveTasks();
  list.innerHTML = "";

  verificarListaVazia(false);
});
//Toggle Logic + Storage
const themeBtn = document.getElementById("toggle-theme");

// Aplicar tema salvo ao carregar
window.addEventListener("load", () => {
  // Tema
  const temaSalvo = localStorage.getItem("tema");
  if (temaSalvo === "dark") {
    document.body.classList.add("dark");
    themeBtn.textContent = "☀️ Light Mode";
  }

  // Tarefas
  const dados = localStorage.getItem("tasks");
  if (dados) {
    tasks = JSON.parse(dados);
    tasks.forEach(({ text, done }) => {
      addTask(text, done, false);
    });
  }

  // Aplica filtro visual e lógico
  const filtroSalvo = localStorage.getItem("filtroAtivo") || "all";
  aplicarFiltro(filtroSalvo);
});


// Toggle do tema ao clicar
themeBtn.addEventListener("click", () => {
  document.body.classList.toggle("dark");
  const darkModeAtivo = document.body.classList.contains("dark");

  themeBtn.textContent = darkModeAtivo ? "☀️ Light Mode" : "🌙 Dark Mode";
  localStorage.setItem("tema", darkModeAtivo ? "dark" : "light");
});


  


