import React from 'react';

export const formatIDR = (amount) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(amount || 0);
};

export const formatDate = (dateStr) => {
  if (!dateStr) return '-';
  try {
    const d = new Date(dateStr);
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(d);
  } catch {
    return dateStr;
  }
};

export const getStatusBadge = (status) => {
  const configs = {
    pending: { label: 'Menunggu Konfirmasi', bg: 'bg-amber-100', text: 'text-amber-800', border: 'border-amber-300' },
    confirmed: { label: 'Dikonfirmasi', bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-300' },
    dp_paid: { label: 'DP Diterima', bg: 'bg-purple-100', text: 'text-purple-800', border: 'border-purple-300' },
    fully_paid: { label: 'Lunas', bg: 'bg-emerald-100', text: 'text-emerald-800', border: 'border-emerald-300' },
    completed: { label: 'Selesai', bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-300' },
    cancelled: { label: 'Dibatalkan', bg: 'bg-rose-100', text: 'text-rose-800', border: 'border-rose-300' },
    verified: { label: 'Terverifikasi', bg: 'bg-emerald-100', text: 'text-emerald-800', border: 'border-emerald-300' },
    rejected: { label: 'Ditolak', bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-300' },
    approved: { label: 'Disetujui', bg: 'bg-teal-100', text: 'text-teal-800', border: 'border-teal-300' },
  };

  const c = configs[status] || { label: status, bg: 'bg-slate-100', text: 'text-slate-800', border: 'border-slate-300' };
  
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${c.bg} ${c.text} ${c.border}`}>
      {c.label}
    </span>
  );
};

export const generateGoogleCalendarUrl = (booking) => {
  if (!booking || !booking.start_date) return '#';
  
  try {
    const formatDateForGCal = (dateStr) => {
      return dateStr.replace(/-/g, '');
    };

    const nextDayStr = (dateStr) => {
      const d = new Date(dateStr);
      d.setDate(d.getDate() + 1);
      return d.toISOString().split('T')[0].replace(/-/g, '');
    };

    const start = formatDateForGCal(booking.start_date);
    const end = nextDayStr(booking.end_date || booking.start_date);

    const clientName = booking.customer?.name || 'Klien';
    const clientPhone = booking.customer?.whatsapp || '';
    const title = `💍 Pernikahan ${clientName} (${booking.booking_code}) - Radja Wedding`;
    
    const items = [];
    booking.selected_bundles?.forEach(b => items.push(`• [Paket] ${b.name}`));
    booking.custom_items?.forEach(i => items.push(`• ${i.quantity}x ${i.name}`));
    const itemsText = items.length > 0 ? items.join('\n') : '-';

    const details = [
      `KODE BOOKING: ${booking.booking_code}`,
      `KLIEN: ${clientName} ${clientPhone ? `(WA: ${clientPhone})` : ''}`,
      `STATUS: ${(booking.status || 'BOOKING').toUpperCase()}`,
      `LOKASI: ${booking.location_address || '-'}`,
      `RINCIAN ITEM/RIAS:\n${itemsText}`,
      `CATATAN: ${booking.notes || '-'}`,
      `Penyedia: Radja Wedding Salon & Bridal`
    ].join('\n\n');

    const params = new URLSearchParams({
      action: 'TEMPLATE',
      text: title,
      dates: `${start}/${end}`,
      details: details,
      location: booking.location_address || 'Salon Radja Wedding'
    });

    return `https://calendar.google.com/calendar/render?${params.toString()}`;
  } catch (err) {
    console.error('Error generating gcal url:', err);
    return '#';
  }
};

