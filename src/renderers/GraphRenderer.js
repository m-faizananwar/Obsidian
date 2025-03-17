/**
 * GraphRenderer.js
 * Handles D3.js knowledge graph visualization.
 */
import * as d3 from 'd3';

export default class GraphRenderer {
  constructor(canvasId, tooltipId) {
    this.canvasSelector = canvasId;
    this.tooltipSelector = tooltipId;
    this.simulation = null;
    this.width = 0;
    this.height = 0;
  }

  init() {
    this.canvas = document.querySelector(this.canvasSelector);
    this.tooltip = document.querySelector(this.tooltipSelector);
    if (!this.canvas) return;
    
    // Initial dimensions (might be 0 if hidden)
    this.width = this.canvas.clientWidth || window.innerWidth;
    this.height = this.canvas.clientHeight || window.innerHeight;

    window.addEventListener('resize', () => {
      if (this.canvas) {
        this.width = this.canvas.clientWidth || window.innerWidth;
        this.height = this.canvas.clientHeight || window.innerHeight;
      }
    });
  }

  render(tasks) {
    if (!this.canvas) return;
    
    // Refresh dimensions before rendering
    this.width = this.canvas.clientWidth || window.innerWidth;
    this.height = this.canvas.clientHeight || window.innerHeight;
    
    this.canvas.innerHTML = '';

    const nodes = this.createNodes(tasks);
    const links = this.createLinks(tasks, nodes);

    const svg = d3
      .select(this.canvasSelector)
      .append('svg')
      .attr('width', '100%')
      .attr('height', '100%')
      .call(
        d3.zoom().on('zoom', (event) => {
          container.attr('transform', event.transform);
        })
      );

    const container = svg.append('g');

    // Gradient definitions
    const defs = container.append('defs');
    const gradient = defs
      .append('linearGradient')
      .attr('id', 'link-gradient')
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '100%')
      .attr('y2', '100%');

    gradient.append('stop').attr('offset', '0%').attr('stop-color', '#ff9dd2');
    gradient.append('stop').attr('offset', '100%').attr('stop-color', '#c99bff');

    // Simulation
    this.simulation = d3
      .forceSimulation(nodes)
      .force('link', d3.forceLink(links).id((d) => d.id).distance((d) => (d.type === 'task-note' ? 60 : 120)))
      .force('charge', d3.forceManyBody().strength((d) => (d.type === 'note' ? -50 : -200)))
      .force('center', d3.forceCenter(this.width / 2, this.height / 2))
      .force('collision', d3.forceCollide().radius((d) => (d.type === 'note' ? 6 : 20)))
      .force('x', d3.forceX(this.width / 2).strength(0.05))
      .force('y', d3.forceY(this.height / 2).strength(0.05));

    // Links
    const link = container
      .append('g')
      .selectAll('line')
      .data(links)
      .join('line')
      .attr('stroke', (d) => (d.type === 'task-task' ? 'url(#link-gradient)' : '#c99bff'))
      .attr('stroke-opacity', (d) => (d.type === 'task-task' ? 0.8 : 0.4))
      .attr('stroke-width', (d) => (d.type === 'task-task' ? 2 : 1))
      .attr('stroke-dasharray', (d) => (d.type === 'task-task' ? '0' : '3,3'));

    // Nodes
    const node = container
      .append('g')
      .selectAll('.node')
      .data(nodes)
      .join('g')
      .attr('class', 'node')
      .call(
        d3
          .drag()
          .on('start', (e, d) => this.dragstarted(e, d))
          .on('drag', (e, d) => this.dragged(e, d))
          .on('end', (e, d) => this.dragended(e, d))
      );

    node
      .append('circle')
      .attr('r', (d) => (d.type === 'note' ? 4 : 10))
      .attr('fill', (d) => {
        if (d.type === 'note') return '#ff9dd2';
        return d.done ? '#9a86a5' : '#c99bff';
      })
      .attr('stroke', (d) => (d.type === 'task' ? '#fef6ff' : 'none'))
      .attr('stroke-width', (d) => (d.type === 'task' ? 1 : 0))
      .attr('stroke-opacity', 0.4);

    node
      .filter((d) => d.type === 'task')
      .append('text')
      .attr('dx', 15)
      .attr('dy', '.35em')
      .text((d) => (d.name.length > 25 ? d.name.substring(0, 25) + '...' : d.name))
      .attr('fill', '#e9d8ff')
      .attr('font-size', '12px');

    this.simulation.on('tick', () => {
      // Keep nodes within the viewport
      nodes.forEach((d) => {
        d.x = Math.max(20, Math.min(this.width - 20, d.x));
        d.y = Math.max(20, Math.min(this.height - 20, d.y));
      });

      link
        .attr('x1', (d) => d.source.x)
        .attr('y1', (d) => d.source.y)
        .attr('x2', (d) => d.target.x)
        .attr('y2', (d) => d.target.y);

      node.attr('transform', (d) => `translate(${d.x},${d.y})`);
    });
  }

  createNodes(tasks) {
    const taskNodes = tasks.map((task) => ({
      id: task.id,
      name: task.text,
      type: 'task',
      done: task.done,
      notes: task.notes.length,
    }));

    const noteNodes = [];
    tasks.forEach((task) => {
      task.notes.forEach((note) => {
        noteNodes.push({
          id: note.id,
          parentId: task.id,
          content: note.content,
          type: 'note',
          timestamp: note.timestamp,
        });
      });
    });

    return [...taskNodes, ...noteNodes];
  }

  createLinks(tasks, nodes) {
    const links = [];
    const nodeIds = new Set(nodes.map(n => n.id));
    
    tasks.forEach((task) => {
      task.connections.forEach((connId) => {
        if (nodeIds.has(task.id) && nodeIds.has(connId)) {
          links.push({ source: task.id, target: connId, type: 'task-task' });
        }
      });
      task.notes.forEach((note) => {
        if (nodeIds.has(task.id) && nodeIds.has(note.id)) {
          links.push({ source: task.id, target: note.id, type: 'task-note' });
        }
      });
    });
    return links;
  }

  // Drag functions
  dragstarted(event, d) {
    if (!event.active) this.simulation.alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
  }
  dragged(event, d) {
    d.fx = event.x;
    d.fy = event.y;
  }
  dragended(event, d) {
    if (!event.active) this.simulation.alphaTarget(0);
    d.fx = null;
    d.fy = null;
  }

  stop() {
    if (this.simulation) this.simulation.stop();
  }
}
