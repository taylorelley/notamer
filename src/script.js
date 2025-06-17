// NOTAM Request Generator JavaScript

// Initialize the application (only when running in a browser)
if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', function() {
        loadDefaultSettings();
        setDefaultTimes();
        setupEventListeners();
        loadSavedData();
    });
}

// Set current date/time as default
function setDefaultTimes() {
    const now = new Date();
    const nowStr = now.toISOString().slice(0, 16);
    const timeFromEl = document.getElementById('timeFrom');
    if (!timeFromEl.value) {
        timeFromEl.value = nowStr;
    }

    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const tomorrowStr = tomorrow.toISOString().slice(0, 16);
    const timeToEl = document.getElementById('timeTo');
    if (!timeToEl.value) {
        timeToEl.value = tomorrowStr;
    }
}

// Setup event listeners
function setupEventListeners() {
    // Auto-generate message when form fields change
    const formElements = document.querySelectorAll('input, select, textarea');
    formElements.forEach(element => {
        element.addEventListener('input', debounce(generateMessage, 500));
        element.addEventListener('change', debounce(generateMessage, 500));
    });

    // Convert input to uppercase for ICAO codes
    ['origin', 'destination', 'location'].forEach(id => {
        const element = document.getElementById(id);
        element.addEventListener('input', function() {
            this.value = this.value.toUpperCase();
        });
    });

    // Save form data on input
    formElements.forEach(element => {
        element.addEventListener('input', debounce(saveFormData, 1000));
    });
}

// Debounce function to limit API calls
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Format datetime for AFTN
function formatDateTime(dateTimeStr) {
    if (!dateTimeStr) return '';
    const date = new Date(dateTimeStr);
    const year = date.getUTCFullYear().toString().padStart(4, '0');
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const day = String(date.getUTCDate()).padStart(2, '0');
    const hours = String(date.getUTCHours()).padStart(2, '0');
    const minutes = String(date.getUTCMinutes()).padStart(2, '0');
    return `${year}${month}${day}${hours}${minutes}`;
}

// Generate AFTN message
function generateMessage() {
    try {
        const formData = getFormData();
        
        // Validate required fields
        const validation = validateForm(formData);
        if (!validation.valid) {
            showNotification(validation.message, 'error');
            return;
        }

        const message = buildAFTNMessage(formData);
        document.getElementById('output').value = message;
        
        // Show success notification
        showNotification('Message generated successfully!', 'success');
        
    } catch (error) {
        console.error('Error generating message:', error);
        showNotification('Error generating message. Please check your inputs.', 'error');
    }
}

