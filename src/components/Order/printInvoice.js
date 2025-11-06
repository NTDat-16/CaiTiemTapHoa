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
  const { orderId, customerName, orderDetails, subtotal, discountAmount, totalAmount, customerPaid, cashierName } = orderData;
  const change = Math.max(0, customerPaid - totalAmount);

  // 2️⃣ HTML template đẹp hơn
  invoiceContent.innerHTML = `
    <div style="text-align:center;">
      <h2 style="margin:0; font-size:15px;">CAI TIEM TAP HOA</h2>
      <p style="margin:2px 0;">ĐC: 123 Đường Sài Gòn, TP.HCM</p>
      <p style="margin:2px 0;">SĐT: 0987.654.321</p>
      <hr style="border-top:1px dashed #000; margin:8px auto; width: 50%;">
    </div>
    <div style="text-align:center;">
      <p style="margin:2px 0;">HÓA ĐƠN THANH TOÁN</p>
      <p style="margin:2px 0;">Số: <strong>HĐ${orderId || "N/A"}</strong></p>
      <p style="margin:2px 0;">Ngày: ${new Date().toLocaleString("vi-VN")}</p>
      <div style="text-align:left; margin-top:5px;">
        <p style="margin:2px 0;"><strong>Khách hàng: </strong>${customerName || "Khách vãng lai"}</p>
        <p style="margin:2px 0;"><strong>Thu ngân: </strong>${cashierName}</p>
        </div>
    </div>

    <table style="width:100%; border-collapse: collapse; font-size:12px; margin-top:8px;">
      <thead>
        <tr style="background-color:#f0f0f0;">
          <th style="text-align:left; padding:6px 8px; border-bottom:1px solid #000;">Tên SP</th>
          <th style="text-align:left; padding:6px 8px; border-bottom:1px solid #000;">Đơn giá</th>
          <th style="text-align:center; padding:6px 8px; border-bottom:1px solid #000;">SL</th>
          <th style="text-align:right; padding:6px 8px; border-bottom:1px solid #000;">TT</th>
        </tr>
      </thead>
      <tbody>
        ${orderDetails
          .map(
            (item) => `
        <tr>
          <td style="text-align:left; padding:4px 8px;">${item.productName}</td>
          <td style="text-align:left; padding:4px 8px;">${item.price.toLocaleString("vi-VN")}</td>
          <td style="text-align:center; padding:4px 8px;">${item.quantity}</td>
          <td style="text-align:right; padding:4px 8px;">${(item.price * item.quantity).toLocaleString("vi-VN")}</td>
        </tr>`
          )
          .join("")}
      </tbody>
    </table>
    <hr style="border-top:1px dashed #000; margin:8px 0;">
    <div style="display:flex; justify-content:space-between;">
      <span style="font-weight:700; color:#000;">Tổng tạm tính:</span>
      <span>${subtotal.toLocaleString("vi-VN")}</span>
    </div>    
    <div style="display:flex; justify-content:space-between;">
      <span style="font-weight:700; color:#000;">Giảm giá:</span>
      <span>${discountAmount.toLocaleString("vi-VN")}</span>
    </div>    
    <div style="display:flex; justify-content:space-between;">
      <span style="font-weight:700; color:#000;">Thành tiền:</span>
      <span>${totalAmount.toLocaleString("vi-VN")}</span>
    </div>    
    <div style="display:flex; justify-content:space-between;">
      <span style="font-weight:700; color:#000;">Khách đưa:</span>
      <span>${customerPaid.toLocaleString("vi-VN")}</span>
    </div>    
    <div style="display:flex; justify-content:space-between;">
      <span style="font-weight:700; color:#000;">Tiền thừa:</span>
      <span>${change.toLocaleString("vi-VN")}</span>
    </div>    
    <hr style="border-top:1px dashed #000; margin:8px auto; width: 50%;">
    <p style="text-align:center; font-size:12px; margin:0; font-weight:bold;">Xin cảm ơn, hẹn gặp lại quý khách!</p>
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
