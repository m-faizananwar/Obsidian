/**
 * main.js
 * Entry point for the Obsidian-inspired Todo App.
 * Orchestrates modules and maintains app state.
 */

import './styles/main.css';
import VaultManager from './managers/VaultManager';
import ThemeManager from './managers/ThemeManager';
import GraphRenderer from './renderers/GraphRenderer';
import { processEmojis, parseTextEmojis } from './utils/EmojiProcessor';
import tippy from 'tippy.js';
import 'tippy.js/dist/tippy.css';
import 'tippy.js/animations/scale.css';
import 'animate.css';
import '@dotlottie/player-component';

// Global instances
const vaultManager = new VaultManager();
const themeManager = new ThemeManager();
const graphRenderer = new GraphRenderer('#graph-canvas', '#graph-tooltip');

// Application State
window.tasks = [];
let currentTaskId = null;
let currentEditingNoteId = null;

// DOM Elements cache
const ELEMENTS = {
  itemInput: document.querySelector('#item'),
  taskBox: document.querySelector('#to-do-box'),
  sidebarTasks: document.querySelector('#tasks-list'),
  vaultName: document.querySelector('#current-vault-name'),
  notesEditor: document.querySelector('#notes-editor'),
  notesPlaceholder: document.querySelector('#notes-placeholder'),
  graphContainer: document.querySelector('#graph-container'),
  saveNoteBtn: document.querySelector('#save-note-btn'),
  noteContent: document.querySelector('#note-content'),
  currentTaskTitle: document.querySelector('#current-task-title'),
  newNoteForm: document.querySelector('#new-note-form'),
  notesContainer: document.querySelector('#notes-container'),
};

/**
 * Initialization
 */
const init = () => {
  themeManager.init();
  graphRenderer.init();

  vaultManager.onVaultSwitch = (vault) => {
    ELEMENTS.vaultName.textContent = vault.name;
    window.tasks = vault.tasks || [];
    refreshTasksUI();
  };
  vaultManager.init();

  setupEventListeners();
  initializeStaticTooltips();
};

/**
 * Core Application Logic
 */
const setupEventListeners = () => {
  ELEMENTS.itemInput.addEventListener('keyup', (e) => {
    const input = ELEMENTS.itemInput;
    if (e.key === 'Enter' && input.value && input.value.trim()) {
      addTask(input.value.trim());
      input.value = '';
    }
  });

  document.querySelector('#graph-view-btn').addEventListener('click', showGraph);
  document.querySelector('#close-graph-btn').addEventListener('click', hideGraph);
  document.querySelector('#refresh-graph-btn').addEventListener('click', () => graphRenderer.render(window.tasks));

  ELEMENTS.saveNoteBtn.addEventListener('click', saveNote);
  document.querySelector('#cancel-note-btn').addEventListener('click', hideNoteForm);
  document.querySelector('#add-note-btn').addEventListener('click', () => showNoteForm());

  document.querySelector('#new-task-btn').addEventListener('click', () => ELEMENTS.itemInput.focus());

  ELEMENTS.taskBox.addEventListener('click', handleTaskBoxClick);
  ELEMENTS.notesContainer.addEventListener('click', handleNoteContainerClick);
};

const addTask = (text, done = false) => {
  const task = {
    id: 'task_' + Date.now(),
    text,
    done,
    notes: [],
    connections: [],
  };
  window.tasks.push(task);
  renderTask(task);
  addTaskToSidebar(task);
  vaultManager.saveCurrentVaultData();
};

