/*
  script.js
  Main JavaScript for the BreachGuard application.
  Handles navigation, breach checking, and password strength analysis.
*/

// Wait for the DOM to be fully loaded before running the script
document.addEventListener('DOMContentLoaded', () => {

    // --- MOCK DATABASE for Breach Checker ---
    // In a real application, this data would come from a secure server API.
    // For this simulation, we define it directly as a JavaScript object.
    const mockDatabase = {
        'user@example.com': [
            { name: 'Fake Social Network', date: '2023-05-15', data: ['Email addresses', 'Passwords (hashed)', 'Usernames'], description: 'A threat actor gained access to a database backup containing user credentials.' }, 
            { name: 'Leaky Cloud Storage', date: '2022-11-01', data: ['Email addresses', 'Full names', 'IP addresses'], description: 'An improperly configured cloud storage bucket exposed user information publicly.' }
        ],
        'admin@example.com': [
            { name: 'Corporate Insider Leak', date: '2024-01-20', data: ['Email addresses', 'Job titles', 'Phone numbers'], description: 'A list of internal employee contacts was leaked by a disgruntled employee.' }
        ],
        'test@test.com': [
            { name: 'Online Gaming Forum', date: '2021-08-10', data: ['Email addresses', 'Usernames', 'Passwords (plaintext, yikes!)'], description: 'The forum\'s legacy database was compromised, exposing unsalted, plaintext passwords.' }
        ]
    };

    // --- NAVIGATION LOGIC ---
    // Handles switching between different content sections (pages)
    const navLinks = document.querySelectorAll('.clickable-nav');
    const contentSections = document.querySelectorAll('.content-section');

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            
            const targetId = link.dataset.target;
            if (!targetId) return;

            // Hide all content sections
            contentSections.forEach(section => {
                section.classList.add('hidden');
            });

            // Show the target section
            const targetSection = document.getElementById(targetId);
            if (targetSection) {
                targetSection.classList.remove('hidden');
            }

            // Update active link style for main navigation bar
            document.querySelectorAll('#main-nav .nav-link').forEach(navLink => {
                navLink.classList.remove('active');
                if(navLink.dataset.target === targetId) {
                    navLink.classList.add('active');
                }
            });

            // If the logo is clicked, ensure the 'Home' link is set to active
            if (link.id === 'logo-link') {
                 document.querySelector('#main-nav .nav-link[data-target="home-section"]').classList.add('active');
            }
        });
    });

    // --- BREACH CHECKER LOGIC ---
    const searchForm = document.getElementById('search-form');
    const emailInput = document.getElementById('email-input');
    const resultsContainer = document.getElementById('results-container');
    const searchButton = document.getElementById('search-button');

    if (searchForm) {
        searchForm.addEventListener('submit', (e) => {
            e.preventDefault(); // Prevent the form from reloading the page
            const email = emailInput.value.trim().toLowerCase();
            if (!email) return; // Do nothing if the input is empty

            showLoading();

            // Simulate a network request delay (1.5 seconds)
            setTimeout(() => {
                const breachData = mockDatabase[email];
                if (breachData) {
                    displayPwned(breachData);
                } else {
                    displayGoodNews();
                }
            }, 1500);
        });
    }

    function showLoading() {
        searchButton.disabled = true;
        searchButton.textContent = 'Checking...';
        resultsContainer.innerHTML = `<div class="flex justify-center items-center p-8"><div class="spinner"></div></div>`;
    }

    function resetSearchButton() {
        searchButton.disabled = false;
        searchButton.textContent = 'Check Now';
    }

    function displayGoodNews() {
        resetSearchButton();
        resultsContainer.innerHTML = `<div class="bg-emerald-100 dark:bg-emerald-900/50 border-l-4 border-emerald-500 text-emerald-800 dark:text-emerald-200 p-6 rounded-lg text-left shadow-lg"><h3 class="text-2xl font-bold mb-2">Good news — no breaches found!</h3><p>This email address was not found in our simulated database of breached accounts.</p></div>`;
    }

    function displayPwned(breaches) {
        resetSearchButton();
        let breachHTML = breaches.map(breach => `
            <div class="bg-white dark:bg-gray-800 p-4 rounded-lg mb-4 border border-gray-200 dark:border-gray-700">
                <h4 class="text-xl font-bold text-gray-900 dark:text-white">${breach.name}</h4>
                <p class="text-sm text-gray-500 dark:text-gray-400 mb-2">Breach date: ${breach.date}</p>
                <p class="text-gray-700 dark:text-gray-300 mb-3">${breach.description}</p>
                <p class="font-semibold text-gray-800 dark:text-gray-200">Compromised data:</p>
                <ul class="list-disc list-inside text-left text-gray-600 dark:text-gray-400">${breach.data.map(item => `<li>${item}</li>`).join('')}</ul>
            </div>`).join('');

        resultsContainer.innerHTML = `
            <div class="bg-red-100 dark:bg-red-900/50 border-l-4 border-red-500 text-red-800 dark:text-red-200 p-6 rounded-lg text-left shadow-lg">
                <h3 class="text-2xl font-bold mb-4">Oh no — pwned!</h3>
                <p class="mb-4">This email was found in <strong>${breaches.length}</strong> simulated breach(es). You should change your passwords immediately, especially on these sites.</p>
                ${breachHTML}
            </div>`;
    }

    // --- PASSWORD CHECKER LOGIC ---
    const passwordInput = document.getElementById('password-input');
    const strengthBar = document.getElementById('password-strength-bar');
    const strengthText = document.getElementById('password-strength-text');
    const criteriaElements = {
        length: document.getElementById('length'),
        lowercase: document.getElementById('lowercase'),
        uppercase: document.getElementById('uppercase'),
        number: document.getElementById('number'),
        special: document.getElementById('special')
    };

    if (passwordInput) {
        passwordInput.addEventListener('input', () => {
            const password = passwordInput.value;
            let score = 0;
            
            const checks = {
                hasLength: password.length >= 12,
                hasLower: /[a-z]/.test(password),
                hasUpper: /[A-Z]/.test(password),
                hasNumber: /[0-9]/.test(password),
                hasSpecial: /[^A-Za-z0-9]/.test(password)
            };

            // Update the UI for each criterion
            updateCriterion(criteriaElements.length, checks.hasLength);
            updateCriterion(criteriaElements.lowercase, checks.hasLower);
            updateCriterion(criteriaElements.uppercase, checks.hasUpper);
            updateCriterion(criteriaElements.number, checks.hasNumber);
            updateCriterion(criteriaElements.special, checks.hasSpecial);

            // Calculate strength score
            if (password.length > 0) score++;
            if (checks.hasLength) score++;
            if (Object.values(checks).filter(val => val).length >= 3 && checks.hasLength) score++;
            if (Object.values(checks).filter(val => val).length >= 4 && checks.hasLength) score++;
            
            // Update the strength bar and text based on the score
            let strengthLabel = "";
            strengthBar.className = 'strength-0'; // Reset class
            if (password.length === 0) {
                score = 0;
                strengthLabel = "";
            } else if (score <= 1) {
                strengthLabel = "Weak";
                strengthBar.classList.add('strength-1');
            } else if (score === 2) {
                strengthLabel = "Medium";
                strengthBar.classList.add('strength-2');
            } else if (score === 3) {
                strengthLabel = "Strong";
                strengthBar.classList.add('strength-3');
            } else if (score >= 4) {
                strengthLabel = "Very Strong";
                strengthBar.classList.add('strength-4');
            }
            
            strengthBar.style.width = (score / 4) * 100 + '%';
            strengthText.textContent = strengthLabel;
            strengthText.style.color = getComputedStyle(strengthBar).backgroundColor;
        });
    }

    function updateCriterion(element, isMet) {
        if (isMet) {
            element.classList.add('text-emerald-500');
            element.classList.remove('text-gray-600', 'dark:text-gray-400');
        } else {
            element.classList.remove('text-emerald-500');
            element.classList.add('text-gray-600', 'dark:text-gray-400');
        }
    }
});
