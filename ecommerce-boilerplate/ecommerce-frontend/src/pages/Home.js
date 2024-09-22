import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';

const HeroSection = styled.section`
  position: relative;
  height: 600px;
  background-image: url('https://cdn.imweb.me/thumbnail/20240604/d46dca26fb004.jpg');
  background-size: cover;
  background-position: center;
`;

const ProductGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-top: 40px;
`;

const ProductCard = styled.div`
  text-align: center;
`;

const ProductImage = styled.img`
  width: 100%;
  height: auto;
`;

const ProductName = styled.h3`
  margin-top: 10px;
  font-size: 16px;
`;

const ProductPrice = styled.p`
  color: #888;
`;

const SalePrice = styled.span`
  color: red;
  margin-right: 5px;
`;

const Home = () => {
  // Mock product data
  const products = [
    { id: 1, name: "Apricot blossom", price: 29000, originalPrice: 44000, image: "https://cdn.imweb.me/thumbnail/20240606/701e851cfe0f2.jpg" },
    { id: 2, name: "Angel's Whisper", price: 29000, originalPrice: 58000, image: "https://cdn.imweb.me/thumbnail/20240606/701e851cfe0f2.jpg" },
    { id: 3, name: "Hinoki forest - woody musk", price: 31000, originalPrice: 62000, image: "https://cdn.imweb.me/thumbnail/20240606/701e851cfe0f2.jpg" },
    { id: 4, name: "Fig & matcha", price: 29000, originalPrice: 67000, image: "https://cdn.imweb.me/thumbnail/20240606/701e851cfe0f2.jpg" },
  ];

  return (
    <div>
      <HeroSection />
      <h2>EVENT</h2>
      <Link to="/shop">SHOP ALL &gt;</Link>
      <ProductGrid>
        {products.map(product => (
          <ProductCard key={product.id}>
            <ProductImage src={product.image} alt={product.name} />
            <ProductName>{product.name}</ProductName>
            <ProductPrice>
              <SalePrice>{product.price.toLocaleString()}원</SalePrice>
              <span style={{ textDecoration: 'line-through' }}>{product.originalPrice.toLocaleString()}원</span>
            </ProductPrice>
          </ProductCard>
        ))}
      </ProductGrid>
    </div>
  );
};

export default Home;