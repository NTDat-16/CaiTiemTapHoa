import { useState, useEffect, useMemo, useCallback } from "react";
import {
  Form, Table, Row, Col, Input, Select, Button, Card, Modal, message, Space, Tag, Pagination, Spin,Divider, InputNumber
} from "antd";
import { SearchOutlined, DeleteOutlined, MinusOutlined, PlusOutlined, QrcodeOutlined } from "@ant-design/icons";
import "./Order.css";
import aquavoiem from "../../assets/aquavoiem.png";
import QR from "../../assets/QR.png";
import useFetchPromotions from "../Hooks/useFetchpPromotion";
import useCustomer from "../Hooks/useCustomer";
// import printInvoice from "./printInvoice";
  const { Option } = Select;


  // MOCK DATA (Vẫn giữ để đảm bảo fallback hoạt động)
  const mockProducts = [
    { product_id: 1, product_name: "Nước suối Aquafina 500ml", barcode: "8938505970025", price: 5000, unit: "chai", type: "do-uong", image_url: aquavoiem },
    { product_id: 2, product_name: "Bánh mì sandwich", barcode: "8934567823912", price: 15000, unit: "ổ", type: "thuc-pham", image_url: aquavoiem },
    { product_id: 3, product_name: "Coca-Cola lon 330ml", barcode: "8934823912345", price: 10000, unit: "lon", type: "do-uong", image_url: aquavoiem },
    { product_id: 4, product_name: "Kẹo cao su Doublemint", barcode: "8935049510011", price: 3000, unit: "gói", type: "gia-dung", image_url: aquavoiem },
    { product_id: 6, product_name: "Bia Saigon", barcode: "8935049510022", price: 18000, unit: "lon", type: "do-uong", image_url: aquavoiem },
    // ... thêm các sản phẩm mock khác
  ];

  const mockPromotions = [
    { promo_id: 1, promo_code: "KM10", discount_type: "percent", discount_value: 10, name: "Giảm 10%" },
    { promo_id: 2, promo_code: "FREESHIP", discount_type: "amount", discount_value: 20000, name: "Giảm 20K" },
  ];


const CATEGORY_MAP = {
    1: { name: "Đồ uống", slug: "do-uong" },
    2: { name: "Bánh kẹo", slug: "banh-keo" },
    3: { name: "Gia vị", slug: "gia-vi" },
    4: { name: "Đồ gia dụng", slug: "do-gia-dung" },
    5: { name: "Mỹ phẩm", slug: "my-pham" },
};

const getCategoryData = (id) => {
    return CATEGORY_MAP[id] || { name: "Khác", slug: "khac" };
};
const normalizeCategoryName = (name) => {
  if (!name) return "";
  return name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d").replace(/[^a-z0-9\s-]/g, "").trim().replace(/\s+/g, "-");
};

  const getAuthToken = () => {
      return localStorage.getItem('token');
  };

  const API_BASE_URL = "http://localhost:5000/api";
  const API_IMAGE = "http://localhost:5000";
