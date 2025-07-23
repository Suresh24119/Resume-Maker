class ResumeMaker {
    constructor() {
        this.debounceTimer = null;
        this.skillList = [];
        this.currentUser = null;
        this.initializeEventListeners();
        this.initializeAuth();
        this.loadSavedData();
        this.generatePreview(); // Initial preview
    }

    initializeAuth() {
        // no Firebase authentication
        console.log('Demo mode: Authentication initialized');

        // Check URL  for login state
        const urlParams = new URLSearchParams(window.location.search);
        const isLoggedIn = urlParams.get('logged_in');
        const userName = urlParams.get('name') || urlParams.get('user') || 'Demo User';

        if (isLoggedIn === 'true') {
            this.currentUser = {displayName: userName, email: userName};
            this.updateAuthUI(this.currentUser);
        }
    }

    updateAuthUI(user) {
        const loginBtn = document.getElementById('login-btn');
        const userInfo = document.getElementById('user-info');
        const userName = document.getElementById('user-name');
        const adminBtn = document.getElementById('admin-btn');

        if (user) {
            if (loginBtn) loginBtn.style.display = 'none';
            if (userInfo) userInfo.style.display = 'flex';
            if (userName) userName.textContent = user.displayName || user.email;
            
            // Show admin panel only for admin users
            if (adminBtn) {
                if (user.email === 'patelsureshkumar67338@gmail.com' || user.displayName === 'Suresh ') {
                    adminBtn.style.display = 'inline-block';
                } else {
                    adminBtn.style.display = 'none';
                }
            }
        } else {
            if (loginBtn) loginBtn.style.display = 'inline-block';
            if (userInfo) userInfo.style.display = 'none';
            if (adminBtn) adminBtn.style.display = 'none';
        }
    }

    async saveUserData() {
        // save to localStorage only
        console.log('Demo mode: Data saved locally');
        const formData = this.collectFormData();
        localStorage.setItem('resumeUserData', JSON.stringify(formData));
    }

    async loadUserData(uid) {
        // load from localStorage
        try {
            const savedData = localStorage.getItem('resumeUserData');
            if (savedData) {
                const data = JSON.parse(savedData);
                this.populateForm(data);
                console.log('Demo mode: Data loaded from local storage');
            }
        } catch (error) {
            console.error('Error loading local data:', error);
        }
    }

    initializeEventListeners() {
        // Add experience button
        document.getElementById('add-experience').addEventListener('click', () => {
            this.addExperienceItem();
        });

        // Add education button
        document.getElementById('add-education').addEventListener('click', () => {
            this.addEducationItem();
        });

        // Add certification button
        document.getElementById('add-certification').addEventListener('click', () => {
            this.addCertificationItem();
        });

        // Template selector
        document.getElementById('template-selector').addEventListener('change', () => {
            this.applyTemplate();
        });

        // Photo upload
        document.getElementById('photo-upload').addEventListener('change', (e) => {
            this.handlePhotoUpload(e);
        });

        // Clear form button
        document.getElementById('clear-form').addEventListener('click', () => {
            this.clearForm();
        });

        // Save data button
        document.getElementById('save-data').addEventListener('click', () => {
            this.saveData();
        });

        // Load data button
        document.getElementById('load-data').addEventListener('click', () => {
            this.loadData();
        });

        // Generate resume button
        document.getElementById('generate-resume').addEventListener('click', () => {
            this.generatePreview();
        });

        // Download PDF button
        document.getElementById('download-pdf').addEventListener('click', () => {
            this.downloadPDF();
        });

        // Real-time preview updates
        this.setupRealTimeUpdates();
    }

    setupRealTimeUpdates() {
        const inputs = [
            'fullName', 'email', 'phone', 'address', 'linkedin', 'summary', 'skills'
        ];

        inputs.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.addEventListener('input', () => {
                    this.debouncedPreviewUpdate();
                });
            }
        });
    }

    debouncedPreviewUpdate() {
        clearTimeout(this.debounceTimer);
        this.debounceTimer = setTimeout(() => {
            this.generatePreview();
        }, 300);
    }

    addExperienceItem() {
        const container = document.getElementById('experience-container');
        const experienceItem = document.createElement('div');
        experienceItem.className = 'experience-item';
        experienceItem.innerHTML = `
            <input type="text" placeholder="Job Title" class="job-title" />
            <input type="text" placeholder="Company Name" class="company" />
            <input type="text" placeholder="Duration (e.g., 2020-2023)" class="duration" />
            <textarea placeholder="Job description and achievements..." class="job-description"></textarea>
            <button type="button" class="remove-item" onclick="this.parentElement.remove()">Remove</button>
        `;
        container.appendChild(experienceItem);

        // Add event listeners to new inputs
        const inputs = experienceItem.querySelectorAll('input, textarea');
        inputs.forEach(input => {
            input.addEventListener('input', () => {
                this.debouncedPreviewUpdate();
            });
        });
    }

    addEducationItem() {
        const container = document.getElementById('education-container');
        const educationItem = document.createElement('div');
        educationItem.className = 'education-item';
        educationItem.innerHTML = `
            <input type="text" placeholder="Degree" class="degree" />
            <input type="text" placeholder="Institution" class="institution" />
            <input type="text" placeholder="Year" class="year" />
            <button type="button" class="remove-item" onclick="this.parentElement.remove()">Remove</button>
        `;
        container.appendChild(educationItem);

        // Add event listeners to new inputs
        const inputs = educationItem.querySelectorAll('input');
        inputs.forEach(input => {
            input.addEventListener('input', () => {
                this.debouncedPreviewUpdate();
            });
        });
    }

    addCertificationItem() {
        const container = document.getElementById('certification-container');
        const certificationItem = document.createElement('div');
        certificationItem.className = 'certification-item';
        certificationItem.innerHTML = `
            <input type="text" placeholder="Certification Name" class="cert-name" />
            <input type="text" placeholder="Issuing Organization" class="cert-org" />
            <input type="text" placeholder="Date Obtained" class="cert-date" />
            <button type="button" class="remove-item" onclick="this.parentElement.remove()">Remove</button>
        `;
        container.appendChild(certificationItem);

        // Add event listeners to new inputs
        const inputs = certificationItem.querySelectorAll('input');
        inputs.forEach(input => {
            input.addEventListener('input', () => {
                this.debouncedPreviewUpdate();
            });
        });
    }

    handlePhotoUpload(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const photoPreview = document.getElementById('photo-preview');
                const previewPhoto = document.getElementById('preview-photo');

                // Update form preview
                photoPreview.innerHTML = `<img src="${e.target.result}" alt="Profile Photo" />`;

                // Update resume preview
                previewPhoto.src = e.target.result;
                previewPhoto.style.display = 'block';

                // Store the photo data
                this.photoData = e.target.result;
            };
            reader.readAsDataURL(file);
        }
    }

    generatePreview() {
        // Personal Information
        document.getElementById('preview-name').textContent =
            document.getElementById('fullName').value || 'Your Name';

        document.getElementById('preview-email').textContent =
            document.getElementById('email').value || '';

        document.getElementById('preview-phone').textContent =
            document.getElementById('phone').value || '';

        document.getElementById('preview-address').textContent =
            document.getElementById('address').value || '';

        const linkedin = document.getElementById('linkedin').value;
        document.getElementById('preview-linkedin').textContent = linkedin || '';

        // Professional Summary
        document.getElementById('preview-summary').textContent =
            document.getElementById('summary').value || 'Your professional summary will appear here...';

        // Work Experience
        this.generateExperiencePreview();

        // Education
        this.generateEducationPreview();

        // Skills
        this.generateSkillsPreview();

        // Certifications
        this.generateCertificationsPreview();
    }

    generateExperiencePreview() {
        const experienceContainer = document.getElementById('preview-experience');
        experienceContainer.innerHTML = '';

        const experienceItems = document.querySelectorAll('.experience-item');

        experienceItems.forEach(item => {
            const jobTitle = item.querySelector('.job-title').value;
            const company = item.querySelector('.company').value;
            const duration = item.querySelector('.duration').value;
            const description = item.querySelector('.job-description').value;

            if (jobTitle || company) {
                const experienceEntry = document.createElement('div');
                experienceEntry.className = 'experience-entry';
                experienceEntry.innerHTML = `
                    <div class="job-header">
                        <div>
                            <div class="job-title">${jobTitle || 'Job Title'}</div>
                            <div class="company">${company || 'Company Name'}</div>
                        </div>
                        <div class="duration">${duration || 'Duration'}</div>
                    </div>
                    <div class="job-description">${description || ''}</div>
                `;
                experienceContainer.appendChild(experienceEntry);
            }
        });

        if (experienceContainer.innerHTML === '') {
            experienceContainer.innerHTML = '<p>No work experience added yet.</p>';
        }
    }

    generateEducationPreview() {
        const educationContainer = document.getElementById('preview-education');
        educationContainer.innerHTML = '';

        const educationItems = document.querySelectorAll('.education-item');

        educationItems.forEach(item => {
            const degree = item.querySelector('.degree').value;
            const institution = item.querySelector('.institution').value;
            const year = item.querySelector('.year').value;

            if (degree || institution) {
                const educationEntry = document.createElement('div');
                educationEntry.className = 'education-entry';
                educationEntry.innerHTML = `
                    <div class="education-header">
                        <div>
                            <div class="degree">${degree || 'Degree'}</div>
                            <div class="institution">${institution || 'Institution'}</div>
                        </div>
                        <div class="year">${year || 'Year'}</div>
                    </div>
                `;
                educationContainer.appendChild(educationEntry);
            }
        });

        if (educationContainer.innerHTML === '') {
            educationContainer.innerHTML = '<p>No education added yet.</p>';
        }
    }

    generateSkillsPreview() {
        const skillsContainer = document.getElementById('preview-skills');

        if (this.skillList.length > 0) {
            skillsContainer.innerHTML = `<div class="skills-list">${this.skillList.join(' • ')}</div>`;
        } else {
            skillsContainer.innerHTML = '<p>No skills added yet.</p>';
        }

        // Update hidden textarea for backward compatibility
        document.getElementById('skills').value = this.skillList.join(', ');
    }

    addSkill() {
        const input = document.getElementById('skillInput');
        const skill = input.value.trim();

        if (skill && !this.skillList.includes(skill)) {
            this.skillList.push(skill);
            this.displaySkills();
            this.generateSkillsPreview();
            this.saveData(); // Auto-save when skills change
        }

        input.value = '';
    }

    removeSkill(skillToRemove) {
        this.skillList = this.skillList.filter(skill => skill !== skillToRemove);
        this.displaySkills();
        this.generateSkillsPreview();
        this.saveData(); // Auto-save when skills change
    }

    displaySkills() {
        const preview = document.getElementById('skillsPreview');
        preview.innerHTML = '';

        this.skillList.forEach(skill => {
            const badge = document.createElement('span');
            badge.className = 'skill-badge';
            badge.innerHTML = `
                ${skill}
                <button class="remove-skill" onclick="resumeMaker.removeSkill('${skill}')" title="Remove skill">×</button>
            `;
            preview.appendChild(badge);
        });
    }

    generateCertificationsPreview() {
        const certificationContainer = document.getElementById('preview-certifications');
        certificationContainer.innerHTML = '';

        const certificationItems = document.querySelectorAll('.certification-item');

        certificationItems.forEach(item => {
            const certName = item.querySelector('.cert-name').value;
            const certOrg = item.querySelector('.cert-org').value;
            const certDate = item.querySelector('.cert-date').value;

            if (certName || certOrg) {
                const certificationEntry = document.createElement('div');
                certificationEntry.className = 'certification-entry';
                certificationEntry.innerHTML = `
                    <div class="cert-header">
                        <div>
                            <div class="cert-name">${certName || 'Certification Name'}</div>
                            <div class="cert-org">${certOrg || 'Issuing Organization'}</div>
                        </div>
                        <div class="cert-date">${certDate || 'Date'}</div>
                    </div>
                `;
                certificationContainer.appendChild(certificationEntry);
            }
        });

        if (certificationContainer.innerHTML === '') {
            certificationContainer.innerHTML = '<p>No certifications added yet.</p>';
        }
    }

    applyTemplate() {
        const template = document.getElementById('template-selector').value;
        const resumeContainer = document.getElementById('resume-preview');

        // Remove existing template classes
        resumeContainer.classList.remove('modern', 'minimal', 'classic', 'creative', 'professional', 'elegant');

        // Add new template class
        if (template !== 'classic') {
            resumeContainer.classList.add(template);
        }
    }

    clearForm() {
        if (confirm('Are you sure you want to clear all form data?')) {
            document.querySelectorAll('input, textarea').forEach(element => {
                element.value = '';
            });

            // Reset to single items
            document.getElementById('experience-container').innerHTML = `
                <div class="experience-item">
                    <input type="text" placeholder="Job Title" class="job-title" />
                    <input type="text" placeholder="Company Name" class="company" />
                    <input type="text" placeholder="Duration (e.g., 2020-2023)" class="duration" />
                    <textarea placeholder="Job description and achievements..." class="job-description"></textarea>
                </div>
            `;

            document.getElementById('education-container').innerHTML = `
                <div class="education-item">
                    <input type="text" placeholder="Degree" class="degree" />
                    <input type="text" placeholder="Institution" class="institution" />
                    <input type="text" placeholder="Year" class="year" />
                </div>
            `;

            document.getElementById('certification-container').innerHTML = `
                <div class="certification-item">
                    <input type="text" placeholder="Certification Name" class="cert-name" />
                    <input type="text" placeholder="Issuing Organization" class="cert-org" />
                    <input type="text" placeholder="Date Obtained" class="cert-date" />
                </div>
            `;

            // Clear photo
            this.photoData = null;
            document.getElementById('photo-preview').innerHTML = '';
            document.getElementById('preview-photo').style.display = 'none';
            document.getElementById('photo-upload').value = '';

            this.setupRealTimeUpdates();
            this.generatePreview();
        }
    }

    collectFormData() {
        const formData = {
            personal: {
                fullName: document.getElementById('fullName').value,
                email: document.getElementById('email').value,
                phone: document.getElementById('phone').value,
                address: document.getElementById('address').value,
                linkedin: document.getElementById('linkedin').value,
                summary: document.getElementById('summary').value,
                skills: this.skillList.join(', '),
                photo: this.photoData || null
            },
            experience: [],
            education: [],
            certifications: [],
            template: document.getElementById('template-selector').value,
            skillList: this.skillList
        };

        // Save experience
        document.querySelectorAll('.experience-item').forEach(item => {
            formData.experience.push({
                jobTitle: item.querySelector('.job-title').value,
                company: item.querySelector('.company').value,
                duration: item.querySelector('.duration').value,
                description: item.querySelector('.job-description').value
            });
        });

        // Save education
        document.querySelectorAll('.education-item').forEach(item => {
            formData.education.push({
                degree: item.querySelector('.degree').value,
                institution: item.querySelector('.institution').value,
                year: item.querySelector('.year').value
            });
        });

        // Save certifications
        document.querySelectorAll('.certification-item').forEach(item => {
            formData.certifications.push({
                name: item.querySelector('.cert-name').value,
                organization: item.querySelector('.cert-org').value,
                date: item.querySelector('.cert-date').value
            });
        });

        return formData;
    }

    saveData() {
        const formData = this.collectFormData();
        localStorage.setItem('resumeData', JSON.stringify(formData));

        // Also save to Firebase if user is logged in
        if (this.currentUser) {
            this.saveUserData();
        }

        alert('Resume data saved successfully!');
    }

    loadData() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = (e) => {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const data = JSON.parse(event.target.result);
                    this.populateForm(data);
                } catch (error) {
                    alert('Invalid file format');
                }
            };
            reader.readAsText(file);
        };
        input.click();
    }

    loadSavedData() {
        const savedData = localStorage.getItem('resumeData');
        if (savedData) {
            try {
                const data = JSON.parse(savedData);
                this.populateForm(data);
            } catch (error) {
                console.error('Error loading saved data:', error);
            }
        }
    }

    populateForm(data) {
        // Load personal information
        if (data.personal) {
            Object.keys(data.personal).forEach(key => {
                if (key === 'photo' && data.personal[key]) {
                    // Handle photo data
                    this.photoData = data.personal[key];
                    const photoPreview = document.getElementById('photo-preview');
                    const previewPhoto = document.getElementById('preview-photo');
                    photoPreview.innerHTML = `<img src="${data.personal[key]}" alt="Profile Photo" />`;
                    previewPhoto.src = data.personal[key];
                    previewPhoto.style.display = 'block';
                } else if (key === 'skills') {
                    // Handle skills - don't populate the hidden textarea
                    // Skills will be loaded from skillList array
                } else {
                    const element = document.getElementById(key);
                    if (element) {
                        element.value = data.personal[key];
                    }
                }
            });
        }

        // Load skills
        if (data.skillList && Array.isArray(data.skillList)) {
            this.skillList = [...data.skillList];
            this.displaySkills();
        }

        // Load template
        if (data.template) {
            document.getElementById('template-selector').value = data.template;
            this.applyTemplate();
        }

        // Load experience
        if (data.experience && data.experience.length > 0) {
            const container = document.getElementById('experience-container');
            container.innerHTML = '';
            data.experience.forEach(exp => {
                this.addExperienceItem();
                const lastItem = container.lastElementChild;
                lastItem.querySelector('.job-title').value = exp.jobTitle || '';
                lastItem.querySelector('.company').value = exp.company || '';
                lastItem.querySelector('.duration').value = exp.duration || '';
                lastItem.querySelector('.job-description').value = exp.description || '';
            });
        }

        // Load education
        if (data.education && data.education.length > 0) {
            const container = document.getElementById('education-container');
            container.innerHTML = '';
            data.education.forEach(edu => {
                this.addEducationItem();
                const lastItem = container.lastElementChild;
                lastItem.querySelector('.degree').value = edu.degree || '';
                lastItem.querySelector('.institution').value = edu.institution || '';
                lastItem.querySelector('.year').value = edu.year || '';
            });
        }

        // Load certifications
        if (data.certifications && data.certifications.length > 0) {
            const container = document.getElementById('certification-container');
            container.innerHTML = '';
            data.certifications.forEach(cert => {
                this.addCertificationItem();
                const lastItem = container.lastElementChild;
                lastItem.querySelector('.cert-name').value = cert.name || '';
                lastItem.querySelector('.cert-org').value = cert.organization || '';
                lastItem.querySelector('.cert-date').value = cert.date || '';
            });
        }

        this.setupRealTimeUpdates();
        this.generatePreview();
    }

    downloadPDF() {
        // Simple PDF download using print functionality
        const resumeContent = document.getElementById('resume-preview').innerHTML;
        const printWindow = window.open('', '_blank');

        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Resume</title>
                <style>
                    body { 
                        font-family: 'Times New Roman', serif; 
                        margin: 20px; 
                        line-height: 1.5; 
                        color: #333;
                    }
                    .resume-header { 
                        text-align: center; 
                        margin-bottom: 20px; 
                        padding-bottom: 15px; 
                        border-bottom: 2px solid #2c3e50; 
                    }
                    .resume-header h1 { 
                        font-size: 24px; 
                        color: #2c3e50; 
                        margin-bottom: 10px; 
                    }
                    .contact-info { 
                        display: flex; 
                        justify-content: center; 
                        flex-wrap: wrap; 
                        gap: 15px; 
                        font-size: 12px; 
                    }
                    .resume-section { 
                        margin-bottom: 20px; 
                    }
                    .resume-section h2 { 
                        font-size: 16px; 
                        color: #2c3e50; 
                        margin-bottom: 10px; 
                        border-bottom: 1px solid #2c3e50; 
                        padding-bottom: 2px; 
                    }
                    .experience-entry, .education-entry { 
                        margin-bottom: 15px; 
                    }
                    .job-header, .education-header { 
                        display: flex; 
                        justify-content: space-between; 
                        margin-bottom: 5px; 
                    }
                    .job-title, .degree { 
                        font-weight: bold; 
                        font-size: 14px; 
                    }
                    .company, .institution { 
                        font-style: italic; 
                        font-size: 14px; 
                    }
                    .duration, .year { 
                        font-size: 12px; 
                        color: #666; 
                    }
                    .job-description { 
                        font-size: 12px; 
                        margin-top: 5px; 
                        white-space: pre-line; 
                    }
                    .skills-list { 
                        font-size: 12px; 
                        line-height: 1.6; 
                    }
                    @media print {
                        body { margin: 0; }
                        .resume-header { page-break-after: avoid; }
                        .resume-section { page-break-inside: avoid; }
                    }
                </style>
            </head>
            <body>
                ${resumeContent}
            </body>
            </html>
        `);

        printWindow.document.close();

        setTimeout(() => {
            printWindow.print();
            printWindow.close();
        }, 250);
    }
}

// Global authentication functions for demo mode
function loginWithGoogle() {
    console.log('Demo mode: Redirecting to auth page...');
    window.location.href = 'auth.html';
}

function logout() {
    console.log('Demo mode: Logout simulated');
    showUserAsLoggedOut();
    // Clear URL parameters
    window.history.replaceState({}, document.title, window.location.pathname);
}

// Global skill management function
function addSkill() {
    if (window.resumeMaker) {
        window.resumeMaker.addSkill();
    }
}

// Initialize the resume maker when the page loads
let resumeMaker;
document.addEventListener('DOMContentLoaded', () => {
    resumeMaker = new ResumeMaker();
    window.resumeMaker = resumeMaker; // Make it globally accessible

    // Add Enter key support for skill input
    document.getElementById('skillInput').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            addSkill();
        }
    });

    // Initialize 3D animations and interactions
    init3DEffects();
});

// 3D Effects and Animations
function init3DEffects() {
    // Add parallax effect to mouse movement
    document.addEventListener('mousemove', (e) => {
        const mouseX = e.clientX / window.innerWidth;
        const mouseY = e.clientY / window.innerHeight;

        // Apply subtle parallax to form sections
        const formSection = document.querySelector('.form-section');
        const previewSection = document.querySelector('.preview-section');

        if (formSection && previewSection) {
            const moveX = (mouseX - 0.5) * 10;
            const moveY = (mouseY - 0.5) * 10;

            formSection.style.transform = `rotateX(${2 + moveY * 0.5}deg) rotateY(${moveX * 0.5}deg)`;
            previewSection.style.transform = `rotateX(${2 - moveY * 0.5}deg) rotateY(${-moveX * 0.5}deg)`;
        }
    });

    // Add floating animation to form groups
    const formGroups = document.querySelectorAll('.form-group');
    formGroups.forEach((group, index) => {
        group.style.animationDelay = `${index * 0.1}s`;
        group.classList.add('floating-element');

        // Add interactive zone effect
        group.classList.add('interactive-zone');
    });

    // Add scroll-triggered animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.animation = 'fadeInUp 0.8s ease-out forwards';
            }
        });
    }, observerOptions);

    // Observe all form groups and sections
    document.querySelectorAll('.form-group, .resume-section').forEach(el => {
        observer.observe(el);
    });

    // Add ripple effect to buttons
    addRippleEffect();

    // Add morphing background effect
    addMorphingBackground();
}

function addRippleEffect() {
    const buttons = document.querySelectorAll('button');

    buttons.forEach(button => {
        button.addEventListener('click', function(e) {
            const ripple = document.createElement('span');
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;

            ripple.style.width = ripple.style.height = size + 'px';
            ripple.style.left = x + 'px';
            ripple.style.top = y + 'px';
            ripple.classList.add('ripple');

            this.appendChild(ripple);

            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
    });
}

function addMorphingBackground() {
    // Create animated shapes in the background
    const shapesContainer = document.createElement('div');
    shapesContainer.className = 'background-shapes';
    shapesContainer.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: -1;
        overflow: hidden;
    `;

    document.body.appendChild(shapesContainer);

    // Create floating shapes
    for (let i = 0; i < 5; i++) {
        const shape = document.createElement('div');
        shape.className = 'floating-shape';
        shape.style.cssText = `
            position: absolute;
            width: ${50 + Math.random() * 100}px;
            height: ${50 + Math.random() * 100}px;
            background: linear-gradient(45deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1));
            border-radius: 50%;
            left: ${Math.random() * 100}%;
            top: ${Math.random() * 100}%;
            animation: floatAround ${10 + Math.random() * 10}s linear infinite;
            filter: blur(1px);
        `;

        shapesContainer.appendChild(shape);
    }
}

