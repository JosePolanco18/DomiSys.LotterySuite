/**
 * Forgot Password Page - Client-side validation and UX enhancements
 * DomiSys FinancialSuite
 */

(function() {
    'use strict';

    // Wait for DOM to be ready
    document.addEventListener('DOMContentLoaded', function() {
        initializeForgotPasswordForm();
    });

    /**
     * Initialize forgot password form with validation and UX enhancements
     */
    function initializeForgotPasswordForm() {
        const form = document.getElementById('forgotPasswordForm');
        const submitButton = document.getElementById('forgotPasswordButton');
        const emailInput = document.getElementById('ForgotPasswordInput_Email');

        if (!form) return;

        // Add real-time validation
        if (emailInput) {
            addInputValidation(emailInput);
        }

        // Handle form submission
        form.addEventListener('submit', function(e) {
            // Check if form is valid
            const isValid = validateForm();

            if (!isValid) {
                e.preventDefault();
                return false;
            }

            // Show loading state
            if (submitButton) {
                setButtonLoading(submitButton, true);
            }
        });

        // Prevent multiple submissions
        let isSubmitting = false;
        form.addEventListener('submit', function(e) {
            if (isSubmitting) {
                e.preventDefault();
                return false;
            }
            isSubmitting = true;
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
            setInvalidState(input, getValidationMessage(input, 'required'));
            return false;
        }

        // Email validation
        if (input.type === 'email' && value) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
                setInvalidState(input, getValidationMessage(input, 'email'));
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
        const form = document.getElementById('forgotPasswordForm');
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
    function getValidationMessage(input, type) {
        if (type === 'required') {
            const requiredMsg = input.getAttribute('data-val-required');
            if (requiredMsg) return requiredMsg;
            return 'Este campo es requerido';
        }

        if (type === 'email') {
            const emailMsg = input.getAttribute('data-val-email');
            if (emailMsg) return emailMsg;
            return 'Ingrese un correo electrónico válido';
        }

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

    // Expose functions for testing if needed
    if (typeof window !== 'undefined') {
        window.ForgotPasswordForm = {
            validateForm: validateForm,
            setButtonLoading: setButtonLoading
        };
    }

})();
