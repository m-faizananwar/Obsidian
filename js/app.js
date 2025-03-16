const item = document.querySelector("#item");
const toDoBox = document.querySelector("#to-do-box");
const tasksList = document.querySelector("#tasks-list");
const graphViewBtn = document.querySelector("#graph-view-btn");
const closeGraphBtn = document.querySelector("#close-graph-btn");
const graphContainer = document.querySelector("#graph-container");
const noteContent = document.querySelector("#note-content");
const saveNoteBtn = document.querySelector("#save-note-btn");
const cancelNoteBtn = document.querySelector("#cancel-note-btn");
const notesEditor = document.querySelector("#notes-editor");
const notesPlaceholder = document.querySelector("#notes-placeholder");
const newTaskBtn = document.querySelector("#new-task-btn");
const addNoteBtn = document.querySelector("#add-note-btn");
const newNoteForm = document.querySelector("#new-note-form");
const notesContainer = document.querySelector("#notes-container");
const currentTaskTitle = document.querySelector("#current-task-title");
const graphTooltip = document.querySelector("#graph-tooltip");

let tasks = [];
let currentTaskId = null;
let graphSimulation = null;
let isEditingNote = false;
let currentEditingNoteId = null;

// Initialize JoyPixels
const processEmojis = () => {
    joypixels.shortnameToImage(document);
};

// Event listeners
item.addEventListener("keyup", function(event) {
    if (event.key == "Enter" && this.value.trim() !== "") {
        addTask(this.value);
        this.value = "";
    }
});

newTaskBtn.addEventListener("click", function() {
    item.focus();
});

addNoteBtn.addEventListener("click", function() {
    showNewNoteForm();
});

saveNoteBtn.addEventListener("click", function() {
    saveNote();
});

cancelNoteBtn.addEventListener("click", function() {
    hideNewNoteForm();
});

graphViewBtn.addEventListener("click", function() {
    showGraphView();
});

closeGraphBtn.addEventListener("click", function() {
    hideGraphView();
});

// Function to create a unique ID
const generateId = () => {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
};

