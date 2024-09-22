import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

const HeaderWrapper = styled.header`
  background-color: ${({ theme }) => theme.colors.primary};
  padding: 1rem;
`;

const Nav = styled.nav`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Logo = styled(Link)`
  font-size: ${({ theme }) => theme.fontSizes.large};
  font-weight: bold;
  color: white;
`;

const NavLinks = styled.div`
  display: flex;
  gap: 1rem;
`;

const NavLink = styled(Link)`
  color: white;
  &:hover {
    text-decoration: underline;
  }
`;

const Header = () => {
  return (
    <HeaderWrapper>
      <Nav>
        <Logo to="/">E-Commerce Store</Logo>
        <NavLinks>
          <NavLink to="/">Home</NavLink>
          <NavLink to="/products">Products</NavLink>
          <NavLink to="/cart">Cart</NavLink>
          <NavLink to="/profile">Profile</NavLink>
        </NavLinks>
      </Nav>
    </HeaderWrapper>
  );
};

export default Header;