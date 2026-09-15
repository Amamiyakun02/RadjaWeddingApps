import React, { createContext, useContext, useState, useEffect } from 'react';

const BookingContext = createContext(null);

export const BookingProvider = ({ children }) => {
  const [selectedBundles, setSelectedBundles] = useState(() => {
    try {
      const saved = localStorage.getItem('radja_cart_bundles');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  const [customItems, setCustomItems] = useState(() => {
    try {
      const saved = localStorage.getItem('radja_cart_items');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  const [eventType, setEventType] = useState('wedding');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [locationAddress, setLocationAddress] = useState('');
  const [notes, setNotes] = useState('');

  // Persist cart to local storage
  useEffect(() => {
    localStorage.setItem('radja_cart_bundles', JSON.stringify(selectedBundles));
  }, [selectedBundles]);

  useEffect(() => {
    localStorage.setItem('radja_cart_items', JSON.stringify(customItems));
  }, [customItems]);

  // Calculate rental duration in days
  const getDaysCount = () => {
    if (!startDate || !endDate) return 1;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays > 0 ? diffDays : 1;
  };

  const daysCount = getDaysCount();

  // Calculations
  const bundlesTotal = selectedBundles.reduce((sum, b) => sum + (b.package_price || 0), 0);
  const customItemsTotal = customItems.reduce((sum, item) => sum + ((item.price_per_day || 0) * (item.quantity || 1) * daysCount), 0);
  const grandTotal = bundlesTotal + customItemsTotal;
  const minimumDp = Math.round(grandTotal * 0.30);
  const totalItemCount = selectedBundles.length + customItems.reduce((sum, i) => sum + (i.quantity || 1), 0);

  // Actions
  const addBundle = (bundle) => {
    setSelectedBundles(prev => {
      const exists = prev.find(b => b.id === bundle.id);
      if (exists) return prev;
      return [...prev, bundle];
    });
  };

  const removeBundle = (bundleId) => {
    setSelectedBundles(prev => prev.filter(b => b.id !== bundleId));
  };

  const addCustomItem = (product, quantity = 1) => {
    setCustomItems(prev => {
      const existingIdx = prev.findIndex(item => item.id === product.id);
      if (existingIdx >= 0) {
        const updated = [...prev];
        updated[existingIdx].quantity += quantity;
        return updated;
      }
      return [...prev, { ...product, quantity }];
    });
  };

  const updateItemQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeCustomItem(productId);
      return;
    }
    setCustomItems(prev => prev.map(item => item.id === productId ? { ...item, quantity } : item));
  };

  const removeCustomItem = (productId) => {
    setCustomItems(prev => prev.filter(item => item.id !== productId));
  };

  const clearCart = () => {
    setSelectedBundles([]);
    setCustomItems([]);
    setStartDate('');
    setEndDate('');
    setLocationAddress('');
    setNotes('');
    localStorage.removeItem('radja_cart_bundles');
    localStorage.removeItem('radja_cart_items');
  };

  return (
    <BookingContext.Provider value={{
      selectedBundles,
      customItems,
      eventType,
      setEventType,
      startDate,
      setStartDate,
      endDate,
      setEndDate,
      locationAddress,
      setLocationAddress,
      notes,
      setNotes,
      daysCount,
      bundlesTotal,
      customItemsTotal,
      grandTotal,
      minimumDp,
      totalItemCount,
      addBundle,
      removeBundle,
      addCustomItem,
      updateItemQuantity,
      removeCustomItem,
      clearCart,
    }}>
      {children}
    </BookingContext.Provider>
  );
};

export const useBooking = () => useContext(BookingContext);
