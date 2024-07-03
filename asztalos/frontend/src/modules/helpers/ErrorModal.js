// ErrorModal.js
// showing some errors in modal

import React, { useEffect } from "react";
import { Modal } from "react-bootstrap";

// the modal closes after 5sec
const ErrorModal = ({ error, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <Modal show={true} onHide={onClose}>
      <Modal.Header closeButton>
        <Modal.Title>Error</Modal.Title>
      </Modal.Header>
      <Modal.Body>{error}</Modal.Body>
    </Modal>
  );
};

export default ErrorModal;