const calculateDiscountAmount = (subtotal, selectedPromoId, promotions) => {
    const promoId = Number(selectedPromoId);
    const selectedPromo = promotions.find(p => p.promo_id === promoId);
    
    if (!selectedPromo || subtotal <= 0) {
        return 0;
    }

    // Lấy min_order_amount, mặc định là 0
    const minAmount = selectedPromo.min_order_amount || 0; 
    
    // Kiểm tra điều kiện đơn hàng tối thiểu
    if (subtotal < minAmount) {
        return 0; 
    }

    const { discount_type, discount_value } = selectedPromo;
    let discount = 0;
    
    // Xử lý cả "Fixed" (API) và "Percent"
    const type = discount_type.toLowerCase();

    if (type === "percent") {
        // Đã sửa: Dùng 'subtotal' (tham số truyền vào)
        discount = (subtotal * discount_value) / 100;
    } else if (type === "fixed" || type === "amount") { 
        discount = discount_value;
    }

    // Chiết khấu không được vượt quá Tổng phụ
    return Math.max(0, Math.min(discount, subtotal));
};
  const useFetchProducts = (page = 1, size = 25) => { 
    const [products, setProducts] = useState([]);
    const [promotions, setPromotions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [totalItems, setTotalItems] = useState(0); 

    const fetchProductsData = useCallback(async () => {
      setLoading(true);
      const token = getAuthToken(); 
      
      if (!token) {
          message.error("Không tìm thấy token. Vui lòng đăng nhập lại.");
          setProducts(mockProducts);
          setPromotions(mockPromotions);
          setLoading(false);
          return;
      }

      try {
          // Dùng page và size đã được cung cấp
            const response = await fetch(`${API_BASE_URL}/Products?PageNumber=${page}&PageSize=${size}`, {
              method: 'GET',
              headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`,
              },
          });

          if (!response.ok) {
              if (response.status === 401) {
                  message.error("Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại.");
              } else {
                  // Sửa: Dùng response.status thay vì response.statusText
                  message.error(`Lỗi khi lấy dữ liệu sản phẩm: ${response.status}`);
              }
              setProducts(mockProducts);
              setPromotions(mockPromotions);
              throw new Error(`HTTP error! status: ${response.status}`);
          }

          const result = await response.json(); 

          
              const fetchedProducts = Array.isArray(result?.data?.items)
              ? result.data.items.map(p => ({
                  ...p,
                 product_id: p.productId || p.product?.productId, 
                product_name: p.productName || p.product?.productName,
                price: p.price || p.product?.price,
                unit: p.unit || p.product?.unit,
                imagePath: p.imagePath || p.product?.imagePath,
                categoryName: p.categoryName || p.product?.categoryName,
                categoryId: p.categoryId || p.product?.categoryId,
              })) 
              : mockProducts;
          
          setProducts(fetchedProducts); 
          // Lấy tổng số lượng (Nếu API trả về trong result.data.totalItems)
  setTotalItems(result?.data?.totalItems || result?.totalItems || result?.data?.pagination?.total || 100);
          setPromotions(mockPromotions); // Giữ nguyên mock promotions
          message.success("Tải dữ liệu sản phẩm thành công!");
          
      } catch (error) {
          console.error("Lỗi khi fetch sản phẩm:", error);
          message.error("Không thể kết nối đến máy chủ hoặc lỗi mạng.");
          setProducts(mockProducts);
          setPromotions(mockPromotions);
      } finally {
          setLoading(false);
      }
    }, [page, size]);
  useEffect(() => {
      fetchProductsData();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page, size]); // chỉ phụ thuộc page & size



    return { products, promotions, loading, totalItems, refetchProducts: fetchProductsData };
  }

  const useFetchInventory = (productIds, page = 1, pageSize = 10) => {
     const [inventory, setInventory] = useState({}); 
     const [loadingInventory, setLoadingInventory] = useState(false);
     
     // Không cần state fetchedProductIds nữa

     const shouldFetch = productIds.length > 0;
    
     // Khai báo hàm fetchData bên trong useEffect hoặc dùng useCallback (nhưng trong trường hợp này, bên trong useEffect là đủ)
     useEffect(() => {
      if (!shouldFetch) {
        // Nếu không có productIds (ví dụ: đang loading Product), clear inventory
        setInventory({}); 
        return;
      }
      const fetchInventoryData = async () => {
        setLoadingInventory(true);
        const token = getAuthToken();

        if (!token) {
          setLoadingInventory(false);
          return;
        }
        try {
          // Gọi API với page và pageSize mới nhất
          const response = await fetch(`${API_BASE_URL}/Inventory?pageNumber=${page}&pageSize=${pageSize}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
          });

          if (!response.ok) {
                     throw new Error(`Lỗi khi lấy dữ liệu tồn kho: ${response.status}`);
                 }
                 const result = await response.json();

                 const newInventory = {};
                 if (Array.isArray(result.data?.items)) {
                    result.data.items.forEach(item => {
                      newInventory[item.productId] = item.quantity; 
                    });
                 }
                 
                 setInventory(newInventory); // Chỉ gọi setInventory một lần
                 // Không cần setFetchedProductIds nữa
             } catch (error) {
                 console.error("Lỗi khi fetch tồn kho:", error);
             } finally {
                 setLoadingInventory(false);
             }
         };
           
         // Luôn gọi fetchInventoryData nếu shouldFetch (productIds.length > 0)
         fetchInventoryData();

   
     }, [shouldFetch, page, pageSize, productIds]); // Giữ productIds vì nó thay đổi sau mỗi lần fetch product

     return { inventory, loadingInventory };
}


