import React, { useState, useEffect } from "react";
import { GraphQLClient } from "graphql-request";
import { Container, Col, Row, Button, Form, Card } from "react-bootstrap";
import "./app.css";

const client = new GraphQLClient(
  "https://api-us-east-1-shared-usea1-02.hygraph.com/v2/clqqgj9664ggl01t60nww2qkw/master"
);

const CREATE_REVIEW = `
mutation CreateReview($name: String!, $rating: Int!, $description: String!) {
createReview(
  data: {
    name: $name,
    rating: $rating,
    description: $description
  }
) {
  id
  name
  rating
  description
}
}
`;

const PUBLISH_REVIEW = `
mutation PublishReview($id: ID!) {
publishReview(where: { id: $id }, to: PUBLISHED) {
  id
}
}
`;

const GET_REVIEWS = `
query GetReviews {
reviews {
  id
  name
  description
  createdAt
  rating
  updatedAt
}
}
`;

const DELETE_REVIEW = `
mutation DeleteReview($id: ID!) {
deleteReview(where: { id: $id }) {
 id
}
}
`;

function App() {
  const [clicked, setClicked] = useState(false);
  const [stars, setStars] = useState(0);
  const [hoveredStars, setHoveredStars] = useState(0);
  const [name, setName] = useState(""); // New state variable for the name
  const [review, setReview] = useState("");
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const data = await client.request(GET_REVIEWS);
        setReviews(data.reviews);
      } catch (error) {
        console.error("Error fetching reviews:", error);
      }
    };

    fetchReviews();
  }, []);

  const onMouseOver = (rating) => {
    if (clicked) return;
    setHoveredStars(rating);
  };

  const onMouseOut = () => {
    if (clicked) return;
    setHoveredStars(0);
  };

  const onClick = (rating) => {
    setClicked(!clicked);
    setStars(rating);
  };

  const submitReview = async (e) => {
    e.preventDefault();
    const variables = { name: name, rating: stars, description: review };

    try {
      // First, create the review
      const createResponse = await client.request(CREATE_REVIEW, variables);
      // Then, publish the review
      const publishResponse = await client.request(PUBLISH_REVIEW, {
        id: createResponse.createReview.id,
      });

      setName("");
      setReview("");
      setStars(0);
      setHoveredStars(0);
      setClicked(false);

      // Fetch reviews again to update the reviews list
      const data = await client.request(GET_REVIEWS);
      setReviews(data.reviews);
    } catch (error) {
      console.error("Error creating or publishing review:", error);
    }
  };

  const deleteReview = async (id) => {
    try {
      // Send the DELETE_REVIEW mutation
      await client.request(DELETE_REVIEW, { id: id });

      // Fetch reviews again to update the reviews list
      const data = await client.request(GET_REVIEWS);
      setReviews(data.reviews);
    } catch (error) {
      console.error("Error deleting review:", error);
    }
  };

  return (
    <Container fluid className="App text-light text-center">
      <Col md={{ span: 6, offset: 3 }}>
        <Row className="mt-5">
          <Col>
            {[...Array(5)].map((_, i) => (
              <span
                key={i}
                className={`star ${
                  i < (hoveredStars || stars) ? "selected" : ""
                }`}
                onMouseOver={() => onMouseOver(i + 1)}
                onMouseOut={onMouseOut}
                onClick={() => onClick(i + 1)}
              >
                &#9733;
              </span>
            ))}
          </Col>
        </Row>
        <Row className="mt-5">
          <Col>
            <Form.Group>
              <Form.Label>Name</Form.Label>
              <Form.Control
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </Form.Group>
          </Col>
        </Row>
        <Row className="mt-5">
          <Col>
            <Form.Group>
              <Form.Label>Review</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={review}
                onChange={(e) => setReview(e.target.value)}
              />
            </Form.Group>
          </Col>
        </Row>
        <Row className="mt-5">
          <Col>
            <Button
              variant="success"
              onClick={(e) => submitReview(e)}
              disabled={review === ""}
            >
              Submit
            </Button>
          </Col>
        </Row>
        <Row className="mt-5">
          <Col>
            {reviews.map((r, rIndex) => (
              <Card key={rIndex} className="mt-3 mb-3 text-dark">
                <Card.Body>
                  <p>{r.name}</p>
                  {[...Array(r.rating)].map((_, sIndex) => (
                    <span key={sIndex} className="text-warning">
                      &#9733;
                    </span>
                  ))}
                  <p>{r.description}</p>
                  <Button variant="danger" onClick={() => deleteReview(r.id)}>
                    Delete
                  </Button>
                </Card.Body>
              </Card>
            ))}
          </Col>
        </Row>
      </Col>
    </Container>
  );
}

export default App;
