import React, { useContext, useState } from 'react';
import { CartContext } from '../context/CartContext';

const Cart = () => {
  const { cart, updateQuantity, removeFromCart } = useContext(CartContext);
  const [promoCode, setPromoCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [promoError, setPromoError] = useState('');

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = +(subtotal * 0.1).toFixed(2); // 10% tax
  const total = +(subtotal + tax - discount).toFixed(2);

  const handleApplyPromo = () => {
    const trimmed = promoCode.trim().toUpperCase();
    if (!trimmed) {
      setDiscount(0);
      setPromoError('Please enter a promo code.');
    } else if (trimmed === '20 DOLLAR OFF') {
      setDiscount(20);
      setPromoError('');
    } else {
      setDiscount(0);
      setPromoError('❌ Invalid promo code');
    }
  };

  if (cart.length === 0) {
    return (
      <div style={{ padding: '2rem' }}>
        <h2>Shopping Cart</h2>
        <p>Your cart is empty.</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <h2>Shopping Cart</h2>

      {cart.map((item) => {
        const id = item.id || item._id;
        return (
          <div
            key={id}
            style={{
              display: 'flex',
              gap: '1rem',
              marginBottom: '1.5rem',
              alignItems: 'center',
              borderBottom: '1px solid #ccc',
              paddingBottom: '1rem',
            }}
          >
            {/* 商品图片 */}
            <img
              src={item.imageUrl}
              alt={item.name}
              style={{
                width: '100px',
                height: '100px',
                objectFit: 'cover',
                borderRadius: '8px',
                border: '1px solid #ddd',
              }}
            />

            {/* 商品信息 */}
            <div style={{ flex: 1 }}>
              <h4>{item.name}</h4>
              <p>Price: ${item.price} x {item.quantity}</p>
              <div>
                <button onClick={() => updateQuantity(id, -1)}>-</button>
                <button onClick={() => updateQuantity(id, 1)}>+</button>
                <button onClick={() => removeFromCart(id)}>Remove</button>
              </div>
            </div>
          </div>
        );
      })}

      {/* Promo Code Section */}
      <div style={{ margin: '1rem 0' }}>
        <input
          type="text"
          placeholder="Enter promo code"
          value={promoCode}
          onChange={(e) => setPromoCode(e.target.value)}
        />
        <button onClick={handleApplyPromo}>Apply</button>
        {promoError && (
          <p style={{ color: 'red', marginTop: '0.5rem' }}>{promoError}</p>
        )}
      </div>

      {/* Price Summary */}
      <div style={{ marginTop: '1rem' }}>
        <p>Subtotal: ${subtotal}</p>
        <p>Tax: ${tax}</p>
        <p>Discount: -${discount}</p>
        <h3>Total: ${total}</h3>
      </div>

      <button
        style={{
          marginTop: '1rem',
          padding: '0.75rem 1.5rem',
          backgroundColor: '#007bff',
          color: '#fff',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
        }}
        onClick={() => alert('✅ Proceeding to checkout...')}
      >
        Continue to Checkout
      </button>
    </div>
  );
};

export default Cart;
