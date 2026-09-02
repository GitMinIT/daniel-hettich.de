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

function deleteBeet(index) {
    if (confirm('Delete this bed?')) {
        APP_STATE.beets.splice(index, 1);
        saveState();
        renderBeets();
    }
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
    // Handle Tabs
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

    // Add Bed Logic
    const addBeetBtn = document.getElementById('add-beet-btn');
    addBeetBtn.addEventListener('click', () => {
        const name = document.getElementById('beet-name').value;
        const width = document.getElementById('beet-width').value;
        const length = document.getElementById('beet-length').value;
        
        if (!name) {
            alert('Please enter a bed name');
            return;
        }

        const newBeet = {
            id: 'beet-' + Math.random().toString(36).substr(2, 9),
            name,
            width,
            length,
            plantings: []
        };
        APP_STATE.beets.push(newBeet);
        saveState();
        renderBeets();
        updateBeetSelect();
        document.getElementById('beet-name').value = '';
    });

    // Planting Form
    const plantingBtn = document.getElementById('submit-planting');
    plantingBtn.addEventListener('click', () => {
        const beetId = document.getElementById('target-beet').value;
        const cropId = document.getElementById('target-crop').value;
        const count = document.getElementById('planting-count').value;
        const date = document.getElementById('planting-date').value;

        if (!beetId || !cropId) {
            alert('Please select both a bed and a crop');
            return;
        }

        const beet = APP_STATE.beets.find(b => b.id === beetId);
        if (beet) {
            if (!beet.plantings) beet.plantings = [];
            beet.plantings.push({ cropId, count, date });
            saveState();
            renderBeets();
        }
    });

    // Update Crop Select
    updateCropSelect();

    // Import/Export
    const importInput = document.createElement('input');
    importInput.type = 'file';
    importInput.accept = 'application/json';
    importInput.style.display = 'none';
    document.body.appendChild(importInput);

    document.querySelectorAll('.btn').forEach(btn => {
        if (btn.textContent.trim() === 'Import') {
            btn.addEventListener('click', () => importInput.click());
        }
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
                updateBeetSelect();
                updateCropSelect();
                alert('Import successful!');
            } catch (err) { alert('Import error: ' + err.message); }
        };
        reader.readAsText(file);
    });

    // Init
    renderBeets();
    renderNotifications();
    updateBeetSelect();
    updateCropSelect();
}

function updateBeetSelect() {
    const select = document.getElementById('target-beet');
    select.innerHTML = '<option value="">-- Select Bed --</option>';
    APP_STATE.beets.forEach(beet => {
        const opt = document.createElement('option');
        opt.value = beet.id;
        opt.textContent = beet.name;
        select.appendChild(opt);
    });
}

function updateCropSelect() {
    const select = document.getElementById('target-crop');
    select.innerHTML = '<option value="">-- Select Crop --</option>';
    APP_STATE.crops.forEach(crop => {
        const opt = document.createElement('option');
        opt.value = crop.id;
        opt.textContent = crop.name;
        select.appendChild(opt);
    });
}

window.addEventListener('DOMContentLoaded', init);
