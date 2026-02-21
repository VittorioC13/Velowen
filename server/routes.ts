import express, { type Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import fs from "fs/promises";
import path from "path";
import { generateSceneFromImage } from "./services/sharpml";
import { generateWorldFromImage } from "./services/worldlabs";

export async function registerRoutes(app: Express): Promise<Server> {
  // Serve static files from client/public/outputs for PLY files
  const outputDir = path.join(process.cwd(), "client", "public", "outputs");
  await fs.mkdir(outputDir, { recursive: true });
  app.use("/outputs", express.static(outputDir));

  // put application routes here
  // prefix all routes with /api

  // use storage to perform CRUD operations on the storage interface
  // e.g. storage.insertUser(user) or storage.getUserByUsername(username)

  // Image to 3D generation endpoint
  app.post("/api/generate-3d", async (req, res) => {
    try {
      const { image, model = "sharp-ml", textPrompt } = req.body;

      if (!image) {
        return res.status(400).json({ message: "Image is required" });
      }

      // Validate model choice
      if (!["sharp-ml", "world-labs"].includes(model)) {
        return res.status(400).json({
          message: "Invalid model. Choose 'sharp-ml' or 'world-labs'"
        });
      }

      if (model === "world-labs") {
        // Use World Labs API
        const result = await generateWorldFromImage(image, {
          modelType: "fast", // Use fast model by default
          textPrompt,
        });

        // Return the SPZ URL directly (no need to save locally)
        res.json({
          success: true,
          plyUrl: result.plyUrl, // Actually an SPZ URL
          worldId: result.worldId,
          marbleViewerUrl: result.marbleViewerUrl,
          model: "world-labs",
          generationTime: result.generationTime,
          assets: {
            spz_urls: result.assets.splats.spz_urls,
            pano_url: result.assets.imagery.pano_url,
            thumbnail_url: result.assets.thumbnail_url,
            caption: result.assets.caption,
          },
        });

      } else {
        // Use SHARP-ML (existing logic)
        const result = await generateSceneFromImage(image);

        // Convert base64 PLY data to buffer
        const plyBuffer = Buffer.from(result.plyData, "base64");

        // Generate a unique ID for this PLY file
        const id = `ply-${Date.now()}-${Math.random().toString(36).substring(7)}`;
        const fileName = `${id}.ply`;

        // Save to client/public/outputs folder
        const outputDir = path.join(process.cwd(), "client", "public", "outputs");
        await fs.mkdir(outputDir, { recursive: true });

        const filePath = path.join(outputDir, fileName);
        await fs.writeFile(filePath, plyBuffer);

        // Return JSON with local URL
        const plyUrl = `/outputs/${fileName}`;

        res.json({
          success: true,
          plyUrl: plyUrl,
          model: "sharp-ml",
          generationTime: result.generationTime,
        });
      }

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
