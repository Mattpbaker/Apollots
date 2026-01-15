// Presentation Navigation and Timer System

class PresentationController {
    constructor() {
        this.currentSlide = 0;
        this.slides = document.querySelectorAll('.slide');
        this.totalSlides = this.slides.length;
        this.timers = {};
        this.timerIntervals = {};
        
        this.init();
    }

    init() {
        // Update slide counter
        document.getElementById('totalSlides').textContent = this.totalSlides;
        this.updateSlideCounter();
        
        // Setup navigation
        this.setupNavigation();
        
        // Setup timers
        this.setupTimers();
        
        // Setup marketing clinic tabs
        this.setupMarketingTabs();
        
        // Show first slide
        this.showSlide(0);
    }

    setupNavigation() {
        // Arrow buttons
        document.getElementById('prevBtn').addEventListener('click', () => this.prevSlide());
        document.getElementById('nextBtn').addEventListener('click', () => this.nextSlide());
        
        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') {
                this.prevSlide();
            } else if (e.key === 'ArrowRight') {
                this.nextSlide();
            } else if (e.key === 'Escape') {
                this.pauseAllTimers();
            }
        });
        
        // Update button states
        this.updateNavButtons();
    }

    setupTimers() {
        this.slides.forEach((slide, index) => {
            const duration = parseInt(slide.dataset.duration) || 0; // in minutes
            const timerId = `timer-${index + 1}`;
            const timerElement = document.getElementById(timerId);
            
            if (timerElement && duration > 0) {
                this.timers[index] = {
                    duration: duration * 60, // convert to seconds
                    remaining: duration * 60,
                    element: timerElement,
                    isRunning: false
                };
            }
        });
    }

    startTimer(slideIndex) {
        if (!this.timers[slideIndex]) return;
        
        const timer = this.timers[slideIndex];
        timer.isRunning = true;
        timer.remaining = timer.duration;
        
        // Clear any existing interval
        if (this.timerIntervals[slideIndex]) {
            clearInterval(this.timerIntervals[slideIndex]);
        }
        
        // Update display immediately
        this.updateTimerDisplay(slideIndex);
        
        // Start countdown
        this.timerIntervals[slideIndex] = setInterval(() => {
            timer.remaining--;
            this.updateTimerDisplay(slideIndex);
            
            if (timer.remaining <= 0) {
                this.stopTimer(slideIndex);
                // Optional: auto-advance or show notification
                this.timerComplete(slideIndex);
            }
        }, 1000);
    }

    stopTimer(slideIndex) {
        if (!this.timers[slideIndex]) return;
        
        const timer = this.timers[slideIndex];
        timer.isRunning = false;
        
        if (this.timerIntervals[slideIndex]) {
            clearInterval(this.timerIntervals[slideIndex]);
            delete this.timerIntervals[slideIndex];
        }
    }

    pauseTimer(slideIndex) {
        if (!this.timers[slideIndex]) return;
        
        const timer = this.timers[slideIndex];
        timer.isRunning = false;
        
        if (this.timerIntervals[slideIndex]) {
            clearInterval(this.timerIntervals[slideIndex]);
            delete this.timerIntervals[slideIndex];
        }
    }

    pauseAllTimers() {
        Object.keys(this.timers).forEach(index => {
            this.pauseTimer(parseInt(index));
        });
    }

    resetTimer(slideIndex) {
        if (!this.timers[slideIndex]) return;
        
        this.stopTimer(slideIndex);
        const timer = this.timers[slideIndex];
        timer.remaining = timer.duration;
        this.updateTimerDisplay(slideIndex);
    }

    updateTimerDisplay(slideIndex) {
        if (!this.timers[slideIndex]) return;
        
        const timer = this.timers[slideIndex];
        const minutes = Math.floor(timer.remaining / 60);
        const seconds = timer.remaining % 60;
        const timeString = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
        
        const timerValue = timer.element.querySelector('.timer-value');
        if (timerValue) {
            timerValue.textContent = timeString;
        }
        
        // Update timer styling based on remaining time
        timer.element.classList.remove('warning', 'danger');
        
        const percentageRemaining = (timer.remaining / timer.duration) * 100;
        if (percentageRemaining <= 20) {
            timer.element.classList.add('danger');
        } else if (percentageRemaining <= 40) {
            timer.element.classList.add('warning');
        }
    }

    timerComplete(slideIndex) {
        // Flash the timer or show notification
        const timer = this.timers[slideIndex];
        if (timer && timer.element) {
            timer.element.style.animation = 'pulse 0.5s ease 3';
            setTimeout(() => {
                timer.element.style.animation = '';
            }, 2000);
        }
    }

    showSlide(index) {
        // Validate index
        if (index < 0 || index >= this.totalSlides) return;
        
        // Stop current slide timer
        if (this.timers[this.currentSlide]) {
            this.pauseTimer(this.currentSlide);
        }
        
        // Hide all slides
        this.slides.forEach(slide => slide.classList.remove('active'));
        
        // Show target slide
        this.slides[index].classList.add('active');
        this.currentSlide = index;
        
        // Start timer for new slide
        if (this.timers[index]) {
            this.startTimer(index);
        }
        
        // Update navigation
        this.updateNavButtons();
        this.updateSlideCounter();
        
        // Reset timeline animations if on timeline slide
        if (this.slides[index].dataset.section === 'Timeline') {
            this.resetTimelineAnimations();
        }
    }

    resetTimelineAnimations() {
        const timelineItems = document.querySelectorAll('.timeline-item');
        timelineItems.forEach((item, index) => {
            item.style.animation = 'none';
            setTimeout(() => {
                item.style.animation = `fadeInSlide 0.8s ease-out ${0.2 + index * 0.2}s forwards`;
            }, 10);
        });
    }

    nextSlide() {
        if (this.currentSlide < this.totalSlides - 1) {
            this.showSlide(this.currentSlide + 1);
        }
    }

    prevSlide() {
        if (this.currentSlide > 0) {
            this.showSlide(this.currentSlide - 1);
        }
    }

    updateNavButtons() {
        const prevBtn = document.getElementById('prevBtn');
        const nextBtn = document.getElementById('nextBtn');
        
        prevBtn.disabled = this.currentSlide === 0;
        nextBtn.disabled = this.currentSlide === this.totalSlides - 1;
    }

    updateSlideCounter() {
        document.getElementById('currentSlide').textContent = this.currentSlide + 1;
    }

    setupMarketingTabs() {
        const tabButtons = document.querySelectorAll('.tab-btn');
        const tabContents = document.querySelectorAll('.tab-content');
        
        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                const targetTab = button.dataset.tab;
                
                // Remove active class from all buttons and contents
                tabButtons.forEach(btn => btn.classList.remove('active'));
                tabContents.forEach(content => content.classList.remove('active'));
                
                // Add active class to clicked button and corresponding content
                button.classList.add('active');
                const targetContent = document.getElementById(targetTab);
                if (targetContent) {
                    targetContent.classList.add('active');
                }
            });
        });
    }
}

