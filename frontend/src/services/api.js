const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

const getAuthHeaders = () => {
  const token = localStorage.getItem('radja_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const handleResponse = async (response) => {
  if (!response.ok) {
    let errorMsg = 'Terjadi kesalahan pada server';
    try {
      const data = await response.json();
      errorMsg = data.detail || data.message || errorMsg;
    } catch (e) {
      // fallback
    }
    throw new Error(errorMsg);
  }
  return response.json();
};

export const api = {
  // --- Auth Endpoints ---
  async loginCustomer(email, password) {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    return handleResponse(res);
  },

  async registerCustomer(userData) {
    const res = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    return handleResponse(res);
  },

  async loginGoogle(googleData) {
    const res = await fetch(`${API_BASE_URL}/auth/google`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(googleData),
    });
    return handleResponse(res);
  },

  async verifyOtp(whatsapp, otp) {
    const res = await fetch(`${API_BASE_URL}/auth/verify-otp`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      },
      body: JSON.stringify({ whatsapp, otp }),
    });
    return handleResponse(res);
  },

  async completeProfile(data) {
    const res = await fetch(`${API_BASE_URL}/auth/complete-profile`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      },
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  async getMe() {
    const res = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  async loginAdmin(email, password) {
    const res = await fetch(`${API_BASE_URL}/auth/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    return handleResponse(res);
  },

  async getAdminMe() {
    const res = await fetch(`${API_BASE_URL}/auth/admin/me`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  // --- Public Endpoints ---
  async getCategories() {
    const res = await fetch(`${API_BASE_URL}/public/categories`);
    return handleResponse(res);
  },

  async getProducts(params = {}) {
    const query = new URLSearchParams();
    if (params.category_slug) query.append('category_slug', params.category_slug);
    if (params.category_id) query.append('category_id', params.category_id);
    if (params.search) query.append('search', params.search);
    if (params.theme) query.append('theme', params.theme);
    if (params.min_price) query.append('min_price', params.min_price);
    if (params.max_price) query.append('max_price', params.max_price);

    const res = await fetch(`${API_BASE_URL}/public/products?${query.toString()}`);
    return handleResponse(res);
  },

  async getProductDetail(id) {
    const res = await fetch(`${API_BASE_URL}/public/products/${id}`);
    return handleResponse(res);
  },

  async getProductAvailability(id) {
    const res = await fetch(`${API_BASE_URL}/public/products/${id}/availability`);
    return handleResponse(res);
  },

  async getBundles(params = {}) {
    const query = new URLSearchParams();
    if (params.event_type) query.append('event_type', params.event_type);
    if (params.search) query.append('search', params.search);

    const res = await fetch(`${API_BASE_URL}/public/bundles?${query.toString()}`);
    return handleResponse(res);
  },

  async getBundleDetail(id) {
    const res = await fetch(`${API_BASE_URL}/public/bundles/${id}`);
    return handleResponse(res);
  },

  async checkAvailability(data) {
    const res = await fetch(`${API_BASE_URL}/public/check-availability`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  async getGalleries(params = {}) {
    const query = new URLSearchParams();
    if (params.event_type) query.append('event_type', params.event_type);
    if (params.category_id) query.append('category_id', params.category_id);

    const res = await fetch(`${API_BASE_URL}/public/galleries?${query.toString()}`);
    return handleResponse(res);
  },

  async getTestimonials(featuredOnly = false) {
    const res = await fetch(`${API_BASE_URL}/public/testimonials?featured_only=${featuredOnly}`);
    return handleResponse(res);
  },

  async getFaqs() {
    const res = await fetch(`${API_BASE_URL}/public/faqs`);
    return handleResponse(res);
  },

  // --- Customer Endpoints ---
  async createBooking(bookingData) {
    const res = await fetch(`${API_BASE_URL}/customer/bookings`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      },
      body: JSON.stringify(bookingData),
    });
    return handleResponse(res);
  },

  async getCustomerBookings() {
    const res = await fetch(`${API_BASE_URL}/customer/bookings`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  async getCustomerBookingDetail(id) {
    const res = await fetch(`${API_BASE_URL}/customer/bookings/${id}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  async uploadPaymentProof(bookingId, formData) {
    const res = await fetch(`${API_BASE_URL}/customer/bookings/${bookingId}/payment`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: formData,
    });
    return handleResponse(res);
  },

  async submitTestimonial(data) {
    const res = await fetch(`${API_BASE_URL}/customer/testimonials`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      },
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  // --- AI Endpoints ---
  async chatKirana(message, sessionToken = null) {
    const res = await fetch(`${API_BASE_URL}/ai/kirana/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, session_token: sessionToken }),
    });
    return handleResponse(res);
  },

  async adminAICommand(command) {
    const res = await fetch(`${API_BASE_URL}/ai/admin/command`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      },
      body: JSON.stringify({ command }),
    });
    return handleResponse(res);
  },

  // --- Admin Endpoints ---
  async getDashboardMetrics() {
    const res = await fetch(`${API_BASE_URL}/admin/dashboard/metrics`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  async createProduct(productData) {
    const res = await fetch(`${API_BASE_URL}/admin/products`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      },
      body: JSON.stringify(productData),
    });
    return handleResponse(res);
  },

  async updateProduct(id, productData) {
    const res = await fetch(`${API_BASE_URL}/admin/products/${id}`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      },
      body: JSON.stringify(productData),
    });
    return handleResponse(res);
  },

  async deleteProduct(id) {
    const res = await fetch(`${API_BASE_URL}/admin/products/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  async createBundle(bundleData) {
    const res = await fetch(`${API_BASE_URL}/admin/bundles`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      },
      body: JSON.stringify(bundleData),
    });
    return handleResponse(res);
  },

  async updateBundle(id, bundleData) {
    const res = await fetch(`${API_BASE_URL}/admin/bundles/${id}`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      },
      body: JSON.stringify(bundleData),
    });
    return handleResponse(res);
  },

  async deleteBundle(id) {
    const res = await fetch(`${API_BASE_URL}/admin/bundles/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  async getAdminBookings(statusFilter = '') {
    const query = statusFilter ? `?status_filter=${statusFilter}` : '';
    const res = await fetch(`${API_BASE_URL}/admin/bookings${query}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  async updateBookingStatus(id, status, adminNotes = '') {
    const res = await fetch(`${API_BASE_URL}/admin/bookings/${id}/status`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      },
      body: JSON.stringify({ status, admin_notes: adminNotes }),
    });
    return handleResponse(res);
  },

  async getAdminPayments(statusFilter = '') {
    const query = statusFilter ? `?status_filter=${statusFilter}` : '';
    const res = await fetch(`${API_BASE_URL}/admin/payments${query}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  async verifyPayment(paymentId, status) {
    const res = await fetch(`${API_BASE_URL}/admin/payments/${paymentId}/verify`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      },
      body: JSON.stringify({ status }),
    });
    return handleResponse(res);
  },

  async getScheduleMatrix(startDate, endDate) {
    const res = await fetch(`${API_BASE_URL}/admin/schedule-matrix?start_date=${startDate}&end_date=${endDate}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  async blockScheduleDate(productId, blockedDate, reason = 'maintenance') {
    const res = await fetch(`${API_BASE_URL}/admin/availability-blocks`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      },
      body: JSON.stringify({ product_id: productId, blocked_date: blockedDate, reason }),
    });
    return handleResponse(res);
  },

  async deleteScheduleBlock(blockId) {
    const res = await fetch(`${API_BASE_URL}/admin/availability-blocks/${blockId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  async getAdminTestimonials(statusFilter = '') {
    const query = statusFilter ? `?status_filter=${statusFilter}` : '';
    const res = await fetch(`${API_BASE_URL}/admin/testimonials${query}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  async moderateTestimonial(id, status, isFeatured = null) {
    const res = await fetch(`${API_BASE_URL}/admin/testimonials/${id}/moderate`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      },
      body: JSON.stringify({ status, is_featured: isFeatured }),
    });
    return handleResponse(res);
  },

  async createGallery(galleryData) {
    const res = await fetch(`${API_BASE_URL}/admin/galleries`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      },
      body: JSON.stringify(galleryData),
    });
    return handleResponse(res);
  },

  async deleteGallery(id) {
    const res = await fetch(`${API_BASE_URL}/admin/galleries/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  async getCalendarSyncInfo() {
    const res = await fetch(`${API_BASE_URL}/calendar/sync-info`);
    return handleResponse(res);
  }
};

