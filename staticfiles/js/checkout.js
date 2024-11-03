// Khởi tạo khi DOM đã load xong
document.addEventListener('DOMContentLoaded', function () {
    // Khai báo các biến DOM elements
    const form = document.getElementById('billing-form');
    const proceedButton = document.getElementById('proceed-button');
    const creditCardFields = document.getElementById('credit-card-fields');
    const creditCardOption = document.getElementById('pay-methodoption1');
    const cashDeliveryOption = document.getElementById('pay-methodoption3');
    const exportPDFButton = document.getElementById('exportPDF');
    const exportTextButton = document.getElementById('exportText');
    const dropdownButton = document.getElementById('exportDropdown');

    // Khởi tạo dropdown Bootstrap
    new bootstrap.Dropdown(dropdownButton);
    console.log('Found PDF button:', exportPDFButton); // Kiểm tra button có tồn tại

    // Đảm bảo rằng các elements tồn tại trước khi khởi tạo
    if (dropdownButton) {
        // Khởi tạo tất cả các dropdowns trên trang
        const dropdowns = document.querySelectorAll('.dropdown-toggle');
        dropdowns.forEach(dropdown => {
            new bootstrap.Dropdown(dropdown);
        });
    }

    // Xử lý sự kiện xuất hóa đơn
    if (exportPDFButton) {
        exportPDFButton.addEventListener('click', function (e) {
            e.preventDefault();
            console.log('Clicked PDF export');
            console.log('Event triggered:', e); // Thêm log chi tiết event
            exportInvoice('pdf');
        });
    } else {
        console.log('PDF button not found'); // Log nếu không tìm thấy button
    }

    if (exportTextButton) {
        exportTextButton.addEventListener('click', function (e) {
            e.preventDefault();
            console.log('Clicked Text export');
            exportInvoice('text');
        });
    }

    // Kiểm tra hiển thị modal
    $('#invoice-details-modal').on('shown.bs.modal', function () {
        console.log('Modal shown');
    });

    // Xử lý nút Proceed
    proceedButton.addEventListener('click', function (event) {
        event.preventDefault();
        if (validateForm()) {
            if (creditCardOption.checked) {
                if (validateCreditCard()) {
                    submitFormData();
                    $('#confirmation-popup').modal('show');
                }
            } else {
                submitFormData();
                $('#confirmation-popup').modal('show');
            }
        }
    });

    // Xử lý nút xác nhận đơn hàng
    document.getElementById('confirm-order').addEventListener('click', function () {
        $('#confirmation-popup').modal('hide');
        //submitFormData();
        showInvoiceDetails();
    });

    // Validation form chính
    function validateForm() {
        let isValid = true;

        // Validate từng trường
        const fields = {
            'billing-name': {
                validate: (value) => value.trim() !== '',
                message: 'Tên không được để trống'
            },
            'billing-email-address': {
                validate: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
                message: 'Email không hợp lệ'
            },
            'billing-phone': {
                validate: (value) => /^\d{10}$/.test(value),
                message: 'Số điện thoại không hợp lệ'
            },
            'billing-address': {
                validate: (value) => value.trim() !== '',
                message: 'Địa chỉ không được để trống'
            },
            'billing-city': {
                validate: (value) => value.trim() !== '',
                message: 'Thành phố không được để trống'
            },
            'zip-code': {
                validate: (value) => /^\d{5}(-\d{4})?$/.test(value),
                message: 'Mã bưu điện không hợp lệ'
            }
        };

        Object.keys(fields).forEach(fieldId => {
            const input = document.getElementById(fieldId);
            const { validate, message } = fields[fieldId];

            if (!validate(input.value)) {
                setErrorFor(input, message);
                isValid = false;
            } else {
                setSuccessFor(input);
            }
        });

        return isValid;
    }

    // Validation thẻ tín dụng
    function validateCreditCard() {
        let isValid = true;

        const cardFields = {
            'cc-number': {
                validate: (value) => /^[0-9]{13,19}$/.test(value),
                message: 'Số thẻ không hợp lệ'
            },
            'cc-expiration': {
                validate: (value) => /^(0[1-9]|1[0-2])\/([0-9]{2})$/.test(value),
                message: 'Ngày hết hạn không hợp lệ'
            },
            'cc-cvv': {
                validate: (value) => /^[0-9]{3,4}$/.test(value),
                message: 'Mã CVV không hợp lệ'
            },
            'cc-name': {
                validate: (value) => value.trim() !== '',
                message: 'Tên trên thẻ không được để trống'
            }
        };

        Object.keys(cardFields).forEach(fieldId => {
            const input = document.getElementById(fieldId);
            const { validate, message } = cardFields[fieldId];

            if (!validate(input.value)) {
                setErrorFor(input, message);
                isValid = false;
            } else {
                setSuccessFor(input);
            }
        });

        return isValid;
    }

    // Cập nhật thông tin shipping
    function updateShippingInfo() {
        const fields = {
            'shipping-name': 'billing-name',
            'shipping-address': 'billing-address',
            'shipping-phone': 'billing-phone',
            'shipping-email': 'billing-email-address',
            'shipping-zipcode': 'zip-code'
        };

        Object.keys(fields).forEach(displayId => {
            const input = document.getElementById(fields[displayId]);
            document.getElementById(displayId).textContent =
                `${displayId.split('-')[1].charAt(0).toUpperCase() + displayId.split('-')[1].slice(1)}: ${input.value}`;
        });

        document.getElementById('shipping-city-country').textContent =
            `City, Country: ${document.getElementById('billing-city').value}, ${document.querySelector('select[title="Country"]').value}`;
    }

    // Utility functions
    function setErrorFor(input, message) {
        const formControl = input.parentElement;
        const small = formControl.querySelector('small') || document.createElement('small');
        small.className = 'text-danger';
        small.innerText = message;
        formControl.appendChild(small);
        input.className = 'form-control is-invalid';
    }

    function setSuccessFor(input) {
        const formControl = input.parentElement;
        const small = formControl.querySelector('small');
        if (small) small.remove();
        input.className = 'form-control is-valid';
    }

    // Event listeners cho form
    const inputs = form.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
        input.addEventListener('input', updateShippingInfo);
        input.addEventListener('change', updateShippingInfo);
    });

    // Xử lý hiển thị/ẩn fields thẻ tín dụng
    function toggleCreditCardFields() {
        if (creditCardOption.checked) {
            creditCardFields.style.display = 'block';
        } else {
            creditCardFields.style.display = 'none';
        }
    }

    creditCardOption.addEventListener('change', toggleCreditCardFields);
    cashDeliveryOption.addEventListener('change', toggleCreditCardFields);
    toggleCreditCardFields();
});