// Initialize presentation when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new PresentationController();
});

// Save functionality for forms (localStorage)
document.addEventListener('DOMContentLoaded', () => {
    // Save check-in/checkout questions
    const checkinQuestion = document.getElementById('checkin-question');
    const checkoutQuestion = document.getElementById('checkout-question');
    
    // Load saved questions
    if (localStorage.getItem('checkinQuestion')) {
        checkinQuestion.value = localStorage.getItem('checkinQuestion');
    }
    if (localStorage.getItem('checkoutQuestion')) {
        checkoutQuestion.value = localStorage.getItem('checkoutQuestion');
    }
    
    // Save on input
    checkinQuestion.addEventListener('input', () => {
        localStorage.setItem('checkinQuestion', checkinQuestion.value);
    });
    
    checkoutQuestion.addEventListener('input', () => {
        localStorage.setItem('checkoutQuestion', checkoutQuestion.value);
    });
    
    // Marketing Clinic PDF Generation
    const saveMarketingClinicBtn = document.getElementById('save-marketing-clinic');
    const startAgainBtn = document.getElementById('start-again-btn');
    
    if (saveMarketingClinicBtn) {
        saveMarketingClinicBtn.addEventListener('click', () => {
            generateMarketingClinicPDF();
        });
    }
    
    if (startAgainBtn) {
        startAgainBtn.addEventListener('click', () => {
            resetMarketingClinicForms();
        });
    }
});

