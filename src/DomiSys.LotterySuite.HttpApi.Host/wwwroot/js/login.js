/**
 * Login Page - Client-side validation and UX enhancements
 * DomiSys FinancialSuite
 */

(function() {
    'use strict';

    // Wait for DOM to be ready
    document.addEventListener('DOMContentLoaded', function() {
        initializeLoginForm();
    });

    /**
     * Initialize login form with validation and UX enhancements
     */
    function initializeLoginForm() {
        const form = document.getElementById('loginForm');
        const loginButton = document.getElementById('loginButton');
        const usernameInput = document.getElementById('LoginInput_UserNameOrEmailAddress');
        const passwordInput = document.getElementById('LoginInput_Password');

        if (!form) return;

        // Add real-time validation
        if (usernameInput) {
            addInputValidation(usernameInput);
        }

        if (passwordInput) {
            addInputValidation(passwordInput);
        }

        // Tenant-aware form submission
        var tenantReady = false;
        form.addEventListener('submit', function(e) {
            var isValid = validateForm();
            if (!isValid) {
                e.preventDefault();
                return false;
            }

            var tenantInput = document.getElementById('TenantName');
            var tenantName = tenantInput ? tenantInput.value.trim().toUpperCase() : '';

            // Leer cookie actual
            var currentCookie = '';
            var cookies = document.cookie.split(';');
            for (var i = 0; i < cookies.length; i++) {
                var c = cookies[i].trim();
                if (c.indexOf('__tenant=') === 0) {
                    currentCookie = decodeURIComponent(c.substring(9));
                    break;
                }
            }

            // Si el tenant cambió, setear cookie y re-submitear
            if (!tenantReady && tenantName !== currentCookie) {
                e.preventDefault();
                if (tenantName) {
                    document.cookie = '__tenant=' + encodeURIComponent(tenantName) + '; path=/; max-age=' + (30 * 24 * 60 * 60);
                } else {
                    document.cookie = '__tenant=; path=/; max-age=0';
                }
                tenantReady = true;
                // Re-submit en el siguiente tick para que el browser envíe la cookie nueva
                setTimeout(function() { form.submit(); }, 50);
                return false;
            }

            // Show loading state
            if (loginButton) {
                setButtonLoading(loginButton, true);
            }
        });
    }

    /**
     * Add real-time validation to input field
     */
    function addInputValidation(input) {
        // Remove invalid state on focus
        input.addEventListener('focus', function() {
            removeInvalidState(this);
        });

        // Validate on blur
        input.addEventListener('blur', function() {
            validateInput(this);
        });

        // Clear validation on input
        input.addEventListener('input', function() {
            if (this.classList.contains('is-invalid')) {
                removeInvalidState(this);
            }
        });
    }

    /**
     * Validate individual input field
     */
    function validateInput(input) {
        const value = input.value.trim();
        const isRequired = input.hasAttribute('data-val-required');

        if (isRequired && !value) {
            setInvalidState(input, getValidationMessage(input));
            return false;
        }

        // Email validation if needed
        if (input.type === 'email' && value) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
                setInvalidState(input, 'Por favor ingrese un correo electrónico válido');
                return false;
            }
        }

        removeInvalidState(input);
        return true;
    }

    /**
     * Validate entire form
     */
    function validateForm() {
        const form = document.getElementById('loginForm');
        if (!form) return true;

        const inputs = form.querySelectorAll('input[data-val-required]');
        let isValid = true;

        inputs.forEach(function(input) {
            if (!validateInput(input)) {
                isValid = false;
            }
        });

        // Focus first invalid input
        if (!isValid) {
            const firstInvalid = form.querySelector('.is-invalid');
            if (firstInvalid) {
                firstInvalid.focus();
            }
        }

        return isValid;
    }

    /**
     * Set invalid state on input
     */
    function setInvalidState(input, message) {
        input.classList.add('is-invalid');

        const feedback = input.parentElement.querySelector('.invalid-feedback');
        if (feedback && message) {
            feedback.textContent = message;
            feedback.style.display = 'block';
        }
    }

    /**
     * Remove invalid state from input
     */
    function removeInvalidState(input) {
        input.classList.remove('is-invalid');

        const feedback = input.parentElement.querySelector('.invalid-feedback');
        if (feedback) {
            feedback.style.display = 'none';
        }
    }

    /**
     * Get validation message for input
     */
    function getValidationMessage(input) {
        const requiredMsg = input.getAttribute('data-val-required');
        if (requiredMsg) return requiredMsg;

        // Default message
        return 'Este campo es requerido';
    }

    /**
     * Set button loading state
     */
    function setButtonLoading(button, isLoading) {
        if (isLoading) {
            button.classList.add('btn-loading');
            button.disabled = true;
        } else {
            button.classList.remove('btn-loading');
            button.disabled = false;
        }
    }

    /**
     * Show validation summary error
     */
    function showValidationError(message) {
        const form = document.getElementById('loginForm');
        if (!form) return;

        // Check if validation summary already exists
        let summary = form.querySelector('.validation-summary');

        if (!summary) {
            summary = document.createElement('div');
            summary.className = 'validation-summary';
            form.insertBefore(summary, form.firstChild);
        }

        summary.innerHTML = `
            <div class="validation-summary-title">Error de validación</div>
            <ul class="validation-summary-errors">
                <li>${message}</li>
            </ul>
        `;

        // Scroll to top of form
        form.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    /**
     * Handle Enter key in inputs
     */
    document.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            const target = e.target;
            if (target.tagName === 'INPUT' && target.type !== 'submit') {
                const form = target.closest('form');
                if (form) {
                    e.preventDefault();
                    const submitButton = form.querySelector('button[type="submit"]');
                    if (submitButton) {
                        submitButton.click();
                    }
                }
            }
        }
    });

    /**
     * Accessibility: Announce errors to screen readers
     */
    function announceError(message) {
        const announcement = document.createElement('div');
        announcement.setAttribute('role', 'alert');
        announcement.setAttribute('aria-live', 'assertive');
        announcement.className = 'visually-hidden';
        announcement.textContent = message;
        document.body.appendChild(announcement);

        // Remove after announcement
        setTimeout(function() {
            document.body.removeChild(announcement);
        }, 1000);
    }

    /**
     * Password visibility toggle (if needed in future)
     */
    function initPasswordToggle() {
        const passwordInput = document.getElementById('LoginInput_Password');
        if (!passwordInput) return;

        const toggleButton = document.createElement('button');
        toggleButton.type = 'button';
        toggleButton.className = 'password-toggle';
        toggleButton.innerHTML = '<span>Mostrar</span>';
        toggleButton.setAttribute('aria-label', 'Mostrar contraseña');

        passwordInput.parentElement.style.position = 'relative';
        passwordInput.parentElement.appendChild(toggleButton);

        toggleButton.addEventListener('click', function() {
            const type = passwordInput.type === 'password' ? 'text' : 'password';
            passwordInput.type = type;
            this.innerHTML = type === 'password' ? '<span>Mostrar</span>' : '<span>Ocultar</span>';
            this.setAttribute('aria-label', type === 'password' ? 'Mostrar contraseña' : 'Ocultar contraseña');
        });
    }

    // Expose functions for testing if needed
    if (typeof window !== 'undefined') {
        window.LoginForm = {
            validateForm: validateForm,
            setButtonLoading: setButtonLoading
        };
    }

})();
