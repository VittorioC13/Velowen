import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";

export async function registerRoutes(app: Express): Promise<Server> {
  // put application routes here
  // prefix all routes with /api

  // use storage to perform CRUD operations on the storage interface
  // e.g. storage.insertUser(user) or storage.getUserByUsername(username)

  // Image to 3D generation endpoint
  app.post("/api/generate-3d", async (req, res) => {
    try {
      const { image } = req.body;

      if (!image) {
        return res.status(400).json({ message: "Image is required" });
      }

      // Call Modal endpoint
      const modalEndpoint = process.env.MODAL_ENDPOINT_URL || 
        "https://victorche0909--sharp-ml-app-sharpmodel-generate.modal.run";

      const response = await fetch(modalEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ image }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Modal API error: ${response.status} ${errorText}`);
      }

      const result = await response.json();

      if (!result.ply_data) {
        throw new Error("No PLY data returned from Modal");
      }

      // Convert base64 PLY data to buffer
      const plyBuffer = Buffer.from(result.ply_data, "base64");

      // Send PLY file as response
      res.setHeader("Content-Type", "application/octet-stream");
      res.setHeader("Content-Disposition", 'attachment; filename="scene.ply"');
      res.send(plyBuffer);
    } catch (error) {
      console.error("Error generating 3D:", error);
      res.status(500).json({
        message: error instanceof Error ? error.message : "Failed to generate 3D scene",
      });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