// Marketing Clinic PDF Generation Function
function generateMarketingClinicPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    // Collect all form data
    const ventureName = document.getElementById('venture-name')?.value || 'N/A';
    const targetAudience = document.getElementById('target-audience')?.value || 'N/A';
    const keyObjectives = document.getElementById('key-objectives')?.value || 'N/A';
    const budgetTimeline = document.getElementById('budget-timeline')?.value || 'N/A';
    
    // Marketing Channels
    const channels = [];
    if (document.getElementById('channel-social')?.checked) channels.push('Social Media');
    if (document.getElementById('channel-email')?.checked) channels.push('Email Marketing');
    if (document.getElementById('channel-content')?.checked) channels.push('Content Marketing');
    if (document.getElementById('channel-paid')?.checked) channels.push('Paid Advertising');
    if (document.getElementById('channel-events')?.checked) channels.push('Events/Networking');
    const channelsText = channels.length > 0 ? channels.join(', ') : 'None selected';
    
    // Content Ideas
    const blogPosts = document.getElementById('content-blog')?.value || 'N/A';
    const socialMedia = document.getElementById('content-social')?.value || 'N/A';
    const videoContent = document.getElementById('content-video')?.value || 'N/A';
    const infographics = document.getElementById('content-infographics')?.value || 'N/A';
    const contentCalendar = document.getElementById('content-calendar')?.value || 'N/A';
    
    // Tracking Systems
    const metrics = [];
    if (document.getElementById('metric-traffic')?.checked) metrics.push('Website Traffic');
    if (document.getElementById('metric-engagement')?.checked) metrics.push('Social Media Engagement');
    if (document.getElementById('metric-leads')?.checked) metrics.push('Lead Generation');
    if (document.getElementById('metric-conversion')?.checked) metrics.push('Conversion Rate');
    if (document.getElementById('metric-email')?.checked) metrics.push('Email Open Rate');
    if (document.getElementById('metric-roi')?.checked) metrics.push('ROI');
    const metricsText = metrics.length > 0 ? metrics.join(', ') : 'None selected';
    
    const trackingTools = document.getElementById('tracking-tools')?.value || 'N/A';
    const reportingFrequency = document.getElementById('reporting-frequency')?.value || 'N/A';
    const kpisDashboard = document.getElementById('kpis-dashboard')?.value || 'N/A';
    
    // Business Process Framework
    const processPlanning = document.getElementById('process-planning')?.value || 'N/A';
    const processExecution = document.getElementById('process-execution')?.value || 'N/A';
    const processMonitoring = document.getElementById('process-monitoring')?.value || 'N/A';
    const processOptimization = document.getElementById('process-optimization')?.value || 'N/A';
    
    // PDF Generation
    let yPos = 20;
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    const maxWidth = pageWidth - (margin * 2);
    const lineHeight = 7;
    
    // Helper function to add text with wrapping
    function addText(text, fontSize = 12, isBold = false, color = [0, 0, 0]) {
        doc.setFontSize(fontSize);
        doc.setTextColor(color[0], color[1], color[2]);
        if (isBold) {
            doc.setFont(undefined, 'bold');
        } else {
            doc.setFont(undefined, 'normal');
        }
        
        const lines = doc.splitTextToSize(text, maxWidth);
        doc.text(lines, margin, yPos);
        yPos += (lines.length * lineHeight) + 5;
        
        // Check if we need a new page
        if (yPos > doc.internal.pageSize.getHeight() - 30) {
            doc.addPage();
            yPos = 20;
        }
    }
    
    // Title
    addText('Marketing Clinic Report', 20, true, [59, 130, 246]);
    yPos += 5;
    
    // Marketing Plan Section
    addText('MARKETING PLAN', 16, true, [0, 0, 0]);
    addText(`Venture Name: ${ventureName}`, 12, false, [0, 0, 0]);
    addText(`Target Audience: ${targetAudience}`, 12, false, [0, 0, 0]);
    addText(`Key Objectives: ${keyObjectives}`, 12, false, [0, 0, 0]);
    addText(`Marketing Channels: ${channelsText}`, 12, false, [0, 0, 0]);
    addText(`Budget & Timeline: ${budgetTimeline}`, 12, false, [0, 0, 0]);
    yPos += 10;
    
    // Content Ideas Section
    addText('CONTENT IDEAS', 16, true, [0, 0, 0]);
    addText(`Blog Posts: ${blogPosts}`, 12, false, [0, 0, 0]);
    addText(`Social Media Posts: ${socialMedia}`, 12, false, [0, 0, 0]);
    addText(`Video Content: ${videoContent}`, 12, false, [0, 0, 0]);
    addText(`Infographics: ${infographics}`, 12, false, [0, 0, 0]);
    addText(`Content Calendar: ${contentCalendar}`, 12, false, [0, 0, 0]);
    yPos += 10;
    
    // Tracking Systems Section
    addText('TRACKING SYSTEMS', 16, true, [0, 0, 0]);
    addText(`Key Metrics: ${metricsText}`, 12, false, [0, 0, 0]);
    addText(`Tracking Tools: ${trackingTools}`, 12, false, [0, 0, 0]);
    addText(`Reporting Frequency: ${reportingFrequency}`, 12, false, [0, 0, 0]);
    addText(`KPIs Dashboard: ${kpisDashboard}`, 12, false, [0, 0, 0]);
    yPos += 10;
    
    // Business Process Framework Section
    addText('BUSINESS PROCESS FRAMEWORK', 16, true, [0, 0, 0]);
    addText(`1. Planning: ${processPlanning}`, 12, false, [0, 0, 0]);
    addText(`2. Execution: ${processExecution}`, 12, false, [0, 0, 0]);
    addText(`3. Monitoring: ${processMonitoring}`, 12, false, [0, 0, 0]);
    addText(`4. Optimization: ${processOptimization}`, 12, false, [0, 0, 0]);
    
    // Generate filename with venture name and date
    const date = new Date().toLocaleDateString('en-GB').replace(/\//g, '-');
    const filename = ventureName && ventureName !== 'N/A' 
        ? `Marketing_Clinic_${ventureName.replace(/[^a-z0-9]/gi, '_')}_${date}.pdf`
        : `Marketing_Clinic_${date}.pdf`;
    
    // Save PDF
    doc.save(filename);
    
    // Show success message and "Start Again" button
    const saveBtn = document.getElementById('save-marketing-clinic');
    const originalText = saveBtn.textContent;
    saveBtn.textContent = 'PDF Downloaded!';
    saveBtn.style.background = '#10b981';
    
    // Show "Start Again" button
    document.getElementById('start-again-btn').style.display = 'inline-block';
    
    setTimeout(() => {
        saveBtn.textContent = originalText;
        saveBtn.style.background = '';
    }, 3000);
}

