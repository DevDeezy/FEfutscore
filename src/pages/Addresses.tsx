import React from 'react';
import AddressManager from '../components/AddressManager';
import { useAppSelector } from '../store';

const Addresses: React.FC = () => {
  const user = useAppSelector((state) => state.auth.user);
  console.log('user in Addresses page:', user);
  if (!user) return <div>Por favor, faça login para gerir as suas moradas.</div>;

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: 24 }}>
      <h1>Gestão de Moradas</h1>
      {user.id ? (
        <AddressManager userId={user.id} />
      ) : (
        <div>Utilizador não encontrado. (user.id está undefined)</div>
      )}
    </div>
  );
};

export default Addresses; 