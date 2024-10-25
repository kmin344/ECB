import React from 'react';
import { Link } from 'react-router-dom';

const EventSection = () => {
  // Mock product data
  const products = [
    { id: 1, name: "Product 1", price: 29000, image: "https://cdn.imweb.me/thumbnail/20240606/07924e4e9b363.jpg" },
    { id: 2, name: "Product 2", price: 39000, image: "https://cdn.imweb.me/thumbnail/20240607/ebc866450cfd0.jpg" },
    { id: 3, name: "Product 3", price: 39000, image: "https://cdn.imweb.me/thumbnail/20240607/ebc866450cfd0.jpg" },
    { id: 3, name: "Product 3", price: 39000, image: "https://cdn.imweb.me/thumbnail/20240607/ebc866450cfd0.jpg" },
    { id: 3, name: "Product 3", price: 39000, image: "https://cdn.imweb.me/thumbnail/20240607/ebc866450cfd0.jpg" },
    // Add more products as needed
  ];

  return (
    <section className="py-16 px-4">
      <div className="container mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold">EVENT</h2>
          <Link to="/shop" className="text-sm font-medium">SHOP ALL &gt;</Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {products.map(product => (
            <div key={product.id} className="group">
              <Link to={`/product/${product.id}`}>
                <img src={product.image} alt={product.name} className="w-full h-64 object-cover" />
                <h3 className="mt-2 text-lg font-medium">{product.name}</h3>
                <p className="text-gray-600">{product.price.toLocaleString()}원</p>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default EventSection;