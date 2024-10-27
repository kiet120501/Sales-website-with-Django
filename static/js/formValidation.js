const FormValidation = {
    validateForm() {
        let isValid = true;

        // Validate Name
        const name = document.getElementById('billing-name');
        if (name.value.trim() === '') {
            this.setErrorFor(name, 'Name cannot be blank');
            isValid = false;
        } else {
            this.setSuccessFor(name);
        }

        // Validate Email
        const email = document.getElementById('billing-email-address');
        if (email.value.trim() === '') {
            this.setErrorFor(email, 'Email cannot be blank');
            isValid = false;
        } else if (!this.isValidEmail(email.value.trim())) {
            this.setErrorFor(email, 'Email is not valid');
            isValid = false;
        } else {
            this.setSuccessFor(email);
        }

        // Validate Phone
        const phone = document.getElementById('billing-phone');
        if (phone.value.trim() === '') {
            this.setErrorFor(phone, 'Phone number cannot be blank');
            isValid = false;
        } else if (!this.isValidPhone(phone.value.trim())) {
            this.setErrorFor(phone, 'Phone number is not valid');
            isValid = false;
        } else {
            this.setSuccessFor(phone);
        }

        // Validate Address
        const address = document.getElementById('billing-address');
        if (address.value.trim() === '') {
            this.setErrorFor(address, 'Address cannot be blank');
            isValid = false;
        } else {
            this.setSuccessFor(address);
        }

        // Validate Country
        const country = document.querySelector('select[title="Country"]');
        if (country.value === '0') {
            this.setErrorFor(country, 'Please select a country');
            isValid = false;
        } else {
            this.setSuccessFor(country);
        }

        // Validate City
        const city = document.getElementById('billing-city');
        if (city.value.trim() === '') {
            this.setErrorFor(city, 'City cannot be blank');
            isValid = false;
        } else {
            this.setSuccessFor(city);
        }

        // Validate Zip Code
        const zipCode = document.getElementById('zip-code');
        if (zipCode.value.trim() === '') {
            this.setErrorFor(zipCode, 'Zip code cannot be blank');
            isValid = false;
        } else if (!this.isValidZipCode(zipCode.value.trim())) {
            this.setErrorFor(zipCode, 'Zip code is not valid');
            isValid = false;
        } else {
            this.setSuccessFor(zipCode);
        }

        return isValid;
    },

    validateCreditCard() {
        let isValid = true;

        // Check Card Number
        const cardNumber = document.getElementById('cc-number');
        if (cardNumber.value.trim() === '') {
            this.setErrorFor(cardNumber, 'Card number cannot be blank');
            isValid = false;
        } else if (!this.isValidCardNumber(cardNumber.value.trim())) {
            this.setErrorFor(cardNumber, 'Invalid card number');
            isValid = false;
        } else {
            this.setSuccessFor(cardNumber);
        }

        // Check Expiration
        const expiration = document.getElementById('cc-expiration');
        if (expiration.value.trim() === '') {
            this.setErrorFor(expiration, 'Expiration date cannot be blank');
            isValid = false;
        } else if (!this.isValidExpiration(expiration.value.trim())) {
            this.setErrorFor(expiration, 'Invalid expiration date');
            isValid = false;
        } else {
            this.setSuccessFor(expiration);
        }

        // Check CVV
        const cvv = document.getElementById('cc-cvv');
        if (cvv.value.trim() === '') {
            this.setErrorFor(cvv, 'CVV cannot be blank');
            isValid = false;
        } else if (!this.isValidCVV(cvv.value.trim())) {
            this.setErrorFor(cvv, 'Invalid CVV');
            isValid = false;
        } else {
            this.setSuccessFor(cvv);
        }

        // Check Name on Card
        const nameOnCard = document.getElementById('cc-name');
        if (nameOnCard.value.trim() === '') {
            this.setErrorFor(nameOnCard, 'Name on card cannot be blank');
            isValid = false;
        } else {
            this.setSuccessFor(nameOnCard);
        }

        return isValid;
    },

    setErrorFor(input, message) {
        const formControl = input.parentElement;
        const small = formControl.querySelector('small');
        if (!small) {
            const errorElement = document.createElement('small');
            errorElement.className = 'text-danger';
            errorElement.innerText = message;
            formControl.appendChild(errorElement);
        } else {
            small.innerText = message;
            small.style.display = 'block';
        }
        if (input.tagName.toLowerCase() === 'select') {
            input.className = 'form-select is-invalid';
        } else {
            input.className = 'form-control is-invalid';
        }
    },

    setSuccessFor(input) {
        const formControl = input.parentElement;
        const small = formControl.querySelector('small');
        if (small) {
            small.style.display = 'none';
        }
        if (input.tagName.toLowerCase() === 'select') {
            input.className = 'form-select is-valid';
        } else {
            input.className = 'form-control is-valid';
        }
    },

    isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    },

    isValidPhone(phone) {
        return /^\d{10}$/.test(phone);
    },

    isValidZipCode(zipCode) {
        return /^\d{5}(-\d{4})?$/.test(zipCode);
    },

    isValidCardNumber(number) {
        return /^[0-9]{13,19}$/.test(number);
    },

    isValidExpiration(exp) {
        return /^(0[1-9]|1[0-2])\/([0-9]{2})$/.test(exp);
    },

    isValidCVV(cvv) {
        return /^[0-9]{3,4}$/.test(cvv);
    }
};
