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
        
        // CRITICAL FIX: Update UI immediately when data changes
        this.updateUI();
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
        
        toast.classList.remove('hidden');
        toast.classList.add('show');
        
        const messages = {
            toggleRoutine: 'Routine item toggled',
            increment: 'Consumption increased',
            decrement: 'Consumption decreased',
            toggleSelfCare: 'Self-care toggled',
            addArchery: 'Archery activity added',
            removeArchery: 'Archery activity removed'
        };
        message.textContent = messages[action] || 'Action completed';
        
        undoBtn.onclick = () => {
            this.undoAction(action, data);
            toast.classList.remove('show');
            setTimeout(() => toast.classList.add('hidden'), 300);
        };
        
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
    }

    updateUI() {
        this.updateMorningRoutine();
        this.updateConsumption();
        this.updateArchery();
        this.updateSelfCare();
        this.updateStats();
        this.updateCharts();
        this.generateReports(); // Make sure reports update too
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
        
        document.getElementById('morning-percentage').textContent = `${percentage}%`;
        document.getElementById('morning-progress').style.width = `${percentage}%`;
        
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
        document.getElementById('water-count').textContent = this.state.consumption.water;
        document.getElementById('coffee-count').textContent = this.state.consumption.coffee;
        document.getElementById('tea-count').textContent = this.state.consumption.tea;
        
        const totalConsumption = this.state.consumption.water + this.state.consumption.coffee + this.state.consumption.tea;
        document.getElementById('daily-water').textContent = totalConsumption;
    }

    updateArchery() {
        const logContainer = document.getElementById('archery-log');
        
        document.getElementById('archery-sessions').textContent = 
            `${this.state.archery.length} session${this.state.archery.length !== 1 ? 's' : ''}`;
        
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
        
        let streak = 0;
        const today = new Date();
        let checkDate = new Date(today);
        
        for (let i = 0; i < 30; i++) {
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
        
        this.charts.daily.data.datasets[0].data = [
            percentage,
            Math.min(this.state.consumption.water * (100 / this.settings.waterTarget), 100),
            Math.min(this.state.consumption.coffee * (100 / this.settings.coffeeTarget), 100),
            Math.min(this.state.consumption.tea * (100 / this.settings.teaTarget), 100),
            Math.min(this.state.archery.length * 33.33, 100),
            selfCarePercent
        ];
        this.charts.daily.update();
        
        document.getElementById('daily-routine-percent').textContent = `${percentage}%`;
        document.getElementById('daily-archery').textContent = this.state.archery.length;
        
        const history = JSON.parse(localStorage.getItem('dashboardHistory') || '{}');
        const dates = Object.keys(history).sort();
        
        const last7Dates = dates.slice(-7);
        const weeklyData = [];
        
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
        
        const weeklyAvg = weeklyData.reduce((a, b) => a + b, 0) / 7;
        document.getElementById('weekly-avg-percent').textContent = `${Math.round(weeklyAvg)}%`;
        document.getElementById('weekly-total').textContent = last7Dates.reduce((sum, date) => sum + (history[date]?.archery.length || 0), 0);
        
        let streak = 0;
        for (let i = weeklyData.length - 1; i >= 0; i--) {
            if (weeklyData[i] >= 50) {
                streak++;
            } else {
                break;
            }
        }
        document.getElementById('weekly-streak').textContent = streak;
        
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
            
            this.updateHeatmap(monthDates);
            
            const monthlyAvg = monthlyData.reduce((a, b) => a + b, 0) / monthlyData.length;
            document.getElementById('monthly-avg').textContent = `${Math.round(monthlyAvg)}%`;
            document.getElementById('monthly-days').textContent = monthDates.length;
            
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
            
            const complete = monthlyData.filter(p => p >= 90).length;
            const partial = monthlyData.filter(p => p >= 50 && p < 90).length;
            const missed = monthlyData.filter(p => p < 50).length;
            
            this.charts.monthlyDistribution.data.datasets[0].data = [complete, partial, missed];
            this.charts.monthlyDistribution.update();
            
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
        
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth();
        
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const totalDays = lastDay.getDate();
        
        const startDay = firstDay.getDay();
        for (let i = 0; i < startDay; i++) {
            const emptyCell = document.createElement('div');
            emptyCell.className = 'heatmap-day';
            emptyCell.style.visibility = 'hidden';
            heatmap.appendChild(emptyCell);
        }
        
        for (let day = 1; day <= totalDays; day++) {
            const dayElement = document.createElement('div');
            dayElement.className = 'heatmap-day';
            dayElement.textContent = day;
            
            const date = new Date(year, month, day);
            const dateStr = this.formatDate(date);
            
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
            `
