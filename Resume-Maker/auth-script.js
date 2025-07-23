
class AuthManager {
    constructor() {
        this.currentTab = 'login';
        this.initializeEventListeners();
        this.initializeFormValidation();
    }

    initializeEventListeners() {
        // Form submissions
        document.getElementById('loginForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleLogin();
        });

        document.getElementById('signupForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleSignup();
        });

        // Real-time validation
        document.getElementById('signupPassword').addEventListener('input', () => {
            this.validatePassword();
        });

        document.getElementById('confirmPassword').addEventListener('input', () => {
            this.validatePasswordMatch();
        });

        // Input animations
        this.setupInputAnimations();
    }

    initializeFormValidation() {
        const inputs = document.querySelectorAll('input[required]');
        inputs.forEach(input => {
            input.addEventListener('blur', () => {
                this.validateInput(input);
            });

            input.addEventListener('input', () => {
                this.clearInputError(input);
            });
        });
    }

    setupInputAnimations() {
        const inputs = document.querySelectorAll('.input-group input');
        inputs.forEach(input => {
            input.addEventListener('focus', () => {
                input.parentElement.classList.add('focused');
            });

            input.addEventListener('blur', () => {
                if (!input.value) {
                    input.parentElement.classList.remove('focused');
                }
            });
        });
    }

    validateInput(input) {
        const value = input.value.trim();
        let isValid = true;
        let errorMessage = '';

        switch (input.type) {
            case 'email':
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(value)) {
                    isValid = false;
                    errorMessage = 'Please enter a valid email address';
                }
                break;
            case 'password':
                if (value.length < 8) {
                    isValid = false;
                    errorMessage = 'Password must be at least 8 characters long';
                }
                break;
            case 'text':
                if (input.id === 'signupName' && value.length < 2) {
                    isValid = false;
                    errorMessage = 'Please enter your full name';
                }
                break;
        }

        if (!isValid) {
            this.showInputError(input, errorMessage);
        } else {
            this.clearInputError(input);
        }

        return isValid;
    }

    validatePassword() {
        const password = document.getElementById('signupPassword').value;
        const requirements = [
            { test: password.length >= 8, text: 'At least 8 characters' },
            { test: /[A-Z]/.test(password), text: 'One uppercase letter' },
            { test: /[a-z]/.test(password), text: 'One lowercase letter' },
            { test: /\d/.test(password), text: 'One number' }
        ];

        //  add  password 
        return requirements.every(req => req.test);
    }

    validatePasswordMatch() {
        const password = document.getElementById('signupPassword').value;
        const confirmPassword = document.getElementById('confirmPassword');
        const match = password === confirmPassword.value;

        if (!match && confirmPassword.value) {
            this.showInputError(confirmPassword, 'Passwords do not match');
        } else {
            this.clearInputError(confirmPassword);
        }

        return match;
    }

    showInputError(input, message) {
        this.clearInputError(input);

        input.style.borderColor = 'rgba(231, 76, 60, 0.5)';
        input.style.background = 'rgba(231, 76, 60, 0.1)';

        const errorElement = document.createElement('div');
        errorElement.className = 'input-error';
        errorElement.textContent = message;
        errorElement.style.cssText = `
            color: #ff6b6b;
            font-size: 0.8rem;
            margin-top: 5px;
            animation: fadeInError 0.3s ease-in-out;
        `;

        input.parentElement.appendChild(errorElement);
    }

    clearInputError(input) {
        const errorElement = input.parentElement.querySelector('.input-error');
        if (errorElement) {
            errorElement.remove();
        }

        input.style.borderColor = '';
        input.style.background = '';
    }

    showMessage(message, type = 'error') {
        // Remove any existing messages
        const existingMessage = document.querySelector('.error-message, .success-message');
        if (existingMessage) {
            existingMessage.remove();
        }

        const messageElement = document.createElement('div');
        messageElement.className = type === 'error' ? 'error-message' : 'success-message';
        messageElement.textContent = message;

        const form = document.querySelector('.auth-form:not(.hidden)');
        form.insertBefore(messageElement, form.firstChild);

        // Auto-remove success messages after 3 seconds
        if (type === 'success') {
            setTimeout(() => {
                messageElement.remove();
            }, 3000);
        }
    }

    setLoading(button, loading) {
        if (loading) {
            button.classList.add('loading');
            button.disabled = true;
            this.originalButtonText = button.textContent;
            button.textContent = '';
        } else {
            button.classList.remove('loading');
            button.disabled = false;
            button.textContent = this.originalButtonText;
        }
    }

    async handleLogin() {
        const email = document.getElementById('loginEmail').value.trim();
        const password = document.getElementById('loginPassword').value;
        const submitButton = document.querySelector('#loginForm .auth-btn');

        // Basic validation
        if (!email || !password) {
            this.showMessage('Please fill in all fields');
            return;
        }

        this.setLoading(submitButton, true);

        try {
            // Simulate API delay
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Use database authentication
            const result = window.userDatabase.authenticateUser(email, password);
            
            if (result.success) {
                this.showMessage('Login successful! Redirecting...', 'success');
                
                // Store user session
                localStorage.setItem('currentUser', JSON.stringify(result.user));
                
                // Redirect to main app after a short delay
                setTimeout(() => {
                    window.location.href = 'index.html?logged_in=true&user=' + encodeURIComponent(result.user.email) + '&name=' + encodeURIComponent(result.user.name);
                }, 1500);
            } else {
                this.showMessage(result.message);
            }

        } catch (error) {
            console.error('Login error:', error);
            this.showMessage('Login failed. Please try again.');
        } finally {
            this.setLoading(submitButton, false);
        }
    }

    async handleSignup() {
        const name = document.getElementById('signupName').value.trim();
        const email = document.getElementById('signupEmail').value.trim();
        const password = document.getElementById('signupPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        const termsAccepted = document.getElementById('termsCheck').checked;
        const submitButton = document.querySelector('#signupForm .auth-btn');

        // Validation
        if (!name || !email || !password || !confirmPassword) {
            this.showMessage('Please fill in all fields');
            return;
        }

        if (!termsAccepted) {
            this.showMessage('Please accept the terms and conditions');
            return;
        }

        if (password !== confirmPassword) {
            this.showMessage('Passwords do not match');
            return;
        }

        if (password.length < 6) {
            this.showMessage('Password must be at least 6 characters long');
            return;
        }

        this.setLoading(submitButton, true);

        try {
            // Simulate API delay
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Use database to create user
            const result = window.userDatabase.createUser(email, password, name);
            
            if (result.success) {
                this.showMessage('Account created successfully! Redirecting...', 'success');
                
                // Auto-login the new user
                const loginResult = window.userDatabase.authenticateUser(email, password);
                if (loginResult.success) {
                    localStorage.setItem('currentUser', JSON.stringify(loginResult.user));
                }
                
                // Redirect to main app after a short delay
                setTimeout(() => {
                    window.location.href = 'index.html?logged_in=true&user=' + encodeURIComponent(email) + '&name=' + encodeURIComponent(name);
                }, 1500);
            } else {
                this.showMessage(result.message);
            }

        } catch (error) {
            console.error('Signup error:', error);
            this.showMessage('Account creation failed. Please try again.');
        } finally {
            this.setLoading(submitButton, false);
        }
    }

    handleAuthError(error) {
        let message = 'An error occurred. Please try again.';

        switch (error.code) {
            case 'auth/user-not-found':
                message = 'No account found with this email address';
                break;
            case 'auth/wrong-password':
                message = 'Incorrect password';
                break;
            case 'auth/email-already-in-use':
                message = 'An account with this email already exists';
                break;
            case 'auth/weak-password':
                message = 'Password is too weak';
                break;
            case 'auth/invalid-email':
                message = 'Invalid email address';
                break;
            case 'auth/too-many-requests':
                message = 'Too many failed attempts. Please try again later';
                break;
            default:
                message = error.message || 'An unexpected error occurred';
        }

        this.showMessage(message);
    }
}

