const sectionConfig = {
  task: {
    listSelector: '.task-list',
    createItem(value) {
      const li = document.createElement('li');
      li.className = 'task';
      li.tabIndex = 0;

      const icon = document.createElement('span');
      icon.className = 'icon';
      icon.setAttribute('aria-hidden', 'true');
      icon.textContent = '•';

      li.append(icon, document.createTextNode(value));
      return li;
    }
  },
  workout: {
    listSelector: '.workout-list',
    createItem(value) {
      const li = document.createElement('li');
      const dot = document.createElement('span');
      dot.className = 'dot';
      li.append(dot, document.createTextNode(value));
      return li;
    }
  },
  nutrition: {
    listSelector: '.nutrition-list',
    createItem(value) {
      const li = document.createElement('li');
      const dot = document.createElement('span');
      dot.className = 'dot';
      li.append(dot, document.createTextNode(value));
      return li;
    }
  }
};

function initialiseApp() {
  setupActionButtons();
  setupForms();
  setupTaskToggle();
}

function setupActionButtons() {
  const buttons = document.querySelectorAll('.action-button');
  buttons.forEach(button => {
    button.addEventListener('click', () => {
      const card = button.closest('.card');
      if (!card) return;
      const form = card.querySelector(`.quick-add[data-type="${button.dataset.type}"]`);
      if (!form) return;
      const shouldShow = form.hidden;
      form.hidden = !shouldShow;
      button.setAttribute('aria-expanded', shouldShow ? 'true' : 'false');
      if (shouldShow) {
        const input = form.querySelector('input');
        if (input) {
          requestAnimationFrame(() => input.focus());
        }
      }
    });
  });
}

function setupForms() {
  const forms = document.querySelectorAll('.quick-add');
  forms.forEach(form => {
    form.addEventListener('submit', event => {
      event.preventDefault();
      const input = form.querySelector('input');
      if (!input) return;
      const value = input.value.trim();
      if (!value) return;

      addItem(form.dataset.type, value);
      input.value = '';
      hideForm(form);
    });

    form.addEventListener('keydown', event => {
      if (event.key === 'Escape') {
        event.preventDefault();
        hideForm(form, { focusButton: true });
      }
    });
  });
}

function setupTaskToggle() {
  const taskList = document.querySelector('.task-list');
  if (!taskList) return;

  const updateIcon = task => {
    const icon = task.querySelector('.icon');
    if (!icon) return;
    icon.textContent = task.classList.contains('done') ? '✔' : '•';
  };

  taskList.querySelectorAll('.task').forEach(updateIcon);

  taskList.addEventListener('click', event => {
    const task = event.target.closest('.task');
    if (!task) return;
    task.classList.toggle('done');
    updateIcon(task);
  });

  taskList.addEventListener('keydown', event => {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    const task = event.target.closest('.task');
    if (!task) return;
    event.preventDefault();
    task.classList.toggle('done');
    updateIcon(task);
  });
}

function addItem(type, value) {
  const config = sectionConfig[type];
  if (!config) return;
  const list = document.querySelector(config.listSelector);
  if (!list) return;

  const item = config.createItem(value);
  list.appendChild(item);

  if (type === 'task') {
    item.classList.remove('done');
    const icon = item.querySelector('.icon');
    if (icon) {
      icon.textContent = '•';
    }
    requestAnimationFrame(() => item.focus());
  }
}

function hideForm(form, { focusButton = false } = {}) {
  form.hidden = true;
  const type = form.dataset.type;
  const card = form.closest('.card');
  const button = card?.querySelector(`.action-button[data-type="${type}"]`);
  if (button) {
    button.setAttribute('aria-expanded', 'false');
    if (focusButton) {
      requestAnimationFrame(() => button.focus());
    }
  }
}

document.addEventListener('DOMContentLoaded', initialiseApp);
