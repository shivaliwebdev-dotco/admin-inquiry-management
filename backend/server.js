
const express = require("express");
const cors = require("cors");
const path = require("path");
const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "../frontend")));

// Temporary in-memory inquiry data
let inquiries = [
  {
    id: 1,
    name: "Aarav Naik",
    email: "aarav@example.com",
    subject: "Website Development",
    message: "I would like to know more about your website development services.",
    status: "New",
    createdAt: new Date().toISOString()
  },
  {
    id: 2,
    name: "Diya Sharma",
    email: "diya@example.com",
    subject: "Digital Marketing",
    message: "Please share your digital marketing packages and pricing.",
    status: "In Progress",
    createdAt: new Date(Date.now() - 86400000).toISOString()
  },
  {
    id: 3,
    name: "Rohan Dessai",
    email: "rohan@example.com",
    subject: "SEO Services",
    message: "I need help improving my website's search engine ranking.",
    status: "Resolved",
    createdAt: new Date(Date.now() - 172800000).toISOString()
  },
  {
    id: 4,
    name: "Maya Fernandes",
    email: "maya@example.com",
    subject: "Social Media Management",
    message: "Can you manage our Instagram and Facebook accounts?",
    status: "New",
    createdAt: new Date(Date.now() - 3600000).toISOString()
  }
];

// Check that the API is running
app.get("/api", (req, res) => {
  res.json({
    message: "Inquiry Management API is running"
  });
});

// Get all inquiries
app.get("/api/inquiries", (req, res) => {
  const { search = "", status = "All" } = req.query;

  let results = [...inquiries];

  if (search.trim()) {
    const term = search.toLowerCase();

    results = results.filter((inquiry) =>
      inquiry.name.toLowerCase().includes(term) ||
      inquiry.email.toLowerCase().includes(term) ||
      inquiry.subject.toLowerCase().includes(term)
    );
  }

  if (status !== "All") {
    results = results.filter(
      (inquiry) => inquiry.status === status
    );
  }

  results.sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );

  res.json(results);
});

// Get a single inquiry
app.get("/api/inquiries/:id", (req, res) => {
  const inquiry = inquiries.find(
    (item) => item.id === Number(req.params.id)
  );

  if (!inquiry) {
    return res.status(404).json({
      message: "Inquiry not found"
    });
  }

  res.json(inquiry);
});

// Create a new inquiry
app.post("/api/inquiries", (req, res) => {
  const { name, email, subject, message } = req.body;

  if (
    !name?.trim() ||
    !email?.trim() ||
    !subject?.trim() ||
    !message?.trim()
  ) {
    return res.status(400).json({
      message: "All fields are required"
    });
  }

  const inquiry = {
    id: Date.now(),
    name: name.trim(),
    email: email.trim(),
    subject: subject.trim(),
    message: message.trim(),
    status: "New",
    createdAt: new Date().toISOString()
  };

  inquiries.unshift(inquiry);

  res.status(201).json({
    message: "Inquiry created successfully",
    inquiry
  });
});

// Update an inquiry's status
app.patch("/api/inquiries/:id", (req, res) => {
  const inquiry = inquiries.find(
    (item) => item.id === Number(req.params.id)
  );

  if (!inquiry) {
    return res.status(404).json({
      message: "Inquiry not found"
    });
  }

  const allowedStatuses = ["New", "In Progress", "Resolved"];
  const { status } = req.body;

  if (!allowedStatuses.includes(status)) {
    return res.status(400).json({
      message: "Invalid inquiry status"
    });
  }

  inquiry.status = status;

  res.json({
    message: "Inquiry status updated successfully",
    inquiry
  });
});

// Delete an inquiry
app.delete("/api/inquiries/:id", (req, res) => {
  const index = inquiries.findIndex(
    (item) => item.id === Number(req.params.id)
  );

  if (index === -1) {
    return res.status(404).json({
      message: "Inquiry not found"
    });
  }

  const deletedInquiry = inquiries.splice(index, 1)[0];

  res.json({
    message: "Inquiry deleted successfully",
    inquiry: deletedInquiry
  });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
