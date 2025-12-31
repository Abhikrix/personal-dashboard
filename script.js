// ===== DASHBOARD APP WITH ALL FEATURES =====
class DashboardApp {
    constructor() {
        this.currentDate = new Date();
        this.state = this.getInitialState();
        this.settings = this.getSettings();
        this.charts = {};
        this.init();
    }

    getInitialState() {
        const saved = localStorage.getItem('dashboardHistory');
        if (saved) {
            const history = JSON.parse(saved);
            const today = this.formatDate(new Date());
            
            // If we have today's data, use it
            if (history[today]) {
                return {
                    date: today,
                    morningRoutine: history[today].morningRoutine || this.getDefaultRoutine(),
                    consumption: history[today].consumption || { water: 0, coffee: 0, tea: 0 },
                    archery: history[today].archery || [],
                    selfCare: history[today].selfCare || { hair: false, face: false }
                };
            }
        }
        
        // Default empty state
        return {
            date: this.formatDate(new Date()),
            morningRoutine: this.getDefaultRoutine(),
            consumption: { water: 0, coffee: 0, tea: 0 },
            archery: [],
            selfCare: { hair: false, face: false }
        };
    }

    getSettings() {
        const saved = localStorage.getItem('dashboardSettings');
        if (saved) {
            return JSON.parse(saved);
        }
        return {
            routineTarget: 7,
            waterTarget: 8,
            coffeeTarget: 2,
            teaTarget: 1
        };
    }

    saveSettings() {
        localStorage.setItem('dashboardSettings', JSON.stringify(this.settings));
    }

    getDefaultRoutine() {
        return [
            { id: 1, time: '4:55', activity: 'Wake up + water', completed: false },
            { id: 2, time: '5:05', activity: 'Run (10 min)', completed: false },
            { id: 3, time: '5:15', activity: 'Stretching & exercise (15 min)', completed: false },
            { id: 4, time: '5:35', activity: 'Breathing / meditation', completed: false },
            { id: 5, time: '5:40', activity: 'Study / writing / deep work', completed: false },
            { id: 6, time: '6:20', activity: 'News & world awareness', completed: false },
            { id: 7, time: '7:00', activity: 'General routine', completed: false }
        ];
    }

    formatDate(date) {
        return date.toISOString().split('T')[0];
    }

    formatDateDisplay(date) {
        return date.toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
    }

    getDateFromString(dateStr) {
        return new Date(dateStr + 'T00:00:00');
    }

    init() {
        this.setupEventListeners();
        this.loadDate(this.currentDate);
        this.setupCharts();
        this.updateUI();
        this.updateSettingsDisplay();
        this.generateReports();
    }

    saveHistory() {
        const history = JSON.parse(localStorage.getItem('dashboardHistory') || '{}');
        const dateStr = this.formatDate(this.currentDate);
        
        history[dateStr] = {
            morningRoutine: this.state.morningRoutine,
            consumption: this.state.consumption,
            archery: this.state.archery,
            selfCare: this.state.selfCare,
            timestamp: new Date().toISOString()
        };
        
        localStorage.setItem('dashboardHistory', JSON.stringify(history));
        this.updateCharts();
        this.generateReports();
    }

    loadDate(date) {
        const dateStr = this.formatDate(date);
        const history = JSON.parse(localStorage.getItem('dashboardHistory') || '{}');
        
        if (history[dateStr]) {
            this.state = {
                date: dateStr,
                morningRoutine: history[dateStr].morningRoutine || this.getDefaultRoutine(),
                consumption: history[dateStr].consumption || { water: 0, coffee: 0, tea: 0 },
                archery: history[dateStr].archery || [],
                selfCare: history[dateStr].selfCare || { hair: false, face: false }
            };
        } else {
            this.state = {
                date: dateStr,
                morningRoutine: this.getDefaultRoutine(),
                consumption: { water: 0, coffee: 0, tea: 0 },
                archery: [],
                selfCare: { hair: false, face: false }
            };
        }
        
        // Update date display
        document.getElementById('current-date-text').textContent = this.formatDateDisplay(date);
        document.getElementById('current-date-display').textContent = dateStr === this.formatDate(new Date()) ? 'Today' : dateStr;
        
        this.updateUI();
        this.generateReports();
    }

    navigateDate(direction) {
        const newDate = new Date(this.currentDate);
        newDate.setDate(newDate.getDate() + direction);
        this.currentDate = newDate;
        this.loadDate(this.currentDate);
    }

    goToToday() {
        this.currentDate = new Date();
        this.loadDate(this.currentDate);
    }

