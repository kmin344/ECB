import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

const HeaderWrapper = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 40px;
  background-color: #f5f5f5;
`;

const Logo = styled(Link)`
  font-size: 24px;
  font-weight: bold;
  text-decoration: none;
  color: #333;
`;

const Nav = styled.nav`
  display: flex;
  gap: 20px;
`;

const NavLink = styled(Link)`
  text-decoration: none;
  color: #333;
  &:hover {
    text-decoration: underline;
  }
`;

const UserActions = styled.div`
  display: flex;
  gap: 15px;
`;

const Header = () => {
  return (
    <HeaderWrapper>
      <Nav>
        <NavLink to="/brand">BRAND</NavLink>
        <NavLink to="/shop">SHOP</NavLink>
        <NavLink to="/membership-benefits">MEMBERSHIP BENEFITS</NavLink>
      </Nav>
      <Logo to="/">Atelier Faye</Logo>
      <UserActions>
        <NavLink to="/login">LOGIN</NavLink>
        <NavLink to="/join">JOIN</NavLink>
        <NavLink to="/cart">CART</NavLink>
        <NavLink to="/profile">MY</NavLink>
      </UserActions>
    </HeaderWrapper>
  );
};

export default Header;