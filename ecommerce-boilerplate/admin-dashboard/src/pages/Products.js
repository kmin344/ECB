// src/pages/Products.js
import React, { useState, useEffect } from 'react';
import { 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, 
  Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, 
  Typography, Grid
} from '@material-ui/core';
import Layout from '../components/Layout';
import { getProducts, createProduct, updateProduct, deleteProduct } from '../services/api';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [open, setOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState({ name: '', price: '', description: '' });
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await getProducts();
      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
      // TODO: Implement error handling
    }
  };

  const handleOpen = (product = { name: '', price: '', description: '' }) => {
    setCurrentProduct(product);
    setIsEditing(!!product._id);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setCurrentProduct({ name: '', price: '', description: '' });
    setIsEditing(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentProduct({ ...currentProduct, [name]: value });
  };

  const handleSubmit = async () => {
    try {
      if (isEditing) {
        await updateProduct(currentProduct._id, currentProduct);
      } else {
        await createProduct(currentProduct);
      }
      fetchProducts();
      handleClose();
    } catch (error) {
      console.error('Error saving product:', error);
      // TODO: Implement error handling
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await deleteProduct(id);
        fetchProducts();
      } catch (error) {
        console.error('Error deleting product:', error);
        // TODO: Implement error handling
      }
    }
  };

  return (
    <Layout>
      <Grid container justifyContent="space-between" alignItems="center">
        <Grid item>
          <Typography variant="h4" gutterBottom>
            Products
          </Typography>
        </Grid>
        <Grid item>
          <Button variant="contained" color="primary" onClick={() => handleOpen()}>
            Add New Product
          </Button>
        </Grid>
      </Grid>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Price</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product._id}>
                <TableCell>{product.name}</TableCell>
                <TableCell>${product.price}</TableCell>
                <TableCell>{product.description}</TableCell>
                <TableCell>
                  <Button color="primary" onClick={() => handleOpen(product)}>
                    Edit
                  </Button>
                  <Button color="secondary" onClick={() => handleDelete(product._id)}>
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>{isEditing ? 'Edit Product' : 'Add New Product'}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            name="name"
            label="Product Name"
            type="text"
            fullWidth
            value={currentProduct.name}
            onChange={handleInputChange}
          />
          <TextField
            margin="dense"
            name="price"
            label="Price"
            type="number"
            fullWidth
            value={currentProduct.price}
            onChange={handleInputChange}
          />
          <TextField
            margin="dense"
            name="description"
            label="Description"
            type="text"
            fullWidth
            multiline
            rows={4}
            value={currentProduct.description}
            onChange={handleInputChange}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Cancel
          </Button>
          <Button onClick={handleSubmit} color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Layout>
  );
};

export default Products;