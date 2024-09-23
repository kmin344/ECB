import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  const products = [
    { id: 1, name: "Apricot blossom", price: 29000, image: "https://cdn.imweb.me/thumbnail/20240606/701e851cfe0f2.jpg" },
    { id: 2, name: "Angel's Whisper", price: 29000, image: "https://cdn.imweb.me/thumbnail/20240606/701e851cfe0f2.jpg" },
    { id: 3, name: "Hinoki forest - woody musk", price: 31000, image: "https://cdn.imweb.me/thumbnail/20240606/701e851cfe0f2.jpg" },
    { id: 4, name: "Fig & matcha", price: 29000, image: "https://cdn.imweb.me/thumbnail/20240606/701e851cfe0f2.jpg" },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative h-screen">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{backgroundImage: "url('https://cdn.imweb.me/thumbnail/20240604/d46dca26fb004.jpg')"}}
        ></div>
        <div className="absolute inset-0 bg-black opacity-50"></div>
        <div className="relative z-10 flex flex-col items-center justify-center h-full text-white px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">Discover the Art of Fragrance</h1>
          <p className="text-xl md:text-2xl mb-8 max-w-2xl">
            Explore our collection of exquisite perfumes, crafted with the finest natural ingredients.
          </p>
          <Link 
            to="/shop" 
            className="bg-white text-black px-8 py-3 rounded-full text-lg font-semibold hover:bg-opacity-90 transition duration-300"
          >
            Shop Now
          </Link>
        </div>
      </section>

      {/* Event Section */}
      <section className="py-16 px-4 md:px-8 bg-white">
        <div className="container mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold">EVENT</h2>
            <Link to="/shop" className="text-sm font-medium hover:underline">View All</Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {products.map(product => (
              <div key={product.id} className="group">
                <Link to={`/product/${product.id}`} className="block">
                  <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden rounded-lg bg-gray-200 xl:aspect-w-7 xl:aspect-h-8">
                    <img 
                      src={product.image} 
                      alt={product.name} 
                      className="h-full w-full object-cover object-center group-hover:opacity-75 transition duration-300"
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

      {/* Best Sellers Section */}
      <section className="py-16 px-4 md:px-8 bg-gray-50">
        <div className="container mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold">BEST SELLERS</h2>
            <Link to="/shop" className="text-sm font-medium hover:underline">View All</Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {products.map(product => (
              <div key={product.id} className="group">
                <Link to={`/product/${product.id}`} className="block">
                  <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden rounded-lg bg-gray-200 xl:aspect-w-7 xl:aspect-h-8">
                    <img 
                      src={product.image} 
                      alt={product.name} 
                      className="h-full w-full object-cover object-center group-hover:opacity-75 transition duration-300"
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
    </div>
  );
};

export default Home;