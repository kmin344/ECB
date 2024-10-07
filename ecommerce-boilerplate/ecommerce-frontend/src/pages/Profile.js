import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { updateUserProfile, fetchUserProfileWithOrders } from '../store/userSlice';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const userState = useSelector(state => state.user);
  const authState = useSelector(state => state.auth);
  const [editing, setEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    address: ''
  });

  useEffect(() => {
    if (authState.user && authState.user._id) {
      dispatch(fetchUserProfileWithOrders(authState.user._id));
    } else if (!authState.token) {
      // Redirect to login if there's no token
      navigate('/login');
    }
  }, [dispatch, authState.user, authState.token, navigate]);

  useEffect(() => {
    if (userState && userState.profile) {
      setProfileData({
        name: userState.profile.name || '',
        email: userState.profile.email || '',
        phone: userState.profile.phone || '',
        address: userState.profile.address || ''
      });
    }
  }, [userState]);

  const handleInputChange = (e) => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(updateUserProfile(profileData));
    setEditing(false);
  };

  if (!authState.user) return <div>Loading...</div>;
  if (userState.status === 'loading') return <div>Loading profile...</div>;
  if (userState.status === 'failed') return <div>Error loading profile. Please try again.</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">My Profile</h1>
      
      <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
        <h2 className="text-2xl font-bold mb-4">Personal Information</h2>
        {editing ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Form fields remain the same */}
            {/* ... */}
          </form>
        ) : (
          <div>
            <p><strong>Name:</strong> {profileData.name}</p>
            <p><strong>Email:</strong> {profileData.email}</p>
            <p><strong>Phone:</strong> {profileData.phone}</p>
            <p><strong>Address:</strong> {profileData.address}</p>
            <button
              className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              onClick={() => setEditing(true)}
            >
              Edit Profile
            </button>
          </div>
        )}
      </div>

      <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
        <h2 className="text-2xl font-bold mb-4">Order History</h2>
        {userState.orders && userState.orders.length > 0 ? (
          <ul>
            {userState.orders.map(order => (
              <li key={order.id} className="mb-4 p-4 border rounded">
                <p><strong>Order ID:</strong> {order.id}</p>
                <p><strong>Date:</strong> {new Date(order.date).toLocaleDateString()}</p>
                <p><strong>Total:</strong> ${order.total.toFixed(2)}</p>
                <p><strong>Status:</strong> {order.status}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p>No orders found.</p>
        )}
      </div>
    </div>
  );
};

export default Profile;