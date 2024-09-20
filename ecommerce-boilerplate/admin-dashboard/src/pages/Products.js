import React, { useState, useEffect } from 'react';
import { 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, 
  Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, 
  Typography, Grid, Switch, FormControlLabel
} from '@mui/material';
import Layout from '../components/Layout';
import { getProducts, createProduct, updateProduct, deleteProduct } from '../services/api';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [open, setOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    inStock: true,
    stock: 0
  });
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

  const handleOpen = (product = {
    name: '',
    description: '',
    price: '',
    category: '',
    inStock: true,
    stock: 0
  }) => {
    setCurrentProduct(product);
    setIsEditing(!!product._id);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setCurrentProduct({
      name: '',
      description: '',
      price: '',
      category: '',
      inStock: true,
      stock: 0
    });
    setIsEditing(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentProduct({ ...currentProduct, [name]: value });
  };

  const handleSwitchChange = (e) => {
    setCurrentProduct({ ...currentProduct, [e.target.name]: e.target.checked });
  };

  const handleSubmit = async () => {
    try {
      const productData = {
        ...currentProduct,
        price: parseFloat(currentProduct.price),
        stock: parseInt(currentProduct.stock, 10)
      };

      if (isEditing) {
        await updateProduct(currentProduct._id, productData);
      } else {
        await createProduct(productData);
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
              <TableCell>Description</TableCell>
              <TableCell>Price</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>In Stock</TableCell>
              <TableCell>Stock</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product._id}>
                <TableCell>{product.name}</TableCell>
                <TableCell>{product.description}</TableCell>
                <TableCell>${product.price.toFixed(2)}</TableCell>
                <TableCell>{product.category}</TableCell>
                <TableCell>{product.inStock ? 'Yes' : 'No'}</TableCell>
                <TableCell>{product.stock}</TableCell>
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
            name="description"
            label="Description"
            type="text"
            fullWidth
            multiline
            rows={4}
            value={currentProduct.description}
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
            name="category"
            label="Category"
            type="text"
            fullWidth
            value={currentProduct.category}
            onChange={handleInputChange}
          />
          <FormControlLabel
            control={
              <Switch
                checked={currentProduct.inStock}
                onChange={handleSwitchChange}
                name="inStock"
                color="primary"
              />
            }
            label="In Stock"
          />
          <TextField
            margin="dense"
            name="stock"
            label="Stock"
            type="number"
            fullWidth
            value={currentProduct.stock}
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