export default function Order() {
  const [currentPage, setCurrentPage] = useState(1);
  const [productsPerPage, setProductsPerPage] = useState(25);
  const { products, loading, totalItems } = useFetchProducts(currentPage, productsPerPage);
  const { promotions } = useFetchPromotions(); 

  const productIds = useMemo(
    () => Array.isArray(products) ? products.map(p => p.product_id) : [],
    [products]
  );

  const [selectedCategory, setSelectedCategory] = useState("all"); 
  const [cart, setCart] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedPromoId, setSelectedPromoId] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Tiền mặt");
  const [customerPaid, setCustomerPaid] = useState(0);
  const [chosenIds, setChosenIds] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm()
  const [phone, setPhone] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [loadingCustomer, setLoadingCustomer] = useState(false);

   
  const { inventory } = useFetchInventory(productIds, currentPage, productsPerPage);


  const currentProducts = useMemo(() => {
      if (!Array.isArray(products)) return [];
      
      // Lọc sản phẩm theo Category và Search
      const filtered = products.filter((p) => {
          const productName = p.product_name ?? ""; 
          
          // 1. LỌC THEO DANH MỤC (ĐÃ SỬA)
          // Lấy slug từ categoryId của sản phẩm (vì selectedCategory là slug)
          const productCategorySlug = getCategoryData(p.categoryId)?.slug; 
          
          // So sánh slug của sản phẩm với selectedCategory state
          const matchCategory = selectedCategory === "all" || productCategorySlug === selectedCategory;
          
          // 2. Lọc theo tìm kiếm
          const matchSearch = productName.toLowerCase().includes(search.toLowerCase());
          
          return matchCategory && matchSearch;
      });

      // Thêm thông tin tồn kho vào sản phẩm đã lọc
      return filtered.map(p => ({
          ...p,
          stock: inventory?.[p.product_id] ?? 0, 
      }));
  }, [products, inventory, selectedCategory, search]);

    const handleAddToCart = (product) => {
      setCart(prev => {
        const exists = prev.find(item => item.product_id === product.product_id);
        if (exists) {
          return prev.map(item =>
            item.product_id === product.product_id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          );
        }
        message.success(`${product.product_name} đã thêm vào giỏ hàng`);
        return [...prev, { ...product, quantity: 1 }];
      });

      setChosenIds(prev => prev.includes(product.product_id)
        ? prev
        : [...prev, product.product_id]
      );
    };

  //   const updateQuantity = (id, delta) => {
  //     setCart((prev) => {
  //       const newCart = prev
  //         .map((item) =>
  //           item.product_id === id
  //           ? { ...item, quantity: Math.max(item.quantity + delta, 0) }
  //           : item
  //       )
  //       .filter((item) => item.quantity > 0);

  //       setChosenIds((prevIds) =>
  //         prevIds.filter((pid) => newCart.some((item) => item.product_id === pid))
  //       );
  //       return newCart;
  //     });
  //   };
  const updateQuantity = (id, delta) => {
    // Lấy ID đơn hàng đang mở/giỏ hàng hiện tại
    const currentOrderId = getActiveOrderId(); // Giả sử có hàm này

    setCart((prev) => {
        const itemToUpdate = prev.find(item => item.product_id === id);
        if (!itemToUpdate) return prev; // Không tìm thấy

        const newQuantity = Math.max(itemToUpdate.quantity + delta, 0);

        // --- Bắt đầu tích hợp API ---
        if (currentOrderId && newQuantity > 0) {
            // Chuẩn bị dữ liệu cập nhật
            const updateData = { quantity: newQuantity }; 

            const token = getAuthToken();
            if (token) {
                 // **Gọi PUT API để cập nhật số lượng sản phẩm trong đơn hàng**
                fetch(`${API_BASE_URL}/Orders/${currentOrderId}/items/${id}`, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify(updateData),
                })
                .then(response => {
                    if (!response.ok) {
                        // Xử lý lỗi API (ví dụ: message.error)
                        console.error("Lỗi cập nhật số lượng trên server");
                        // Có thể cần rollback local state nếu cập nhật server thất bại
                    }
                })
                .catch(error => console.error("Lỗi network/server:", error));
            }
        } 
       
        const newCart = prev
            .map((item) =>
                item.product_id === id
                ? { ...item, quantity: newQuantity }
                : item
            )
            .filter((item) => item.quantity > 0);

        setChosenIds((prevIds) =>
            prevIds.filter((pid) => newCart.some((item) => item.product_id === pid))
        );
        return newCart;
    });
};

    const removeFromCart = (id) => {
      setCart((prev) => {
        const newCart = prev.filter((i) => i.product_id !== id);

        setChosenIds((prevIds) => prevIds.filter((pid) => pid !== id));
        return newCart;
      });
    };

  const calculateDiscountAmount = (subtotal, selectedPromoId, promotions) => {
    const promoId = Number(selectedPromoId);
    const selectedPromo = promotions.find(p => p.promo_id === promoId);
    
    // 1. Kiểm tra tồn tại và tổng tiền
    if (!selectedPromo || subtotal <= 0) {
        return 0;
    }

    const minAmount = selectedPromo.min_order_amount || 0; 
    
    // 2. Kiểm tra điều kiện đơn hàng tối thiểu
    if (subtotal < minAmount) {
        return 0; 
    }

    const { discount_type, discount_value } = selectedPromo;
    let discount = 0;
    
    // 3. Tính toán chiết khấu (SỬA: Dùng 'subtotal' thay vì 'currentSubtotal')
    const type = discount_type.toLowerCase();

    if (type === "percent") {
        // Dùng tham số 'subtotal' ở đây
        discount = (subtotal * discount_value) / 100;
    } else if (type === "fixed" || type === "amount") {
        discount = discount_value;
    }

    // Chiết khấu không được vượt quá Tổng phụ
    return Math.max(0, Math.min(discount, subtotal));
};
 
