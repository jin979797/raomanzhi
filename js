const dock = document.getElementById('dock');
let draggedElement = null;
let placeholder = null;

dock.addEventListener('dragstart', (e) => {
    if (e.target.closest('.app')) {
        draggedElement = e.target.closest('.app');
        setTimeout(() => {
            draggedElement.style.opacity = '0.5';
        }, 0);
    }
});

dock.addEventListener('dragend', (e) => {
    if (draggedElement) {
        draggedElement.style.opacity = '1';
        draggedElement = null;
    }
    if (placeholder) {
        placeholder.remove();
        placeholder = null;
    }
});

dock.addEventListener('dragover', (e) => {
    e.preventDefault();
    
    if (!draggedElement) return;
    
    const afterElement = getDragAfterElement(dock, e.clientX);
    
    if (!placeholder) {
        placeholder = document.createElement('div');
        placeholder.className = 'placeholder';
        dock.insertBefore(placeholder, draggedElement);
    }
    
    if (afterElement == null) {
        dock.appendChild(placeholder);
    } else {
        dock.insertBefore(placeholder, afterElement);
    }
});

dock.addEventListener('drop', (e) => {
    e.preventDefault();
    if (draggedElement && placeholder) {
        if (placeholder.nextSibling) {
            dock.insertBefore(draggedElement, placeholder.nextSibling);
        } else {
            dock.appendChild(draggedElement);
        }
        placeholder.remove();
        placeholder = null;
        draggedElement.style.opacity = '1';
        draggedElement = null;
    }
});

function getDragAfterElement(container, x) {
    const draggableElements = [...container.querySelectorAll('.app:not(.dragging)')];
    
    return draggableElements.reduce((closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = x - box.left - box.width / 2;
        
        if (offset < 0 && offset > closest.offset) {
            return { offset: offset, element: child };
        } else {
            return closest;
        }
    }, { offset: Number.NEGATIVE_INFINITY }).element;
}