const renderTask = (task) => {
  const li = document.createElement('li');
  li.dataset.id = task.id;
  li.className = `p-3 rounded-xl glass-effect flex items-center justify-between group transition-all hover:border-pastel-accent shadow-sm ${task.done ? 'opacity-60' : ''}`;
  
  li.innerHTML = `
    <div class="flex items-center flex-1">
      <span class="checkbox-ui w-6 h-6 inline-block border border-pastel-accent rounded-full mr-3 cursor-pointer ${task.done ? 'bg-pastel-accent bg-opacity-50' : ''}">
        ${task.done ? '<i class="fas fa-check text-xs text-pastel-darkBg flex justify-center items-center h-full"></i>' : ''}
      </span>
      <span class="task-text flex-1 ${task.done ? 'line-through' : ''} cursor-text">${task.text}</span>
    </div>
    <div class="opacity-0 group-hover:opacity-100 transition-opacity flex items-center space-x-2">
      <button class="edit-task-btn text-pastel-muted hover:text-pastel-accent p-1">
        <i class="fas fa-edit text-xs"></i>
      </button>
      <button class="delete-btn text-pastel-muted hover:text-pastel-secondary p-1">
        <i class="fas fa-times"></i>
      </button>
    </div>
  `;

  ELEMENTS.taskBox.prepend(li);
  processEmojis();
};

const addTaskToSidebar = (task) => {
  const li = document.createElement('li');
  li.dataset.id = task.id;
  li.className = `py-1.5 px-3 rounded-lg cursor-pointer hover:bg-pastel-accent hover:bg-opacity-10 transition-colors flex items-center ${task.done ? 'text-pastel-muted' : ''}`;
  li.textContent = task.text.length > 20 ? task.text.substring(0, 17) + '...' : task.text;
  
  li.addEventListener('click', () => selectTask(task.id));
  ELEMENTS.sidebarTasks.appendChild(li);
};

const handleTaskBoxClick = (e) => {
  const li = e.target.closest('li');
  if (!li) return;
  
  const id = li.dataset.id;
  const task = window.tasks.find(t => t.id === id);
  if (!task) return;

  // Checkbox toggle
  if (e.target.closest('.checkbox-ui')) {
    task.done = !task.done;
    refreshTasksUI();
    vaultManager.saveCurrentVaultData();
    return;
  }

  // Delete task
  if (e.target.closest('.delete-btn')) {
    deleteTask(id);
    return;
  }

  // Edit task title
  if (e.target.closest('.edit-task-btn') || (e.target.classList.contains('task-text') && e.detail === 2)) {
    const newText = prompt('Edit task:', task.text);
    if (newText !== null && newText.trim() !== '') {
      task.text = newText.trim();
      refreshTasksUI();
      vaultManager.saveCurrentVaultData();
    }
    return;
  }

  selectTask(id);
};

const deleteTask = (id) => {
  if (confirm('Delete this task and all its notes?')) {
    window.tasks = window.tasks.filter(t => t.id !== id);
    if (currentTaskId === id) {
      currentTaskId = null;
      ELEMENTS.notesEditor.classList.add('hidden');
      ELEMENTS.notesPlaceholder.classList.remove('hidden');
    }
    refreshTasksUI();
    vaultManager.saveCurrentVaultData();
  }
};

const selectTask = (id) => {
  currentTaskId = id;
  const task = window.tasks.find(t => t.id === id);
  if (!task) return;

  ELEMENTS.notesPlaceholder.classList.add('hidden');
  ELEMENTS.notesEditor.classList.remove('hidden');
  ELEMENTS.currentTaskTitle.textContent = task.text;
  hideNoteForm();
  renderNotes(task);
};