    showUndoToast(action, data) {
        const toast = document.getElementById('undo-toast');
        const message = document.getElementById('toast-message');
        const undoBtn = document.getElementById('undo-action');
        
        // Show toast
        toast.classList.remove('hidden');
        toast.classList.add('show');
        
        // Set message
        const messages = {
            toggleRoutine: 'Routine item toggled',
            increment: 'Consumption increased',
            decrement: 'Consumption decreased',
            toggleSelfCare: 'Self-care toggled',
            addArchery: 'Archery activity added',
            removeArchery: 'Archery activity removed'
        };
        message.textContent = messages[action] || 'Action completed';
        
        // Set undo action
        undoBtn.onclick = () => {
            this.undoAction(action, data);
            toast.classList.remove('show');
            setTimeout(() => toast.classList.add('hidden'), 300);
        };
        
        // Auto-hide after 5 seconds
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.classList.add('hidden'), 300);
        }, 5000);
    }

    undoAction(originalAction, data) {
        switch (originalAction) {
            case 'toggleRoutine':
                const item = this.state.morningRoutine.find(r => r.id === data.id);
                if (item) item.completed = !item.completed;
                break;
            case 'increment':
                if (this.state.consumption[data.type] > 0) {
                    this.state.consumption[data.type]--;
                }
                break;
            case 'decrement':
                this.state.consumption[data.type]++;
                break;
            case 'toggleSelfCare':
                this.state.selfCare[data.type] = !this.state.selfCare[data.type];
                break;
            case 'addArchery':
                this.state.archery = this.state.archery.filter(a => a.id !== data.id);
                break;
            case 'removeArchery':
                this.state.archery.push(data);
                break;
        }
        this.saveHistory();
        this.updateUI();
        this.generateReports();
    }

    updateUI() {
        this.updateMorningRoutine();
        this.updateConsumption();
        this.updateArchery();
        this.updateSelfCare();
        this.updateStats();
        this.updateCharts();
    }

    updateSettingsDisplay() {
        document.getElementById('water-target-display').textContent = this.settings.waterTarget;
        document.getElementById('coffee-target-display').textContent = this.settings.coffeeTarget;
        document.getElementById('tea-target-display').textContent = this.settings.teaTarget;
        document.getElementById('routine-target').value = this.settings.routineTarget;
        document.getElementById('water-target').value = this.settings.waterTarget;
        document.getElementById('coffee-target').value = this.settings.coffeeTarget;
        document.getElementById('tea-target').value = this.settings.teaTarget;
    }

    updateMorningRoutine() {
        const container = document.getElementById('morning-routine-timeline');
        const completedCount = this.state.morningRoutine.filter(r => r.completed).length;
        const totalCount = this.settings.routineTarget || 7;
        const percentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
        
        // Update percentage
        document.getElementById('morning-percentage').textContent = `${percentage}%`;
        document.getElementById('morning-progress').style.width = `${percentage}%`;
        
        // Update routine items
        container.innerHTML = this.state.morningRoutine.slice(0, totalCount).map(item => `
            <div class="routine-item ${item.completed ? 'completed' : ''}">
                <div class="routine-time">${item.time}</div>
                <div class="routine-activity">${item.activity}</div>
                <div class="routine-toggle">
                    <input type="checkbox" id="routine-${item.id}" 
                           class="toggle-switch" ${item.completed ? 'checked' : ''}
                           data-id="${item.id}">
                    <label for="routine-${item.id}" class="toggle-label"></label>
                </div>
            </div>
        `).join('');
    }

    updateConsumption() {
        // Update counts
        document.getElementById('water-count').textContent = this.state.consumption.water;
        document.getElementById('coffee-count').textContent = this.state.consumption.coffee;
        document.getElementById('tea-count').textContent = this.state.consumption.tea;
        
        // Update consumption summary
        const totalConsumption = this.state.consumption.water + this.state.consumption.coffee + this.state.consumption.tea;
        document.getElementById('daily-water').textContent = totalConsumption;
    }

    updateArchery() {
        const logContainer = document.getElementById('archery-log');
        
        // Update session count
        document.getElementById('archery-sessions').textContent = 
            `${this.state.archery.length} session${this.state.archery.length !== 1 ? 's' : ''}`;
        
        // Update log
        logContainer.innerHTML = this.state.archery.length === 0 
            ? '<div style="text-align: center; color: #94a3b8; padding: 20px;">No activities logged today</div>'
            : this.state.archery.map(activity => `
                <div class="archery-log-item">
                    <span>${this.formatArcheryType(activity.type)} - ${new Date(activity.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    <button class="btn-remove" data-id="${activity.id}">×</button>
                </div>
            `).join('');
    }

    formatArcheryType(type) {
        const types = {
            class: 'Class',
            stretching: 'Stretching',
            shooting: 'Shooting',
            workout: 'Workout'
        };
        return types[type] || type;
    }

    updateSelfCare() {
        document.getElementById('hair-care').checked = this.state.selfCare.hair;
        document.getElementById('face-care').checked = this.state.selfCare.face;
    }

    updateStats() {
        const history = JSON.parse(localStorage.getItem('dashboardHistory') || '{}');
        const dates = Object.keys(history).sort();
        
        if (dates.length === 0) {
            document.getElementById('streak-count').textContent = '0';
            document.getElementById('weekly-avg').textContent = '0%';
            return;
        }
        
        // Calculate streak (consecutive days with at least 50% completion)
        let streak = 0;
        const today = new Date();
        let checkDate = new Date(today);
        
        for (let i = 0; i < 30; i++) { // Check last 30 days max
            const dateStr = this.formatDate(checkDate);
            const dayData = history[dateStr];
            
            if (dayData) {
                const completed = dayData.morningRoutine.filter(r => r.completed).length;
                const total = this.settings.routineTarget || 7;
                const percentage = Math.round((completed / total) * 100);
                
                if (percentage >= 50) {
                    streak++;
                } else {
                    break;
                }
            } else {
                break;
            }
            
            checkDate.setDate(checkDate.getDate() - 1);
        }
        
        // Calculate weekly average (last 7 days)
        const last7Dates = dates.slice(-7);
        let weeklyTotal = 0;
        let weeklyCount = 0;
        
        last7Dates.forEach(dateStr => {
            const dayData = history[dateStr];
            if (dayData) {
                const completed = dayData.morningRoutine.filter(r => r.completed).length;
                const total = this.settings.routineTarget || 7;
                const percentage = Math.round((completed / total) * 100);
                weeklyTotal += percentage;
                weeklyCount++;
            }
        });
        
        const weeklyAvg = weeklyCount > 0 ? Math.round(weeklyTotal / weeklyCount) : 0;
        
        document.getElementById('streak-count').textContent = streak;
        document.getElementById('weekly-avg').textContent = `${weeklyAvg}%`;
        document.getElementById('weekly-avg-percent').textContent = `${weeklyAvg}%`;
    }

    setupCharts() {
        // Daily Chart
        this.charts.daily = new Chart(document.getElementById('daily-chart'), {
            type: 'bar',
            data: {
                labels: ['Morning Routine', 'Water', 'Coffee', 'Tea', 'Archery', 'Self-Care'],
                datasets: [{
                    label: 'Today',
                    data: [0, 0, 0, 0, 0, 0],
                    backgroundColor: [
                        '#3b82f6',
                        '#06b6d4',
                        '#8b5cf6',
                        '#10b981',
                        '#f59e0b',
                        '#ec4899'
                    ],
                    borderColor: [
                        '#2563eb',
                        '#0891b2',
                        '#7c3aed',
                        '#059669',
                        '#d97706',
                        '#db2777'
                    ],
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const labels = ['% Complete', 'Glasses', 'Cups', 'Cups', 'Sessions', 'Complete'];
                                return `${context.parsed.y} ${labels[context.dataIndex]}`;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100,
                        ticks: {
                            callback: function(value) {
                                return value + '%';
                            }
                        }
                    }
                }
            }
        });

        // Weekly Chart
        this.charts.weekly = new Chart(document.getElementById('weekly-chart'), {
            type: 'line',
            data: {
                labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                datasets: [{
                    label: 'Routine Completion',
                    data: [0, 0, 0, 0, 0, 0, 0],
                    borderColor: '#3b82f6',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100,
                        ticks: {
                            callback: function(value) {
                                return value + '%';
                            }
                        }
                    }
                }
            }
        });

        // Monthly Trend Chart
        this.charts.monthlyTrend = new Chart(document.getElementById('monthly-trend-chart'), {
            type: 'line',
            data: {
                labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
                datasets: [{
                    label: 'Weekly Average',
                    data: [0, 0, 0, 0],
                    borderColor: '#10b981',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100,
                        ticks: {
                            callback: function(value) {
                                return value + '%';
                            }
                        }
                    }
                }
            }
        });

        // Monthly Distribution Chart
        this.charts.monthlyDistribution = new Chart(document.getElementById('monthly-distribution-chart'), {
            type: 'doughnut',
            data: {
                labels: ['Complete', 'Partial', 'Missed'],
                datasets: [{
                    data: [0, 0, 0],
                    backgroundColor: ['#10b981', '#f59e0b', '#ef4444'],
                    borderWidth: 2,
                    borderColor: 'white'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { position: 'bottom' } }
            }
        });
    }

    updateCharts() {
        const completedCount = this.state.morningRoutine.filter(r => r.completed).length;
        const total = this.settings.routineTarget || 7;
        const percentage = Math.round((completedCount / total) * 100);
        const selfCarePercent = ((this.state.selfCare.hair ? 1 : 0) + (this.state.selfCare.face ? 1 : 0)) * 50;
        
        // Update daily chart with actual data
        this.charts.daily.data.datasets[0].data = [
            percentage,
            Math.min(this.state.consumption.water * (100 / this.settings.waterTarget), 100),
            Math.min(this.state.consumption.coffee * (100 / this.settings.coffeeTarget), 100),
            Math.min(this.state.consumption.tea * (100 / this.settings.teaTarget), 100),
            Math.min(this.state.archery.length * 33.33, 100),
            selfCarePercent
        ];
        this.charts.daily.update();
        
        // Update report stats
        document.getElementById('daily-routine-percent').textContent = `${percentage}%`;
        document.getElementById('daily-archery').textContent = this.state.archery.length;
        
        // Get history for weekly and monthly charts
        const history = JSON.parse(localStorage.getItem('dashboardHistory') || '{}');
        const dates = Object.keys(history).sort();
        
        // Update weekly chart with actual data
        const last7Dates = dates.slice(-7);
        const weeklyData = [];
        
        // Get last 7 days or pad with zeros
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateStr = this.formatDate(date);
            
            if (history[dateStr]) {
                const data = history[dateStr];
                const completed = data.morningRoutine.filter(r => r.completed).length;
                const total = this.settings.routineTarget || 7;
                weeklyData.push(Math.round((completed / total) * 100));
            } else {
                weeklyData.push(0);
            }
        }
        
        this.charts.weekly.data.datasets[0].data = weeklyData;
        this.charts.weekly.update();
        
        // Update weekly stats
        const weeklyAvg = weeklyData.reduce((a, b) => a + b, 0) / 7;
        document.getElementById('weekly-avg-percent').textContent = `${Math.round(weeklyAvg)}%`;
        document.getElementById('weekly-total').textContent = last7Dates.reduce((sum, date) => sum + (history[date]?.archery.length || 0), 0);
        
        // Calculate streak for weekly
        let streak = 0;
        for (let i = weeklyData.length - 1; i >= 0; i--) {
            if (weeklyData[i] >= 50) {
                streak++;
            } else {
                break;
            }
        }
        document.getElementById('weekly-streak').textContent = streak;
        
        // Update monthly data
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        const monthDates = dates.filter(date => {
            const dateObj = new Date(date);
            return dateObj.getMonth() === currentMonth && 
                   dateObj.getFullYear() === currentYear;
        });
        
        if (monthDates.length > 0) {
            const monthlyData = monthDates.map(date => {
                const data = history[date];
                const completed = data.morningRoutine.filter(r => r.completed).length;
                const total = this.settings.routineTarget || 7;
                return Math.round((completed / total) * 100);
            });
            
            // Update heatmap
            this.updateHeatmap(monthDates);
            
            // Update monthly stats
            const monthlyAvg = monthlyData.reduce((a, b) => a + b, 0) / monthlyData.length;
            document.getElementById('monthly-avg').textContent = `${Math.round(monthlyAvg)}%`;
            document.getElementById('monthly-days').textContent = monthDates.length;
            
            // Calculate best streak for monthly
            let bestStreak = 0;
            let currentStreak = 0;
            for (const percent of monthlyData) {
                if (percent >= 50) {
                    currentStreak++;
                    bestStreak = Math.max(bestStreak, currentStreak);
                } else {
                    currentStreak = 0;
                }
            }
            document.getElementById('monthly-best').textContent = bestStreak;
            
            // Calculate distribution for monthly chart
            const complete = monthlyData.filter(p => p >= 90).length;
            const partial = monthlyData.filter(p => p >= 50 && p < 90).length;
            const missed = monthlyData.filter(p => p < 50).length;
            
            this.charts.monthlyDistribution.data.datasets[0].data = [complete, partial, missed];
            this.charts.monthlyDistribution.update();
            
            // Update monthly trend chart (weekly averages within month)
            const weeklyAverages = [0, 0, 0, 0];
            monthDates.forEach(dateStr => {
                const date = new Date(dateStr);
                const week = Math.floor((date.getDate() - 1) / 7);
                if (week < 4) {
                    const data = history[dateStr];
                    const completed = data.morningRoutine.filter(r => r.completed).length;
                    const total = this.settings.routineTarget || 7;
                    weeklyAverages[week] = weeklyAverages[week] || 0;
                    weeklyAverages[week] = Math.round((weeklyAverages[week] + Math.round((completed / total) * 100)) / 2);
                }
            });
            
            this.charts.monthlyTrend.data.datasets[0].data = weeklyAverages;
            this.charts.monthlyTrend.update();
        }
    }

    updateHeatmap(dates) {
        const heatmap = document.getElementById('monthly-heatmap');
        heatmap.innerHTML = '';
        const history = JSON.parse(localStorage.getItem('dashboardHistory') || '{}');
        
        // Get current month and year
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth();
        
        // Get first day of month and total days
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const totalDays = lastDay.getDate();
        
        // Add empty cells for days before the 1st
        const startDay = firstDay.getDay(); // 0 = Sunday, 1 = Monday, etc.
        for (let i = 0; i < startDay; i++) {
            const emptyCell = document.createElement('div');
            emptyCell.className = 'heatmap-day';
            emptyCell.style.visibility = 'hidden';
            heatmap.appendChild(emptyCell);
        }
        
        // Create cells for each day of the month
        for (let day = 1; day <= totalDays; day++) {
            const dayElement = document.createElement('div');
            dayElement.className = 'heatmap-day';
            dayElement.textContent = day;
            
            // Create date string
            const date = new Date(year, month, day);
            const dateStr = this.formatDate(date);
            
            // Find if we have data for this day
            if (dates.includes(dateStr)) {
                const data = history[dateStr];
                const completed = data.morningRoutine.filter(r => r.completed).length;
                const total = this.settings.routineTarget || 7;
                const percentage = Math.round((completed / total) * 100);
                
                if (percentage >= 90) {
                    dayElement.classList.add('completed');
                } else if (percentage >= 50) {
                    dayElement.classList.add('partial');
                } else if (percentage > 0) {
                    dayElement.classList.add('missed');
                }
                
                // Add tooltip
                dayElement.title = `${dateStr}: ${percentage}% complete`;
            }
            
            heatmap.appendChild(dayElement);
        }
    }

    generateReports() {
        this.generateDailyReport();
        this.generateWeeklyReport();
        this.generateMonthlyReport();
    }

    generateDailyReport() {
        const completedCount = this.state.morningRoutine.filter(r => r.completed).length;
        const total = this.settings.routineTarget || 7;
        const percentage = Math.round((completedCount / total) * 100);
        const insights = document.getElementById('daily-insights');
        
        // Always show insights, even if no data
        let insightText = '';
        
        if (completedCount === 0) {
            insightText = `
                <div class="insight-item">
                    <div class="insight-title">📊 Start Your Day Strong</div>
                    <div class="insight-text">Begin your morning routine to unlock detailed insights and track your progress throughout the day. Even completing 1-2 items can build momentum.</div>
                </div>
                <div class="insight-item positive">
                    <div class="insight-title">💡 Tip of the Day</div>
                    <div class="insight-text">Research shows that people who complete morning routines are 40% more productive throughout the day. Start small and build consistency.</div>
                </div>
                <div class="insight-item">
                    <div class="insight-title">🎯 Today's Opportunity</div>
                    <div class="insight-text">You have ${total} routine items planned. Focus on completing at least 3 today to build your streak and momentum.</div>
                </div>
            `;
        } else if (percentage === 100) {
            insightText = `
                <div class="insight-item positive">
                    <div class="insight-title">🎯 Perfect Execution</div>
                    <div class="insight-text">You've completed 100% of your morning routine! This exceptional start will positively impact your entire day's productivity.</div>
                </div>
                <div class="insight-item positive">
                    <div class="insight-title">📈 Peak Performance</div>
                    <div class="insight-text">Studies show that days starting with complete routines have 60% higher achievement rates. Keep this momentum going!</div>
                </div>
            `;
        } else if (percentage >= 70) {
            insightText = `
                <div class="insight-item positive">
                    <div class="insight-title">📈 Strong Start</div>
                    <div class="insight-text">You completed ${completedCount}/${total} morning activities (${percentage}%). You're building excellent discipline habits.</div>
                </div>
                <div class="insight-item">
                    <div class="insight-title">⚡ Almost There</div>
                    <div class="insight-text">You're just ${total - completedCount} items away from a perfect score. Focus on those remaining tasks tomorrow.</div>
                </div>
            `;
        } else if (percentage >= 40) {
            insightText = `
                <div class="insight-item warning">
                    <div class="insight-title">⚠️ Good Progress</div>
                    <div class="insight-text">You completed ${completedCount}/${total} morning activities. Consistency matters more than perfection - focus on maintaining this level daily.</div>
                </div>
                <div class="insight-item">
                    <div class="insight-title">🎯 Improvement Target</div>
                    <div class="insight-text">Try to complete at least 1 more item tomorrow to reach the 50% milestone and maintain your streak.</div>
                </div>
            `;
        } else {
            insightText = `
                <div class="insight-item warning">
                    <div class="insight-title">🔄 Building Momentum</div>
                    <div class="insight-text">You completed ${completedCount}/${total} activities. Every journey starts with small steps. Focus on consistency over perfection.</div>
                </div>
                <div class="insight-item">
                    <div class="insight-title">💪 Tomorrow's Goal</div>
                    <div class="insight-text">Aim to complete at least ${Math.min(completedCount + 1, total)} items tomorrow. Small, consistent improvements lead to big changes.</div>
                </div>
            `;
        }
        
        // Add consumption insights
        if (this.state.consumption.water >= this.settings.waterTarget) {
            insightText += `
                <div class="insight-item positive">
                    <div class="insight-title">💧 Hydration Master</div>
                    <div class="insight-text">Perfect water intake today! Proper hydration improves cognitive function by up to 30%.</div>
                </div>
            `;
        } else if (this.state.consumption.water > 0) {
            insightText += `
                <div class="insight-item">
                    <div class="insight-title">💧 Hydration Progress</div>
                    <div class="insight-text">You've had ${this.state.consumption.water}/${this.settings.waterTarget} glasses. Aim for ${this.settings.waterTarget - this.state.consumption.water} more today.</div>
                </div>
            `;
        } else {
            insightText += `
                <div class="insight-item warning">
                    <div class="insight-title">💧 Hydration Reminder</div>
                    <div class="insight-text">Remember to drink water! Even 1-2 glasses can boost your energy and focus significantly.</div>
                </div>
            `;
        }
        
        // Add archery insights
        if (this.state.archery.length > 0) {
            insightText += `
                <div class="insight-item positive">
                    <div class="insight-title">🏹 Practice Maintained</div>
                    <div class="insight-text">Great job with ${this.state.archery.length} archery session${this.state.archery.length > 1 ? 's' : ''}. Consistent practice builds mastery.</div>
                </div>
            `;
        } else {
            insightText += `
                <div class="insight-item">
                    <div class="insight-title">🏹 Archery Opportunity</div>
                    <div class="insight-text">Consider adding an archery session today - even 15 minutes of practice maintains skill retention.</div>
                </div>
            `;
        }
        
        // Add self-care insights
        const selfCareCount = (this.state.selfCare.hair ? 1 : 0) + (this.state.selfCare.face ? 1 : 0);
        if (selfCareCount === 2) {
            insightText += `
                <div class="insight-item positive">
                    <div class="insight-title">✨ Self-Care Complete</div>
                    <div class="insight-text">Excellent! Completing both self-care routines contributes to long-term well-being and confidence.</div>
                </div>
            `;
        } else if (selfCareCount === 1) {
            insightText += `
                <div class="insight-item">
                    <div class="insight-title">✨ Self-Care Progress</div>
                    <div class="insight-text">You've completed 1 self-care routine. Consider adding the other one for complete self-maintenance.</div>
                </div>
            `;
        }
        
        insights.innerHTML = insightText;
    }

    generateWeeklyReport() {
        const history = JSON.parse(localStorage.getItem('dashboardHistory') || '{}');
        const dates = Object.keys(history).sort().slice(-7);
        const insights = document.getElementById('weekly-insights');
        
        let insightText = '';
        
        if (dates.length === 0) {
            insightText = `
                <div class="insight-item">
                    <div class="insight-title">📈 Weekly Tracking Starting</div>
                    <div class="insight-text">Track your data for a few days to see detailed weekly insights and patterns. Aim for consistency over perfection.</div>
                </div>
                <div class="insight-item positive">
                    <div class="insight-title">🎯 Weekly Goal</div>
                    <div class="insight-text">Aim for at least 4 days of completed routines this week to establish strong habits. Start with today!</div>
                </div>
                <div class="insight-item">
                    <div class="insight-title">📊 Data Collection</div>
                    <div class="insight-text">As you track more days, you'll see patterns emerge that can help optimize your routine and productivity.</div>
                </div>
            `;
        } else {
            const weeklyData = dates.map(date => {
                const data = history[date];
                const completed = data.morningRoutine.filter(r => r.completed).length;
                const total = this.settings.routineTarget || 7;
                return Math.round((completed / total) * 100);
            });
            
            const average = Math.round(weeklyData.reduce((a, b) => a + b, 0) / weeklyData.length);
            
            // Calculate streak
            let streak = 0;
            for (let i = weeklyData.length - 1; i >= 0; i--) {
                if (weeklyData[i] >= 50) {
                    streak++;
                } else {
                    break;
                }
            }
            
            const totalArchery = dates.reduce((sum, date) => sum + (history[date]?.archery.length || 0), 0);
            const totalWater = dates.reduce((sum, date) => sum + (history[date]?.consumption.water || 0), 0);
            
            if (average >= 85) {
                insightText = `
                    <div class="insight-item positive">
                        <div class="insight-title">🏆 Exceptional Week</div>
                        <div class="insight-text">Your weekly average of ${average}% shows incredible consistency. You've maintained a ${streak}-day streak!</div>
                    </div>
                    <div class="insight-item positive">
                        <div class="insight-title">📊 Weekly Summary</div>
                        <div class="insight-text">• ${dates.length} tracked days<br>• ${totalArchery} archery sessions<br>• ${totalWater} glasses of water<br>• ${streak}-day active streak</div>
                    </div>
                `;
            } else if (average >= 70) {
                insightText = `
                    <div class="insight-item positive">
                        <div class="insight-title">📊 Solid Performance</div>
                        <div class="insight-text">Weekly average: ${average}%. You're building strong habits with a ${streak}-day streak.</div>
                    </div>
                    <div class="insight-item">
                        <div class="insight-title">📈 Weekly Stats</div>
                        <div class="insight-text">• ${dates.length} tracked days<br>• ${totalArchery} archery sessions<br>• Average ${Math.round(totalWater/dates.length)} glasses/day</div>
                    </div>
                `;
            } else if (average > 0) {
                insightText = `
                    <div class="insight-item warning">
                        <div class="insight-title">📈 Building Consistency</div>
                        <div class="insight-text">Weekly average: ${average}%. Focus on completing at least 50% daily to build momentum.</div>
                    </div>
                    <div class="insight-item">
                        <div class="insight-title">🎯 Improvement Areas</div>
                        <div class="insight-text">• Tracked ${dates.length}/7 days<br>• ${streak}-day current streak<br>• Aim for 5+ days next week</div>
                    </div>
                `;
            } else {
                insightText = `
                    <div class="insight-item">
                        <div class="insight-title">📅 Week Starting</div>
                        <div class="insight-text">You've tracked ${dates.length} days this week. Focus on consistency to see your weekly average improve.</div>
                    </div>
                    <div class="insight-item">
                        <div class="insight-title">🎯 This Week's Goal</div>
                        <div class="insight-text">Aim to track at least 5 days this week with 50%+ completion to establish a strong weekly routine.</div>
                    </div>
                `;
            }
        }
        
        insights.innerHTML = insightText;
    }

    generateMonthlyReport() {
        const history = JSON.parse(localStorage.getItem('dashboardHistory') || '{}');
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        const monthDates = Object.keys(history).filter(date => {
            const dateObj = new Date(date);
            return dateObj.getMonth() === currentMonth && 
                   dateObj.getFullYear() === currentYear;
        });
        
        const insights = document.getElementById('monthly-insights');
        let insightText = '';
        
        if (monthDates.length === 0) {
            insightText = `
                <div class="insight-item">
                    <div class="insight-title">📅 Monthly Overview Starting</div>
                    <div class="insight-text">Track your data throughout the month to see comprehensive insights and long-term progress patterns.</div>
                </div>
                <div class="insight-item positive">
                    <div class="insight-title">🎯 Monthly Challenge</div>
                    <div class="insight-text">Aim for at least 15 active days this month to establish strong, lasting habits. Every day counts!</div>
                </div>
                <div class="insight-item">
                    <div class="insight-title">📈 Long-term Tracking</div>
                    <div class="insight-text">Monthly data reveals patterns that daily or weekly views might miss. Track consistently for best insights.</div>
                </div>
            `;
        } else {
            const monthlyData = monthDates.map(date => {
                const data = history[date];
                const completed = data.morningRoutine.filter(r => r.completed).length;
                const total = this.settings.routineTarget || 7;
                return Math.round((completed / total) * 100);
            });
            
            const average = Math.round(monthlyData.reduce((a, b) => a + b, 0) / monthlyData.length);
            
            // Calculate best streak
            let bestStreak = 0;
            let currentStreak = 0;
            for (const percent of monthlyData) {
                if (percent >= 50) {
                    currentStreak++;
                    bestStreak = Math.max(bestStreak, currentStreak);
                } else {
                    currentStreak = 0;
                }
            }
            
            const totalArchery = monthDates.reduce((sum, date) => sum + (history[date]?.archery.length || 0), 0);
            const totalWater = monthDates.reduce((sum, date) => sum + (history[date]?.consumption.water || 0), 0);
            
            // Calculate distribution
            const complete = monthlyData.filter(p => p >= 90).length;
            const partial = monthlyData.filter(p => p >= 50 && p < 90).length;
            const missed = monthlyData.filter(p => p > 0 && p < 50).length;
            const empty = new Date().getDate() - monthDates.length; // Days not tracked
            
            if (average >= 80) {
                insightText = `
                    <div class="insight-item positive">
                        <div class="insight-title">🏆 Outstanding Month</div>
                        <div class="insight-text">${average}% monthly average with a ${bestStreak}-day streak! This level of consistency is exceptional.</div>
                    </div>
                    <div class="insight-item positive">
                        <div class="insight-title">📊 Monthly Summary</div>
                        <div class="insight-text">• ${monthDates.length} active days<br>• ${complete} perfect days (90%+)<br>• ${totalArchery} archery sessions<br>• ${totalWater} total glasses of water</div>
                    </div>
                `;
            } else if (average >= 65) {
                insightText = `
                    <div class="insight-item positive">
                        <div class="insight-title">📈 Solid Foundation</div>
                        <div class="insight-text">${average}% average with ${monthDates.length} active days. You've established a strong routine pattern.</div>
                    </div>
                    <div class="insight-item">
                        <div class="insight-title">📊 Monthly Stats</div>
                        <div class="insight-text">• ${complete} perfect days<br>• ${partial} good days (50-89%)<br>• ${missed} low days<br>• ${empty} days not tracked</div>
                    </div>
                `;
            } else if (average > 0) {
                insightText = `
                    <div class="insight-item warning">
                        <div class="insight-title">📈 Progress Tracking</div>
                        <div class="insight-text">${average}% average with ${monthDates.length} active days. Focus on consistency in the coming weeks.</div>
                    </div>
                    <div class="insight-item">
                        <div class="insight-title">🎯 Next Month Goals</div>
                        <div class="insight-text">• Increase to ${monthDates.length + 5} active days<br>• Aim for ${bestStreak + 3}-day streak<br>• Target 70%+ monthly average</div>
                    </div>
                `;
            } else {
                insightText = `
                    <div class="insight-item">
                        <div class="insight-title">📅 Month in Progress</div>
                        <div class="insight-text">You've tracked ${monthDates.length} days this month. Every tracked day contributes to your long-term progress.</div>
                    </div>
                    <div class="insight-item">
                        <div class="insight-title">📊 Current Status</div>
                        <div class="insight-text">• ${monthDates.length}/${new Date().getDate()} days tracked<br>• ${bestStreak}-day best streak<br>• ${totalArchery} archery sessions total</div>
                    </div>
                `;
            }
        }
        
        insights.innerHTML = insightText;
    }

    showDownloadModal() {
        const modal = document.getElementById('download-modal');
        modal.classList.add('show');
        
        // Set default dates
        const today = new Date();
        const lastWeek = new Date();
        lastWeek.setDate(lastWeek.getDate() - 7);
        
        document.getElementById('start-date').value = this.formatDate(lastWeek);
        document.getElementById('end-date').value = this.formatDate(today);
        document.getElementById('daily-date').value = this.formatDate(today);
        document.getElementById('weekly-select').value = this.getCurrentWeek();
        document.getElementById('monthly-select').value = today.getFullYear() + '-' + String(today.getMonth() + 1).padStart(2, '0');
    }

    getCurrentWeek() {
        const now = new Date();
        const startOfYear = new Date(now.getFullYear(), 0, 1);
        const days = Math.floor((now - startOfYear) / (24 * 60 * 60 * 1000));
        const weekNumber = Math.ceil((days + 1) / 7);
        return now.getFullYear() + '-W' + String(weekNumber).padStart(2, '0');
    }

    showHistoryModal() {
        const modal = document.getElementById('history-modal');
        modal.classList.add('show');
        this.loadHistoryView();
    }

    showDetailModal(title, content) {
        document.getElementById('detail-title').textContent = title;
        document.getElementById('detail-content').innerHTML = content;
        document.getElementById('detail-modal').classList.add('show');
    }

    loadHistoryView() {
        const history = JSON.parse(localStorage.getItem('dashboardHistory') || '{}');
        const dates = Object.keys(history).sort().reverse(); // Most recent first
        const container = document.getElementById('history-list');
        
        if (dates.length === 0) {
            container.innerHTML = `
                <div class="no-data">
                    <i class="fas fa-history"></i>
                    <p>No history data available yet. Start tracking your routine!</p>
                </div>
            `;
            return;
        }
        
        let historyHTML = '';
        
        dates.forEach(dateStr => {
            const data = history[dateStr];
            const completedCount = data.morningRoutine.filter(r => r.completed).length;
            const total = this.settings.routineTarget || 7;
            const percentage = Math.round((completedCount / total) * 100);
            const totalConsumption = data.consumption.water + data.consumption.coffee + data.consumption.tea;
            const selfCareStatus = (data.selfCare.hair ? 1 : 0) + (data.selfCare.face ? 1 : 0);
            
            historyHTML += `
                <div class="history-day">
                    <div class="history-date">
                        <span>${this.formatDateDisplay(new Date(dateStr))}</span>
                        <span style="color: ${percentage >= 50 ? '#10b981' : '#ef4444'}; font-weight: 600;">
                            ${percentage}%
                        </span>
                    </div>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${percentage}%"></div>
                    </div>
                    <div class="history-stats">
                        <div class="history-stat" data-date="${dateStr}" data-type="consumption">
                            <div class="history-stat-value">${totalConsumption}</div>
                            <div class="history-stat-label">Consumption</div>
                        </div>
                        <div class="history-stat" data-date="${dateStr}" data-type="archery">
                            <div class="history-stat-value">${data.archery.length}</div>
                            <div class="history-stat-label">Archery</div>
                        </div>
                        <div class="history-stat" data-date="${dateStr}" data-type="selfcare">
                            <div class="history-stat-value">${selfCareStatus === 2 ? '✓' : (selfCareStatus === 1 ? '○' : '✗')}</div>
                            <div class="history-stat-label">Self-Care</div>
                        </div>
                    </div>
                </div>
            `;
        });
        
        container.innerHTML = historyHTML;
        
        // Add click handlers for detailed views
        container.querySelectorAll('.history-stat').forEach(stat => {
            stat.addEventListener('click', (e) => {
                const date = e.currentTarget.dataset.date;
                const type = e.currentTarget.dataset.type;
                this.showDetailedView(date, type);
            });
        });
    }

    showDetailedView(date, type) {
        const history = JSON.parse(localStorage.getItem('dashboardHistory') || '{}');
        const data = history[date];
        
        if (!data) return;
        
        let title = '';
        let content = '';
        
        switch(type) {
            case 'consumption':
                title = `Consumption Details - ${date}`;
                content = `
                    <div class="detailed-view">
                        <div class="detailed-item">
                            <span>Water</span>
                            <strong>${data.consumption.water} glasses</strong>
                        </div>
                        <div class="detailed-item">
                            <span>Coffee</span>
                            <strong>${data.consumption.coffee} cups</strong>
                        </div>
                        <div class="detailed-item">
                            <span>Tea</span>
                            <strong>${data.consumption.tea} cups</strong>
                        </div>
                        <div class="detailed-item">
                            <span>Total Consumption</span>
                            <strong>${data.consumption.water + data.consumption.coffee + data.consumption.tea} items</strong>
                        </div>
                    </div>
                `;
                break;
                
            case 'archery':
                title = `Archery Sessions - ${date}`;
                if (data.archery.length === 0) {
                    content = '<p>No archery sessions recorded for this day.</p>';
                } else {
                    content = `
                        <div class="detailed-view">
                            ${data.archery.map(session => `
                                <div class="detailed-item">
                                    <span>${this.formatArcheryType(session.type)}</span>
                                    <strong>${new Date(session.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</strong>
                                </div>
                            `).join('')}
                        </div>
                    `;
                }
                break;
                
            case 'selfcare':
                title = `Self-Care Details - ${date}`;
                content = `
                    <div class="detailed-view">
                        <div class="detailed-item">
                            <span>Hair Care</span>
                            <strong>${data.selfCare.hair ? '✓ Completed' : '✗ Not completed'}</strong>
                        </div>
                        <div class="detailed-item">
                            <span>Face Care</span>
                            <strong>${data.selfCare.face ? '✓ Completed' : '✗ Not completed'}</strong>
                        </div>
                    </div>
                `;
                break;
        }
        
        this.showDetailModal(title, content);
    }

    generatePDFReport(type, options = {}) {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF('p', 'mm', 'a4');
        
        // Add title
        doc.setFontSize(20);
        doc.setTextColor(59, 130, 246);
        doc.text('Discipline OS - Personal Dashboard Report', 105, 20, { align: 'center' });
        
        // Add Malayalam quote
        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        doc.text('അവിവേകത്തിന്റെ അപൂർണ്ണമായ പ്രത്യക്ഷത', 105, 28, { align: 'center' });
        
        doc.setFontSize(12);
        doc.setTextColor(100, 100, 100);
        
        // Add report type and date
        const reportDate = new Date().toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        
        let selectedDate = '';
        if (type === 'daily') {
            selectedDate = document.getElementById('daily-date').value;
        } else if (type === 'weekly') {
            selectedDate = document.getElementById('weekly-select').value;
        } else if (type === 'monthly') {
            selectedDate = document.getElementById('monthly-select').value;
        }
        
        doc.text(`Report Type: ${type.toUpperCase()}`, 20, 40);
        doc.text(`Date Range: ${selectedDate || 'Custom Range'}`, 20, 47);
        doc.text(`Generated: ${reportDate}`, 20, 54);
        
        // Get data based on report type
        const history = JSON.parse(localStorage.getItem('dashboardHistory') || '{}');
        let dates = [];
        
        if (type === 'daily' && selectedDate) {
            dates = [selectedDate];
        } else if (type === 'weekly' && selectedDate) {
            // Parse week number and get dates for that week
            const year = parseInt(selectedDate.split('-')[0]);
            const week = parseInt(selectedDate.split('W')[1]);
            dates = this.getDatesForWeek(year, week);
        } else if (type === 'monthly' && selectedDate) {
            // Parse month and get dates for that month
            const year = parseInt(selectedDate.split('-')[0]);
            const month = parseInt(selectedDate.split('-')[1]) - 1;
            dates = this.getDatesForMonth(year, month);
        } else if (type === 'custom') {
            const startDate = document.getElementById('start-date').value;
            const endDate = document.getElementById('end-date').value;
            dates = this.getDatesInRange(startDate, endDate);
        }
        
        // Filter dates that have data
        const filteredDates = dates.filter(date => history[date]);
        
        if (filteredDates.length === 0) {
            doc.text('No data available for the selected period.', 20, 70);
        } else {
            let yPos = 70;
            
            // Add summary section
            doc.setFontSize(16);
            doc.setTextColor(30, 41, 59);
            doc.text('Executive Summary', 20, yPos);
            yPos += 10;
            
            doc.setFontSize(11);
            doc.setTextColor(100, 100, 100);
            
            const summaryText = `${filteredDates.length} days of data found. Showing detailed breakdown:`;
            doc.text(summaryText, 20, yPos, { maxWidth: 170 });
            yPos += 15;
            
            // Add detailed data for each day
            filteredDates.forEach(dateStr => {
                if (yPos > 250) {
                    doc.addPage();
                    yPos = 20;
                }
                
                const data = history[dateStr];
                const completedCount = data.morningRoutine.filter(r => r.completed).length;
                const total = this.settings.routineTarget || 7;
                const percentage = Math.round((completedCount / total) * 100);
                
                // Day header
                doc.setFontSize(14);
                doc.setTextColor(30, 41, 59);
                doc.text(`${this.formatDateDisplay(new Date(dateStr))} (${percentage}%)`, 20, yPos);
                yPos += 8;
                
                doc.setFontSize(11);
                doc.setTextColor(100, 100, 100);
                
                // Morning Routine
                doc.text('Morning Routine:', 25, yPos);
                yPos += 6;
                data.morningRoutine.forEach((item, index) => {
                    if (index < total) {
                        doc.text(`${item.completed ? '✓' : '✗'} ${item.time} - ${item.activity}`, 30, yPos, { maxWidth: 150 });
                        yPos += 5;
                    }
                });
                yPos += 3;
                
                // Consumption
                doc.text('Consumption:', 25, yPos);
                yPos += 6;
                doc.text(`• Water: ${data.consumption.water} glasses`, 30, yPos);
                yPos += 5;
                doc.text(`• Coffee: ${data.consumption.coffee} cups`, 30, yPos);
                yPos += 5;
                doc.text(`• Tea: ${data.consumption.tea} cups`, 30, yPos);
                yPos += 3;
                
                // Archery Sessions
                doc.text('Archery Sessions:', 25, yPos);
                yPos += 6;
                if (data.archery.length === 0) {
                    doc.text('No sessions recorded', 30, yPos);
                    yPos += 5;
                } else {
                    data.archery.forEach(session => {
                        const time = new Date(session.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                        doc.text(`• ${this.formatArcheryType(session.type)} at ${time}`, 30, yPos, { maxWidth: 150 });
                        yPos += 5;
                    });
                }
                yPos += 3;
                
                // Self-Care
                doc.text('Self-Care:', 25, yPos);
                yPos += 6;
                doc.text(`• Hair Care: ${data.selfCare.hair ? 'Completed' : 'Not completed'}`, 30, yPos);
                yPos += 5;
                doc.text(`• Face Care: ${data.selfCare.face ? 'Completed' : 'Not completed'}`, 30, yPos);
                yPos += 10;
                
                // Add separator line
                if (yPos < 280) {
                    doc.line(20, yPos, 190, yPos);
                    yPos += 10;
                }
            });
            
            // Add insights section
            if (yPos > 250) {
                doc.addPage();
                yPos = 20;
            }
            
            doc.setFontSize(16);
            doc.setTextColor(30, 41, 59);
            doc.text('Insights & Recommendations', 20, yPos);
            yPos += 10;
            
            doc.setFontSize(11);
            doc.setTextColor(100, 100, 100);
            
            let insights = '';
            if (type === 'daily') {
                insights = "Review your daily performance to identify areas for improvement. Consistency in daily routines leads to long-term habit formation.";
            } else if (type === 'weekly') {
                insights = "Weekly patterns reveal your consistency. Look for trends in your most productive days and identify obstacles on less productive days.";
            } else if (type === 'monthly') {
                insights = "Monthly tracking shows long-term progress. Celebrate your achievements and set new goals for the coming month.";
            }
            
            doc.text(insights, 20, yPos, { maxWidth: 170 });
        }
        
        // Save the PDF
        const fileName = `DisciplineOS_${type}_Report_${this.formatDate(new Date())}.pdf`;
        doc.save(fileName);
        
        alert(`PDF report generated: ${fileName}`);
    }

    getDatesForWeek(year, week) {
        const dates = [];
        const firstDayOfYear = new Date(year, 0, 1);
        const daysOffset = firstDayOfYear.getDay() || 7;
        const firstWeekStart = new Date(year, 0, 1 + (week - 1) * 7 - (daysOffset - 1));
        
        for (let i = 0; i < 7; i++) {
            const date = new Date(firstWeekStart);
            date.setDate(firstWeekStart.getDate() + i);
            dates.push(this.formatDate(date));
        }
        
        return dates;
    }

    getDatesForMonth(year, month) {
        const dates = [];
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        
        for (let day = 1; day <= daysInMonth; day++) {
            dates.push(this.formatDate(new Date(year, month, day)));
        }
        
        return dates;
    }

    getDatesInRange(startStr, endStr) {
        const dates = [];
        const start = new Date(startStr);
        const end = new Date(endStr);
        
        for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
            dates.push(this.formatDate(new Date(date)));
        }
        
        return dates;
    }

    showSettingsModal() {
        document.getElementById('settings-modal').classList.add('show');
    }

    setupEventListeners() {
        // Date navigation
        document.getElementById('prev-day').addEventListener('click', () => this.navigateDate(-1));
        document.getElementById('next-day').addEventListener('click', () => this.navigateDate(1));
        document.getElementById('prev-day-btn').addEventListener('click', () => this.navigateDate(-1));
        document.getElementById('next-day-btn').addEventListener('click', () => this.navigateDate(1));
        document.getElementById('today-btn').addEventListener('click', () => this.goToToday());

        // Morning routine toggles
        document.addEventListener('click', (e) => {
            if (e.target.matches('.toggle-switch') || e.target.matches('.toggle-label')) {
                const checkbox = e.target.matches('.toggle-switch') ? e.target : document.getElementById(e.target.getAttribute('for'));
                if (checkbox && checkbox.dataset.id) {
                    const id = parseInt(checkbox.dataset.id);
                    const item = this.state.morningRoutine.find(r => r.id === id);
                    if (item) {
                        this.showUndoToast('toggleRoutine', { id: item.id, type: 'routine' });
                        item.completed = !item.completed;
                        this.saveHistory();
                        this.updateUI();
                        this.generateReports();
                    }
                }
            }
        });

        // Consumption buttons
        document.addEventListener('click', (e) => {
            if (e.target.matches('.btn-increment, .btn-increment *')) {
                const btn = e.target.closest('.btn-increment');
                const type = btn.dataset.type;
                this.showUndoToast('increment', { type: type });
                this.state.consumption[type]++;
                this.saveHistory();
                this.updateUI();
                this.generateReports();
            } else if (e.target.matches('.btn-decrement, .btn-decrement *')) {
                const btn = e.target.closest('.btn-decrement');
                const type = btn.dataset.type;
                if (this.state.consumption[type] > 0) {
                    this.showUndoToast('decrement', { type: type });
                    this.state.consumption[type]--;
                    this.saveHistory();
                    this.updateUI();
                    this.generateReports();
                }
            }
        });

        // Archery buttons
        document.addEventListener('click', (e) => {
            if (e.target.matches('.archery-btn, .archery-btn *')) {
                const btn = e.target.closest('.archery-btn');
                const type = btn.dataset.type;
                const activity = {
                    id: Date.now(),
                    type: type,
                    timestamp: new Date().toISOString()
                };
                this.showUndoToast('addArchery', activity);
                this.state.archery.push(activity);
                this.saveHistory();
                this.updateUI();
                this.generateReports();
            } else if (e.target.matches('.btn-remove, .btn-remove *')) {
                const btn = e.target.closest('.btn-remove');
                const id = parseInt(btn.dataset.id);
                const activity = this.state.archery.find(a => a.id === id);
                if (activity) {
                    this.showUndoToast('removeArchery', activity);
                    this.state.archery = this.state.archery.filter(a => a.id !== id);
                    this.saveHistory();
                    this.updateUI();
                    this.generateReports();
                }
            }
        });

        // Self-care toggles
        document.addEventListener('change', (e) => {
            if (e.target.id === 'hair-care' || e.target.id === 'face-care') {
                const type = e.target.id.replace('-care', '');
                this.showUndoToast('toggleSelfCare', { type: type });
                this.state.selfCare[type] = !this.state.selfCare[type];
                this.saveHistory();
                this.updateUI();
                this.generateReports();
            }
        });

        // Report tabs
        document.querySelectorAll('.report-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                const period = e.target.dataset.period;
                
                // Update active tab
                document.querySelectorAll('.report-tab').forEach(t => t.classList.remove('active'));
                e.target.classList.add('active');
                
                // Show selected report
                document.querySelectorAll('.report-section').forEach(section => {
                    section.classList.remove('active');
                });
                document.getElementById(`${period}-report`).classList.add('active');
            });
        });

        // Reset consumption
        document.getElementById('reset-consumption').addEventListener('click', () => {
            if (confirm('Reset all consumption counters to zero?')) {
                this.state.consumption = { water: 0, coffee: 0, tea: 0 };
                this.saveHistory();
                this.updateUI();
                this.generateReports();
            }
        });

        // Download button
        document.getElementById('download-btn').addEventListener('click', () => {
            this.showDownloadModal();
        });

        // History button
        document.getElementById('history-btn').addEventListener('click', () => {
            this.showHistoryModal();
        });

        // Settings buttons
        document.getElementById('settings-btn').addEventListener('click', () => {
            this.showSettingsModal();
        });

        document.getElementById('settings-btn-footer').addEventListener('click', () => {
            this.showSettingsModal();
        });

        // Save settings
        document.getElementById('save-settings').addEventListener('click', () => {
            this.settings.routineTarget = parseInt(document.getElementById('routine-target').value) || 7;
            this.settings.waterTarget = parseInt(document.getElementById('water-target').value) || 8;
            this.settings.coffeeTarget = parseInt(document.getElementById('coffee-target').value) || 2;
            this.settings.teaTarget = parseInt(document.getElementById('tea-target').value) || 1;
            
            this.saveSettings();
            this.updateSettingsDisplay();
            this.updateUI();
            this.generateReports();
            
            alert('Settings saved successfully!');
            document.getElementById('settings-modal').classList.remove('show');
        });

        // Export data
        document.getElementById('export-data').addEventListener('click', () => {
            const history = localStorage.getItem('dashboardHistory');
            const settings = localStorage.getItem('dashboardSettings');
            const data = {
                history: JSON.parse(history || '{}'),
                settings: JSON.parse(settings || '{}'),
                exportDate: new Date().toISOString(),
                version: '3.0'
            };
            
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `discipline_os_backup_${this.formatDate(new Date())}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        });

        // Import data
        document.getElementById('import-data').addEventListener('click', () => {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = '.json';
            
            input.onchange = (e) => {
                const file = e.target.files[0];
                const reader = new FileReader();
                
                reader.onload = (event) => {
                    try {
                        const data = JSON.parse(event.target.result);
                        
                        if (data.history) {
                            localStorage.setItem('dashboardHistory', JSON.stringify(data.history));
                        }
                        
                        if (data.settings) {
                            localStorage.setItem('dashboardSettings', JSON.stringify(data.settings));
                            this.settings = data.settings;
                            this.updateSettingsDisplay();
                        }
                        
                        alert('Data imported successfully!');
                        this.loadDate(this.currentDate);
                        this.generateReports();
                    } catch (error) {
                        alert('Error importing data. Please check the file format.');
                    }
                };
                
                reader.readAsText(file);
            };
            
            input.click();
        });

        // Clear data
        document.getElementById('clear-data').addEventListener('click', () => {
            if (confirm('Are you sure you want to clear all data? This cannot be undone.')) {
                localStorage.removeItem('dashboardHistory');
                localStorage.removeItem('dashboardSettings');
                this.state = this.getInitialState();
                this.settings = this.getSettings();
                this.updateSettingsDisplay();
                this.updateUI();
                this.generateReports();
                alert('All data has been cleared.');
            }
        });

        // Modal close buttons
        document.getElementById('close-download-modal').addEventListener('click', () => {
            document.getElementById('download-modal').classList.remove('show');
        });

        document.getElementById('close-history-modal').addEventListener('click', () => {
            document.getElementById('history-modal').classList.remove('show');
        });

        document.getElementById('close-detail-modal').addEventListener('click', () => {
            document.getElementById('detail-modal').classList.remove('show');
        });

        document.getElementById('close-settings-modal').addEventListener('click', () => {
            document.getElementById('settings-modal').classList.remove('show');
        });

        // Generate PDF button
        document.getElementById('generate-pdf').addEventListener('click', () => {
            const reportType = document.getElementById('report-type').value;
            this.generatePDFReport(reportType);
            document.getElementById('download-modal').classList.remove('show');
        });

        // Report type change
        document.getElementById('report-type').addEventListener('change', (e) => {
            const type = e.target.value;
            
            // Show/hide options based on report type
            document.getElementById('daily-date-group').style.display = 
                type === 'daily' ? 'block' : 'none';
            document.getElementById('weekly-calendar-group').style.display = 
                type === 'weekly' ? 'block' : 'none';
            document.getElementById('monthly-calendar-group').style.display = 
                type === 'monthly' ? 'block' : 'none';
            document.getElementById('date-range-group').style.display = 
                type === 'custom' ? 'block' : 'none';
        });

        // Detailed view clicks in analytics
        document.getElementById('daily-routine-stat').addEventListener('click', () => {
            const completedCount = this.state.morningRoutine.filter(r => r.completed).length;
            const total = this.settings.routineTarget || 7;
            let content = `<div class="detailed-view">`;
            
            this.state.morningRoutine.slice(0, total).forEach(item => {
                content += `
                    <div class="detailed-item">
                        <span>${item.time} - ${item.activity}</span>
                        <strong>${item.completed ? '✓ Completed' : '✗ Pending'}</strong>
                    </div>
                `;
            });
            
            content += `<div class="detailed-item">
                <span>Overall Completion</span>
                <strong>${completedCount}/${total} (${Math.round((completedCount/total)*100)}%)</strong>
            </div>`;
            content += `</div>`;
            this.showDetailModal('Today\'s Morning Routine', content);
        });

        document.getElementById('daily-consumption-stat').addEventListener('click', () => {
            const content = `
                <div class="detailed-view">
                    <div class="detailed-item">
                        <span>Water</span>
                        <strong>${this.state.consumption.water} glasses (Target: ${this.settings.waterTarget})</strong>
                    </div>
                    <div class="detailed-item">
                        <span>Coffee</span>
                        <strong>${this.state.consumption.coffee} cups (Target: ${this.settings.coffeeTarget})</strong>
                    </div>
                    <div class="detailed-item">
                        <span>Tea</span>
                        <strong>${this.state.consumption.tea} cups (Target: ${this.settings.teaTarget})</strong>
                    </div>
                    <div class="detailed-item">
                        <span>Total Consumption</span>
                        <strong>${this.state.consumption.water + this.state.consumption.coffee + this.state.consumption.tea} items</strong>
                    </div>
                </div>
            `;
            this.showDetailModal('Today\'s Consumption', content);
        });

        document.getElementById('daily-archery-stat').addEventListener('click', () => {
            if (this.state.archery.length === 0) {
                this.showDetailModal('Today\'s Archery Sessions', '<p>No archery sessions recorded today.</p>');
            } else {
                let content = `<div class="detailed-view">`;
                
                this.state.archery.forEach(session => {
                    const time = new Date(session.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                    content += `
                        <div class="detailed-item">
                            <span>${this.formatArcheryType(session.type)}</span>
                            <strong>${time}</strong>
                        </div>
                    `;
                });
                
                content += `<div class="detailed-item">
                    <span>Total Sessions Today</span>
                    <strong>${this.state.archery.length}</strong>
                </div>`;
                content += `</div>`;
                this.showDetailModal('Today\'s Archery Sessions', content);
            }
        });

        // Close modals when clicking outside
        window.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                e.target.classList.remove('show');
            }
        });
    }
}

// Initialize the app
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new DashboardApp();
});