// Add CSS animations for 3D effects
const style = document.createElement('style');
style.textContent = `
    .ripple {
        position: absolute;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.6);
        transform: scale(0);
        animation: rippleAnimation 0.6s linear;
        pointer-events: none;
    }

    @keyframes rippleAnimation {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }

    @keyframes floatAround {
        0% {
            transform: translateX(0px) translateY(0px) rotate(0deg);
        }
        33% {
            transform: translateX(30px) translateY(-30px) rotate(120deg);
        }
        66% {
            transform: translateX(-20px) translateY(20px) rotate(240deg);
        }
        100% {
            transform: translateX(0px) translateY(0px) rotate(360deg);
        }
    }

    .background-shapes {
        animation: shapesFloat 20s ease-in-out infinite;
    }

    @keyframes shapesFloat {
        0%, 100% { transform: translateY(0px) rotate(0deg); }
        50% { transform: translateY(-20px) rotate(5deg); }
    }
`;
document.head.appendChild(style);

// Define updatePreview function
function updatePreview() {
    if (window.resumeMaker) {
        window.resumeMaker.generatePreview();
    }
}

// Initialize the app
document.addEventListener('DOMContentLoaded', function() {
    // Initialize 3D effects
    init3DEffects();

    // Check URL parameters for login state
    const urlParams = new URLSearchParams(window.location.search);
    const isLoggedIn = urlParams.get('logged_in');
    const userName = urlParams.get('name') || urlParams.get('user') || 'Demo User';

    if (isLoggedIn === 'true') {
        showUserAsLoggedIn(userName);
    }
});

