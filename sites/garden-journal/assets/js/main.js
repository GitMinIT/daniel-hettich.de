const APP_STATE = {
    beets: JSON.parse(localStorage.getItem('gj_beets') || '[]'),
    crops: JSON.parse(localStorage.getItem('gj_crops') || '[]'),
    currentTab: 'planning'
};

function saveState() {
    localStorage.setItem('gj_beets', JSON.stringify(APP_STATE.beets));
    localStorage.setItem('gj_crops', JSON.stringify(APP_STATE.crops));
}

function renderBeets() {
    const container = document.getElementById('beet-list');
    container.innerHTML = '';

    if (APP_STATE.beets.length === 0) {
        container.innerHTML = '<div style="text-align:center; color:#b0b0b0; padding: 2rem;">No beds created yet. Start planning!</div>';
        return;
    }

    APP_STATE.beets.forEach((beet, index) => {
        const card = document.createElement('div');
        card.className = 'beet-card';
        
        const plantingsHtml = (beet.plantings || []).map((p, pIdx) => {
            const crop = APP_STATE.crops.find(c => c.id === p.cropId) || { name: 'Unknown' };
            return `<div class="planting-item">
                <span class="planting-crop">${crop.name}</span>
                <span>${p.count}x | ${p.date}</span>
            </div>`;
        }).join('');

        card.innerHTML = `
            <h3>${beet.name}</h3>
            <p>Dimensions: ${beet.width}m x ${beet.length}m</p>
            <div class="plantings-container">${plantingsHtml}</div>
            <button class="btn" style="margin-top:10px; font-size:0.8rem" onclick="deleteBeet(${index})">Delete Bed</button>
        `;
        container.appendChild(card);
    });
}

function renderCrops() {
    const container = document.getElementById('crop-list');
    container.innerHTML = '';

    if (APP_STATE.crops.length === 0) {
        container.innerHTML = '<div style="text-align:center; color:#b0b0b0; padding: 2rem;">No crops defined. Add some!</div>';
        return;
    }

    APP_STATE.crops.forEach((crop, index) => {
        const card = document.createElement('div');
        card.className = 'crop-card';
        card.innerHTML = `
            <h3 style="color: ${crop.color || '#4CAF50'}">${crop.name}</h3>
            <p>Sow: ${crop.sowStart}-${crop.sowEnd}</p>
            <p>Harvest: ${crop.harvestStart}-${crop.harvestEnd}</p>
            <p>Spacing: ${crop.spacing || 'N/A'} cm</p>
            <div class="crop-actions">
                <button class="btn" style="font-size:0.8rem" onclick="editCrop(${index})">Edit</button>
                <button class="btn" style="font-size:0.8rem; color: #ff4444; border-color: #ff4444" onclick="deleteCrop(${index})">Delete</button>
            </div>
        `;
        container.appendChild(card);
    });
}

function deleteBeet(index) {
    if (confirm('Delete this bed?')) {
        APP_STATE.beets.splice(index, 1);
        saveState();
        renderBeets();
        updateBeetSelect();
    }
}

function deleteCrop(index) {
    if (confirm('Delete this crop?')) {
        APP_STATE.crops.splice(index, 1);
        saveState();
        renderCrops();
        updateCropSelect();
    }
}

function editCrop(index) {
    const crop = APP_STATE.crops[index];
    const newName = prompt('Enter new name:', crop.name);
    if (newName === null) return;
    const newColor = prompt('Enter new color (hex):', crop.color || '#4CAF50');
    const newSpacing = prompt('Enter planting distance (cm):', crop.spacing || '');
    
    APP_STATE.crops[index] = { ...crop, name: newName, color: newColor, spacing: newSpacing };
    saveState();
    renderCrops();
    updateCropSelect();
}

