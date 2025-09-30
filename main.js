// Main JavaScript for the applicant page
import { db } from './firebase-config.js';
import { 
    collection, 
    addDoc, 
    query, 
    where, 
    getDocs,
    serverTimestamp 
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

// DOM elements
const initialForm = document.getElementById('initial-form');
const applicantInfoForm = document.getElementById('applicant-info-form');
const questionnaire = document.getElementById('questionnaire');
const questionnaireForm = document.getElementById('questionnaire-form');
const duplicateMessage = document.getElementById('duplicate-message');
const thankYouMessage = document.getElementById('thank-you');
const loadingElement = document.getElementById('loading');
const errorMessage = document.getElementById('error-message');
const errorText = document.getElementById('error-text');

// Application state
let applicantData = {
    name: '',
    email: '',
    phone: ''
};

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    // Hide all messages initially
    hideAllMessages();
    
    // Set up form event listeners
    applicantInfoForm.addEventListener('submit', handleInitialFormSubmit);
    questionnaireForm.addEventListener('submit', handleQuestionnaireSubmit);
});

// Handle initial form submission
async function handleInitialFormSubmit(e) {
    e.preventDefault();
    
    // Get form data
    const formData = new FormData(applicantInfoForm);
    applicantData.name = formData.get('fullName').trim();
    applicantData.email = formData.get('email').trim().toLowerCase();
    applicantData.phone = formData.get('phone').trim();
    
    // Validate required fields
    if (!applicantData.name || !applicantData.email || !applicantData.phone) {
        showError('Please fill in all required fields.');
        return;
    }
    
    // Validate email format
    if (!isValidEmail(applicantData.email)) {
        showError('Please enter a valid email address.');
        return;
    }
    
    try {
        showLoading();
        
        // Check for duplicate email
        const isDuplicate = await checkDuplicateEmail(applicantData.email);
        
        if (isDuplicate) {
            hideLoading();
            showDuplicateMessage();
        } else {
            hideLoading();
            showQuestionnaire();
        }
    } catch (error) {
        console.error('Error checking duplicate email:', error);
        hideLoading();
        showError('An error occurred. Please try again.');
    }
}

// Check if email already exists in the database
async function checkDuplicateEmail(email) {
    try {
        const applicantsRef = collection(db, 'applicants');
        const q = query(applicantsRef, where('email', '==', email));
        const querySnapshot = await getDocs(q);
        
        return !querySnapshot.empty;
    } catch (error) {
        console.error('Error checking duplicate email:', error);
        throw error;
    }
}

// Handle questionnaire form submission
async function handleQuestionnaireSubmit(e) {
    e.preventDefault();
    
    try {
        const formData = new FormData(questionnaireForm);
        
        // Validate all questions are answered
        const answers = {};
        let allAnswered = true;
        
        for (let i = 1; i <= 6; i++) {
            const answer = formData.get(`q${i}`);
            if (!answer) {
                allAnswered = false;
                break;
            }
            answers[`q${i}`] = answer;
        }
        
        if (!allAnswered) {
            showError('Please answer all questions before submitting.');
            return;
        }
        
        showLoading();
        
        // Prepare submission data
        const submissionData = {
            name: applicantData.name,
            email: applicantData.email,
            phone: applicantData.phone,
            submittedAt: serverTimestamp(),
            answers: answers
        };
        
        // Submit to Firestore
        await addDoc(collection(db, 'applicants'), submissionData);
        
        hideLoading();
        showThankYou();
        
    } catch (error) {
        console.error('Error submitting application:', error);
        hideLoading();
        showError('An error occurred while submitting your application. Please try again.');
    }
}

// Utility functions
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function showLoading() {
    hideAllMessages();
    loadingElement.style.display = 'block';
}

function hideLoading() {
    loadingElement.style.display = 'none';
}

function showError(message) {
    hideAllMessages();
    errorText.textContent = message;
    errorMessage.style.display = 'block';
    
    // Auto-hide error after 5 seconds
    setTimeout(() => {
        errorMessage.style.display = 'none';
    }, 5000);
}

function showDuplicateMessage() {
    hideAllMessages();
    initialForm.style.display = 'none';
    duplicateMessage.style.display = 'block';
}

function showQuestionnaire() {
    hideAllMessages();
    initialForm.style.display = 'none';
    questionnaire.style.display = 'block';
}

function showThankYou() {
    hideAllMessages();
    questionnaire.style.display = 'none';
    thankYouMessage.style.display = 'block';
}

function hideAllMessages() {
    const elements = [
        duplicateMessage,
        thankYouMessage,
        errorMessage,
        loadingElement
    ];
    
    elements.forEach(element => {
        if (element) {
            element.style.display = 'none';
        }
    });
}