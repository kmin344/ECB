import { useDispatch } from 'react-redux';
import { logoutUser } from '../store/authSlice';

const Logout = async () => {
  const dispatch = useDispatch();

  try {
    await dispatch(logoutUser()).unwrap();
  } catch (err) {
    console.error('Failed to log in: ', err);
  }

  return;
};

export default Logout;