// Global functions
function switchTab(tab) {
    const loginTab = document.getElementById('login-tab');
    const signupTab = document.getElementById('signup-tab');
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');
    const switchText = document.getElementById('auth-switch-text');

    // Clear any existing messages
    const existingMessage = document.querySelector('.error-message, .success-message');
    if (existingMessage) {
        existingMessage.remove();
    }

    if (tab === 'login') {
        loginTab.classList.add('active');
        signupTab.classList.remove('active');
        loginForm.classList.remove('hidden');
        signupForm.classList.add('hidden');
        switchText.innerHTML = 'Don\'t have an account? <a href="#" onclick="switchTab(\'signup\')">Sign up</a>';
    } else {
        signupTab.classList.add('active');
        loginTab.classList.remove('active');
        signupForm.classList.remove('hidden');
        loginForm.classList.add('hidden');
        switchText.innerHTML = 'Already have an account? <a href="#" onclick="switchTab(\'login\')">Sign in</a>';
    }
}

function loginWithGoogle() {
    if (typeof window.signInWithPopup !== 'undefined') {
        window.signInWithPopup(window.auth, window.provider)
            .then((result) => {
                console.log('User signed in with Google:', result.user);
                // Redirect to main app
                window.location.href = 'index.html';
            })
            .catch((error) => {
                console.error('Google sign-in error:', error);
                if (window.authManager) {
                    window.authManager.handleAuthError(error);
                }
            });
    }
}

function resetPassword() {
    const email = document.getElementById('loginEmail').value.trim();

    if (!email) {
        if (window.authManager) {
            window.authManager.showMessage('Please enter your email address first');
        }
        return;
    }

    // Use database to reset password
    const result = window.userDatabase.resetPassword(email);
    
    if (result.success) {
        if (window.authManager) {
            window.authManager.showMessage(
                `Password reset successful! Your temporary password is: ${result.tempPassword}`, 
                'success'
            );
        }
    } else {
        if (window.authManager) {
            window.authManager.showMessage(result.message);
        }
    }
}

// Initialize the auth manager when the page loads
document.addEventListener('DOMContentLoaded', () => {
    window.authManager = new AuthManager();

    // Check if user is already logged in
    const currentUser = localStorage.getItem('currentUser');
    if (currentUser) {
        const returnLink = document.getElementById('return-to-app');
        if (returnLink) {
            returnLink.style.display = 'block';
        }
    }

    // Add entrance animation to shapes
    const shapes = document.querySelectorAll('.shape');
    shapes.forEach((shape, index) => {
        setTimeout(() => {
            shape.style.opacity = '0.7';
            shape.style.animation = `float 6s ease-in-out infinite ${index * 0.5}s`;
        }, index * 200);
    });
});
