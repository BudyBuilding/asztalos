import React from "react";
import { Card, Form, Button } from "react-bootstrap";

function NewClient() {
  return (
    <Card className="w-50 m-auto">
      <Card.Header as="h5">Add New Client</Card.Header>
      <Card.Body>
        <Form>
          <Form.Group className="mb-3" controlId="formClientName">
            <Form.Label>Name</Form.Label>
            <Form.Control type="text" placeholder="Enter client name" />
          </Form.Group>
          <Form.Group className="mb-3" controlId="formClientTel">
            <Form.Label>Telephone</Form.Label>
            <Form.Control type="tel" placeholder="Enter client telephone" />
          </Form.Group>
          <Form.Group className="mb-3" controlId="formClientAddress">
            <Form.Label>Address</Form.Label>
            <Form.Control type="text" placeholder="Enter client address" />
          </Form.Group>
          <Button variant="primary" type="submit">
            Add Client
          </Button>
        </Form>
      </Card.Body>
    </Card>
  );
}

export default NewClient;
