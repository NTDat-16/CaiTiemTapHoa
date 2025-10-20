import { useState, useEffect, useCallback } from "react";
import { message } from "antd";

// Dữ liệu mock fallback
const mockPromotions = [
  { promo_id: 1, promo_code: "KM10", discount_type: "percent", discount_value: 10, name: "Giảm 10%" },
  { promo_id: 2, promo_code: "FREESHIP", discount_type: "amount", discount_value: 20000, name: "Giảm 20K" },
];

const API_BASE_URL = "http://localhost:5000/api";

const getAuthToken = () => localStorage.getItem("token");

export default function useFetchPromotions() {
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const fetchPromotions = useCallback(async () => {
    setLoading(true);
    setErrorMessage("");

    const token = getAuthToken();
    if (!token) {
      message.warning("Không tìm thấy token, đang sử dụng dữ liệu mẫu.");
      setPromotions(mockPromotions);
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/Promotion`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 401) {
        message.error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
        throw new Error("Unauthorized");
      }

      if (!response.ok) {
        const detail = await response.text();
        throw new Error(`HTTP ${response.status}: ${detail}`);
      }

      const apiResult = await response.json();

      // ✅ Kiểm tra và ánh xạ dữ liệu
      if (apiResult?.data && Array.isArray(apiResult.data.items)) {
        const mappedPromotions = apiResult.data.items.map((item) => ({
          promo_id: item.promoId,
          promo_code: item.promoCode,
          description: item.description,
          discount_type: item.discountType,
          discount_value: item.discountValue,
          start_date: item.startDate,
          end_date: item.endDate,
          min_order_amount: item.minOrderAmount,
          usage_limit: item.usageLimit,
          used_count: item.usedCount ?? 0,
          status: item.status,
          name: item.name || item.promoCode,
        }));

        setPromotions(mappedPromotions);
        message.success("Tải dữ liệu khuyến mãi thành công!");
      } else {
        console.warn("⚠️ Dữ liệu API không hợp lệ:", apiResult);
        setPromotions(mockPromotions);
        throw new Error("Không tìm thấy data.items trong phản hồi API.");
      }
    } catch (error) {
      console.error("🚨 Lỗi khi tải khuyến mãi:", error);
      setErrorMessage(
        error.message.includes("Unauthorized")
          ? "Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại."
          : "Không thể tải dữ liệu khuyến mãi."
      );
      setPromotions(mockPromotions);
    } finally {
      setLoading(false);
    }
  }, []);

  // 🧭 Gọi khi component mount
  useEffect(() => {
    fetchPromotions();
  }, [fetchPromotions]);

  return { promotions, loading, errorMessage, refetch: fetchPromotions };
}
