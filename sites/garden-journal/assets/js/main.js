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
        card.innerHTML = `
            <h3>${beet.name}</h3>
            <p>Dimensions: ${beet.width}m x ${beet.length}m</p>
            <div style="font-size: 0.8rem; color: #888; margin-bottom: 10px;">
                Plantings: ${beet.plantings ? beet.plantings.length : 0}
            </div>
            <button class="btn" style="margin-top:10px; font-size:0.8rem" onclick="deleteBeet(${index})">Delete</button>
        `;
        container.appendChild(card);
    });
}

function deleteBeet(index) {
    APP_STATE.beets.splice(index, 1);
    saveState();
    renderBeets();
}

async function init() {
    // Import Logic
    const importInput = document.createElement('input');
    importInput.type = 'file';
    importInput.accept = 'application/json';
    importInput.style.display = 'none';
    document.body.appendChild(importInput);

    document.querySelector('.btn:contains("Import")')?.addEventListener('click', () => importInput.click());
    // Using a more robust way to find the import button since .contains is not JS
    document.querySelectorAll('.btn').forEach(btn => {
        if (btn.textContent.trim() === 'Import') {
            btn.addEventListener('click', () => importInput.click());
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
                alert('Import successful!');
            } catch (err) {
                alert('Error importing file: ' + err.message);
            }
        };
        reader.readAsText(file);
    });

    const form = document.getElementById('beet-form');
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const newBeet = {
            name: document.getElementById('beet-name').value,
            width: document.getElementById('beet-width').value,
            length: document.getElementById('beet-length').value,
            plantings: []
        };
        APP_STATE.beets.push(newBeet);
        saveState();
        renderBeets();
        form.reset();
    });

    const tabs = document.querySelectorAll('.tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
        });
    });

    renderBeets();
}

window.addEventListener('DOMContentLoaded', init);
