// src/pages/Dashboard.js
import React, { useState, useEffect } from 'react';
import { 
  Grid, Paper, Typography, CircularProgress
} from '@mui/material';

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  LineChart, Line, PieChart, Pie, Cell
} from 'recharts';
import Layout from '../components/Layout';
import { getProducts, getOrders, getUsers, getReviews } from '../services/api';

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalProducts: 0,
    totalUsers: 0,
    totalReviews: 0,
  });
  const [revenueData, setRevenueData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [statusData, setStatusData] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [products, orders, users, reviews] = await Promise.all([
        getProducts(),
        getOrders(),
        getUsers(),
        getReviews()
      ]);

      // Calculate metrics
      const totalRevenue = orders.data.reduce((sum, order) => sum + order.total, 0);
      const totalOrders = orders.data.length;
      const totalProducts = products.data.length;
      const totalUsers = users.data.length;
      const totalReviews = reviews.data.length;

      setMetrics({ totalRevenue, totalOrders, totalProducts, totalUsers, totalReviews });

      // Prepare revenue data (last 7 days)
      const last7Days = [...Array(7)].map((_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - i);
        return d.toISOString().split('T')[0];
      }).reverse();

      const revenueByDay = orders.data.reduce((acc, order) => {
        const day = new Date(order.createdAt).toISOString().split('T')[0];
        acc[day] = (acc[day] || 0) + order.total;
        return acc;
      }, {});

      setRevenueData(last7Days.map(day => ({
        date: day,
        revenue: revenueByDay[day] || 0
      })));

      // Prepare category data
      const categoryCounts = products.data.reduce((acc, product) => {
        acc[product.category] = (acc[product.category] || 0) + 1;
        return acc;
      }, {});

      setCategoryData(Object.entries(categoryCounts).map(([name, value]) => ({ name, value })));

      // Prepare order status data
      const statusCounts = orders.data.reduce((acc, order) => {
        acc[order.status] = (acc[order.status] || 0) + 1;
        return acc;
      }, {});

      setStatusData(Object.entries(statusCounts).map(([name, value]) => ({ name, value })));

      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setLoading(false);
      // TODO: Implement error handling
    }
  };

  if (loading) {
    return (
      <Layout>
        <CircularProgress />
      </Layout>
    );
  }

  return (
    <Layout>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      <Grid container spacing={3}>
        {/* Metrics */}
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <Paper style={{ padding: '1rem', textAlign: 'center' }}>
            <Typography variant="h6">Total Revenue</Typography>
            <Typography variant="h4">${metrics.totalRevenue.toFixed(2)}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <Paper style={{ padding: '1rem', textAlign: 'center' }}>
            <Typography variant="h6">Total Orders</Typography>
            <Typography variant="h4">{metrics.totalOrders}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <Paper style={{ padding: '1rem', textAlign: 'center' }}>
            <Typography variant="h6">Total Products</Typography>
            <Typography variant="h4">{metrics.totalProducts}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <Paper style={{ padding: '1rem', textAlign: 'center' }}>
            <Typography variant="h6">Total Users</Typography>
            <Typography variant="h4">{metrics.totalUsers}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <Paper style={{ padding: '1rem', textAlign: 'center' }}>
            <Typography variant="h6">Total Reviews</Typography>
            <Typography variant="h4">{metrics.totalReviews}</Typography>
          </Paper>
        </Grid>

        {/* Revenue Chart */}
        <Grid item xs={12} md={6}>
          <Paper style={{ padding: '1rem' }}>
            <Typography variant="h6">Revenue (Last 7 Days)</Typography>
            <LineChart width={500} height={300} data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="revenue" stroke="#8884d8" />
            </LineChart>
          </Paper>
        </Grid>

        {/* Product Categories Chart */}
        <Grid item xs={12} md={6}>
          <Paper style={{ padding: '1rem' }}>
            <Typography variant="h6">Product Categories</Typography>
            <PieChart width={500} height={300}>
              <Pie data={categoryData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} fill="#8884d8" label>
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={`#${Math.floor(Math.random()*16777215).toString(16)}`} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </Paper>
        </Grid>

        {/* Order Status Chart */}
        <Grid item xs={12}>
          <Paper style={{ padding: '1rem' }}>
            <Typography variant="h6">Order Status</Typography>
            <BarChart width={1000} height={300} data={statusData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill="#8884d8" />
            </BarChart>
          </Paper>
        </Grid>
      </Grid>
    </Layout>
  );
};

export default Dashboard;