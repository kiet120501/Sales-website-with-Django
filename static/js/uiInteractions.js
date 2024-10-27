const UIInteractions = {
    initializeModals() {
        $(document).ready(function () {
            $('[data-bs-toggle="modal"]').on('click', function () {
                var target = $(this).data('bs-target');
                $(target).modal('show');
            });

            $('#invoice-details-modal').modal({
                show: false
            });
        });
    },

    toggleCreditCardFields() {
        const creditCardFields = document.getElementById('credit-card-fields');
        const creditCardOption = document.getElementById('pay-methodoption1');
        const cashDeliveryOption = document.getElementById('pay-methodoption3');

        function toggleFields() {
            if (creditCardOption.checked) {
                creditCardFields.style.display = 'block';
            } else {
                creditCardFields.style.display = 'none';
            }
        }

        creditCardOption.addEventListener('change', toggleFields);
        cashDeliveryOption.addEventListener('change', toggleFields);

        // Initial check
        toggleFields();
    },

    showSuccessPopup() {
        $('#success-popup').modal('show');
    },

    showConfirmationPopup() {
        $('#confirmation-popup').modal('show');
    },

    hideConfirmationPopup() {
        $('#confirmation-popup').modal('hide');
    },

    showInvoiceDetailsModal() {
        $('#invoice-details-modal').modal('show');
    },

    updateShippingInfo() {
        document.getElementById('shipping-name').textContent = 'Name: ' + document.getElementById('billing-name').value;
        document.getElementById('shipping-address').textContent = 'Address: ' + document.getElementById('billing-address').value;
        document.getElementById('shipping-city-country').textContent = 'City, Country: ' +
            document.getElementById('billing-city').value + ', ' +
            document.querySelector('select[title="Country"]').value;
        document.getElementById('shipping-zipcode').textContent = 'Zip Code: ' + document.getElementById('zip-code').value;
        document.getElementById('shipping-phone').textContent = 'Phone: ' + document.getElementById('billing-phone').value;
        document.getElementById('shipping-email').textContent = 'Email: ' + document.getElementById('billing-email-address').value;
    },

    setupFormListeners() {
        const form = document.getElementById('billing-form');
        const inputs = form.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            input.addEventListener('input', this.updateShippingInfo);
            input.addEventListener('change', this.updateShippingInfo);
        });
    }
};

// Khởi tạo các tương tác UI khi trang được load
document.addEventListener('DOMContentLoaded', function () {
    UIInteractions.initializeModals();
    UIInteractions.toggleCreditCardFields();
    UIInteractions.setupFormListeners();
});
