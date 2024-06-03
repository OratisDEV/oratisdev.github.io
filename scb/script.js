document.addEventListener('DOMContentLoaded', (event) => {
    const map = document.getElementById('map');
    const menu = document.getElementById('menu');
    const buildings = document.querySelectorAll('.draggable');
    const saveBtn = document.getElementById('saveBtn');
    const loadBtn = document.getElementById('loadBtn');
    const loadExBtn = document.getElementById('loadExBtn');
    const fileInput = document.getElementById('fileInput');

    buildings.forEach(building => {
        building.addEventListener('dragstart', dragStart);
    });

    menu.querySelectorAll('.draggable').forEach(building => {
        building.addEventListener('contextmenu', (e) => e.preventDefault());
    });

    map.addEventListener('dragover', dragOver);
    map.addEventListener('drop', drop);

    saveBtn.addEventListener('click', saveLayout);
    loadExBtn.addEventListener('click', loadExLayout);
    loadBtn.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', loadLayout);

    function dragStart(e) {
        const originalElement = e.target;
        const clone = originalElement.cloneNode(true);
        clone.id = 'clone-' + Date.now();
        clone.classList.add('cloned');
        map.appendChild(clone);
        e.dataTransfer.setData('text/plain', clone.id);

        clone.addEventListener('dragstart', dragStartOnMap);
        clone.addEventListener('dragend', dragEnd);
        clone.addEventListener('contextmenu', removeBuilding);

        if (clone.dataset.type === 'building' && originalElement.id === 'hospital') {
            clone.addEventListener('mouseenter', show24xHighlightZone);
            clone.addEventListener('mouseleave', remove24xHighlightZone);
        }
        else if (clone.dataset.type === 'building' && originalElement.id === 'improved-police-station') {
            clone.addEventListener('mouseenter', show24xHighlightZone);
            clone.addEventListener('mouseleave', remove24xHighlightZone);
        }
        else if (clone.dataset.type === 'building' && originalElement.id === 'improved-fire-station') {
            clone.addEventListener('mouseenter', show22xHighlightZone);
            clone.addEventListener('mouseleave', remove22xHighlightZone);
        }
    }

    function dragStartOnMap(e) {
        e.dataTransfer.setData('text/plain', e.target.id);
        e.target.classList.add('dragging');
    }

    function dragEnd(e) {
        const id = e.dataTransfer.getData('text/plain');
        const draggable = document.getElementById(id);

        if (draggable) {
            draggable.style.display = 'block';
            draggable.classList.remove('dragging');
        }
    }

    function dragOver(e) {
        e.preventDefault();
    }

    function drop(e) {
        e.preventDefault();
        const id = e.dataTransfer.getData('text/plain');
        const draggable = document.getElementById(id);
        const rect = map.getBoundingClientRect();
        const gridCellSize = rect.width / 50;

        const left = e.clientX - rect.left;
        const top = e.clientY - rect.top;

        const gridX = Math.floor(left / gridCellSize);
        const gridY = Math.floor(top / gridCellSize);

        draggable.style.left = `${gridX * gridCellSize}px`;
        draggable.style.top = `${gridY * gridCellSize}px`;
        draggable.style.width = `${draggable.dataset.width * gridCellSize}px`;
        draggable.style.height = `${draggable.dataset.height * gridCellSize}px`;

        map.appendChild(draggable);
    }

    function removeBuilding(e) {
        e.preventDefault();
        const target = e.target;
        if (target.closest('#menu')) return;
        target.remove();
    }

    function saveLayout() {
        const layout = [];
        const clones = document.querySelectorAll('.cloned');

        clones.forEach(clone => {
            layout.push({
                id: clone.id,
                type: clone.dataset.type,
                width: clone.dataset.width,
                height: clone.dataset.height,
                left: clone.style.left,
                top: clone.style.top,
                backgroundColor: clone.style.backgroundColor,
                textContent: clone.textContent
            });
        });

        const blob = new Blob([JSON.stringify(layout, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'scb-layout.json';
        a.click();
        URL.revokeObjectURL(url);
    }

    function loadLayout(e) {
        const file = e.target.files[0];
        const reader = new FileReader();

        reader.onload = function(event) {
            const layout = JSON.parse(event.target.result);
            map.innerHTML = '<div id="grid"></div><div id="overlay"></div>'; // Clear current layout

            const gridCellSize = map.getBoundingClientRect().width / 50;

            layout.forEach(item => {
                const clone = document.createElement('div');
                clone.id = item.id;
                clone.className = 'draggable cloned';
                clone.dataset.type = item.type;
                clone.dataset.width = item.width;
                clone.dataset.height = item.height;
                clone.style.left = item.left;
                clone.style.top = item.top;
                clone.style.width = `${item.width * gridCellSize}px`;
                clone.style.height = `${item.height * gridCellSize}px`;
                clone.style.backgroundColor = item.backgroundColor;
                clone.textContent = item.textContent;

                map.appendChild(clone);

                clone.addEventListener('dragstart', dragStartOnMap);
                clone.addEventListener('dragend', dragEnd);
                clone.addEventListener('contextmenu', removeBuilding);

                if (clone.dataset.type === 'building' && clone.id === 'hospital') {
                    clone.addEventListener('mouseenter', showHighlightZone);
                    clone.addEventListener('mouseleave', removeHighlightZone);
                }
            });
        };

        reader.readAsText(file);
    }

    function loadExLayout() {
        fetch('scb/zegerman_v403.json')
            .then(response => response.json())
            .then(layout => {
                map.innerHTML = '<div id="grid"></div><div id="overlay"></div>'; // Clear current layout

                const gridCellSize = map.getBoundingClientRect().width / 50;

                layout.forEach(item => {
                    const clone = document.createElement('div');
                    clone.id = item.id;
                    clone.className = 'draggable cloned';
                    clone.dataset.type = item.type;
                    clone.dataset.width = item.width;
                    clone.dataset.height = item.height;
                    clone.style.left = item.left;
                    clone.style.top = item.top;
                    clone.style.width = `${item.width * gridCellSize}px`;
                    clone.style.height = `${item.height * gridCellSize}px`;
                    clone.style.backgroundColor = item.backgroundColor;
                    clone.textContent = item.textContent;

                    map.appendChild(clone);

                    clone.addEventListener('dragstart', dragStartOnMap);
                    clone.addEventListener('dragend', dragEnd);
                    clone.addEventListener('contextmenu', removeBuilding);

                    if (clone.dataset.type === 'building' && clone.id === 'hospital') {
                        clone.addEventListener('mouseenter', showHighlightZone);
                        clone.addEventListener('mouseleave', removeHighlightZone);
                    }
                });
            })
            .catch(error => console.error('Error loading layout:', error));
    }

    function show24xHighlightZone(e) {
        const target = e.target;
        const gridCellSize = map.getBoundingClientRect().width / 50;
        const highlightZone = document.createElement('div');

        highlightZone.style.position = 'absolute';
        highlightZone.style.width = `${24 * gridCellSize}px`;
        highlightZone.style.height = `${24 * gridCellSize}px`;
        highlightZone.style.backgroundColor = 'rgba(0, 255, 0, 0.5)';
        highlightZone.style.pointerEvents = 'none';
        highlightZone.style.zIndex = '9999';  // Added to bring the highlight zone to the front
        highlightZone.id = 'highlight-zone';

        const left = parseFloat(target.style.left);
        const top = parseFloat(target.style.top);

        highlightZone.style.left = `${left - 10 * gridCellSize}px`;
        highlightZone.style.top = `${top - 10 * gridCellSize}px`;

        document.getElementById('overlay').appendChild(highlightZone);
    }

    function remove24xHighlightZone() {
        const highlightZone = document.getElementById('highlight-zone');
        if (highlightZone) {
            highlightZone.remove();
        }
    }

    function show22xHighlightZone(e) {
        const target = e.target;
        const gridCellSize = map.getBoundingClientRect().width / 50;
        const highlightZone = document.createElement('div');

        highlightZone.style.position = 'absolute';
        highlightZone.style.width = `${22 * gridCellSize}px`;
        highlightZone.style.height = `${22 * gridCellSize}px`;
        highlightZone.style.backgroundColor = 'rgba(0, 255, 0, 0.5)';
        highlightZone.style.pointerEvents = 'none';
        highlightZone.style.zIndex = '9999';
        highlightZone.id = 'highlight-zone';

        const left = parseFloat(target.style.left);
        const top = parseFloat(target.style.top);

        highlightZone.style.left = `${left - (22 - parseFloat(target.dataset.width)) / 2 * gridCellSize}px`;
        highlightZone.style.top = `${top - (22 - parseFloat(target.dataset.height)) / 2 * gridCellSize}px`;

        document.getElementById('overlay').appendChild(highlightZone);
    }

    function remove22xHighlightZone() {
        const highlightZone = document.getElementById('highlight-zone');
        if (highlightZone) {
            highlightZone.remove();
        }
    }
});