// Reset Marketing Clinic Forms
function resetMarketingClinicForms() {
    // Reset all inputs
    document.getElementById('venture-name').value = '';
    document.getElementById('target-audience').value = '';
    document.getElementById('key-objectives').value = '';
    document.getElementById('budget-timeline').value = '';
    
    // Reset checkboxes
    document.getElementById('channel-social').checked = false;
    document.getElementById('channel-email').checked = false;
    document.getElementById('channel-content').checked = false;
    document.getElementById('channel-paid').checked = false;
    document.getElementById('channel-events').checked = false;
    
    // Reset content ideas
    document.getElementById('content-blog').value = '';
    document.getElementById('content-social').value = '';
    document.getElementById('content-video').value = '';
    document.getElementById('content-infographics').value = '';
    document.getElementById('content-calendar').value = '';
    
    // Reset tracking systems
    document.getElementById('metric-traffic').checked = false;
    document.getElementById('metric-engagement').checked = false;
    document.getElementById('metric-leads').checked = false;
    document.getElementById('metric-conversion').checked = false;
    document.getElementById('metric-email').checked = false;
    document.getElementById('metric-roi').checked = false;
    document.getElementById('tracking-tools').value = '';
    document.getElementById('reporting-frequency').value = '';
    document.getElementById('kpis-dashboard').value = '';
    
    // Reset business process framework
    document.getElementById('process-planning').value = '';
    document.getElementById('process-execution').value = '';
    document.getElementById('process-monitoring').value = '';
    document.getElementById('process-optimization').value = '';
    
    // Hide "Start Again" button
    document.getElementById('start-again-btn').style.display = 'none';
    
    // Go back to first tab
    const firstTab = document.querySelector('.tab-btn[data-tab="marketing-plans"]');
    if (firstTab) {
        firstTab.click();
    }
}

