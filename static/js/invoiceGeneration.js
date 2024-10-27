const InvoiceGeneration = {
    showInvoiceDetails() {
        // Lấy ngày giờ hiện tại
        var now = new Date();
        var dateTimeString = now.toLocaleString('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });

        // Lấy thông tin giao hàng và định dạng lại
        var shippingInfo = document.querySelector('.card-radio').innerHTML;
        shippingInfo = shippingInfo.replace(/([^:]+):/g, '<strong>$1:</strong>');

        // Lấy tóm tắt đơn hàng
        var orderSummary = document.querySelector('.checkout-order-summary .table-responsive').innerHTML;

        // Điền thông tin vào modal chi tiết hóa đơn
        document.getElementById('invoice-shipping-info').innerHTML = shippingInfo;
        document.getElementById('invoice-order-summary').innerHTML = orderSummary;
        document.getElementById('invoice-date-time').textContent = 'Ngày đặt hàng: ' + dateTimeString;

        // Hiển thị modal chi tiết hóa đơn
        $('#invoice-details-modal').modal('show');
    },

    exportInvoice(type) {
        var content = "-----------------------\n\n";
        content += "\t\t\t\t\t\t                                                 INVOICE  ID:\n\n";
        content += "Order date: " + new Date().toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' }) + '\n\n\n';

        content += "Customer :\n";
        content += "Name: " + document.getElementById('billing-name').value + '\n';
        content += "Address: " + document.getElementById('billing-address').value + '\n';
        content += "City, Country: " + document.getElementById('billing-city').value + ', ' +
            document.querySelector('select[title="Country"]').value + '\n';
        content += "Postal Code: " + document.getElementById('zip-code').value + '\n';
        content += "Phone: " + document.getElementById('billing-phone').value + '\n';
        content += "Email: " + document.getElementById('billing-email-address').value + '\n\n\n';

        content += "Order Details:\n";
        content += "-------------------------------------------------------------------------------------------------------------------------------------------------\n";
        content += "Product                           \t   |    Quantity    |            Unit Price          |            Total        \n";
        content += "-------------------------------------------------------------------------------------------------------------------------------------------------\n";

        var orderSummary = document.getElementById('invoice-order-summary').querySelectorAll('tr');
        orderSummary.forEach(function (row, index) {
            if (index < orderSummary.length - 3) {
                var columns = row.querySelectorAll('td, th');
                var productInfo = columns[1].innerText;
                content += productInfo.padEnd(50) + "~~|\t" +
                    "-".padEnd(20) + "\t|" +
                    "1".padEnd(15) + "B|" +
                    columns[2].innerText.padEnd(30) + "|C" +
                    columns[2].innerText.padEnd(25) + "\n";

                content += "---------------------------------------------------------------------------------------------------------------------------------\n";
            }
        });

        content += "Total:                              |" + " ".repeat(45) + orderSummary[orderSummary.length - 3].querySelectorAll('td')[1].innerText.padStart(20) + "\n";
        content += "---------------------------------------------------------------------------------------------------------------------------------\n";
        content += "                                            |\n";
        content += "Estimated Tax:                      |" + " ".repeat(45) + orderSummary[orderSummary.length - 2].querySelectorAll('td')[1].innerText.padStart(20) + "\n";
        content += "------------------------------------------------------------------------  ---------------------------------------------------------\n";
        content += "Total Payment:                      |" + " ".repeat(45) + orderSummary[orderSummary.length - 1].querySelectorAll('td')[1].innerText.padStart(20) + "\n\n\n\n";

        content += "----------------------\n";
        content += "@shopabc\n";

        if (type === 'pdf') {
            var doc = new jsPDF();
            doc.addFont("{% static 'fonts/Montserrat-Black.ttf' %}", 'Montserrat', 'normal');
            doc.setFont('Montserrat Black');
            doc.setFontSize(10);
            var lines = doc.splitTextToSize(content, 180);
            doc.text(lines, 10, 10);
            doc.save('invoice.pdf');
        } else {
            var blob = new Blob(["\ufeff" + content], { type: "text/plain;charset=utf-8" });
            saveAs(blob, "invoice.txt");
        }
    }
};
