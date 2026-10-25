const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const swaggerUi = require("swagger-ui-express");
const swaggerJsdoc = require("swagger-jsdoc");

const Book = require("./models/Book");

const app = express();

// ================================
// 1. Middleware
// ================================
app.use(cors());
app.use(express.json());

// ================================
// 2. Cau hinh Swagger
// ================================
const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "BookStore API",
      version: "1.0.0",
      description: "API quan ly sach su dung Node.js, Express va MongoDB"
    },
    servers: [
      {
        url: "http://localhost:5000",
        description: "Local development server"
      }
    ],
    tags: [
      {
        name: "Books",
        description: "Cac API quan ly sach"
      }
    ],
    paths: {
      "/api/books": {
        get: {
          tags: ["Books"],
          summary: "Lay danh sach sach",
          description: "Lay tat ca sach trong MongoDB",
          responses: {
            200: {
              description: "Lay danh sach sach thanh cong",
              content: {
                "application/json": {
                  schema: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        _id: {
                          type: "string",
                          example: "671234567890abcdef123456"
                        },
                        title: {
                          type: "string",
                          example: "Dac Nhan Tam"
                        },
                        author: {
                          type: "string",
                          example: "Dale Carnegie"
                        },
                        price: {
                          type: "number",
                          example: 85000
                        }
                      }
                    }
                  }
                }
              }
            },
            500: {
              description: "Loi khi lay danh sach sach"
            }
          }
        },

        post: {
          tags: ["Books"],
          summary: "Them sach moi",
          description: "Them mot cuon sach moi vao MongoDB",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["title", "author", "price"],
                  properties: {
                    title: {
                      type: "string",
                      example: "Lap trinh Node.js"
                    },
                    author: {
                      type: "string",
                      example: "Nguyen Van A"
                    },
                    price: {
                      type: "number",
                      minimum: 0,
                      example: 85000
                    }
                  }
                }
              }
            }
          },
          responses: {
            201: {
              description: "Them sach thanh cong",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      _id: {
                        type: "string",
                        example: "671234567890abcdef123456"
                      },
                      title: {
                        type: "string",
                        example: "Lap trinh Node.js"
                      },
                      author: {
                        type: "string",
                        example: "Nguyen Van A"
                      },
                      price: {
                        type: "number",
                        example: 85000
                      }
                    }
                  }
                }
              }
            },
            400: {
              description: "Du lieu khong hop le"
            },
            500: {
              description: "Loi khi them sach"
            }
          }
        }
      }
    }
  },
  apis: []
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

// Mo giao dien Swagger tai /api-docs
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// ================================
// 3. API GET: Lay danh sach sach
// ================================
app.get("/api/books", async (req, res) => {
  try {
    const books = await Book.find();

    return res.status(200).json(books);
  } catch (error) {
    console.error("Loi GET /api/books:", error);

    return res.status(500).json({
      message: "Loi khi lay danh sach sach"
    });
  }
});

// ================================
// 4. API POST: Them sach moi
// ================================
app.post("/api/books", async (req, res) => {
  try {
    const { title, author, price } = req.body;

    // Kiem tra ten sach
    if (typeof title !== "string" || !title.trim()) {
      return res.status(400).json({
        message: "Ten sach khong duoc de trong"
      });
    }

    // Kiem tra tac gia
    if (typeof author !== "string" || !author.trim()) {
      return res.status(400).json({
        message: "Ten tac gia khong duoc de trong"
      });
    }

    // Kiem tra gia sach
    if (
      price === undefined ||
      price === null ||
      price === "" ||
      !Number.isFinite(Number(price)) ||
      Number(price) < 0
    ) {
      return res.status(400).json({
        message: "Gia sach phai la so hop le va khong am"
      });
    }

    // Tao sach moi va luu vao MongoDB
    const newBook = await Book.create({
      title: title.trim(),
      author: author.trim(),
      price: Number(price)
    });

    return res.status(201).json(newBook);
  } catch (error) {
    console.error("Loi POST /api/books:", error);

    return res.status(500).json({
      message: "Loi khi them sach"
    });
  }
});

// ================================
// 5. API kiem tra server
// ================================
app.get("/", (req, res) => {
  res.status(200).json({
    message: "BookStore API dang hoat dong",
    swagger: "http://localhost:5000/api-docs",
    books: "http://localhost:5000/api/books"
  });
});

// ================================
// 6. Ket noi MongoDB va chay server
// ================================
async function startServer() {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error(
        "Chua cau hinh MONGO_URI trong file backend/.env"
      );
    }

    await mongoose.connect(process.env.MONGO_URI);

    console.log("Da ket noi MongoDB thanh cong!");

    const PORT = process.env.PORT || 5000;

    app.listen(PORT, () => {
      console.log(`Backend dang chay tai http://localhost:${PORT}`);
      console.log(`Swagger UI: http://localhost:${PORT}/api-docs`);
      console.log(`Danh sach sach: http://localhost:${PORT}/api/books`);
    });
  } catch (error) {
    console.error("Loi khoi dong:", error.message);
    process.exitCode = 1;
  }
}

startServer();