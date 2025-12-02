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
      return createTrackItem('workout', value);
    }
  },
  nutrition: {
    listSelector: '.nutrition-list',
    createItem(value) {
      return createTrackItem('nutrition', value);
    }
  }
};

function initialiseApp() {
  setupTabs();
  setupActionButtons();
  setupForms();
  setupTaskToggle();
  setupTrackableLists();
  setupGoalControls();
  updateAllStats();
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

function setupTabs() {
  const tabs = Array.from(document.querySelectorAll('[data-tab-target]'));
  const panels = Array.from(document.querySelectorAll('[data-tab-panel]'));
  if (!tabs.length || !panels.length) {
    return;
  }

  const activateTab = (target, { focusTab = true } = {}) => {
    tabs.forEach(tab => {
      const isActive = tab.dataset.tabTarget === target;
      tab.classList.toggle('is-active', isActive);
      tab.setAttribute('aria-selected', isActive ? 'true' : 'false');
      tab.tabIndex = isActive ? 0 : -1;
      if (isActive && focusTab) {
        requestAnimationFrame(() => tab.focus());
      }
    });

    panels.forEach(panel => {
      const isActive = panel.dataset.tabPanel === target;
      panel.classList.toggle('is-active', isActive);
      panel.hidden = !isActive;
      panel.setAttribute('aria-hidden', isActive ? 'false' : 'true');
    });
  };

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      activateTab(tab.dataset.tabTarget, { focusTab: false });
    });

    tab.addEventListener('keydown', event => {
      if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') {
        return;
      }
      event.preventDefault();
      const currentIndex = tabs.indexOf(tab);
      if (currentIndex === -1) {
        return;
      }
      const offset = event.key === 'ArrowRight' ? 1 : -1;
      const nextIndex = (currentIndex + offset + tabs.length) % tabs.length;
      const nextTab = tabs[nextIndex];
      activateTab(nextTab.dataset.tabTarget);
    });
  });

  const defaultTab = tabs.find(tab => tab.classList.contains('is-active')) ?? tabs[0];
  if (defaultTab) {
    activateTab(defaultTab.dataset.tabTarget, { focusTab: false });
  }
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
      updateAllStats();
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
    updateAllStats();
  });

  taskList.addEventListener('keydown', event => {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    const task = event.target.closest('.task');
    if (!task) return;
    event.preventDefault();
    task.classList.toggle('done');
    updateIcon(task);
    updateAllStats();
  });
}

function setupTrackableLists() {
  const lists = document.querySelectorAll('.trackable-list');
  lists.forEach(list => {
    list.addEventListener('click', event => {
      const item = event.target.closest('.track-item');
      if (!item) return;
      toggleTrackItem(item);
    });

    list.addEventListener('keydown', event => {
      if (event.key !== 'Enter' && event.key !== ' ') return;
      const item = event.target.closest('.track-item');
      if (!item) return;
      event.preventDefault();
      toggleTrackItem(item);
    });
  });
}

