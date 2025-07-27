import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  Alert,
  CircularProgress,
} from '@mui/material';
import axios from 'axios';
import { API_BASE_URL } from '../api';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../store';
import { fetchOrders } from '../store/slices/orderSlice';

interface PaymentProofModalProps {
  open: boolean;
  onClose: () => void;
  order: any;
}

const PaymentProofModal: React.FC<PaymentProofModalProps> = ({ open, onClose, order }) => {
  const dispatch = useDispatch<AppDispatch>();
  const [proofReference, setProofReference] = useState('');
  const [proofImage, setProofImage] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Revolut');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleProofImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
      setError('Por favor, carregue um ficheiro de imagem');
      return;
    }
    
    if (file.size > 5 * 1024 * 1024) {
      setError('O tamanho da imagem deve ser inferior a 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result;
      if (typeof result === 'string') {
        setProofImage(result);
        setError(null);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    if (!proofReference.trim() && !proofImage) {
      setError('Por favor, adicione uma referência de pagamento ou uma imagem de prova');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `${API_BASE_URL}/.netlify/functions/updateorderpaymentproof/${order.id}`,
        {
          proofReference: proofReference.trim() || null,
          proofImage: proofImage || null,
          paymentMethod,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Update order status to pending
      await axios.put(
        `${API_BASE_URL}/.netlify/functions/updateorderstatus/${order.id}`,
        { status: 'pending' },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      dispatch(fetchOrders());
      onClose();
      setProofReference('');
      setProofImage('');
      setPaymentMethod('Revolut');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao atualizar a prova de pagamento');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
      setProofReference('');
      setProofImage('');
      setPaymentMethod('Revolut');
      setError(null);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Adicionar Prova de Pagamento</DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Encomenda #{order.id} - Total: €{order.total_price?.toFixed(2)}
        </Typography>

        <TextField
          fullWidth
          label="Referência de Pagamento"
          value={proofReference}
          onChange={(e) => setProofReference(e.target.value)}
          margin="normal"
          placeholder="Ex: REF123456789"
        />

        <TextField
          fullWidth
          select
          label="Método de Pagamento"
          value={paymentMethod}
          onChange={(e) => setPaymentMethod(e.target.value)}
          margin="normal"
        >
          <option value="Revolut">Revolut</option>
          <option value="PayPal">PayPal</option>
          <option value="Bank Transfer">Transferência Bancária</option>
        </TextField>

        <Box sx={{ mt: 2 }}>
          <Button variant="outlined" component="label" fullWidth>
            Carregar Imagem de Prova
            <input
              type="file"
              hidden
              accept="image/*"
              onChange={handleProofImageChange}
            />
          </Button>
          {proofImage && (
            <Box sx={{ mt: 1 }}>
              <img
                src={proofImage}
                alt="Prova de pagamento"
                style={{
                  maxWidth: '100%',
                  maxHeight: '200px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                }}
              />
            </Box>
          )}
        </Box>

        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          Cancelar
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading || (!proofReference.trim() && !proofImage)}
        >
          {loading ? <CircularProgress size={24} /> : 'Enviar Prova'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PaymentProofModal; 