function showUserAsLoggedIn(userName) {
    const loginBtn = document.getElementById('login-btn');
    const userInfo = document.getElementById('user-info');
    const userNameSpan = document.getElementById('user-name');
    const adminBtn = document.getElementById('admin-btn');

    if (loginBtn) loginBtn.style.display = 'none';
    if (userInfo) {
        userInfo.style.display = 'flex';
        userInfo.style.alignItems = 'center';
        userInfo.style.gap = '10px';
    }
    if (userNameSpan) userNameSpan.textContent = `Welcome, ${userName}!`;
    
    // Show admin panel only for admin users
    const currentUser = localStorage.getItem('currentUser');
    if (currentUser && adminBtn) {
        try {
            const userData = JSON.parse(currentUser);
            if (userData.email === 'admin@example.com' || userName === 'Administrator') {
                adminBtn.style.display = 'inline-block';
            } else {
                adminBtn.style.display = 'none';
            }
        } catch (error) {
            adminBtn.style.display = 'none';
        }
    }
}

function showUserAsLoggedOut() {
    const loginBtn = document.getElementById('login-btn');
    const userInfo = document.getElementById('user-info');

    if (loginBtn) loginBtn.style.display = 'block';
    if (userInfo) userInfo.style.display = 'none';
}

// Add missing updatePreview function
function updatePreview() {
    if (window.resumeMaker) {
        window.resumeMaker.generatePreview();
    }
}

// Initialize resume maker if not already initialized
if (!window.resumeMaker) {
    window.resumeMaker = {
        generatePreview: function() {
            console.log('Resume preview updated');
        }
    };
}