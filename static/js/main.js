// Định nghĩa các hằng số
const CONSTANTS = {
    CREDIT_CARD_OPTION_ID: 'pay-methodoption1',
    CASH_DELIVERY_OPTION_ID: 'pay-methodoption3',
    PROCEED_BUTTON_ID: 'proceed-button',
    CONFIRM_ORDER_ID: 'confirm-order',
    EXPORT_PDF_ID: 'exportPDF',
    EXPORT_TEXT_ID: 'exportText',
    SUCCESS_POPUP_ID: 'success-popup',
    CONFIRMATION_POPUP_ID: 'confirmation-popup',
    INVOICE_DETAILS_MODAL_ID: 'invoice-details-modal'
};

document.addEventListener('DOMContentLoaded', () => {
    // Khởi tạo các tương tác UI
    UIInteractions.initializeModals();
    UIInteractions.toggleCreditCardFields();

    // Xử lý sự kiện khi nhấn nút Proceed
    const proceedButton = document.getElementById(CONSTANTS.PROCEED_BUTTON_ID);
    proceedButton.addEventListener('click', async (event) => {
        event.preventDefault();
        if (FormValidation.validateForm()) {
            const creditCardOption = document.getElementById(CONSTANTS.CREDIT_CARD_OPTION_ID);
            if (creditCardOption.checked) {
                if (FormValidation.validateCreditCard()) {
                    await PaymentProcessing.submitFormData();
                    $('#' + CONSTANTS.CONFIRMATION_POPUP_ID).modal('show');
                }
            } else {
                await PaymentProcessing.submitFormData();
                $('#' + CONSTANTS.CONFIRMATION_POPUP_ID).modal('show');
            }
        }
    });

    // Xử lý sự kiện khi xác nhận đơn hàng
    document.getElementById(CONSTANTS.CONFIRM_ORDER_ID).addEventListener('click', () => {
        $('#' + CONSTANTS.CONFIRMATION_POPUP_ID).modal('hide');
        PaymentProcessing.submitFormData();
        InvoiceGeneration.showInvoiceDetails();
    });

    // Xử lý sự kiện khi xuất hóa đơn PDF
    document.getElementById(CONSTANTS.EXPORT_PDF_ID).addEventListener('click', () => {
        InvoiceGeneration.exportInvoice('pdf');
    });

    // Xử lý sự kiện khi xuất hóa đơn Text
    document.getElementById(CONSTANTS.EXPORT_TEXT_ID).addEventListener('click', () => {
        InvoiceGeneration.exportInvoice('text');
    });

    // Xử lý sự kiện khi form thay đổi
    const form = document.getElementById('billing-form');
    const inputs = form.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
        input.addEventListener('input', PaymentProcessing.updateShippingInfo);
        input.addEventListener('change', PaymentProcessing.updateShippingInfo);
    });

    // Khởi tạo PayPal button
    paypal.Buttons({
        style: {
            color: 'blue',
            shape: 'rect',
        },
        createOrder: function (data, actions) {
            return actions.order.create({
                purchase_units: [{
                    amount: {
                        value: parseFloat(total).toFixed(2)
                    }
                }]
            });
        },
        onApprove: function (data, actions) {
            return actions.order.capture().then(function (details) {
                PaymentProcessing.submitFormData();
            });
        }
    }).render('#paypal-button-container');
});
