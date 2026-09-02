const APP_STATE = {
    beets: JSON.parse(localStorage.getItem('gj_beets') || '[]'),
    currentTab: 'planning'
};

function saveState() {
    localStorage.setItem('gj_beets', JSON.stringify(APP_STATE.beets));
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
    const form = document.getElementById('beet-form');
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const newBeet = {
            name: document.getElementById('beet-name').value,
            width: document.getElementById('beet-width').value,
            length: document.getElementById('beet-length').value
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
            // In a full app, we would switch workspace content here
        });
    });

    renderBeets();
}

window.addEventListener('DOMContentLoaded', init);
