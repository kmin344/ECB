import React, { useState, useEffect } from 'react';
import { 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, 
  Button, Dialog, DialogTitle, DialogContent, DialogActions, 
  Typography, Select, MenuItem
} from '@mui/material';
import Layout from '../components/Layout';
import { getOrders, updateOrderStatus } from '../services/api';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [open, setOpen] = useState(false);
  const [currentOrder, setCurrentOrder] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await getOrders();
      setOrders(response.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
      // TODO: Implement error handling
    }
  };

  const handleOpen = (order) => {
    setCurrentOrder(order);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setCurrentOrder(null);
  };

  const handleStatusChange = async (e) => {
    const newStatus = e.target.value;
    try {
      await updateOrderStatus(currentOrder._id, newStatus);
      setOrders(orders.map(order => 
        order._id === currentOrder._id ? {...order, status: newStatus} : order
      ));
      handleClose();
    } catch (error) {
      console.error('Error updating order status:', error);
      // TODO: Implement error handling
    }
  };

  const formatPrice = (price) => {
    return typeof price === 'number' ? `$${price.toFixed(2)}` : 'N/A';
  };

  return (
    <Layout>
      <Typography variant="h4" gutterBottom>
        Orders
      </Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Order ID</TableCell>
              <TableCell>Customer ID</TableCell>
              <TableCell>Total</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order._id}>
                <TableCell>{order._id}</TableCell>
                <TableCell>{order.user || 'N/A'}</TableCell>
                <TableCell>{formatPrice(order.totalAmount)}</TableCell>
                <TableCell>{order.status}</TableCell>
                <TableCell>{new Date(order.createdAt).toLocaleDateString()}</TableCell>
                <TableCell>
                  <Button color="primary" onClick={() => handleOpen(order)}>
                    View Details
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Order Details</DialogTitle>
        <DialogContent>
          {currentOrder && (
            <>
              <Typography variant="h6">Order ID: {currentOrder._id}</Typography>
              <Typography>Customer ID: {currentOrder.user || 'N/A'}</Typography>
              <Typography>Total: {formatPrice(currentOrder.totalAmount)}</Typography>
              <Typography>Status: {currentOrder.status}</Typography>
              <Typography>Date: {new Date(currentOrder.createdAt).toLocaleString()}</Typography>
              <Typography variant="h6" style={{marginTop: '1rem'}}>Products:</Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Product ID</TableCell>
                      <TableCell>Quantity</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {currentOrder.products.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>{item.product || 'N/A'}</TableCell>
                        <TableCell>{item.quantity}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              <Typography variant="h6" style={{marginTop: '1rem'}}>Update Status:</Typography>
              <Select
                value={currentOrder.status}
                onChange={handleStatusChange}
                fullWidth
              >
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="processing">Processing</MenuItem>
                <MenuItem value="shipped">Shipped</MenuItem>
                <MenuItem value="delivered">Delivered</MenuItem>
                <MenuItem value="cancelled">Cancelled</MenuItem>
              </Select>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Layout>
  );
};

export default Orders;