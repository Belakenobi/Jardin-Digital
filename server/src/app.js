import express from "express";
import cors from "cors";
import supabase from "./config/supabase.js";

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    methods: ["GET", "POST", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());

app.get("/api/health", (_request, response) => {
  return response.status(200).json({
    status: "ok",
    message: "Digital Garden API is running",
  });
});

app.get("/api/health/database", async (_request, response) => {
  try {
    const { error } = await supabase
      .from("profiles")
      .select("id")
      .limit(1);

    if (error) {
      console.error("Database health check failed:", error.message);

      return response.status(503).json({
        status: "error",
        message: "Database connection failed",
      });
    }

    return response.status(200).json({
      status: "ok",
      message: "Database connection successful",
    });
  } catch (error) {
    console.error("Unexpected database error:", error.message);

    return response.status(500).json({
      status: "error",
      message: "Unexpected server error",
    });
  }
});

app.use((_request, response) => {
  return response.status(404).json({
    status: "error",
    message: "Endpoint not found",
  });
});

export default app;