const { subtotal, discountAmount, total } = useMemo(() => {
    const currentSubtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    
    // Tính Chiết khấu bằng hàm helper mới (đã xử lý minOrderAmount và Fixed/Percent)
    const currentDiscount = calculateDiscountAmount(
        currentSubtotal,
        selectedPromoId,
        promotions
    );

    const currentTotal = Math.max(0, currentSubtotal - currentDiscount);
    
    return { subtotal: currentSubtotal, discountAmount: currentDiscount, total: currentTotal };
}, [cart, selectedPromoId, promotions]);
const mapPaymentMethodToServer = (method) => {
    switch (method) {
        case "Tiền mặt": return "Cash";
        case "Thẻ": return "Card"; // Thay 'Thẻ' bằng giá trị tiếng Việt thực tế trong state của bạn
        case "Chuyển khoản": return "BankTransfer"; // Thay 'Chuyển khoản' bằng giá trị thực tế
        case "Ví điện tử": return "EWallet"; // Thay 'Ví điện tử' bằng giá trị thực tế
        default: return "Cash"; 
    }
};
const handlePayment = async () => {
  
    
    if (cart.length === 0) {
        Modal.warning({ title: 'Giỏ hàng trống', content: 'Vui lòng thêm sản phẩm vào giỏ hàng trước khi thanh toán.', centered: true });
        return;
    }
    
    if (paymentMethod === "Tiền mặt" && customerPaid < total) {
        Modal.error({ title: 'Lỗi Thanh Toán Tiền Mặt', content: `Số tiền khách đưa không đủ!`, centered: true });
        return;
    }

    const token = getAuthToken();
    if (!token) {
        Modal.error({ title: 'Lỗi Phiên Đăng Nhập', content: 'Phiên đăng nhập đã hết hạn hoặc không hợp lệ. Vui lòng đăng nhập lại.', centered: true });
        return;
    }
    
    let finalCustomerId = 2; // Khách vãng lai
    if (phone) { 
        message.loading({ content: 'Đang kiểm tra thông tin khách hàng...', key: 'customerCheck' });
        finalCustomerId = await fetchCustomerByPhone(phone) || 2;
        message.destroy('customerCheck');
    }

   
    const orderDetails = cart.map(item => ({
        productId: item.product_id,
        quantity: item.quantity,
        price: item.price,
    }));

    const createOrderData = {
        customerId: finalCustomerId, 
        promoId: selectedPromoId ? Number(selectedPromoId) : null,
        
        totalAmount: total, 
        discountAmount: discountAmount,
        subtotal: subtotal,
        // Backend CreateOrderRequest có thể cần OrderItems trong Request Body
        orderDetails: orderDetails, 
    };

    // --- [BẮT ĐẦU GỌI API] ---
    let orderId = null;
    let finalOrderResult = null;
    
   try {
        
        // ===================================================================
        // ⭐ BƯỚC 1: TẠO ĐƠN HÀNG NHÁP (POST api/Orders) - ĐÃ TĂNG CƯỜNG KIỂM TRA
        // ===================================================================
        message.loading({ content: 'Bước 1/4: Đang tạo đơn hàng nháp...', key: 'payment' });
        
        const createResponse = await fetch(`${API_BASE_URL}/Orders`, {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body: JSON.stringify(createOrderData),
        });

        const createResult = await handleApiResponse(createResponse);
        
        if (!createResponse.ok) {
            // Xử lý lỗi HTTP (4xx, 5xx)
            const errorMessage = createResult.message || `Lỗi HTTP: ${createResponse.status} - Lỗi khi tạo đơn hàng.`;
            throw new Error(`Tạo đơn hàng thất bại: ${errorMessage}`);
        }

        // ⭐ SỬA LỖI: Trích xuất orderId an toàn bằng Optional Chaining
        orderId = createResult.data?.orderId;
        
        if (!orderId) {
            // Xử lý lỗi nếu HTTP 200/201 nhưng Server không trả về Order ID
            const serverMessage = createResult.message || JSON.stringify(createResult);
            throw new Error(`Tạo đơn hàng thất bại: Server không trả về Order ID. Phản hồi: ${serverMessage}`);
        }
        
        message.success({ content: `✅ Bước 1/4: Đã tạo đơn hàng nháp ID: ${orderId}`, key: 'payment', duration: 1.5 });
        

        // ===================================================================
        // ⭐ BƯỚC 2: THÊM TỪNG SẢN PHẨM VÀO ĐƠN HÀNG (POST api/Orders/{id}/items)
        // (orderId đã chắc chắn có giá trị)
        // ===================================================================
        message.loading({ content: 'Bước 2/4: Đang thêm sản phẩm vào đơn hàng...', key: 'payment' });
        
        for (const item of cart) {
            const addRequestData = {
                productId: item.product_id,
                quantity: item.quantity,
            };
            
            const addResponse = await fetch(`${API_BASE_URL}/Orders/${orderId}/items`, {
                method: "POST",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                body: JSON.stringify(addRequestData),
            });
            
            const addResult = await handleApiResponse(addResponse);
            
            if (!addResponse.ok) {
                // Xử lý lỗi rõ ràng hơn
                const validationError = addResult.errors ? Object.values(addResult.errors).flat().join(" | ") : "";
                const errorMessage = addResult.message || validationError || `Lỗi khi thêm sản phẩm ${item.product_name}.`;
                throw new Error(`Thêm sản phẩm thất bại: ${errorMessage}`);
            }
        }
        
        message.success({ content: `✅ Bước 2/4: Đã thêm sản phẩm thành công.`, key: 'payment', duration: 1.5 });


        // ===================================================================
        // ⭐ BƯỚC 3: CẬP NHẬT ĐƠN HÀNG (PUT api/Orders/{id})
        // ===================================================================
        message.loading({ content: 'Bước 3/4: Đang cập nhật đơn hàng (buộc tính lại tổng tiền)...', key: 'payment' });
      
        const updateRequestData = {}; 

        const updateResponse = await fetch(`${API_BASE_URL}/Orders/${orderId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body: JSON.stringify(updateRequestData),
        });

        const updateResult = await handleApiResponse(updateResponse);

        if (!updateResponse.ok) {
            const errorMessage = updateResult.message || `Lỗi HTTP: ${updateResponse.status} - Lỗi khi cập nhật đơn hàng.`;
            throw new Error(`Cập nhật đơn hàng thất bại: ${errorMessage}`);
        }
        // Lúc này, Backend đã tính lại tổng tiền chính xác (415725.00 + 209283.00 = 625008.00)
        message.success({ content: `✅ Bước 3/4: Đã cập nhật tổng tiền thành công.`, key: 'payment', duration: 1.5 });
        // ===================================================================
        // ⭐ BƯỚC 4: THANH TOÁN (POST api/Orders/{id}/checkout)
        // ===================================================================
        message.loading({ content: `Bước 4/4: Đang xử lý thanh toán cho đơn hàng ${orderId}...`, key: 'payment' });
        const serverPaymentMethod = mapPaymentMethodToServer(paymentMethod);

        const checkoutData = {
            paymentMethod: serverPaymentMethod, 
            amount: total, // Gửi tổng tiền chính xác từ Frontend
            customerPaid: customerPaid
        };
        
        const checkoutResponse = await fetch(`${API_BASE_URL}/Orders/${orderId}/checkout`, {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body: JSON.stringify(checkoutData),
        });

        finalOrderResult = await handleApiResponse(checkoutResponse);

        if (!checkoutResponse.ok) {
            let errorMessage = finalOrderResult.message || `Lỗi HTTP: ${checkoutResponse.status} - Lỗi khi thanh toán`;
            
            if (finalOrderResult.errors) {
                const validationErrors = Object.values(finalOrderResult.errors).flat().join(" | ");
                errorMessage = `Thanh toán thất bại: ${validationErrors}`;
            }
            
            throw new Error(errorMessage);
        }
        
        // --- [XỬ LÝ THÀNH CÔNG] ---
        message.success({ content: `✅ Thanh toán thành công! Mã đơn: ${finalOrderResult.data.orderId}`, key: 'payment', duration: 3 });
       // Tạo dữ liệu hóa đơn để in
        const orderToPrint = {
            orderId: finalOrderResult.data.orderId || orderId,
            subtotal: subtotal,
            discountAmount: discountAmount,
            totalAmount: total, // Dùng 'total' và đặt tên là 'totalAmount'
            customerPaid: customerPaid,
            customerName: customerName || (phone ? `Khách hàng (${phone})` : "Khách vãng lai"),
            // Map cart items to the format expected by printInvoice.js
            orderDetails: cart.map(item => ({
                productName: item.product_name,
                quantity: item.quantity,
                price: item.price
            }))
        };

        // Yêu cầu 3: Thêm logic in hóa đơn
        Modal.confirm({
            title: 'Thanh toán thành công',
            content: 'Bạn có muốn in hóa đơn cho giao dịch này không?',
            okText: 'In Hóa đơn',
            cancelText: 'Bỏ qua',
            centered: true,
            onOk() {
                // Gọi hàm printInvoice đã import
                printInvoice(orderToPrint);
            },
            // Reset trạng thái sau khi modal đóng (dù In hay Bỏ qua)
            afterClose() { 
                setCart([]);
                setSelectedPromoId("");
                setCustomerPaid(0);
                setPhone("");
                setCustomerName("");
                setChosenIds([]);
                if (refetchProducts) refetchProducts(); 
            }
        });
        // 4. Reset giỏ hàng và thanh toán
      

    } catch (error) {
        console.error("Lỗi thanh toán:", error);
        
        // Hiển thị Modal Lỗi Server
        Modal.error({
            title: '❌ Thanh toán thất bại',
            content: error.message || 'Đã xảy ra lỗi không xác định trong quá trình xử lý.',
            centered: true
        });

    }
};

// Hàm hỗ trợ đọc JSON an toàn (từ câu trả lời trước)
const handleApiResponse = async (response) => {
    let result = {};
    const contentType = response.headers.get("content-type");
    
    if (contentType && contentType.includes("application/json")) {
        try {
            result = await response.json();
        } catch (e) {
            // Lỗi SyntaxError: Unexpected end of JSON input
            result = { message: `Phản hồi không phải JSON hợp lệ: ${e.message}` };
        }
    } else if (response.status !== 204) {
        const text = await response.text();
        result = { message: text || `Lỗi HTTP: ${response.status}` };
    }
    return result;
};

  const handlePaymentChange = (value) => {
      setPaymentMethod(value);
      console.log("Phương thức thanh toán:", value);
  };

    //Danh sách các cột trong bảng
    const columns = [
    {
      title: "No",
      key: "no",
      width: '10%',
      render: (text, record, index) => index + 1, // tự tăng
    },
    {
      title: "Sản phẩm",
      dataIndex: "product_name",
      key: "product_name",
      // Cột này nên chiếm nhiều không gian hơn
      width: '30%', 
      render: (text) => (
        <div style={{ whiteSpace: "normal", wordBreak: "break-word" }}>{text}</div>
      ),
    },
    {
      title: "SL",
      dataIndex: "quantity",
      key: "quantity",
      width: '25%', // Tăng độ rộng để chứa nút
      align: 'center',
      render: (qty, record) => (
        <Space>
          {/* Nút Giảm SL: Luôn cho phép giảm (đã có check qty > 0 trong updateQuantity) */}
          <Button 
            size="small" 
            icon={<MinusOutlined />} 
            onClick={() => updateQuantity(record.product_id, -1)} 
          />
          {/* Hiển thị số lượng */}
          <span style={{ minWidth: 20, textAlign: 'center', fontWeight: 600 }}>
            {qty}
          </span>
          {/* Nút Tăng SL: CHỈ CHO PHÉP TĂNG nếu SL hiện tại < Tồn kho (record.stock) */}
          <Button 
            size="small" 
            icon={<PlusOutlined />}
            disabled={qty >= record.stock} // Vô hiệu hóa nút nếu SL đã bằng hoặc vượt quá tồn kho
            onClick={() => {
              if (qty < record.stock) {
                updateQuantity(record.product_id, 1);
              } else {
                 message.warning(`Số lượng tối đa có thể thêm là ${record.stock}!`);
              }
            }}
          />
        </Space>
      ),
    },
    { 
      title: "Đơn giá", 
      dataIndex: "price", 
      key: "price", 
      width: '20%',
      align: 'left', // Căn phải cho dễ đọc
      render: (p) => p.toLocaleString() + " ₫" 
    },
    { 
      title: "Thành tiền", 
      key: "total", 
      width: '20%',
      align: 'left', // Căn phải cho dễ đọc
      render: (_, r) => (
          <span style={{ fontWeight: 600 }}>
             {(r.price * r.quantity).toLocaleString() + " ₫"}
          </span>
      ),
    },
    { 
      title: "", 
      key: "action", 
      width: 40, 
      align: 'center',
      render: (_, r) => (
        <Button 
          type="primary" 
          danger 
          size="small" 
          icon={<DeleteOutlined />} 
          onClick={() => removeFromCart(r.product_id)} 
        />
      ),
    },
  ];
   
    const handlePhoneChange = (e) => {
      const value = e.target.value;
      setPhone(value);

      if (value.length >= 10) {
        fetchCustomerByPhone(value);
      } else {
        setCustomerName("");
      }
    };

    const fetchCustomerByPhone = async (phone) => {
      try {
        setLoadingCustomer(true);

        const response = await fetch(`http://localhost:5000/api/Customer/by-phone/${phone}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        const result = await response.json();

        if (response.ok && result?.data) {
          setCustomerName(result.data.name || ""); 
        } else {
          setCustomerName("");
          message.warning("Không tìm thấy khách hàng này");
        }
      } catch (error) {
        console.error("Lỗi khi tìm khách hàng:", error);
        message.error("Không thể kết nối đến server");
      } finally {
        setLoadingCustomer(false);
      }
    };

    //Thêm khách hàng mới
    const AddNewCustomer = async (values) => {
      try {
        const { name, phone } = values;

        const response = await fetch("http://localhost:5000/api/Customer", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({ name, phone }),
        });

        const data = await response.json();

        if (!response.ok) {
          // Nếu server trả lỗi trùng số
          if (data.message?.includes("Phone number already exists")) {
            form.setFields([{ name: "phone", errors: ["Số điện thoại đã tồn tại!"] }]);
            return;
          }
          throw new Error(data.message || "Thêm khách hàng thất bại");
        }

        message.success("Thêm khách hàng thành công");
        form.resetFields();
        setIsModalOpen(false);
        setPhone(phone);
        setCustomerName(name);

      } catch (error) {
        // Lỗi khác
        message.error(error.message || "Lỗi khi thêm khách hàng");
        console.error(error);
      }
    };

    //Tính tiền thừa cho khách
    function tienthua(tiendua, tongmua) {
      const change = tiendua - tongmua;
      return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(change);
    }
  return (
    <div className="order-container">
      <Row gutter={16}>
        {/* Cột bên trái */}
        <Col span={16}>
          <Card
              title={null}
              style={{height: "calc(100vh - 80px)",display: "flex",flexDirection: "column",borderRadius: 12,boxShadow: "0 4px 12px rgba(0,0,0,0.08)",overflow: "hidden",}}
              styles={{ body: { display: "flex", flexDirection: "column", height: "100%", padding: 0 } }}          >
              {/* Header */}
              <div
                style={{padding: "10px 20px",borderBottom: "1px solid #f0f0f0",background: "#fff",position: "sticky",top: 0,zIndex: 2,}}
              >
                <Space style={{ width: "100%", justifyContent: "space-between" }}>
                  <Select
                    onChange={(val) => setSelectedCategory(val)} 
                    value={selectedCategory}
                    style={{width: 160,height: 50,borderRadius: 6,}}
                    size="middle"
                >
                    <Option value="all">Tất cả</Option>
               
                    {Object.values(CATEGORY_MAP).map(cat => (
                        <Option key={cat.slug} value={cat.slug}>
                            {cat.name}
                        </Option>
                    ))}
                </Select>

                  <Input
                    prefix={<SearchOutlined style={{ color: "#999" }} />}
                    placeholder="Tìm sản phẩm..."
                    allowClear
                    onChange={(e) => setSearch(e.target.value)}
                    style={{width: 240,height: 36,borderRadius: 6,}}
                    size="middle"
                  />
                </Space>
              </div>

              {/* Danh sách sản phẩm*/}
              <div
                style={{flex: 1,overflowY: "auto",padding: "16px 20px",background: "#fafafa",}}
              >
                {loading ? (
                  <div style={{ textAlign: "center", padding: "60px 0" }}>
                    <Spin size="large" />
                  </div>
                ) : (
                  <div
                    className="product-grid"
                    style={{display: "grid",gridTemplateColumns: "auto-fit, minmax(160px, 1fr)",gap: 5,justifyItems: "center",alignItems: "start",}}
                  >
                    {currentProducts.map((p) => (
                        <Card
                          key={p.product_id}
                          hoverable={inventory?.[p.product_id] > 0}
                          onClick={() => inventory?.[p.product_id] > 0 && handleAddToCart(p)}
                          style={{
                            position: "relative", // để Tag và icon nằm đúng vị trí
                            width: 160,
                            height: 230,
                            borderRadius: 10,
                            background: "#fff",
                            cursor: inventory?.[p.product_id] > 0 ? "pointer" : "not-allowed",
                            opacity: inventory?.[p.product_id] > 0 ? 1 : 0.6,
                            transition: "all 0.25s ease",
                            boxShadow: "0 3px 10px rgba(0,0,0,0.06)",
                            overflow: "hidden",
                            display: "flex",
                            flexDirection: "column",
                            padding: 0,
                          }}
                          onMouseEnter={(e) => {
                            if (inventory?.[p.product_id] > 0) {
                              e.currentTarget.style.transform = "translateY(-4px)";
                              e.currentTarget.style.boxShadow = "0 8px 18px rgba(0,0,0,0.1)";
                            }
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = "translateY(0)";
                            e.currentTarget.style.boxShadow = "0 3px 10px rgba(0,0,0,0.06)";
                          }}
                        >
                          {/* Tag danh mục */}
                          <div
                            style={{
                              position: "absolute",
                              top: 6,
                              left: 6,
                              zIndex: 5,
                            }}
                          >
                            <Tag
                              style={{
                                fontSize: 10,
                                fontWeight: 600,
                                borderRadius: 8,
                                padding: "2px 6px",
                                background: "linear-gradient(135deg, #3b82f6, #2563eb)",
                                color: "#fff",
                                boxShadow: "0 2px 6px rgba(37,99,235,0.25)",
                              }}
                            >
                              {getCategoryData(p.categoryId)?.name || "Khác"}
                            </Tag>
                          </div>

                          {/* Icon đã chọn */}
                          {chosenIds.includes(p.product_id) && (
                            <div
                              style={{
                                position: "absolute",
                                top: 6,
                                right: 6,
                                width: 22,
                                height: 22,
                                background: "linear-gradient(135deg, #22c55e, #16a34a)",
                                borderRadius: "50%",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                color: "#fff",
                                fontSize: 12,
                                boxShadow: "0 3px 6px rgba(22,163,74,0.25)",
                                zIndex: 10,
                              }}
                            >
                              ✓
                            </div>
                          )}

                          {/* ẢNH SẢN PHẨM */}
                          <div
                            style={{
                              position: "relative",
                              height: 115,
                              background: "#f9fafb",
                              overflow: "hidden",
                              flexShrink: 0,
                              borderBottom: "1px solid #f1f5f9",
                            }}
                          >
                            <img
                              alt={p.product_name}
                              src={
                                p.imagePath
                                  ? p.imagePath.startsWith("http")
                                    ? p.imagePath
                                    : `${API_IMAGE}${p.imagePath}`
                                  : aquavoiem
                              }
                              onError={(e) => (e.target.src = aquavoiem)}
                              style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                                transition: "transform 0.3s ease",
                                filter: inventory?.[p.product_id] > 0 ? "none" : "grayscale(70%)",
                              }}
                              onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
                              onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
                            />

                            {/* Hết hàng */}
                            {inventory?.[p.product_id] === 0 && (
                              <div
                                style={{
                                  position: "absolute",
                                  top: 6,
                                  right: 6,
                                  background: "rgba(17, 24, 39, 0.75)",
                                  color: "#fff",
                                  fontSize: 10.5,
                                  padding: "2px 6px",
                                  borderRadius: 6,
                                  fontWeight: 600,
                                  boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                                }}
                              >
                                Hết hàng
                              </div>
                            )}
                          </div>

                          {/* TÊN SẢN PHẨM */}
                          <div
                            style={{
                              padding: "5px 5px 0px 0px",
                              flex: 1,
                              display: "flex",
                              flexDirection: "column",
                              justifyContent: "center",
                            }}
                          >
                            <div
                              style={{
                                fontWeight: 700,
                                fontSize: 13,
                                color: "#111827",
                                marginBottom: 3,
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                lineHeight: "17px",
                                textAlign: "center",
                              }}
                            >
                              {p.product_name}
                            </div>
                          </div>

                          {/* GIÁ + SỐ LƯỢNG */}
                          <div
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              justifyContent: "center",
                              alignItems: "center",
                              padding: "0 6px 6px 6px",
                            }}
                          >
                            <div
                              style={{
                                background: "linear-gradient(90deg, #ef4444, #f97316)",
                                WebkitBackgroundClip: "text",
                                WebkitTextFillColor: "transparent",
                                fontWeight: 800,
                                fontSize: 14,
                                marginBottom: 2,
                              }}
                            >
                              {p.price.toLocaleString()} ₫
                            </div>
                            <div
                              style={{
                                fontSize: 11,
                                color: "#6b7280",
                                fontWeight: 500,
                              }}
                            >
                              Còn lại: {inventory?.[p.product_id] || 0} {p.unit}
                            </div>
                          </div>
                        </Card>
                    ))}
                  </div>
              )}
              </div>
              {/* Footer */}
              <div
                style={{padding: "10px 24px",borderTop: "1px solid #f0f0f0",background: "#fff",
                  position: "sticky",bottom: 0,zIndex: 2,display: "flex",justifyContent: "flex-end",
                  // backgroundColor:"red"
                }}
              >
                     <Pagination
                  style={{ transform: "translateY(-10px)" }}
                  current={currentPage}
                  pageSize={productsPerPage}
                  total={totalItems/2}
                  showSizeChanger
                  pageSizeOptions={["5", "10", "15", "20", "25", "50"]}
                  onChange={(page, size) => {
                    setCurrentPage(page);
                    setProductsPerPage(size);
                  }}
                />
              </div>
            </Card>
        </Col>
        {/* Cột bên phải*/}
        <Col span={8} style={{ paddingRight: 0}}>
            <Card
              bordered
              style={{ height: "calc(100vh - 80px)", display: "flex", flexDirection: "column", padding: 0 }}
              bodyStyle={{ padding: 0 }}
            >
              {/* Danh sách sản phẩm */}
              <div style={{ flex: 1, overflowY: "auto", background: "#fafafa", padding: 0}}>
                <Table
                  columns={columns}
                  dataSource={cart}
                  rowKey="product_id"
                  pagination={false}
                  size="small"
                  locale={{ emptyText: "Chưa có sản phẩm" }}
                  bordered
                  scroll={cart.length > 5 ? { y: 330 } : undefined}
                  style={{ tableLayout: "fixed", width: "100%" }}
                  components={{
                    header: {
                      cell: ({ children, ...restProps }) => (
                        <th
                          {...restProps}
                          style={{backgroundColor: "#008f5a",color: "#fff",fontWeight: 600,textAlign: "center",}}
                        >
                          {children}
                        </th>
                      ),
                    },
                  }}
                />
              </div>

              {/* 2. Thông tin khách + thanh toán */}
                <div 
                  style={{ display: "flex", padding: 16, gap: 16, flex: 1, overflowY: "auto", background: "#fff"}}>
                  {/* Cột trái */}
                  <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 12 }}>

                    <Input
                      placeholder="Nhập SĐT khách hàng"
                      value={phone}
                    
                      addonAfter={
                        <Button onClick={() => setIsModalOpen(true)} type="primary" style={{ padding: "0 12px", height: 28 }}>
                          + Thêm
                        </Button>
                      }
                      suffix={loadingCustomer ? <Spin size="small" /> : null}
                      style={{ height: 36, borderRadius: 6 }}
                      onChange={handlePhoneChange}
                    />
                    
                    <Input
                      placeholder="Tên khách hàng "
                      value={customerName}
                      readOnly
                      style={{ height: 36, borderRadius: 6, marginTop: 8 }}
                    />
                    
                    <Select
                      value={selectedPromoId}
                      onChange={(v) => setSelectedPromoId(v)}
                      placeholder="Chọn mã khuyến mãi"
                      style={{ width: "100%", height: 36, borderRadius: 6 }}
                    >
                    <Option value="">Không áp dụng</Option>
                      {promotions.map((promo) => (
                        <Option key={promo.promo_id} value={promo.promo_id}>{promo.name}</Option>
                      ))}
                    </Select>
                    <Input.TextArea placeholder="Ghi chú cho đơn" rows={2} style={{ borderRadius: 6, resize: "none"}}  />
                    <Select
                      value={paymentMethod}
  //                     onChange={handlePayment}
                      onChange={handlePaymentChange}
                      style={{ width: "100%", height: 36, borderRadius: 6 }}
                    >
                      <Option value="Tiền mặt">Tiền mặt</Option>
                      <Option value="Chuyển khoản">Chuyển khoản</Option>
                      <Option value="Thẻ">Thẻ</Option>
                    </Select>
                  </div>

                  {/* Cột phải */}
                  <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, color: "#555" }}>
                      <span>Tổng phụ:</span>
                      <span>{subtotal.toLocaleString()} ₫</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, color: "#555" }}>
                      <span>Giảm giá:</span>
                      <span>- {discountAmount.toLocaleString()} ₫</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontWeight: "bold", fontSize: 18 }}>
                      <span>Tổng cộng:</span>
                      <span>{total.toLocaleString()} ₫</span> 
                      
                    </div>
                    {paymentMethod === "Tiền mặt" && 
                      <>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, fontWeight: "bold" }}>
                          <span>Khách đưa:</span>
                            <InputNumber
                              min={0}
                              value={customerPaid}
                              formatter={(value) => `${value?.toLocaleString()} ₫`}
                              parser={(value) => value.replace(/\D/g, "")}
                              onChange={(value) => setCustomerPaid(value)}
                              style={{ width: 120 }}
                            />
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, color: "red", fontWeight: "bold"}}>
                          <span>Tiền thừa:</span>
                          <span>
                            {customerPaid != null && tienthua(customerPaid, total)}
                          </span>
                        </div>

                      </>
                    }
                    {paymentMethod === "Chuyển khoản" && (
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, marginTop: "5px" }}>
                        <img src={QR} alt="QR Payment" style={{ width: 100, height: 100, objectFit: "contain" }} />
                        <div style={{ textAlign: "center", fontSize: 14, fontWeight: 500 }}>
                          Tên tài khoản: CaiTiemTapHoa <br />
                          STK: 1010101010
                        </div>
                      </div>
                    )}
                  </div>
                </div>

              {/* 3. Footer: nút luôn sát đáy */}
              <div style={{display: "flex",gap: 8,borderTop: "1px solid #f0f0f0",padding: 12,flexShrink: 0}}>                      
                <Button type="default" style={{ flex: 1 }} onClick={() => {setCart([]);setChosenIds([]);}}>Hủy</Button>
                <Button type="primary" style={{ flex: 1 }} onClick={handlePayment}>Thanh toán</Button>              
              </div>
            </Card>
          </Col>
        </Row>

        {/*Model thêm khách hàng mới*/}
      <Modal
        title={"Thêm Khách Hàng Mới"}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        width={400}
        style={{ top: 100 }}
        closeIcon={false}
      >
        <Form form={form} layout="vertical" autoComplete="off" onFinish={AddNewCustomer}>
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <Form.Item
              label="Họ và tên"
              name="name"
              rules={[
                { required: true, message: "Vui lòng nhập họ và tên" },
                { max: 250, message: "Họ và tên không quá 250 ký tự" }
                  ]}
            >
                <Input placeholder="Nguyễn Văn An" style={{ width: "100%", height: 36 }} />
              </Form.Item>

              <Form.Item
                label="Số điện thoại"
                name="phone"
                validateTrigger="onSubmit"
                rules={[
                  { required: true, message: "Vui lòng nhập số điện thoại" },
                  { pattern: /^[0-9]{10}$/, message: "Số điện thoại không hợp lệ (10 số)" }
                ]}
              >
                <Input placeholder="090xxxxxxx" style={{ width: "100%", height: 36 }} maxLength={10} />
              </Form.Item>
            </div>

            <Form.Item style={{ marginTop: 24, textAlign: "right", marginBottom: 0 }}>
              <Space>
                <Button onClick={() => setIsModalOpen(false)}>Hủy</Button>
                <Button type="primary" htmlType="submit">Thêm mới</Button>
              </Space>
            </Form.Item>
          </Form>
      </Modal>
    </div>
  );
}