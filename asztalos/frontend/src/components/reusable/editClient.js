import React, { useState } from "react";
import { Card, Form, Button } from "react-bootstrap";

function EditClient() {
  const [client, setClient] = useState({
    id: 1213,
    name: "Chereji Clau",
    tel: "+45616161",
    address: "Some place",
  });
  return (
    <Card className="w-50 m-auto">
      <Card.Header as="h5">Edit Client</Card.Header>
      <Card.Body>
        <Form>
          <Form.Group className="mb-3" controlId="formClientName">
            <Form.Label>Name</Form.Label>
            <Form.Control type="text" placeholder={client.name} />
          </Form.Group>
          <Form.Group className="mb-3" controlId="formClientTel">
            <Form.Label>Telephone</Form.Label>
            <Form.Control type="tel" placeholder={client.tel} />
          </Form.Group>
          <Form.Group className="mb-3" controlId="formClientAddress">
            <Form.Label>Address</Form.Label>
            <Form.Control type="text" placeholder={client.address} />
          </Form.Group>
          <Button variant="primary" type="submit">
            Save
          </Button>
        </Form>
      </Card.Body>
    </Card>
  );
}

export default EditClient;
