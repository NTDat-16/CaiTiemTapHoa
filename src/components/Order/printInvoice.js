import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
const printInvoice = (orderData) => {
    // 1. Tạo một container HTML tạm thời cho hóa đơn
    const invoiceContent = document.createElement('div');
    // ... (nội dung HTML giữ nguyên)
    invoiceContent.innerHTML = `
        <h3 style="text-align: center; margin-bottom: 5px;">CỬA HÀNG ABC</h3>
        <p style="text-align: center; font-size: 10px;">Địa chỉ: 123 Đường Sài Gòn, TP.HCM</p>
        <p style="text-align: center; font-size: 10px;">ĐT: 0987.654.321</p>
        <hr style="border-top: 1px dashed #000; margin: 10px 0;">
        <h4 style="text-align: center; margin-bottom: 10px;">HÓA ĐƠN BÁN HÀNG</h4>
        <p style="font-size: 12px; margin: 2px 0;">Mã đơn: **${orderData.orderId || 'N/A'}**</p>
        <p style="font-size: 12px; margin: 2px 0;">Ngày: ${new Date().toLocaleDateString('vi-VN')} ${new Date().toLocaleTimeString('vi-VN')}</p>
        <p style="font-size: 12px; margin: 2px 0;">Khách hàng: **${orderData.customerName || 'Khách vãng lai'}**</p>
        <hr style="border-top: 1px dashed #000; margin: 10px 0;">
        <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
            <thead>
                <tr>
                    <th style="text-align: left; padding-bottom: 5px;">SP</th>
                    <th style="text-align: center; padding-bottom: 5px;">SL</th>
                    <th style="text-align: right; padding-bottom: 5px;">Thành tiền</th>
                </tr>
            </thead>
            <tbody>
                ${orderData.orderDetails.map(item => `
                    <tr>
                        <td style="text-align: left; max-width: 150px; word-break: break-all;">${item.productName || 'Sản phẩm'}</td>
                        <td style="text-align: center;">${item.quantity}</td>
                        <td style="text-align: right;">${(item.quantity * item.price).toLocaleString('vi-VN')}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
        <hr style="border-top: 1px dashed #000; margin: 10px 0;">
        <p style="font-size: 12px; margin: 2px 0; display: flex; justify-content: space-between;"><span>Tổng tiền hàng:</span> <span>${orderData.subtotal.toLocaleString('vi-VN')} ₫</span></p>
        <p style="font-size: 12px; margin: 2px 0; display: flex; justify-content: space-between;"><span>Giảm giá:</span> <span>- ${orderData.discountAmount.toLocaleString('vi-VN')} ₫</span></p>
        <hr style="border-top: 1px dashed #000; margin: 5px 0;">
        <p style="font-weight: bold; font-size: 14px; margin: 5px 0; display: flex; justify-content: space-between;"><span>KHÁCH CẦN TRẢ:</span> <span>${orderData.totalAmount.toLocaleString('vi-VN')} ₫</span></p>
        <p style="font-size: 12px; margin: 2px 0; display: flex; justify-content: space-between;"><span>Khách đã đưa:</span> <span>${orderData.customerPaid.toLocaleString('vi-VN')} ₫</span></p>
        <p style="font-size: 12px; margin: 2px 0; display: flex; justify-content: space-between;"><span>Tiền thừa:</span> <span>${Math.max(0, orderData.customerPaid - orderData.totalAmount).toLocaleString('vi-VN')} ₫</span></p>
        <hr style="border-top: 1px dashed #000; margin: 10px 0;">
        <p style="text-align: center; font-size: 10px; margin-top: 10px;">Cảm ơn quý khách và hẹn gặp lại!</p>
    `;

    // Phải thêm vào body để html2canvas hoạt động, sau đó xóa
    document.body.appendChild(invoiceContent);

    // 2. Chuyển HTML thành Canvas/Image
    html2canvas(invoiceContent, {
        scale: 2, // Tăng chất lượng hình ảnh
        useCORS: true,
        logging: false
    }).then(canvas => {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: [80, canvas.height * 80 / canvas.width] // Chiều rộng 80mm (thường dùng cho máy in nhiệt)
        });

        const imgWidth = 80;
        const imgHeight = canvas.height * imgWidth / canvas.width;

        pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);

        // 3. Tải file PDF và cho phép người dùng chọn chỗ lưu
        const filename = `HoaDon-${orderData.orderId || 'BanLe'}-${new Date().getTime()}.pdf`;
        pdf.save(filename); 
        
        // 4. Xóa nội dung HTML tạm thời
        document.body.removeChild(invoiceContent);
        message.success("Đã tạo file hóa đơn PDF!");

    }).catch(error => {
        console.error("Lỗi khi tạo PDF:", error);
        document.body.removeChild(invoiceContent); // Đảm bảo dọn dẹp
        message.error("Lỗi khi tạo file PDF.");
    });
};

// Đảm bảo import 2 thư viện jspdf và html2canvas ở đầu file Order.jsx
// import jsPDF from 'jspdf';
// import html2canvas from 'html2canvas'; 
// (nếu bạn đặt hàm này ở file helper, nhớ export nó ra)