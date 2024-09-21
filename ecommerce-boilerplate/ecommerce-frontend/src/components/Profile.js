import React from 'react';

const Profile = ({ user }) => (
  <div className="profile">
    <h2>Your Profile</h2>
    <p>Name: {user.name}</p>
    <p>Email: {user.email}</p>
    <button>Edit Profile</button>
  </div>
);

export default Profile;