// Get form data
function getFormData() {
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

// Validate form data
function validateForm(data) {
    if (!data.origin || !data.destination || !data.location) {
        return {
            valid: false,
            message: 'Please fill in Origin Address, Destination Address, and Location Identifier'
        };
    }

    if (data.origin.length !== 8 || data.destination.length !== 8) {
        return {
            valid: false,
            message: 'AFTN addresses must be exactly 8 characters long'
        };
    }

    if (data.location.length !== 4) {
        return {
            valid: false,
            message: 'Location identifier must be exactly 4 characters long'
        };
    }

    // Validate ICAO format (basic check)
    const icaoPattern = /^[A-Z]{4}$/;
    if (!icaoPattern.test(data.location)) {
        return {
            valid: false,
            message: 'Location identifier must be 4 capital letters'
        };
    }

    const aftnPattern = /^[A-Z]{8}$/;
    if (!aftnPattern.test(data.origin) || !aftnPattern.test(data.destination)) {
        return {
            valid: false,
            message: 'AFTN addresses must be 8 capital letters'
        };
    }

    return { valid: true };
}

// Build AFTN message
function buildAFTNMessage(data) {
    // Generate timestamp
    const now = new Date();
    const timestamp = formatDateTime(now.toISOString());
    
    // Generate message number (using timestamp for uniqueness)
    const msgNumber = timestamp.slice(-4);

    // Format date/time ranges
    const fromTime = formatDateTime(data.timeFrom);
    const toTime = formatDateTime(data.timeTo);

    // Build AFTN message according to ICAO standards
    let message = '';
    
    // AFTN Header
    message += `${data.priority} ${data.destination}\n`;
    message += `${timestamp} ${data.origin}\n\n`;
    
    // Message type and identifier
    message += `RQN${msgNumber}\n`;
    message += `(RQN-REQUEST NOTAM\n`;
    
    // Location (A line)
    message += `A)${data.location}\n`;
    
    // Time period (B and C lines)
    if (fromTime && toTime) {
        message += `B)${fromTime} C)${toTime}\n`;
    } else if (fromTime) {
        message += `B)${fromTime}\n`;
    }
    
    // Request specification (D line)
    message += `D)${data.requestType} NOTAMS REQUESTED\n`;
    
    // Additional information (E line)
    if (data.remarks) {
        message += `E)${data.remarks}\n`;
    }
    
    // Message closing
    message += `)\n`;
    message += `NNNN`;

    return message;
}

// Copy to clipboard
async function copyToClipboard() {
    const output = document.getElementById('output');
    if (!output.value.trim()) {
        showNotification('Please generate a message first', 'error');
        return;
    }

    try {
        await navigator.clipboard.writeText(output.value);
        showNotification('Message copied to clipboard!', 'success');
    } catch (err) {
        // Fallback for older browsers
        output.select();
        document.execCommand('copy');
        showNotification('Message copied to clipboard!', 'success');
    }
}

// Send via email
function sendEmail() {
    const output = document.getElementById('output');
    if (!output.value.trim()) {
        showNotification('Please generate a message first', 'error');
        return;
    }
    
    const formData = getFormData();
    const subject = `NOTAM Request - ${formData.location} - ${new Date().toISOString().slice(0, 10)}`;
    const body = encodeURIComponent(output.value);
    const mailtoLink = `mailto:?subject=${encodeURIComponent(subject)}&body=${body}`;
    
    window.open(mailtoLink);
    showNotification('Email client opened with message', 'info');
}

// Clear form
function clearForm() {
    const formElements = document.querySelectorAll('input, select, textarea');
    formElements.forEach(element => {
        if (element.type === 'datetime-local') {
            element.value = '';
        } else if (element.tagName === 'SELECT') {
            element.selectedIndex = 0;
        } else {
            element.value = '';
        }
    });
    
    document.getElementById('output').value = '';
    loadDefaultSettings();
    setDefaultTimes();
    clearSavedData();
    showNotification('Form cleared', 'info');
}

// Show notification
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existing = document.querySelector('.notification');
    if (existing) {
        existing.remove();
    }

    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Show notification
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    // Hide notification after 3 seconds
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 300);
    }, 3000);
}

// Save form data to localStorage (if available)
function saveFormData() {
    if (typeof(Storage) !== "undefined") {
        const formData = getFormData();
        localStorage.setItem('notamFormData', JSON.stringify(formData));
    }
}

// Load admin-defined default settings
function loadDefaultSettings() {
    if (typeof(Storage) !== "undefined") {
        const defaults = localStorage.getItem('notamDefaultSettings');
        if (defaults) {
            try {
                const data = JSON.parse(defaults);
                Object.keys(data).forEach(key => {
                    const element = document.getElementById(key);
                    if (element && data[key]) {
                        element.value = data[key];
                    }
                });
            } catch (error) {
                console.error('Error loading default settings:', error);
            }
        }
    }
}

// Load saved form data
function loadSavedData() {
    if (typeof(Storage) !== "undefined") {
        const savedData = localStorage.getItem('notamFormData');
        if (savedData) {
            try {
                const data = JSON.parse(savedData);
                
                // Restore form values
                Object.keys(data).forEach(key => {
                    const element = document.getElementById(key);
                    if (element && data[key]) {
                        element.value = data[key];
                    }
                });
                
                // Generate message with restored data
                setTimeout(generateMessage, 100);
                
            } catch (error) {
                console.error('Error loading saved data:', error);
            }
        }
    }
}

// Clear saved data
function clearSavedData() {
    if (typeof(Storage) !== "undefined") {
        localStorage.removeItem('notamFormData');
    }
}

// Export functions for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        formatDateTime,
        validateForm,
        buildAFTNMessage,
        getFormData,
        loadDefaultSettings
    };
}
