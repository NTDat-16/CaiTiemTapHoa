import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { message } from "antd";

export function printInvoice(orderData) {
  // 1️⃣ Tạo HTML hóa đơn tạm thời
  const invoiceContent = document.createElement("div");
  invoiceContent.style.width = "80mm";
  invoiceContent.style.padding = "10px";
  invoiceContent.style.fontFamily = "monospace";
  invoiceContent.style.background = "#fff";
  invoiceContent.style.color = "#000";
  invoiceContent.style.fontSize = "12px";
  invoiceContent.style.lineHeight = "1.3";

  // Dữ liệu tính toán
  const { orderId, customerName, orderDetails, subtotal, discountAmount, totalAmount, customerPaid } = orderData;
  const change = Math.max(0, customerPaid - totalAmount);

  // 2️⃣ HTML template đẹp hơn
  invoiceContent.innerHTML = `
    <div style="text-align:center;">
      <h2 style="margin:0; font-size:15px;">CỬA HÀNG ABC</h2>
      <p style="margin:2px 0;">ĐC: 123 Đường Sài Gòn, TP.HCM</p>
      <p style="margin:2px 0;">ĐT: 0987.654.321</p>
    </div>
    <hr style="border-top:1px dashed #000; margin:8px 0;">
    <div>
      <p style="margin:2px 0;">Mã đơn: <strong>${orderId || "N/A"}</strong></p>
      <p style="margin:2px 0;">Ngày: ${new Date().toLocaleString("vi-VN")}</p>
      <p style="margin:2px 0;">Khách hàng: <strong>${customerName || "Khách vãng lai"}</strong></p>
    </div>
    <hr style="border-top:1px dashed #000; margin:8px 0;">

    <table style="width:100%; border-collapse:collapse; font-size:12px;">
      <thead>
        <tr>
          <th style="text-align:left;">Tên SP</th>
          <th style="text-align:center;">SL</th>
          <th style="text-align:right;">Thành tiền</th>
        </tr>
      </thead>
      <tbody>
        ${orderDetails
          .map(
            (item) => `
          <tr>
            <td style="text-align:left;">${item.productName}</td>
            <td style="text-align:center;">${item.quantity}</td>
            <td style="text-align:right;">${(item.price * item.quantity).toLocaleString("vi-VN")} ₫</td>
          </tr>`
          )
          .join("")}
      </tbody>
    </table>

    <hr style="border-top:1px dashed #000; margin:8px 0;">
    <div style="display:flex; justify-content:space-between;"><span>Tổng tiền hàng:</span><span>${subtotal.toLocaleString("vi-VN")} ₫</span></div>
    <div style="display:flex; justify-content:space-between;"><span>Giảm giá:</span><span>- ${discountAmount.toLocaleString("vi-VN")} ₫</span></div>
    <div style="border-top:1px dashed #000; margin:5px 0;"></div>
    <div style="display:flex; justify-content:space-between; font-weight:bold; font-size:14px;">
      <span>KHÁCH CẦN TRẢ:</span><span>${totalAmount.toLocaleString("vi-VN")} ₫</span>
    </div>
    <div style="display:flex; justify-content:space-between; margin-top:4px;">
      <span>Khách đưa:</span><span>${customerPaid.toLocaleString("vi-VN")} ₫</span>
    </div>
    <div style="display:flex; justify-content:space-between;">
      <span>Tiền thừa:</span><span>${change.toLocaleString("vi-VN")} ₫</span>
    </div>
    <hr style="border-top:1px dashed #000; margin:8px 0;">
    <p style="text-align:center; font-size:11px; margin:0;">Cảm ơn quý khách!</p>
    <p style="text-align:center; font-size:11px; margin:0;">Hẹn gặp lại!</p>
  `;

  // 3️⃣ Render ra PDF
  document.body.appendChild(invoiceContent);

  html2canvas(invoiceContent, {
    scale: 3,
    useCORS: true,
    logging: false,
  })
    .then((canvas) => {
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: [80, (canvas.height * 80) / canvas.width],
      });

      const imgWidth = 80;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);

      const filename = `HoaDon-${orderId || "BanLe"}-${Date.now()}.pdf`;
      pdf.save(filename);

      message.success("✅ Hóa đơn đã được tạo thành công!");
    })
    .catch((err) => {
      console.error("Lỗi tạo PDF:", err);
      message.error("Lỗi khi tạo file PDF!");
    })
    .finally(() => {
      document.body.removeChild(invoiceContent);
    });
}

export default printInvoice;
