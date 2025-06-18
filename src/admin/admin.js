// Admin panel for configuring default NOTAM request settings

document.addEventListener('DOMContentLoaded', () => {
    loadAdminDefaults();
});

function loadAdminDefaults() {
    const defaults = getStoredDefaults();
    // Expose defaults globally so other pages can access them
    if (typeof globalThis !== 'undefined') {
        globalThis.notamGlobalDefaults = defaults;
    }
    Object.keys(defaults).forEach(key => {
        const el = document.getElementById(key);
        if (el && defaults[key]) {
            el.value = defaults[key];
        }
    });
}

function saveDefaults() {
    const data = collectFormData();
    localStorage.setItem('notamDefaultSettings', JSON.stringify(data));
    if (typeof globalThis !== 'undefined') {
        globalThis.notamGlobalDefaults = data;
    }
    showNotification('Defaults saved successfully!', 'success');
}

function clearDefaults() {
    localStorage.removeItem('notamDefaultSettings');
    if (typeof globalThis !== 'undefined') {
        globalThis.notamGlobalDefaults = {};
    }
    const elements = document.querySelectorAll('input, select, textarea');
    elements.forEach(el => {
        if (el.type === 'select-one') {
            el.selectedIndex = 0;
        } else {
            el.value = '';
        }
    });
    showNotification('Defaults cleared', 'info');
}

function collectFormData() {
    return {
        priority: document.getElementById('priority').value,
        origin: document.getElementById('origin').value.toUpperCase().trim(),
        destination: document.getElementById('destination').value.toUpperCase().trim(),
        location: document.getElementById('location').value.toUpperCase().trim(),
        requestType: document.getElementById('requestType').value,
        timeFrom: document.getElementById('timeFrom').value,
        timeTo: document.getElementById('timeTo').value,
        remarks: document.getElementById('remarks').value.trim()
    };
}

function getStoredDefaults() {
    const stored = localStorage.getItem('notamDefaultSettings');
    if (!stored) return {};
    try {
        return JSON.parse(stored);
    } catch (e) {
        console.error('Error parsing stored defaults', e);
        return {};
    }
}

function showNotification(message, type = 'info') {
    const existing = document.querySelector('.notification');
    if (existing) existing.remove();

    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => notification.classList.add('show'), 100);
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}
