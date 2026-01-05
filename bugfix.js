// bugfix.js - Comprehensive bug fixes for Discipline OS Dashboard

document.addEventListener('DOMContentLoaded', function() {
    // Fix 1: Ensure modals display properly
    const originalModalShow = Element.prototype.classList.add;
    Element.prototype.classList.add = function(...args) {
        if (args.includes('show') && this.classList.contains('modal')) {
            this.style.display = 'flex';
        }
        return originalModalShow.apply(this, args);
    };

    // Fix 2: Chart rendering on window resize
    let resizeTimer;
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(function() {
            if (window.app && window.app.charts) {
                Object.values(window.app.charts).forEach(chart => {
                    if (chart && typeof chart.resize === 'function') {
                        chart.resize();
                    }
                });
            }
        }, 250);
    });

    // Fix 3: Better event delegation for dynamic content
    document.addEventListener('click', function(e) {
        // Handle archery remove buttons
        const removeBtn = e.target.closest('.btn-remove');
        if (removeBtn && window.app) {
            const id = parseInt(removeBtn.dataset.id);
            const activity = window.app.state.archery.find(a => a.id === id);
            if (activity) {
                window.app.showUndoToast('removeArchery', activity);
                window.app.state.archery = window.app.state.archery.filter(a => a.id !== id);
                window.app.saveHistory();
                window.app.updateUI();
                window.app.generateReports();
            }
        }

        // Handle routine toggles (for dynamically added items)
        if (e.target.matches('.toggle-switch') || e.target.matches('.toggle-label')) {
            const checkbox = e.target.matches('.toggle-switch') 
                ? e.target 
                : document.getElementById(e.target.getAttribute('for'));
            
            if (checkbox && checkbox.dataset.id && window.app) {
                const id = parseInt(checkbox.dataset.id);
                const item = window.app.state.morningRoutine.find(r => r.id === id);
                if (item) {
                    window.app.showUndoToast('toggleRoutine', { id: item.id, type: 'routine' });
                    item.completed = !item.completed;
                    window.app.saveHistory();
                    window.app.updateUI();
                    window.app.generateReports();
                }
            }
        }
    });

    // Fix 4: Prevent default form submission behavior
    document.addEventListener('submit', function(e) {
        if (e.target.tagName === 'FORM') {
            e.preventDefault();
        }
    });

    // Fix 5: Better date sync between header and main navigation
    const syncDateDisplay = function() {
        if (window.app) {
            const dateText = document.getElementById('current-date-text');
            const dateDisplay = document.getElementById('current-date-display');
            
            if (dateText && dateDisplay) {
                dateText.textContent = window.app.formatDateDisplay(window.app.currentDate);
                const today = window.app.formatDate(new Date());
                const current = window.app.formatDate(window.app.currentDate);
                dateDisplay.textContent = current === today ? 'Today' : current;
            }
        }
    };

    // Override the navigateDate method to sync displays
    if (window.app && window.app.navigateDate) {
        const originalNavigate = window.app.navigateDate;
        window.app.navigateDate = function(direction) {
            originalNavigate.call(this, direction);
            syncDateDisplay();
        };
    }

    // Fix 6: Ensure settings are properly loaded on init
    if (window.app && window.app.updateSettingsDisplay) {
        // Delay slightly to ensure DOM is ready
        setTimeout(() => {
            window.app.updateSettingsDisplay();
        }, 100);
    }

    // Fix 7: Handle touch events for mobile
    document.addEventListener('touchstart', function(e) {
        // Prevent zoom on double-tap
        if (e.touches.length > 1) {
            e.preventDefault();
        }
    }, { passive: false });

    // Fix 8: Improve PDF generation for empty data
    if (window.app && window.app.generatePDFReport) {
        const originalPDF = window.app.generatePDFReport;
        window.app.generatePDFReport = function(type, options) {
            // Check if there's any data before generating PDF
            const history = JSON.parse(localStorage.getItem('dashboardHistory') || '{}');
            if (Object.keys(history).length === 0) {
                alert('No data available to generate report. Please track some activities first.');
                return;
            }
            return originalPDF.call(this, type, options);
        };
    }

    console.log('Discipline OS Bug Fixes Applied');
});