const renderNotes = (task) => {
  ELEMENTS.notesContainer.innerHTML = task.notes.length ? '' : '<div class="text-center py-10 opacity-30"><i class="fas fa-feather text-3xl mb-2"></i><p class="text-xs uppercase tracking-widest">No notes in the galaxy yet</p></div>';
  
  task.notes.forEach(note => {
    const el = document.createElement('div');
    el.className = 'group p-4 bg-pastel-darkBg bg-opacity-40 rounded-xl border border-pastel-muted border-opacity-10 mb-3 hover:border-pastel-accent transition-all animate__animated animate__fadeIn';
    el.dataset.id = note.id;
    
    el.innerHTML = `
      <div class="flex justify-between items-start mb-2">
        <span class="text-[10px] text-pastel-muted font-bold tracking-widest uppercase">
          ${new Date(note.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
        <div class="opacity-0 group-hover:opacity-100 flex space-x-2 transition-opacity">
          <button class="edit-note-btn text-pastel-muted hover:text-pastel-accent" title="Edit note">
            <i class="fas fa-edit text-xs"></i>
          </button>
          <button class="delete-note-btn text-pastel-muted hover:text-pastel-secondary" title="Delete note">
            <i class="fas fa-trash text-xs"></i>
          </button>
        </div>
      </div>
      <div class="text-sm note-text-content leading-relaxed">${parseTextEmojis(note.content)}</div>
    `;
    ELEMENTS.notesContainer.appendChild(el);
  });
};

const handleNoteContainerClick = (e) => {
  const noteEl = e.target.closest('[data-id]');
  if (!noteEl) return;
  
  const noteId = noteEl.dataset.id;
  const task = window.tasks.find(t => t.id === currentTaskId);
  if (!task) return;
  
  const note = task.notes.find(n => n.id === noteId || n.id == noteId);

  // Edit Note
  if (e.target.closest('.edit-note-btn')) {
    showNoteForm(note);
    return;
  }

  // Delete Note
  if (e.target.closest('.delete-note-btn')) {
    if (confirm('Delete this note?')) {
      task.notes = task.notes.filter(n => n.id !== noteId && n.id != noteId);
      renderNotes(task);
      vaultManager.saveCurrentVaultData();
    }
  }
};

const showNoteForm = (note = null) => {
  ELEMENTS.newNoteForm.classList.remove('hidden');
  if (note) {
    ELEMENTS.noteContent.value = note.content;
    currentEditingNoteId = note.id;
    ELEMENTS.saveNoteBtn.textContent = 'Update Note';
  } else {
    ELEMENTS.noteContent.value = '';
    currentEditingNoteId = null;
    ELEMENTS.saveNoteBtn.textContent = 'Save Note';
  }
  ELEMENTS.noteContent.focus();
};

const hideNoteForm = () => {
  ELEMENTS.newNoteForm.classList.add('hidden');
  ELEMENTS.noteContent.value = '';
  currentEditingNoteId = null;
};

const saveNote = () => {
  const content = ELEMENTS.noteContent.value.trim();
  if (!content || !currentTaskId) return;

  const task = window.tasks.find(t => t.id === currentTaskId);
  if (!task) return;

  if (currentEditingNoteId) {
    const note = task.notes.find(n => n.id === currentEditingNoteId || n.id == currentEditingNoteId);
    if (note) note.content = content;
  } else {
    task.notes.push({ 
      id: 'note_' + Date.now(), 
      content, 
      timestamp: Date.now() 
    });
  }
  
  renderNotes(task);
  vaultManager.saveCurrentVaultData();
  hideNoteForm();
};

const showGraph = () => {
  ELEMENTS.graphContainer.classList.remove('hidden');
  ELEMENTS.graphContainer.classList.add('flex');
  graphRenderer.render(window.tasks);
};

const hideGraph = () => {
  ELEMENTS.graphContainer.classList.add('hidden');
  ELEMENTS.graphContainer.classList.remove('flex');
  graphRenderer.stop();
};

const refreshTasksUI = () => {
  ELEMENTS.taskBox.innerHTML = '';
  ELEMENTS.sidebarTasks.innerHTML = '';
  window.tasks.forEach(task => {
    renderTask(task);
    addTaskToSidebar(task);
  });
};

const initializeStaticTooltips = () => {
  tippy('#new-task-btn', { content: 'Focus input', placement: 'right' });
  tippy('#graph-view-btn', { content: 'Visualize nodes' });
};

// Start the app
init();
