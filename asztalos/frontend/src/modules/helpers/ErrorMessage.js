// ErrorMessage.js

import React from "react";

const ErrorMessage = ({ message }) => {
  return (
    <div style={styles.container}>
      <p style={styles.text}>{message}</p>
    </div>
  );
};

const styles = {
  container: {
    backgroundColor: "#f8d7da",
    color: "#721c24",
    padding: "10px",
    borderRadius: "5px",
    margin: "10px 0",
  },
  text: {
    margin: 0,
  },
};

export default ErrorMessage;
