import React from 'react';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import Swal from 'sweetalert2';
import styles from './Header.module.css';


const Header = ({setAuth,auth}) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    Swal.fire({
      title: 'Are you sure?',
      text: 'Do you really want to log out?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, log out!',
    }).then((result) => {
      if (result.isConfirmed) {
        setAuth({ username: '', password: '' });
        navigate('/login');
      }
    });
  };

  return (
    <header className={styles.header}>
      <h1 className={styles.logo}>Hi,{auth.username}</h1>
      <div className={styles.userInfo}>
        <button onClick={handleLogout} className={styles.logoutButton}>
          Logout
        </button>
      </div>
    </header>
  );
}

Header.propTypes = {
  setAuth: PropTypes.func.isRequired,
  auth: PropTypes.shape({
    username: PropTypes.string.isRequired,
    password: PropTypes.string.isRequired,
  }).isRequired,
};

export default Header;