// Function to add new task
const addTask = (text, id = generateId(), notes = [], done = false, save = true) => {
    const task = {
        id,
        text,
        notes: Array.isArray(notes) ? notes : [],
        done,
        connections: []
    };
    
    tasks.push(task);
    
    // Create task item in the main list
    const listItem = document.createElement("li");
    listItem.dataset.id = task.id;
    listItem.className = `p-3 rounded-lg bg-pastel-darkBg bg-opacity-60 border border-pastel-muted border-opacity-30 
                         flex items-center justify-between group transition-all hover:border-pastel-accent shadow-sm
                         ${done ? 'opacity-60' : ''}`;
    listItem.innerHTML = `
        <div class="flex items-center">
            <span class="w-6 h-6 inline-block border border-pastel-accent rounded-full mr-3 cursor-pointer 
                  ${done ? 'bg-pastel-accent bg-opacity-50' : 'bg-transparent'}">
                ${done ? '<i class="fas fa-check text-xs text-pastel-darkBg flex justify-center items-center h-full"></i>' : ''}
            </span>
            <span class="task-text ${done ? 'line-through' : ''}">${text}</span>
            ${task.notes.length > 0 ? `<span class="ml-2 text-pastel-accent text-xs">${task.notes.length}</span>` : ''}
        </div>
        <div class="opacity-0 group-hover:opacity-100 transition-opacity">
            <button class="delete-btn text-pastel-muted hover:text-pastel-secondary ml-2">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;
    
    // Add event for toggling task completion
    const checkbox = listItem.querySelector(".w-6");
    checkbox.addEventListener("click", () => {
        task.done = !task.done;
        updateTaskUI(task);
        if (save) saveToLocalStorage();
    });
    
    // Add event for deleting task
    listItem.querySelector(".delete-btn").addEventListener("click", (e) => {
        e.stopPropagation();
        deleteTask(task.id);
    });
    
    // Add event for selecting task to show notes
    listItem.addEventListener("click", (e) => {
        if (!e.target.closest(".delete-btn") && !e.target.closest(".w-6")) {
            selectTask(task.id);
        }
    });
    
    toDoBox.appendChild(listItem);
    
    // Add to sidebar list
    addTaskToSidebar(task);
    
    if (save) saveToLocalStorage();
    return task;
};

// Add task to sidebar
const addTaskToSidebar = (task) => {
    const sidebarItem = document.createElement("li");
    sidebarItem.dataset.id = task.id;
    sidebarItem.className = `py-1 px-2 rounded-lg cursor-pointer hover:bg-pastel-muted hover:bg-opacity-20 
                           ${task.done ? 'text-pastel-muted' : ''} flex items-center`;
    sidebarItem.innerHTML = `
        <span>${truncateText(task.text, 18)}</span>
        ${task.notes.length > 0 ? `<span class="ml-1 text-pastel-accent text-xs">${task.notes.length}</span>` : ''}
    `;
    
    sidebarItem.addEventListener("click", () => {
        selectTask(task.id);
    });
    
    // Add cute tooltip for task content
    tippy(sidebarItem, {
        content: task.text,
        placement: 'right',
        animation: 'scale',
        theme: 'pastel-theme'
    });
    
    tasksList.appendChild(sidebarItem);
};

// Update task UI when status changes
const updateTaskUI = (task) => {
    // Update main task list UI
    const listItem = toDoBox.querySelector(`li[data-id="${task.id}"]`);
    if (listItem) {
        const checkbox = listItem.querySelector(".w-6");
        const taskText = listItem.querySelector(".task-text");
        
        if (task.done) {
            checkbox.classList.add("bg-pastel-accent", "bg-opacity-50");
            checkbox.innerHTML = '<i class="fas fa-check text-xs text-pastel-darkBg flex justify-center items-center h-full"></i>';
            taskText.classList.add("line-through");
            listItem.classList.add("opacity-60");
        } else {
            checkbox.classList.remove("bg-pastel-accent", "bg-opacity-50");
            checkbox.innerHTML = '';
            taskText.classList.remove("line-through");
            listItem.classList.remove("opacity-60");
        }
        
        // Update note count
        const oldCount = listItem.querySelector(".text-xs");
        if (oldCount) oldCount.remove();
        
        if (task.notes.length > 0) {
            const countEl = document.createElement("span");
            countEl.className = "ml-2 text-pastel-accent text-xs";
            countEl.textContent = task.notes.length;
            taskText.parentNode.appendChild(countEl);
        }
    }
    
    // Update sidebar task list
    const sidebarItem = tasksList.querySelector(`li[data-id="${task.id}"]`);
    if (sidebarItem) {
        if (task.done) {
            sidebarItem.classList.add("text-pastel-muted");
        } else {
            sidebarItem.classList.remove("text-pastel-muted");
        }
        
        // Update note count in sidebar
        sidebarItem.innerHTML = `
            <span>${truncateText(task.text, 18)}</span>
            ${task.notes.length > 0 ? `<span class="ml-1 text-pastel-accent text-xs">${task.notes.length}</span>` : ''}
        `;
    }
};

// Delete task
const deleteTask = (id) => {
    // Remove from data array
    tasks = tasks.filter(task => task.id !== id);
    
    // Remove connections to this task
    tasks.forEach(task => {
        task.connections = task.connections.filter(connId => connId !== id);
    });
    
    // Remove from UI
    const mainItem = toDoBox.querySelector(`li[data-id="${id}"]`);
    if (mainItem) mainItem.remove();
    
    const sidebarItem = tasksList.querySelector(`li[data-id="${id}"]`);
    if (sidebarItem) sidebarItem.remove();
    
    // Clear notes area if current task was deleted
    if (currentTaskId === id) {
        currentTaskId = null;
        showNotesPlaceholder();
    }
    
    saveToLocalStorage();
};

// Select task to show notes
const selectTask = (id) => {
    currentTaskId = id;
    const task = tasks.find(t => t.id === id);
    
    // Highlight selected task in sidebar
    document.querySelectorAll("#tasks-list li").forEach(li => {
        li.classList.remove("bg-pastel-muted", "bg-opacity-20", "border-l-2", "border-pastel-accent", "pl-1");
    });
    
    const selectedItem = tasksList.querySelector(`li[data-id="${id}"]`);
    if (selectedItem) {
        selectedItem.classList.add("bg-pastel-muted", "bg-opacity-20", "border-l-2", "border-pastel-accent", "pl-1");
    }
    
    // Show notes for selected task
    if (task) {
        notesPlaceholder.classList.add("hidden");
        notesEditor.classList.remove("hidden");
        currentTaskTitle.textContent = truncateText(task.text, 30);
        hideNewNoteForm();
        renderNotes(task);
        updateConnectionsInfo(task);
    }
};

// Show new note form
const showNewNoteForm = () => {
    isEditingNote = false;
    currentEditingNoteId = null;
    newNoteForm.classList.remove("hidden");
    noteContent.value = "";
    noteContent.focus();
};

// Hide new note form
const hideNewNoteForm = () => {
    newNoteForm.classList.add("hidden");
    noteContent.value = "";
    isEditingNote = false;
    currentEditingNoteId = null;
};

// Create a note element
const createNoteElement = (note, index) => {
    const noteEl = document.createElement("div");
    noteEl.className = "bg-pastel-darkBg bg-opacity-80 p-3 rounded-lg border border-pastel-muted border-opacity-30 note-card animate__animated animate__fadeIn";
    noteEl.dataset.id = note.id;
    
    // Find connected tasks based on mentions
    const linkedTasks = findLinkedTasks(note.content);
    
    noteEl.innerHTML = `
        <div class="flex justify-between items-start mb-1">
            <div class="text-xs text-pastel-muted">${formatDate(note.timestamp)}</div>
            <div class="flex space-x-2">
                <button class="edit-note-btn text-pastel-muted hover:text-pastel-accent">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="delete-note-btn text-pastel-muted hover:text-pastel-secondary">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
        <div class="note-content whitespace-pre-wrap">${processNoteContent(note.content)}</div>
        ${linkedTasks.length > 0 ? `
        <div class="mt-2 text-xs border-t border-pastel-muted border-opacity-20 pt-1">
            <span class="text-pastel-accent">Linked to:</span>
            <span class="text-pastel-muted">${linkedTasks.map(t => t.text).join(', ')}</span>
        </div>
        ` : ''}
    `;
    
    // Add event listeners
    noteEl.querySelector(".edit-note-btn").addEventListener("click", () => {
        startEditingNote(note);
    });
    
    noteEl.querySelector(".delete-note-btn").addEventListener("click", () => {
        deleteNote(note.id);
    });
    
    return noteEl;
};

// Start editing an existing note
const startEditingNote = (note) => {
    isEditingNote = true;
    currentEditingNoteId = note.id;
    newNoteForm.classList.remove("hidden");
    noteContent.value = note.content;
    noteContent.focus();
    
    // Scroll to the form
    newNoteForm.scrollIntoView({ behavior: 'smooth' });
};

// Format date for note timestamp
const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
};

// Process note content to format mentions
const processNoteContent = (content) => {
    // Replace mentions with styled spans
    return content.replace(/\[\[(.*?)\]\]/g, (match, name) => {
        return `<span class="text-pastel-accent">[[${name}]]</span>`;
    });
};

// Find tasks linked in note content
const findLinkedTasks = (content) => {
    const linkedTasks = [];
    const mentions = content.match(/\[\[(.*?)\]\]/g) || [];
    
    mentions.forEach(mention => {
        const taskName = mention.replace('[[', '').replace(']]', '');
        const foundTask = tasks.find(t => 
            t.id !== currentTaskId && // Don't count self-references
            t.text.toLowerCase().includes(taskName.toLowerCase())
        );
        
        if (foundTask && !linkedTasks.some(t => t.id === foundTask.id)) {
            linkedTasks.push(foundTask);
        }
    });
    
    return linkedTasks;
};

// Render all notes for a task
const renderNotes = (task) => {
    notesContainer.innerHTML = '';
    
    if (task.notes.length === 0) {
        const emptyState = document.createElement("div");
        emptyState.className = "text-center text-pastel-muted p-4";
        emptyState.innerHTML = `
            <div class="text-4xl mb-2">:books:</div>
            <p>No notes yet. Click "Add Note" to create one!</p>
        `;
        notesContainer.appendChild(emptyState);
        processEmojis();
        return;
    }
    
    task.notes.forEach((note, index) => {
        const noteEl = createNoteElement(note, index);
        notesContainer.appendChild(noteEl);
    });
    
    processEmojis();
};

// Save a note (new or edited)
const saveNote = () => {
    const content = noteContent.value.trim();
    if (!content || !currentTaskId) return;
    
    const task = tasks.find(t => t.id === currentTaskId);
    if (!task) return;
    
    if (isEditingNote && currentEditingNoteId) {
        // Edit existing note
        const noteIndex = task.notes.findIndex(n => n.id === currentEditingNoteId);
        if (noteIndex !== -1) {
            task.notes[noteIndex].content = content;
            task.notes[noteIndex].editTimestamp = Date.now();
        }
    } else {
        // Create new note
        task.notes.push({
            id: generateId(),
            content: content,
            timestamp: Date.now()
        });
    }
    
    updateTaskConnections(currentTaskId);
    updateTaskUI(task);
    hideNewNoteForm();
    renderNotes(task);
    updateConnectionsInfo(task);
    saveToLocalStorage();
};

// Delete a note
const deleteNote = (noteId) => {
    const task = tasks.find(t => t.id === currentTaskId);
    if (!task) return;
    
    task.notes = task.notes.filter(note => note.id !== noteId);
    updateTaskConnections(currentTaskId);
    updateTaskUI(task);
    renderNotes(task);
    updateConnectionsInfo(task);
    saveToLocalStorage();
};

// Update connections between tasks based on note content
const updateTaskConnections = (sourceTaskId) => {
    const sourceTask = tasks.find(t => t.id === sourceTaskId);
    if (!sourceTask) return;
    
    // Reset connections
    sourceTask.connections = [];
    
    // Process all notes to find mentions
    sourceTask.notes.forEach(note => {
        const mentions = note.content.match(/\[\[(.*?)\]\]/g) || [];
        mentions.forEach(mention => {
            const taskName = mention.replace('[[', '').replace(']]', '');
            const connectedTask = tasks.find(t => 
                t.id !== sourceTask.id && // Don't connect to self
                t.text.toLowerCase().includes(taskName.toLowerCase())
            );
            
            if (connectedTask && !sourceTask.connections.includes(connectedTask.id)) {
                sourceTask.connections.push(connectedTask.id);
            }
        });
    });
};

// Update display of connections info
const updateConnectionsInfo = (task) => {
    let connectedTasks = document.querySelector("#connected-tasks");
    if (connectedTasks) connectedTasks.remove();
    
    if (task && task.connections.length > 0) {
        // Create connections info element
        connectedTasks = document.createElement("div");
        connectedTasks.id = "connected-tasks";
        connectedTasks.className = "mt-4 p-3 rounded-lg bg-pastel-darkBg bg-opacity-50 border border-pastel-muted border-opacity-30 shadow-sm";
        
        connectedTasks.innerHTML = `
            <div class="text-sm text-pastel-accent mb-2 flex items-center">
                <span class="mr-2">:link:</span> Connected Tasks:
            </div>
            <ul class="space-y-1">
                ${task.connections.map(connId => {
                    const connTask = tasks.find(t => t.id === connId);
                    return connTask ? 
                        `<li class="text-sm hover:text-pastel-accent cursor-pointer flex items-center pl-2" data-id="${connId}">
                            <span class="mr-1">:sparkles:</span>
                            ${connTask.text}
                        </li>` : '';
                }).join('')}
            </ul>
        `;
        
        notesEditor.appendChild(connectedTasks);
        processEmojis();
        
        // Add click events to connected tasks
        connectedTasks.querySelectorAll("li").forEach(li => {
            li.addEventListener("click", () => {
                selectTask(li.dataset.id);
            });
        });
    }
};

// Show notes placeholder when no task is selected
const showNotesPlaceholder = () => {
    notesPlaceholder.classList.remove("hidden");
    notesEditor.classList.add("hidden");
};

// Display graph visualization with full screen mode
const showGraphView = () => {
    graphContainer.classList.remove("hidden");
    // Ensure graph container is full screen
    document.body.classList.add('overflow-hidden');
    
    // Set a small delay to ensure CSS transition works properly
    setTimeout(() => {
        renderGraph();
    }, 100);
};

// Hide graph visualization
const hideGraphView = () => {
    graphContainer.classList.add("hidden");
    document.body.classList.remove('overflow-hidden');
    if (graphSimulation) graphSimulation.stop();
};

// Render graph using D3.js with tasks and notes
const renderGraph = () => {
    const graphCanvas = document.getElementById("graph-canvas");
    graphCanvas.innerHTML = '';
    
    // Show loading animation
    const graphLoading = document.getElementById("graph-loading");
    if (graphLoading) graphLoading.classList.remove("hidden");
    
    const width = graphCanvas.clientWidth;
    const height = graphCanvas.clientHeight;
    
    // Create SVG with zoom capabilities
    const svg = d3.select("#graph-canvas")
        .append("svg")
        .attr("width", "100%")
        .attr("height", "100%")
        .call(d3.zoom().on("zoom", function(event) {
            g.attr("transform", event.transform);
        }));
    
    // Add a container group that will be transformed for zoom
    const g = svg.append("g");
    
    // Create gradient for links
    const gradient = g.append("defs")
        .append("linearGradient")
        .attr("id", "link-gradient")
        .attr("x1", "0%")
        .attr("y1", "0%")
        .attr("x2", "100%")
        .attr("y2", "100%");
    
    gradient.append("stop")
        .attr("offset", "0%")
        .attr("stop-color", "#ff9dd2");
    
    gradient.append("stop")
        .attr("offset", "100%")
        .attr("stop-color", "#c99bff");
    
    // Create nodes for tasks and notes
    const taskNodes = tasks.map(task => ({
        id: task.id,
        name: task.text,
        type: "task",
        done: task.done,
        notes: task.notes.length
    }));
    
    const noteNodes = [];
    tasks.forEach(task => {
        task.notes.forEach(note => {
            noteNodes.push({
                id: note.id,
                parentId: task.id,
                content: note.content,
                type: "note",
                timestamp: note.timestamp
            });
        });
    });
    
    const nodes = [...taskNodes, ...noteNodes];
    
    // Create links between tasks and between tasks and their notes
    const taskLinks = [];
    const noteLinks = [];
    
    // Task to task links (connections)
    tasks.forEach(task => {
        task.connections.forEach(connId => {
            taskLinks.push({
                source: task.id,
                target: connId,
                type: "task-task"
            });
        });
    });
    
    // Task to note links
    noteNodes.forEach(note => {
        noteLinks.push({
            source: note.parentId,
            target: note.id,
            type: "task-note"
        });
    });
    
    const links = [...taskLinks, ...noteLinks];
    
    // Create force simulation
    graphSimulation = d3.forceSimulation(nodes)
        .force("link", d3.forceLink(links).id(d => d.id).distance(d => d.type === "task-note" ? 60 : 120))
        .force("charge", d3.forceManyBody().strength(d => d.type === "note" ? -50 : -200))
        .force("center", d3.forceCenter(width / 2, height / 2))
        .force("collision", d3.forceCollide().radius(d => d.type === "note" ? 6 : 20))
        .force("x", d3.forceX(width / 2).strength(0.05))
        .force("y", d3.forceY(height / 2).strength(0.05));
    
    // Create link elements
    const link = g.append("g")
        .selectAll("line")
        .data(links)
        .join("line")
        .attr("stroke", d => d.type === "task-task" ? "url(#link-gradient)" : "#c99bff")
        .attr("stroke-opacity", d => d.type === "task-task" ? 0.8 : 0.4)
        .attr("stroke-width", d => d.type === "task-task" ? 2 : 1)
        .attr("stroke-dasharray", d => d.type === "task-task" ? "0" : "3,3");
    
    // Create node elements
    const node = g.append("g")
        .selectAll(".node")
        .data(nodes)
        .join("g")
        .attr("class", "node")
        .call(d3.drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended));
    
    // Add circles to nodes with different sizes for tasks and notes
    node.append("circle")
        .attr("r", d => d.type === "note" ? 4 : 10)
        .attr("fill", d => {
            if (d.type === "note") return "#ff9dd2";
            return d.done ? "#9a86a5" : "#c99bff";
        })
        .attr("stroke", d => d.type === "task" ? "#fef6ff" : "none")
        .attr("stroke-width", d => d.type === "task" ? 1 : 0)
        .attr("stroke-opacity", 0.4);
    
    // Add glowing effect for task nodes
    node.filter(d => d.type === "task")
        .append("circle")
        .attr("r", 14)
        .attr("fill", "none")
        .attr("stroke", "#ff9dd2")
        .attr("stroke-width", 1)
        .attr("stroke-opacity", 0.3)
        .attr("class", "glow-circle");
    
    // Add text labels to task nodes
    node.filter(d => d.type === "task")
        .append("text")
        .attr("dx", 15)
        .attr("dy", ".35em")
        .text(d => truncateText(d.name, 25))
        .attr("fill", "#e9d8ff")
        .attr("font-size", "12px");
    
    // Add hover and click interactions
    node.on("mouseover", function(event, d) {
        // Bring this node to front
        this.parentNode.appendChild(this);
        showNodeTooltip(event, d);
    })
    .on("mouseout", function() {
        hideNodeTooltip();
    })
    .on("click", function(event, d) {
        if (d.type === "task") {
            hideGraphView();
            selectTask(d.id);
        }
    });
    
    // Update positions on each tick
    graphSimulation.on("tick", () => {
        // Keep nodes within the viewport
        nodes.forEach(d => {
            // Add boundary constraints with padding
            d.x = Math.max(20, Math.min(width - 20, d.x));
            d.y = Math.max(20, Math.min(height - 20, d.y));
        });
        
        link
            .attr("x1", d => d.source.x)
            .attr("y1", d => d.source.y)
            .attr("x2", d => d.target.x)
            .attr("y2", d => d.target.y);
        
        node
            .attr("transform", d => `translate(${d.x},${d.y})`);
    });
    
    // Hide loading animation after rendering completes
    setTimeout(() => {
        if (graphLoading) graphLoading.classList.add("hidden");
    }, 800);
    
    // Handle speed control slider
    const speedSlider = document.getElementById("graph-speed");
    if (speedSlider) {
        // Set initial value
        speedSlider.value = 50;
        
        speedSlider.addEventListener("input", function() {
            // Convert slider value (0-100) to a reasonable alpha target (0-0.5)
            const alphaTarget = this.value / 200;
            graphSimulation.alphaTarget(alphaTarget).restart();
        });
    }
    
    // Drag functions
    function dragstarted(event) {
        if (!event.active) graphSimulation.alphaTarget(0.3).restart();
        event.subject.fx = event.subject.x;
        event.subject.fy = event.subject.y;
    }
    
    function dragged(event) {
        event.subject.fx = event.x;
        event.subject.fy = event.y;
    }
    
    function dragended(event) {
        if (!event.active) graphSimulation.alphaTarget(0);
        event.subject.fx = null;
        event.subject.fy = null;
    }
};

// Show tooltip when hovering over a node in the graph
const showNodeTooltip = (event, d) => {
    const tooltip = document.getElementById("graph-tooltip");
    tooltip.classList.remove("hidden");
    
    if (d.type === "task") {
        const task = tasks.find(t => t.id === d.id);
        if (!task) return;
        
        tooltip.innerHTML = `
            <div class="font-medium text-pastel-accent mb-1">${task.text}</div>
            <div class="text-xs mb-2 text-pastel-muted">${task.notes.length} notes</div>
            ${task.done ? '<div class="text-xs text-pastel-secondary">Completed</div>' : ''}
        `;
    } else {
        // Find the parent task of this note
        const parentTask = tasks.find(t => t.id === d.parentId);
        const noteText = d.content.length > 100 ? d.content.substring(0, 100) + "..." : d.content;
        
        tooltip.innerHTML = `
            <div class="text-xs text-pastel-muted mb-1">Note from "${parentTask ? parentTask.text : 'Unknown task'}"</div>
            <div class="text-sm whitespace-pre-wrap">${processNoteContent(noteText)}</div>
            <div class="text-xs mt-2 text-pastel-muted">${formatDate(d.timestamp)}</div>
        `;
    }
    
    // Position the tooltip
    const tooltipWidth = tooltip.offsetWidth;
    const tooltipHeight = tooltip.offsetHeight;
    const padding = 10;
    
    tooltip.style.left = `${event.pageX - tooltipWidth / 2}px`;
    tooltip.style.top = `${event.pageY - tooltipHeight - padding}px`;
    
    processEmojis();
};

// Hide the node tooltip
const hideNodeTooltip = () => {
    document.getElementById("graph-tooltip").classList.add("hidden");
};

// Helper function to truncate text
const truncateText = (text, maxLength) => {
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
};

// Save data to localStorage
const saveToLocalStorage = () => {
    localStorage.setItem("obsidianTasks", JSON.stringify(tasks));
};

// Load data from localStorage
const loadFromLocalStorage = () => {
    const savedTasks = JSON.parse(localStorage.getItem("obsidianTasks")) || [];
    toDoBox.innerHTML = '';
    tasksList.innerHTML = '';
    tasks = [];
    
    savedTasks.forEach(task => {
        addTask(task.text, task.id, task.notes || [], task.done, false);
    });
    
    // Restore connections after all tasks are created
    savedTasks.forEach(savedTask => {
        const task = tasks.find(t => t.id === savedTask.id);
        if (task) {
            task.connections = savedTask.connections || [];
        }
    });
    
    showNotesPlaceholder();
    initializeTooltips();
};

// Initialize Tippy.js tooltips
const initializeTooltips = () => {
    tippy.setDefaultProps({
        animation: 'scale',
        theme: 'pastel-theme',
        duration: 200
    });
};

// Initialize the app
document.addEventListener("DOMContentLoaded", () => {
    loadFromLocalStorage();
    processEmojis();
    
    // After DOM is loaded, initialize tooltips
    setTimeout(() => {
        initializeTooltips();
    }, 500);
    
    // Set up refresh graph button
    const refreshGraphBtn = document.getElementById("refresh-graph-btn");
    if (refreshGraphBtn) {
        refreshGraphBtn.addEventListener("click", () => {
            // Add loading animation class
            refreshGraphBtn.classList.add("active");
            
            // Show loading indicator
            const graphLoading = document.getElementById("graph-loading");
            if (graphLoading) graphLoading.classList.remove("hidden");
            
            // Stop current simulation
            if (graphSimulation) graphSimulation.stop();
            
            // Clear the graph canvas
            document.getElementById("graph-canvas").innerHTML = '';
            
            // Slight delay to allow UI update
            setTimeout(() => {
                renderGraph();
                
                // Remove loading animation after a short delay
                setTimeout(() => {
                    refreshGraphBtn.classList.remove("active");
                }, 500);
            }, 300);
        });
    }
});