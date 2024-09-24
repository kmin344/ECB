import React from 'react';
import styled from 'styled-components';

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background-color: white;
  padding: 20px;
  border-radius: 5px;
  max-width: 500px;
  width: 100%;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 10px;
  right: 10px;
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
`;

const ProductImage = styled.img`
  width: 100%;
  height: auto;
`;

const ProductName = styled.h2`
  margin-top: 20px;
`;

const ProductPrice = styled.p`
  font-size: 18px;
  margin-top: 10px;
`;

const AddToCartButton = styled.button`
  background-color: #3498db;
  color: white;
  border: none;
  padding: 10px 20px;
  margin-top: 20px;
  cursor: pointer;
  &:hover {
    background-color: #2980b9;
  }
`;

const QuickViewModal = ({ product, onClose }) => {
  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <CloseButton onClick={onClose}>&times;</CloseButton>
        <ProductImage src={product.image} alt={product.name} />
        <ProductName>{product.name}</ProductName>
        <ProductPrice>
          <span>{product.price.toLocaleString()}원</span>
          <span style={{ textDecoration: 'line-through', marginLeft: '10px', color: '#888' }}>
            {product.originalPrice.toLocaleString()}원
          </span>
        </ProductPrice>
        <AddToCartButton>Add to Cart</AddToCartButton>
      </ModalContent>
    </ModalOverlay>
  );
};

export default QuickViewModal;