function setupGoalControls() {
  const goals = document.querySelectorAll('.goal');
  goals.forEach(goal => {
    const input = goal.querySelector('[data-goal-input]');
    if (!input) return;
    const progressBar = goal.querySelector('[data-progress-bar]');
    const percent = goal.querySelector('[data-goal-percent]');

    const updateGoal = () => {
      const value = Number.parseInt(input.value, 10) || 0;
      if (progressBar) {
        progressBar.style.width = `${value}%`;
      }
      if (percent) {
        percent.textContent = `${value}%`;
      }
      goal.dataset.progress = value;
      updateAllStats();
    };

    input.addEventListener('input', updateGoal);
    updateGoal();
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
  } else if (item instanceof HTMLElement) {
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

function createTrackItem(type, value) {
  const li = document.createElement('li');
  li.className = 'track-item';
  li.dataset.type = type;
  li.setAttribute('role', 'button');
  li.tabIndex = 0;
  li.setAttribute('aria-pressed', 'false');

  const dot = document.createElement('span');
  dot.className = 'dot';

  const label = document.createElement('span');
  label.className = 'label';
  label.textContent = value;

  li.append(dot, label);
  return li;
}

function toggleTrackItem(item) {
  const isDone = item.classList.toggle('done');
  item.setAttribute('aria-pressed', isDone ? 'true' : 'false');
  updateAllStats();
}

function updateAllStats() {
  updateTaskBadge();
  updateTrackableBadge('workout');
  updateTrackableBadge('nutrition');
  const xp = calculateXP();
  updateReward(xp);
  updateAchievements(xp);
}

function updateTaskBadge() {
  const badge = document.querySelector('[data-tasks-badge]');
  const list = document.querySelector('.task-list');
  if (!badge || !list) return;

  const tasks = list.querySelectorAll('.task');
  const total = tasks.length;
  const done = list.querySelectorAll('.task.done').length;

  if (!total) {
    badge.textContent = 'Sem tarefas';
    return;
  }

  const saldo = total - done;
  badge.textContent = done === total
    ? 'Tudo concluído'
    : saldo === 1
      ? 'Falta 1 missão'
      : `${done}/${total} feitas`;
}

function updateTrackableBadge(type) {
  const badgeSelector = type === 'workout' ? '[data-workout-badge]' : '[data-nutrition-badge]';
  const badge = document.querySelector(badgeSelector);
  const list = document.querySelector(`.${type === 'workout' ? 'workout' : 'nutrition'}-list`);
  if (!badge || !list) return;

  const items = list.querySelectorAll('.track-item');
  const total = items.length;
  const done = list.querySelectorAll('.track-item.done').length;

  if (!total) {
    badge.textContent = type === 'workout' ? 'Sem treinos' : 'Sem macros';
    return;
  }

  if (done === total) {
    badge.textContent = type === 'workout' ? 'Pump garantido' : 'Macros fechadas';
    return;
  }

  const label = type === 'workout' ? 'treino' : 'macro';
  badge.textContent = `${done}/${total} ${label}${total > 1 ? 's' : ''}`;
}

function calculateXP() {
  const tasksDone = document.querySelectorAll('.task-list .task.done').length;
  const workoutsDone = document.querySelectorAll('.workout-list .track-item.done').length;
  const nutritionDone = document.querySelectorAll('.nutrition-list .track-item.done').length;
  const goals = Array.from(document.querySelectorAll('.goal')).map(goal => Number(goal.dataset.progress || 0));

  const totalProgress = goals.reduce((acc, value) => acc + value, 0);
  return tasksDone * 15 + workoutsDone * 30 + nutritionDone * 10 + Math.round(totalProgress / (goals.length || 1));
}

function updateReward(xp) {
  const label = document.querySelector('[data-reward-label]');
  if (!label) return;

  let message = 'Segue firme, irmão!';
  if (xp >= 200) {
    message = 'Recompensa destravada: massagem esportiva';
  } else if (xp >= 120) {
    message = 'Recompensa destravada: noite do burger';
  } else if (xp >= 60) {
    message = 'Recompensa destravada: cerveja sem culpa';
  }

  label.textContent = `XP ${xp} • ${message}`;
}

function updateAchievements(xp) {
  const badge = document.querySelector('[data-xp-badge]');
  if (badge) {
    badge.textContent = `XP ${xp}`;
  }

  const items = document.querySelectorAll('[data-achievement-list] .achievement');
  items.forEach(item => {
    const threshold = Number(item.dataset.threshold || 0);
    const earned = xp >= threshold;
    item.classList.toggle('earned', earned);
    const status = item.querySelector('.status');
    if (status) {
      status.textContent = earned ? 'Destravado' : `${threshold} XP`;
    }
  });
}

document.addEventListener('DOMContentLoaded', initialiseApp);
