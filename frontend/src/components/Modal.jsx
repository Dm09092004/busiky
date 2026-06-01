// src/components/Modal.js
import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button } from '@mui/material';

const Modal = ({ show, onClose, title, message }) => {
  return (
    <Dialog open={show} onClose={onClose}>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <DialogContentText>{message}</DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} autoFocus>Закрыть</Button>
      </DialogActions>
    </Dialog>
  );
};

export default Modal;