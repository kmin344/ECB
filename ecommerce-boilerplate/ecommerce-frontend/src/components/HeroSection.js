import React from 'react';
import { Link } from 'react-router-dom';

const HeroSection = () => {
  return (
    <section className="relative h-screen">
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{backgroundImage: "url('https://cdn.imweb.me/thumbnail/20240604/d46dca26fb004.jpg')"}}
      ></div>
      <div className="absolute inset-0 bg-black opacity-50"></div>
      <div className="relative z-10 flex flex-col items-center justify-center h-full text-white">
        <h1 className="text-4xl md:text-6xl font-bold mb-4">Discover the Art of Fragrance</h1>
        <p className="text-xl md:text-2xl mb-8">Explore our collection of exquisite perfumes</p>
        <Link to="/shop" className="bg-white text-black px-8 py-3 rounded-full text-lg font-semibold">
          Shop Now
        </Link>
      </div>
    </section>
  );
};

export default HeroSection;