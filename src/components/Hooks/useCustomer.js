import { useState, useCallback } from "react";
import { message } from "antd";

const API_BASE_URL = "http://localhost:5000/api";

export default function useCustomer() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  const token = localStorage.getItem("token");

  const fetchCustomers = useCallback(async (page = 1, pageSize = 10) => {
    setLoading(true);
    try {
      const res = await fetch(
        `${API_BASE_URL}/Customer?pageNumber=${page}&pageSize=${pageSize}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);

      const data = await res.json();
      if (!data || !data.data)
        throw new Error("Phản hồi từ API không hợp lệ");

      const items = (data.data.items || []).map((c) => ({
        ...c,
        customerId: Number(c.customerId),
      }));

      setCustomers(items);
      setPagination({
        current: data.data.pageNumber || page,
        pageSize: data.data.pageSize || pageSize,
        total: data.data.totalCount || items.length,
      });
    } catch (error) {
      message.error("❌ Lỗi khi tải danh sách khách hàng: " + error.message);
      console.error(error);
    } finally {
      setTimeout(() => setLoading(false), 800);
    }
  }, [token]);

  const findCustomerByPhone = useCallback(async (phone) => {
    if (!phone) return null;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/Customer/by-phone/${phone}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.status === 404) {
        message.warning("Không tìm thấy khách hàng này!");
        return null;
      }

      if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);

      const data = await res.json();
      return data?.data || null;
    } catch (error) {
      message.error("Lỗi khi tìm khách hàng: " + error.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [token]);

  // ➕ Thêm khách hàng mới
  const addCustomer = useCallback(async (newCustomer) => {
    if (!newCustomer) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/Customer`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newCustomer),
      });

      if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);

      const data = await res.json();
      message.success("✅ Thêm khách hàng thành công!");
      return data?.data || null;
    } catch (error) {
      message.error("❌ Lỗi khi thêm khách hàng: " + error.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [token]);

  return {
    customers,
    loading,
    pagination,
    fetchCustomers,
    findCustomerByPhone,
    addCustomer,
  };
}
