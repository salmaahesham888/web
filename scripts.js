// Initialize Database
let db;
const DB_NAME = 'RenewableEnergyDB';
const DB_VERSION = 1;
const STORE_NAME = 'users';

// DOM Elements
const loginBtn = document.getElementById('login-btn');
const signupBtn = document.getElementById('signup-btn');
const loginForm = document.getElementById('login-form');
const signupForm = document.getElementById('signup-form');
const loginFormElement = document.getElementById('loginForm');
const signupFormElement = document.getElementById('signupForm');
const loginError = document.getElementById('login-error');
const signupError = document.getElementById('signup-error');

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    initDB();
    setupEventListeners();
    hideAllForms();
});

// Initialize IndexedDB
function initDB() {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
        db = event.target.result;
        
        // Create users store if it doesn't exist
        if (!db.objectStoreNames.contains(STORE_NAME)) {
            const objectStore = db.createObjectStore(STORE_NAME, { keyPath: 'email' });
            objectStore.createIndex('username', 'username', { unique: true });
            console.log('Database store created');
        }
    };

    request.onsuccess = (event) => {
        db = event.target.result;
        console.log('Database initialized successfully');
    };

    request.onerror = (event) => {
        console.error('Database error:', event.target.error);
    };
}

// Setup event listeners
function setupEventListeners() {
    // Button clicks
    loginBtn.addEventListener('click', showLoginForm);
    signupBtn.addEventListener('click', showSignupForm);
    
    // Form submissions
    loginFormElement.addEventListener('submit', handleLogin);
    signupFormElement.addEventListener('submit', handleSignup);
}

// Form visibility functions
function hideAllForms() {
    loginForm.style.display = 'none';
    signupForm.style.display = 'none';
}

function showLoginForm() {
    hideAllForms();
    loginForm.style.display = 'block';
    clearErrors();
}

function showSignupForm() {
    hideAllForms();
    signupForm.style.display = 'block';
    clearErrors();
}

function clearErrors() {
    loginError.textContent = '';
    signupError.textContent = '';
}

// Handle login
async function handleLogin(e) {
    e.preventDefault();
    clearErrors();
    
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    try {
        const user = await getUser(email);
        
        if (user && user.password === password) {
            alert(`Welcome back, ${user.username}!`);
            // Redirect to dashboard or main page
            // window.location.href = 'dashboard.html';
        } else {
            loginError.textContent = 'Invalid email or password';
        }
    } catch (error) {
        console.error('Login error:', error);
        loginError.textContent = 'An error occurred during login';
    }
}

// Handle signup
async function handleSignup(e) {
    e.preventDefault();
    clearErrors();
    
    const username = document.getElementById('signup-name').value;
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;

    const user = {
        username: username,
        email: email,
        password: password
    };

    try {
        await addUser(user);
        alert(`Welcome ${username}! Your account has been created.`);
        signupFormElement.reset();
        showLoginForm();
    } catch (error) {
        console.error('Signup error:', error);
        if (error.name === 'ConstraintError') {
            signupError.textContent = 'This email is already registered';
        } else {
            signupError.textContent = 'An error occurred during signup';
        }
    }
}

// Database operations
function getUser(email) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.get(email);

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

function addUser(user) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.add(user);

        request.onsuccess = () => resolve();
        request.onerror = (e) => reject(e.target.error);
    });
}