function renderNotifications() {
    const panel = document.getElementById('notifications');
    const currentMonth = new Date().getMonth() + 1;
    const alerts = [];

    APP_STATE.beets.forEach(beet => {
        (beet.plantings || []).forEach(p => {
            const crop = APP_STATE.crops.find(c => c.id === p.cropId);
            if (crop && crop.harvestStart === currentMonth) {
                alerts.push(`Time to harvest <strong>${crop.name}</strong> in ${beet.name}!`);
            }
        });
    });

    if (alerts.length === 0) {
        panel.innerHTML = '<strong>All quiet in the garden.</strong> No critical tasks for this month.';
    } else {
        panel.innerHTML = '<strong>Garden Alerts:</strong>' + alerts.map(a => `<div class="notification-item">${a}</div>`).join('');
    }
}

async function init() {
    const tabs = document.querySelectorAll('.tab');
    const workspaces = {
        'planning': document.getElementById('workspace-planning'),
        'calendar': document.getElementById('workspace-calendar'),
        'crops': document.getElementById('workspace-crops')
    };

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            const target = tab.textContent.trim().toLowerCase();
            const key = target.includes('planung') ? 'planning' : target.includes('kalender') ? 'calendar' : 'crops';
            Object.values(workspaces).forEach(w => w.classList.add('hidden'));
            workspaces[key].classList.remove('hidden');
        });
    });

    document.getElementById('add-beet-btn').addEventListener('click', () => {
        const name = document.getElementById('beet-name').value;
        const width = document.getElementById('beet-width').value;
        const length = document.getElementById('beet-length').value;
        if (!name) return alert('Enter name');
        APP_STATE.beets.push({ id: 'beet-' + Math.random().toString(36).substr(2, 9), name, width, length, plantings: [] });
        saveState();
        renderBeets();
        updateBeetSelect();
        document.getElementById('beet-name').value = '';
    });

    document.getElementById('submit-planting').addEventListener('click', () => {
        const beetId = document.getElementById('target-beet').value;
        const cropId = document.getElementById('target-crop').value;
        const count = document.getElementById('planting-count').value;
        const date = document.getElementById('planting-date').value;
        if (!beetId || !cropId) return alert('Select bed and crop');
        const beet = APP_STATE.beets.find(b => b.id === beetId);
        if (beet) {
            if (!beet.plantings) beet.plantings = [];
            beet.plantings.push({ cropId, count, date });
            saveState();
            renderBeets();
        }
    });

    document.getElementById('add-crop-btn').addEventListener('click', () => {
        const name = document.getElementById('crop-name').value;
        const color = document.getElementById('crop-color').value;
        const spacing = prompt('Planting distance (cm):', '50');
        if (!name) return alert('Enter crop name');
        APP_STATE.crops.push({
            id: 'crop-' + Math.random().toString(36).substr(2, 9),
            name,
            color,
            spacing,
            sowStart: 3, sowEnd: 5, harvestStart: 7, harvestEnd: 10
        });
        saveState();
        renderCrops();
        updateCropSelect();
        document.getElementById('crop-name').value = '';
    });

    const importInput = document.createElement('input');
    importInput.type = 'file';
    importInput.accept = 'application/json';
    importInput.style.display = 'none';
    document.body.appendChild(importInput);

    document.querySelectorAll('.btn').forEach(btn => {
        if (btn.textContent.trim() === 'Import') btn.addEventListener('click', () => importInput.click());
        if (btn.textContent.trim() === 'Sichern') {
            btn.addEventListener('click', () => {
                const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(APP_STATE));
                const downloadAnchorNode = document.createElement('a');
                downloadAnchorNode.setAttribute("href", dataStr);
                downloadAnchorNode.setAttribute("download", "garden_backup.json");
                document.body.appendChild(downloadAnchorNode);
                downloadAnchorNode.click();
                downloadAnchorNode.remove();
            });
        }
    });

    importInput.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const data = JSON.parse(event.target.result);
                if (data.beets) APP_STATE.beets = data.beets;
                if (data.crops) APP_STATE.crops = data.crops;
                saveState();
                renderBeets();
                renderCrops();
                updateBeetSelect();
                updateCropSelect();
                alert('Import successful!');
            } catch (err) { alert('Import error: ' + err.message); }
        };
        reader.readAsText(file);
    });

    renderBeets();
    renderCrops();
    renderNotifications();
    updateBeetSelect();
    updateCropSelect();
}

window.addEventListener('DOMContentLoaded', init);
