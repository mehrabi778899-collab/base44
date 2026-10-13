import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { api } from './content';

export const SiteContext = createContext(null);
export const useSite = () => useContext(SiteContext);

export function SiteProvider({ children }) {
  const [settings, setSettings] = useState({ brandName: 'گرم‌نور', phone: '', whatsapp: '', instagram: '', telegram: '', email: '', address: '', workingHours: 'شنبه تا پنجشنبه، ۹ تا ۱۸', shippingCost: 50000, freeShippingThreshold: 500000, bikeCost: 30000, bikeCity: '', zarinpalMerchantId: '' });
  const [cart, setCart] = useState(() => { try { return JSON.parse(localStorage.getItem('garmnoor_cart') || '[]'); } catch { return []; } });
  const [wishlist, setWishlist] = useState(() => { try { return JSON.parse(localStorage.getItem('garmnoor_wishlist') || '[]'); } catch { return []; } });
  const [user, setUser] = useState(null);

  useEffect(() => { api('/settings').then(setSettings).catch(() => {}); }, []);
  useEffect(() => { localStorage.setItem('garmnoor_cart', JSON.stringify(cart)); }, [cart]);
  useEffect(() => { localStorage.setItem('garmnoor_wishlist', JSON.stringify(wishlist)); }, [wishlist]);
  useEffect(() => { api('/auth/session').then(r => setUser(r.user)).catch(() => {}); }, []);

  const addToCart = useCallback((product, qty = 1) => {
    setCart(prev => { const ex = prev.find(i => i.id === product.id); if (ex) return prev.map(i => i.id === product.id ? { ...i, qty: i.qty + qty } : i); return [...prev, { id: product.id, name: product.name, price: product.price, image: product.images?.[0], qty }]; });
  }, []);
  const removeFromCart = useCallback(id => setCart(prev => prev.filter(i => i.id !== id)), []);
  const updateQty = useCallback((id, qty) => setCart(prev => prev.map(i => i.id === id ? { ...i, qty: Math.max(1, qty) } : i)), []);
  const clearCart = useCallback(() => setCart([]), []);
  const cartTotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const cartCount = cart.reduce((s, i) => s + i.qty, 0);
  const toggleWishlist = useCallback(id => setWishlist(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]), []);
  const inWishlist = useCallback(id => wishlist.includes(id), [wishlist]);
  const setUserSession = useCallback(u => setUser(u), []);

  return React.createElement(SiteContext.Provider, { value: { settings, setSettings, cart, addToCart, removeFromCart, updateQty, clearCart, cartTotal, cartCount, wishlist, toggleWishlist, inWishlist, user, setUserSession } }, children);
}
