import React from 'react';
import { Link } from 'react-router-dom';

const BestSellersSection = () => {
  // Mock product data for Best Sellers
  const bestSellers = [
    { id: 1, name: "Best Seller 1", price: 39000, image: "https://cdn.imweb.me/thumbnail/20240606/9bded7c6993db.jpg" },
    { id: 2, name: "Best Seller 2", price: 49000, image: "https://cdn.imweb.me/thumbnail/20240606/9bded7c6993db.jpg" },
    { id: 3, name: "Best Seller 3", price: 44000, image: "https://cdn.imweb.me/thumbnail/20240606/9bded7c6993db.jpg" },
    { id: 4, name: "Best Seller 4", price: 52000, image: "https://cdn.imweb.me/thumbnail/20240606/9bded7c6993db.jpg" },
  ];

  return (
    <section className="py-16 px-4">
      <div className="container mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold">BEST SELLERS</h2>
          <Link to="/best-sellers" className="text-sm font-medium">SHOP ALL &gt;</Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {bestSellers.map(product => (
            <div key={product.id} className="group">
              <Link to={`/product/${product.id}`}>
                <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden rounded-lg bg-gray-200 xl:aspect-w-7 xl:aspect-h-8">
                  <img 
                    src={product.image} 
                    alt={product.name} 
                    className="h-full w-full object-cover object-center group-hover:opacity-75"
                  />
                </div>
                <h3 className="mt-4 text-sm text-gray-700">{product.name}</h3>
                <p className="mt-1 text-lg font-medium text-gray-900">{product.price.toLocaleString()}원</p>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BestSellersSection;