// Xử lý submit form
function submitFormData() {
    const total = document.querySelector('.bg-light td:last-child').textContent.replace(/[^0-9]/g, '');

    const formData = {
        form: {
            name: document.getElementById('billing-name').value,
            email: document.getElementById('billing-email-address').value,
            total: total
        },
        shipping: {
            address: document.getElementById('billing-address').value,
            city: document.getElementById('billing-city').value,
            country: document.querySelector('select[title="Country"]').value,
            zipcode: document.getElementById('zip-code').value
        },
        client: {
            name: document.getElementById('billing-name').value,
            email: document.getElementById('billing-email-address').value,
            phone: document.getElementById('billing-phone').value
        }
    };

    fetch("/process_order/", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrftoken,
        },
        body: JSON.stringify(formData)
    })
        .then(response => response.json())
        .then(data => {
            console.log('Success:', data);
            $('#success-popup').modal('show');
            cart = {};
            document.cookie = 'cart=' + JSON.stringify(cart) + ";domain=;path=/";
        });
}

// Hiển thị chi tiết hóa đơn
function showInvoiceDetails() {
    const now = new Date();
    const dateTimeString = now.toLocaleString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });

    const shippingInfo = document.querySelector('.card-radio').innerHTML
        .replace(/([^:]+):/g, '<strong>$1:</strong>');

    document.getElementById('invoice-shipping-info').innerHTML = shippingInfo;
    document.getElementById('invoice-order-summary').innerHTML =
        document.querySelector('.checkout-order-summary .table-responsive').innerHTML;
    document.getElementById('invoice-date-time').textContent = 'Ngày đặt hàng: ' + dateTimeString;

    $('#invoice-details-modal').modal('show');
}

// Xuất hóa đơn
function exportInvoice(type) {
    console.log('Starting export:', type);
    let content = generateInvoiceContent();
    console.log('Content generated:', content);

    if (type === 'pdf') {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        doc.setFont('helvetica');
        doc.setFontSize(10);
        const lines = doc.splitTextToSize(content, 180);
        doc.text(lines, 10, 10);
        doc.save('invoice.pdf');
    } else {
        const blob = new Blob(["\ufeff" + content], { type: "text/plain;charset=utf-8" });
        saveAs(blob, "invoice.txt");
    }
}

// Tạo nội dung hóa đơn
function generateInvoiceContent() {
    let content = "-----------------------\n";
    content += "\t\t\t\t\t\t                                                 HÓA ĐƠN\n\n";
    content += "Ngày đặt hàng: " + new Date().toLocaleString('vi-VN') + '\n\n';

    // Thông tin khách hàng
    content += "THÔNG TIN KHÁCH HÀNG:\n";
    content += `Tên: ${document.getElementById('billing-name').value}\n`;
    content += `Địa chỉ: ${document.getElementById('billing-address').value}\n`;
    content += `Thành phố/Quốc gia: ${document.getElementById('billing-city').value}, ${document.querySelector('select[title="Country"]').value}\n`;
    content += `Mã bưu điện: ${document.getElementById('zip-code').value}\n`;
    content += `Điện thoại: ${document.getElementById('billing-phone').value}\n`;
    content += `Email: ${document.getElementById('billing-email-address').value}\n\n`;

    // Chi tiết đơn hàng
    content += "CHI TIẾT ĐƠN HÀNG:\n";
    content += "-".repeat(80) + "\n";
    content += "Sản phẩm".padEnd(40) + "Số lượng".padEnd(15) + "Đơn giá".padEnd(15) + "Thành tiền\n";
    content += "-".repeat(80) + "\n";

    // Thêm từng sản phẩm
    const orderSummary = document.getElementById('invoice-order-summary').querySelectorAll('tr');
    orderSummary.forEach((row, index) => {
        if (index < orderSummary.length - 3) {
            const columns = row.querySelectorAll('td, th');
            content += columns[1].innerText.padEnd(40) +
                "1".padEnd(15) +
                columns[2].innerText.padEnd(15) +
                columns[2].innerText + "\n";
        }
    });

    // Tổng cộng
    content += "-".repeat(80) + "\n";
    content += "Tổng tiền hàng:".padEnd(70) +
        orderSummary[orderSummary.length - 3].querySelectorAll('td')[1].innerText + "\n";
    content += "Thuế:".padEnd(70) +
        orderSummary[orderSummary.length - 2].querySelectorAll('td')[1].innerText + "\n";
    content += "Tổng thanh toán:".padEnd(70) +
        orderSummary[orderSummary.length - 1].querySelectorAll('td')[1].innerText + "\n";

    content += "\n\n@shopabc\n";
    content += "-----------------------\n";

    return content;


}