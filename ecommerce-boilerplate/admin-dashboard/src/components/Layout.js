import React from 'react';
import { AppBar, Drawer, List, ListItem, ListItemIcon, ListItemText, Toolbar, Typography } from '@mui/material';
import { Link } from 'react-router-dom';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import PeopleIcon from '@mui/icons-material/People';
import RateReviewIcon from '@mui/icons-material/RateReview';

const drawerWidth = 240;

const Layout = ({ children }) => {
  return (
    <div style={{ display: 'flex' }}>
      <AppBar position="fixed" style={{ zIndex: 1201 }}>
        <Toolbar>
          <Typography variant="h6" noWrap>
            E-commerce Admin
          </Typography>
        </Toolbar>
      </AppBar>
      <Drawer
        variant="permanent"
        style={{
          width: drawerWidth,
          flexShrink: 0,
        }}
      >
        <Toolbar />
        <List>
          <ListItem button component={Link} to="/">
            <ListItemIcon><DashboardIcon /></ListItemIcon>
            <ListItemText primary="Dashboard" />
          </ListItem>
          <ListItem button component={Link} to="/products">
            <ListItemIcon><ShoppingCartIcon /></ListItemIcon>
            <ListItemText primary="Products" />
          </ListItem>
          <ListItem button component={Link} to="/orders">
            <ListItemIcon><ShoppingCartIcon /></ListItemIcon>
            <ListItemText primary="Orders" />
          </ListItem>
          <ListItem button component={Link} to="/users">
            <ListItemIcon><PeopleIcon /></ListItemIcon>
            <ListItemText primary="Users" />
          </ListItem>
          <ListItem button component={Link} to="/reviews">
            <ListItemIcon><RateReviewIcon /></ListItemIcon>
            <ListItemText primary="Reviews" />
          </ListItem>
        </List>
      </Drawer>
      <main style={{ flexGrow: 1, padding: '24px' }}>
        <Toolbar />
        {children}
      </main>
    </div>
  );
};

export default Layout;