// Task Status Update Functionality
document.addEventListener('DOMContentLoaded', () => {
    function updateTaskStatus(taskCard) {
        const statusSelects = taskCard.querySelectorAll('.task-status-select');
        const statusIndicator = taskCard.querySelector('.status-indicator');
        
        if (!statusIndicator) return;
        
        let allFilled = true;
        let hasNotOnTarget = false;
        
        statusSelects.forEach(select => {
            const value = select.value;
            
            if (!value || value === '') {
                allFilled = false;
            } else if (value === 'not-on-target') {
                hasNotOnTarget = true;
            }
        });
        
        // Update status
        statusIndicator.classList.remove('on-track', 'off-track', 'pending');
        
        if (!allFilled && !hasNotOnTarget) {
            // No options selected yet
            statusIndicator.classList.add('pending');
            statusIndicator.textContent = 'Pending';
        } else if (hasNotOnTarget) {
            // At least one "Not on Target" selected
            statusIndicator.classList.add('off-track');
            statusIndicator.textContent = 'Off Track';
        } else {
            // All filled with "On target" or "Done"
            statusIndicator.classList.add('on-track');
            statusIndicator.textContent = 'On Track';
        }
    }
    
    // Set up event listeners for all select dropdowns
    document.querySelectorAll('.task-card').forEach(taskCard => {
        const selects = taskCard.querySelectorAll('.task-status-select');
        selects.forEach(select => {
            select.addEventListener('change', () => {
                updateTaskStatus(taskCard);
            });
        });
        
        // Initialize status on page load
        updateTaskStatus(taskCard);
    });
    
    // Announcements - save to localStorage
    const announcementsText = document.getElementById('announcements-text');
    if (announcementsText) {
        // Load saved announcements
        if (localStorage.getItem('announcements')) {
            announcementsText.value = localStorage.getItem('announcements');
        }
        
        // Save announcements on input
        announcementsText.addEventListener('input', () => {
            localStorage.setItem('announcements', announcementsText.value);
        });
    }
    
    // Notes section - save to localStorage
    const notesTextarea = document.getElementById('task-notes');
    if (notesTextarea) {
        // Load saved notes
        if (localStorage.getItem('taskNotes')) {
            notesTextarea.value = localStorage.getItem('taskNotes');
        }
        
        // Save notes on input
        notesTextarea.addEventListener('input', () => {
            localStorage.setItem('taskNotes', notesTextarea.value);
        });
    }
    
    // Role assignments - save to localStorage and update status
    document.querySelectorAll('.role-name-input').forEach(input => {
        const roleKey = `role-${input.dataset.role}`;
        const roleCard = input.closest('.role-card');
        const statusIndicator = roleCard ? roleCard.querySelector('.role-status-indicator') : null;
        
        // Function to update status
        function updateRoleStatus() {
            if (statusIndicator) {
                const hasName = input.value.trim().length > 0;
                statusIndicator.classList.remove('assigned', 'unassigned');
                
                if (hasName) {
                    statusIndicator.classList.add('assigned');
                    statusIndicator.textContent = 'Assigned';
                } else {
                    statusIndicator.classList.add('unassigned');
                    statusIndicator.textContent = 'Unassigned';
                }
            }
        }
        
        // Load saved role name
        if (localStorage.getItem(roleKey)) {
            input.value = localStorage.getItem(roleKey);
        }
        
        // Update status on load
        updateRoleStatus();
        
        // Save role name and update status on input
        input.addEventListener('input', () => {
            localStorage.setItem(roleKey, input.value);
            updateRoleStatus();
        });
    });
    
    // Editable role titles - save to localStorage
    document.querySelectorAll('.role-title-input').forEach(input => {
        const titleKey = `role-title-${input.dataset.roleTitle}`;
        
        // Load saved role title
        if (localStorage.getItem(titleKey)) {
            input.value = localStorage.getItem(titleKey);
        }
        
        // Save role title on input
        input.addEventListener('input', () => {
            localStorage.setItem(titleKey, input.value);
        });
    });
    
    // Extra Roles Toggle
    const extraRolesToggle = document.getElementById('extraRolesToggle');
    const extraRolesContent = document.getElementById('extraRolesContent');
    
    if (extraRolesToggle && extraRolesContent) {
        // Load saved toggle state
        const isOpen = localStorage.getItem('extraRolesOpen') === 'true';
        if (isOpen) {
            extraRolesToggle.classList.add('active');
            extraRolesContent.classList.add('open');
        }
        
        extraRolesToggle.addEventListener('click', () => {
            const isCurrentlyOpen = extraRolesContent.classList.contains('open');
            
            if (isCurrentlyOpen) {
                extraRolesContent.classList.remove('open');
                extraRolesToggle.classList.remove('active');
                localStorage.setItem('extraRolesOpen', 'false');
            } else {
                extraRolesContent.classList.add('open');
                extraRolesToggle.classList.add('active');
                localStorage.setItem('extraRolesOpen', 'true');
            }
        });
    }
    
    // EDI Policy Sections - save to localStorage
    // EDI Policy
    const ediPolicyStatus = document.getElementById('edi-policy-status');
    const ediPolicyNotes = document.getElementById('edi-policy-notes');
    
    if (ediPolicyStatus) {
        if (localStorage.getItem('ediPolicyStatus')) {
            ediPolicyStatus.value = localStorage.getItem('ediPolicyStatus');
        }
        ediPolicyStatus.addEventListener('change', () => {
            localStorage.setItem('ediPolicyStatus', ediPolicyStatus.value);
        });
    }
    
    if (ediPolicyNotes) {
        if (localStorage.getItem('ediPolicyNotes')) {
            ediPolicyNotes.value = localStorage.getItem('ediPolicyNotes');
        }
        ediPolicyNotes.addEventListener('input', () => {
            localStorage.setItem('ediPolicyNotes', ediPolicyNotes.value);
        });
    }
    
    // Sexual Harassment Policy
    const sexualHarassmentPolicyStatus = document.getElementById('sexual-harassment-policy-status');
    const sexualHarassmentPolicyNotes = document.getElementById('sexual-harassment-policy-notes');
    
    if (sexualHarassmentPolicyStatus) {
        if (localStorage.getItem('sexualHarassmentPolicyStatus')) {
            sexualHarassmentPolicyStatus.value = localStorage.getItem('sexualHarassmentPolicyStatus');
        }
        sexualHarassmentPolicyStatus.addEventListener('change', () => {
            localStorage.setItem('sexualHarassmentPolicyStatus', sexualHarassmentPolicyStatus.value);
        });
    }
    
    if (sexualHarassmentPolicyNotes) {
        if (localStorage.getItem('sexualHarassmentPolicyNotes')) {
            sexualHarassmentPolicyNotes.value = localStorage.getItem('sexualHarassmentPolicyNotes');
        }
        sexualHarassmentPolicyNotes.addEventListener('input', () => {
            localStorage.setItem('sexualHarassmentPolicyNotes', sexualHarassmentPolicyNotes.value);
        });
    }
});
