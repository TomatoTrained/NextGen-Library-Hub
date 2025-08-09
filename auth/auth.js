import { auth, db } from '../js/firebase.js';

// DOM Elements
const errorMessage = document.getElementById('error-message');

// Login Functions
if (document.getElementById('login-btn')) {
    const loginBtn = document.getElementById('login-btn');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const phoneInput = document.getElementById('phone');
    const standardLogin = document.getElementById('standard-login');
    const ussdLogin = document.getElementById('ussd-login');
    const standardTab = document.getElementById('standard-login-tab');
    const ussdTab = document.getElementById('ussd-login-tab');

    // Tab switching
    standardTab.addEventListener('click', () => {
        standardLogin.style.display = 'block';
        ussdLogin.style.display = 'none';
        standardTab.classList.add('active');
        ussdTab.classList.remove('active');
    });

    ussdTab.addEventListener('click', () => {
        standardLogin.style.display = 'none';
        ussdLogin.style.display = 'block';
        ussdTab.classList.add('active');
        standardTab.classList.remove('active');
    });

    // Login handler
    loginBtn.addEventListener('click', () => {
        if (standardLogin.style.display !== 'none') {
            // Standard email login
            const email = emailInput.value;
            const password = passwordInput.value;
            
            if (!email || !password) {
                showError('Please fill in all fields');
                return;
            }
            
            auth.signInWithEmailAndPassword(email, password)
                .then(() => {
                    window.location.href = '../index.html';
                })
                .catch(error => {
                    showError(getAuthErrorMessage(error));
                });
        } else {
            // USSD login simulation
            const phone = phoneInput.value;
            if (!phone || !phone.startsWith('263') || phone.length !== 12) {
                showError('Please enter a valid Zimbabwean number starting with 263');
                return;
            }
            
            // In a real implementation, you would integrate with a USSD gateway API
            simulateUSSDLogin(phone);
        }
    });
}

// Signup Functions
if (document.getElementById('signup-btn')) {
    document.getElementById('signup-btn').addEventListener('click', signupUser);
}

async function signupUser() {
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const phone = document.getElementById('phone').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirm-password').value;
    const userType = document.getElementById('user-type').value;

    // Validation
    if (!name || !email || !phone || !password || !confirmPassword) {
        showError('Please fill in all fields');
        return;
    }

    if (password !== confirmPassword) {
        showError('Passwords do not match');
        return;
    }

    if (password.length < 6) {
        showError('Password must be at least 6 characters');
        return;
    }

    if (!phone.startsWith('263') || phone.length !== 12) {
        showError('Please enter a valid Zimbabwean number starting with 263');
        return;
    }

    try {
        // Create user
        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        
        // Update user profile
        await userCredential.user.updateProfile({
            displayName: name
        });

        // Save additional user data to Firestore
        await db.collection('users').doc(userCredential.user.uid).set({
            name,
            email,
            phone,
            userType,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });

        // Redirect to main app
        window.location.href = '../index.html';
    } catch (error) {
        showError(getAuthErrorMessage(error));
    }
}

// USSD Simulation (for demo purposes)
function simulateUSSDLogin(phone) {
    showError('USSD login would connect to EcoCash/OneMoney API in production');
    // In production, you would:
    // 1. Send USSD prompt to the phone number
    // 2. Verify the PIN entered via USSD
    // 3. Authenticate the user
}

// Helper functions
function showError(message) {
    errorMessage.textContent = message;
    setTimeout(() => {
        errorMessage.textContent = '';
    }, 5000);
}

function getAuthErrorMessage(error) {
    switch (error.code) {
        case 'auth/email-already-in-use':
            return 'Email is already registered';
        case 'auth/invalid-email':
            return 'Invalid email address';
        case 'auth/weak-password':
            return 'Password is too weak';
        case 'auth/user-not-found':
            return 'User not found';
        case 'auth/wrong-password':
            return 'Incorrect password';
        default:
            return 'Login failed. Please try again.';
    }
}

// Language switcher
if (document.getElementById('language-select')) {
    document.getElementById('language-select').addEventListener('change', (e) => {
        // In a full implementation, this would change the UI language
        console.log('Language changed to:', e.target.value);
    });
}