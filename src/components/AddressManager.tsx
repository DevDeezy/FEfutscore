import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../store';
import { getAddresses, addAddress, editAddress, removeAddress } from '../store/slices/addressSlice';

const AddressManager = ({ userId, onSelect }: { userId: number, onSelect?: (address: any) => void }) => {
  const dispatch = useAppDispatch();
  const addresses = useAppSelector((state) => state.address.addresses);
  const [editing, setEditing] = useState<any | null>(null);
  const [form, setForm] = useState<any>({ nome: '', telemovel: '', morada: '', cidade: '', distrito: '', codigoPostal: '', pais: 'Portugal' });

  useEffect(() => {
    dispatch(getAddresses(userId));
  }, [dispatch, userId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editing) {
      dispatch(editAddress({ ...form, id: editing.id, userId }));
      setEditing(null);
    } else {
      dispatch(addAddress({ ...form, userId }));
    }
    setForm({ nome: '', telemovel: '', morada: '', cidade: '', distrito: '', codigoPostal: '', pais: 'Portugal' });
  };

  const handleEdit = (address: any) => {
    setEditing(address);
    setForm(address);
  };

  const handleDelete = (id: number) => {
    dispatch(removeAddress({ id, userId }));
  };

  return (
    <div>
      <h2>Moradas</h2>
      <ul>
        {addresses.map((a: any) => (
          <li key={a.id}>
            {a.nome}, {a.morada}, {a.cidade}, {a.distrito}, {a.codigoPostal}, {a.pais}, {a.telemovel}
            <button onClick={() => handleEdit(a)}>Editar</button>
            <button onClick={() => handleDelete(a.id)}>Eliminar</button>
            {onSelect && <button onClick={() => onSelect(a)}>Usar esta morada</button>}
          </li>
        ))}
      </ul>
      <form onSubmit={handleSubmit} style={{ marginTop: 16 }}>
        <input placeholder="Nome" value={form.nome} onChange={e => setForm({ ...form, nome: e.target.value })} required />
        <input placeholder="Telemóvel" value={form.telemovel} onChange={e => setForm({ ...form, telemovel: e.target.value })} required />
        <input placeholder="Morada" value={form.morada} onChange={e => setForm({ ...form, morada: e.target.value })} required />
        <input placeholder="Cidade" value={form.cidade} onChange={e => setForm({ ...form, cidade: e.target.value })} required />
        <input placeholder="Distrito" value={form.distrito} onChange={e => setForm({ ...form, distrito: e.target.value })} required />
        <input placeholder="Código Postal" value={form.codigoPostal} onChange={e => setForm({ ...form, codigoPostal: e.target.value })} required />
        <input placeholder="País" value={form.pais} onChange={e => setForm({ ...form, pais: e.target.value })} required />
        <button type="submit">{editing ? 'Atualizar' : 'Adicionar'}</button>
        {editing && <button type="button" onClick={() => { setEditing(null); setForm({ nome: '', telemovel: '', morada: '', cidade: '', distrito: '', codigoPostal: '', pais: 'Portugal' }); }}>Cancelar</button>}
      </form>
    </div>
  );
};

export default AddressManager; 