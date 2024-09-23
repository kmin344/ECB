import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';

const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
`;

const HeroSection = styled.section`
  position: relative;
  height: 80vh;
  background-image: url('https://cdn.imweb.me/thumbnail/20240604/d46dca26fb004.jpg');
  background-size: cover;
  background-position: center;
`;

const HeroOverlay = styled.div`
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.5), transparent);
`;

const HeroContent = styled.div`
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  color: white;
  padding: 0 1rem;
`;

const HeroTitle = styled.h1`
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 1rem;
  
  @media (min-width: 768px) {
    font-size: 3rem;
  }
`;

const HeroDescription = styled.p`
  font-size: 1rem;
  max-width: 32rem;
  margin-bottom: 2rem;
  
  @media (min-width: 768px) {
    font-size: 1.25rem;
  }
`;

const StyledButton = styled(Link)`
  background-color: white;
  color: black;
  padding: 0.75rem 1.5rem;
  border-radius: 0.25rem;
  text-decoration: none;
  font-weight: bold;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: #f0f0f0;
  }
`;

const SectionContainer = styled.section`
  padding: 3rem 1rem;
  background-color: white;
  
  @media (min-width: 768px) {
    padding: 4rem 1.5rem;
  }
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
`;

const SectionTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: bold;
  
  @media (min-width: 768px) {
    font-size: 2rem;
  }
`;

const ViewAllLink = styled(Link)`
  font-size: 0.875rem;
  font-weight: 500;
  text-decoration: none;
  color: inherit;
  
  &:hover {
    text-decoration: underline;
  }
`;

const ProductGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
  
  @media (min-width: 768px) {
    grid-template-columns: repeat(4, 1fr);
  }
`;

const ProductCard = styled.div`
  display: flex;
  flex-direction: column;
`;

const ProductImage = styled.img`
  width: 100%;
  height: 300px;
  object-fit: cover;
  border-radius: 0.5rem;
  transition: transform 0.3s ease;
  
  &:hover {
    transform: scale(1.05);
  }
`;

const ProductInfo = styled.div`
  margin-top: 1rem;
`;

const ProductName = styled.h3`
  font-size: 1rem;
  font-weight: 500;
`;

const ProductPrice = styled.p`
  font-size: 0.875rem;
  color: #6b7280;
`;

const Home = () => {
  const products = [
    { id: 1, name: "Apricot blossom", price: 29000, image: "https://cdn.imweb.me/thumbnail/20240606/701e851cfe0f2.jpg" },
    { id: 2, name: "Angel's Whisper", price: 29000, image: "https://cdn.imweb.me/thumbnail/20240606/701e851cfe0f2.jpg" },
    { id: 3, name: "Hinoki forest - woody musk", price: 31000, image: "https://cdn.imweb.me/thumbnail/20240606/701e851cfe0f2.jpg" },
    { id: 4, name: "Fig & matcha", price: 29000, image: "https://cdn.imweb.me/thumbnail/20240606/701e851cfe0f2.jpg" },
  ];

  return (
    <PageContainer>
      <HeroSection>
        <HeroOverlay />
        <HeroContent>
          <HeroTitle>Discover the Art of Fragrance</HeroTitle>
          <HeroDescription>
            Explore our collection of exquisite perfumes, crafted with the finest natural ingredients.
          </HeroDescription>
          <StyledButton to="/shop">Shop Now</StyledButton>
        </HeroContent>
      </HeroSection>

      <SectionContainer>
        <SectionHeader>
          <SectionTitle>EVENT</SectionTitle>
          <ViewAllLink to="/shop">View All</ViewAllLink>
        </SectionHeader>
        <ProductGrid>
          {products.map(product => (
            <ProductCard key={product.id}>
              <Link to={`/product/${product.id}`}>
                <ProductImage src={product.image} alt={product.name} />
                <ProductInfo>
                  <ProductName>{product.name}</ProductName>
                  <ProductPrice>{product.price.toLocaleString()}원</ProductPrice>
                </ProductInfo>
              </Link>
            </ProductCard>
          ))}
        </ProductGrid>
      </SectionContainer>

      <SectionContainer>
        <SectionHeader>
          <SectionTitle>BEST SELLERS</SectionTitle>
          <ViewAllLink to="/shop">View All</ViewAllLink>
        </SectionHeader>
        <ProductGrid>
          {products.map(product => (
            <ProductCard key={product.id}>
              <Link to={`/product/${product.id}`}>
                <ProductImage src={product.image} alt={product.name} />
                <ProductInfo>
                  <ProductName>{product.name}</ProductName>
                  <ProductPrice>{product.price.toLocaleString()}원</ProductPrice>
                </ProductInfo>
              </Link>
            </ProductCard>
          ))}
        </ProductGrid>
      </SectionContainer>
    </PageContainer>
  );
};

export default Home;