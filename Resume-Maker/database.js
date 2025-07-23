
class SimpleDatabase {
    constructor() {
        this.users = this.loadUsers();
        this.initializeDefaultAdmin();
    }

    loadUsers() {
        try {
            const userData = localStorage.getItem('userDatabase');
            return userData ? JSON.parse(userData) : {};
        } catch (error) {
            console.error('Error loading user database:', error);
            return {};
        }
    }

    saveUsers() {
        try {
            localStorage.setItem('userDatabase', JSON.stringify(this.users));
            return true;
        } catch (error) {
            console.error('Error saving user database:', error);
            return false;
        }
    }

    initializeDefaultAdmin() {
        // Create admin user 
        if (Object.keys(this.users).length === 0) {
            this.createUser('patelsureshkumar67338@gmail.com', 'suresh9650', 'suresh');
        }
    }

    hashPassword(password) {
        
        // In production, use proper password hashing like bcrypt
        let hash = 0;
        for (let i = 0; i < password.length; i++) {
            const char = password.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return hash.toString();
    }

    createUser(email, password, name) {
        if (this.users[email]) {
            return { success: false, message: 'User already exists' };
        }

        const hashedPassword = this.hashPassword(password);
        this.users[email] = {
            id: Date.now().toString(),
            email: email,
            password: hashedPassword,
            name: name,
            createdAt: new Date().toISOString(),
            lastLogin: null
        };

        if (this.saveUsers()) {
            return { success: true, message: 'User created successfully' };
        } else {
            return { success: false, message: 'Failed to save user' };
        }
    }

    authenticateUser(email, password) {
        const user = this.users[email];
        if (!user) {
            return { success: false, message: 'User not found' };
        }

        const hashedPassword = this.hashPassword(password);
        if (user.password === hashedPassword) {
            // Update last login
            user.lastLogin = new Date().toISOString();
            this.saveUsers();
            
            return { 
                success: true, 
                message: 'Authentication successful',
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    lastLogin: user.lastLogin
                }
            };
        } else {
            return { success: false, message: 'Invalid password' };
        }
    }

    getUserByEmail(email) {
        const user = this.users[email];
        if (user) {
            return {
                id: user.id,
                email: user.email,
                name: user.name,
                createdAt: user.createdAt,
                lastLogin: user.lastLogin
            };
        }
        return null;
    }

    updateUser(email, updates) {
        if (!this.users[email]) {
            return { success: false, message: 'User not found' };
        }

        // Only allow updating name and password
        if (updates.name) {
            this.users[email].name = updates.name;
        }
        if (updates.password) {
            this.users[email].password = this.hashPassword(updates.password);
        }

        if (this.saveUsers()) {
            return { success: true, message: 'User updated successfully' };
        } else {
            return { success: false, message: 'Failed to update user' };
        }
    }

    deleteUser(email) {
        if (!this.users[email]) {
            return { success: false, message: 'User not found' };
        }

        delete this.users[email];
        if (this.saveUsers()) {
            return { success: true, message: 'User deleted successfully' };
        } else {
            return { success: false, message: 'Failed to delete user' };
        }
    }

    getAllUsers() {
        return Object.values(this.users).map(user => ({
            id: user.id,
            email: user.email,
            name: user.name,
            createdAt: user.createdAt,
            lastLogin: user.lastLogin
        }));
    }

    resetPassword(email) {
        if (!this.users[email]) {
            return { success: false, message: 'User not found' };
        }

        // Generate a temporary password
        const tempPassword = Math.random().toString(36).slice(-8);
        this.users[email].password = this.hashPassword(tempPassword);
        
        if (this.saveUsers()) {
            return { 
                success: true, 
                message: 'Password reset successful',
                tempPassword: tempPassword
            };
        } else {
            return { success: false, message: 'Failed to reset password' };
        }
    }
}

// Initialize the database
const userDatabase = new SimpleDatabase();

// Make it globally available
window.userDatabase = userDatabase;

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SimpleDatabase;
}
