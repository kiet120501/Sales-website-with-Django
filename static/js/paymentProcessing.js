const PaymentProcessing = {
    async submitFormData() {
        console.log('Payment button clicked');

        const userFormData = {
            'name': document.getElementById('billing-name').value,
            'email': document.getElementById('billing-email-address').value,
            'total': total,
        };

        const shippingInfo = {
            'address': document.getElementById('billing-address').value,
            'city': document.getElementById('billing-city').value,
            'country': document.querySelector('select[title="Country"]').value,
            'zipcode': document.getElementById('zip-code').value,
        };

        const clientInfo = {
            'name': document.getElementById('billing-name').value,
            'email': document.getElementById('billing-email-address').value,
            'phone': document.getElementById('billing-phone').value,
        };

        console.log('Shipping Info:', shippingInfo);
        console.log('User Info:', userFormData);

        const url = "/process_order/";
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': csrftoken,
                },
                body: JSON.stringify({ 'form': userFormData, 'shipping': shippingInfo, 'client': clientInfo }),
            });
            const data = await response.json();
            console.log('Success:', data);

            // Show success popup
            $('#success-popup').modal('show');

            cart = {};
            document.cookie = 'cart=' + JSON.stringify(cart) + ";domain=;path=/";

            // Uncomment the line below if you want to redirect after successful order
            // window.location.href = "{% url 'store' %}";
        } catch (error) {
            console.error('Error:', error);
        }
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

    initializePaymentListeners() {
        const form = document.getElementById('billing-form');
        const inputs = form.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            input.addEventListener('input', this.updateShippingInfo);
            input.addEventListener('change', this.updateShippingInfo);
        });
    }
};

// Initialize payment listeners when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    PaymentProcessing.initializePaymentListeners();
});
