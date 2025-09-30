// Admin JavaScript for the dashboard
import { auth, db } from './firebase-config.js';
import { 
    signInWithEmailAndPassword, 
    signOut, 
    onAuthStateChanged 
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { 
    collection, 
    getDocs, 
    orderBy, 
    query 
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

// DOM elements
const loginForm = document.getElementById('login-form');
const adminLoginForm = document.getElementById('admin-login-form');
const dashboard = document.getElementById('dashboard');
const adminLoading = document.getElementById('admin-loading');
const adminError = document.getElementById('admin-error');
const adminErrorText = document.getElementById('admin-error-text');
const submissionsTable = document.getElementById('submissions-table');
const submissionsTbody = document.getElementById('submissions-tbody');
const submissionCount = document.getElementById('submission-count');
const refreshBtn = document.getElementById('refresh-btn');
const logoutBtn = document.getElementById('logout-btn');
const noSubmissions = document.getElementById('no-submissions');

// Initialize the admin panel
document.addEventListener('DOMContentLoaded', function() {
    // Set up authentication state listener
    onAuthStateChanged(auth, (user) => {
        if (user) {
            showDashboard();
            loadSubmissions();
        } else {
            showLoginForm();
        }
    });
    
    // Set up event listeners
    adminLoginForm.addEventListener('submit', handleLogin);
    logoutBtn.addEventListener('click', handleLogout);
    refreshBtn.addEventListener('click', loadSubmissions);
});

// Handle admin login
async function handleLogin(e) {
    e.preventDefault();
    
    const formData = new FormData(adminLoginForm);
    const email = formData.get('email').trim();
    const password = formData.get('password').trim();
    
    if (!email || !password) {
        showAdminError('Please fill in both email and password.');
        return;
    }
    
    try {
        showAdminLoading();
        await signInWithEmailAndPassword(auth, email, password);
        hideAdminLoading();
        // Auth state change will handle showing dashboard
    } catch (error) {
        console.error('Login error:', error);
        hideAdminLoading();
        
        let errorMessage = 'Login failed. Please try again.';
        
        switch (error.code) {
            case 'auth/user-not-found':
            case 'auth/wrong-password':
            case 'auth/invalid-credential':
                errorMessage = 'Invalid email or password.';
                break;
            case 'auth/too-many-requests':
                errorMessage = 'Too many failed attempts. Please try again later.';
                break;
            case 'auth/network-request-failed':
                errorMessage = 'Network error. Please check your connection.';
                break;
        }
        
        showAdminError(errorMessage);
    }
}

// Handle admin logout
async function handleLogout() {
    try {
        await signOut(auth);
        // Auth state change will handle showing login form
    } catch (error) {
        console.error('Logout error:', error);
        showAdminError('Error signing out. Please try again.');
    }
}

// Load submissions from Firestore
async function loadSubmissions() {
    try {
        showAdminLoading();
        
        const applicantsRef = collection(db, 'applicants');
        const q = query(applicantsRef, orderBy('submittedAt', 'desc'));
        const querySnapshot = await getDocs(q);
        
        const submissions = [];
        querySnapshot.forEach((doc) => {
            submissions.push({
                id: doc.id,
                ...doc.data()
            });
        });
        
        hideAdminLoading();
        displaySubmissions(submissions);
        
    } catch (error) {
        console.error('Error loading submissions:', error);
        hideAdminLoading();
        showAdminError('Error loading submissions. Please try again.');
    }
}

// Display submissions in the table
function displaySubmissions(submissions) {
    // Clear existing table body
    submissionsTbody.innerHTML = '';
    
    // Update submission count
    submissionCount.textContent = `${submissions.length} submission${submissions.length !== 1 ? 's' : ''}`;
    
    if (submissions.length === 0) {
        submissionsTable.style.display = 'none';
        noSubmissions.style.display = 'block';
        return;
    }
    
    submissionsTable.style.display = 'table';
    noSubmissions.style.display = 'none';
    
    // Populate table with submissions
    submissions.forEach(submission => {
        const row = document.createElement('tr');
        
        // Format submission date
        let submittedAtText = 'N/A';
        if (submission.submittedAt && submission.submittedAt.toDate) {
            const date = submission.submittedAt.toDate();
            submittedAtText = date.toLocaleString();
        }
        
        // Create table cells
        row.innerHTML = `
            <td>${escapeHtml(submission.name || 'N/A')}</td>
            <td>${escapeHtml(submission.email || 'N/A')}</td>
            <td>${escapeHtml(submission.phone || 'N/A')}</td>
            <td>${submittedAtText}</td>
            <td class="answer">${escapeHtml(submission.answers?.q1 || 'N/A')}</td>
            <td class="answer">${escapeHtml(submission.answers?.q2 || 'N/A')}</td>
            <td class="answer">${escapeHtml(submission.answers?.q3 || 'N/A')}</td>
            <td class="answer">${escapeHtml(submission.answers?.q4 || 'N/A')}</td>
            <td class="answer">${escapeHtml(submission.answers?.q5 || 'N/A')}</td>
            <td class="answer">${escapeHtml(submission.answers?.q6 || 'N/A')}</td>
        `;
        
        submissionsTbody.appendChild(row);
    });
}

// UI state management functions
function showLoginForm() {
    loginForm.style.display = 'block';
    dashboard.style.display = 'none';
    hideAdminError();
    hideAdminLoading();
}

function showDashboard() {
    loginForm.style.display = 'none';
    dashboard.style.display = 'block';
    hideAdminError();
    hideAdminLoading();
}

function showAdminLoading() {
    adminLoading.style.display = 'block';
    hideAdminError();
}

function hideAdminLoading() {
    adminLoading.style.display = 'none';
}

function showAdminError(message) {
    adminErrorText.textContent = message;
    adminError.style.display = 'block';
    
    // Auto-hide error after 5 seconds
    setTimeout(() => {
        adminError.style.display = 'none';
    }, 5000);
}

function hideAdminError() {
    adminError.style.display = 'none';
}

// Utility function to escape HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}