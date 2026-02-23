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

      // LOG WHAT MODEL WAS SELECTED
      console.log(`[3D Generation] Model selected: ${model}`);

      if (!image) {
        return res.status(400).json({ message: "Image is required" });
      }

      // Validate model choice
      if (!["sharp-ml", "world-labs", "hunyuan"].includes(model)) {
        return res.status(400).json({
          message: "Invalid model. Choose 'sharp-ml', 'world-labs', or 'hunyuan'"
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
          glbUrl: result.assets.mesh?.collider_mesh_url || null, // Add mesh URL
          worldId: result.worldId,
          marbleViewerUrl: result.marbleViewerUrl,
          model: "world-labs",
          generationTime: result.generationTime,
          assets: {
            spz_urls: result.assets.splats.spz_urls,
            pano_url: result.assets.imagery.pano_url,
            mesh_url: result.assets.mesh?.collider_mesh_url,
            thumbnail_url: result.assets.thumbnail_url,
            caption: result.assets.caption,
          },
        });

      } else if (model === "hunyuan") {
        // Use Hunyuan3D for mesh generation
        console.log("[Hunyuan] Starting Hunyuan3D mesh generation...");

        // CHECK IF API KEY EXISTS
        if (!process.env.REPLICATE_API_TOKEN) {
          console.error("[Hunyuan] REPLICATE_API_TOKEN not found in environment!");
          return res.status(500).json({
            success: false,
            message: "Hunyuan model not configured. REPLICATE_API_TOKEN is missing. Please use SHARP-ML or World Labs instead.",
          });
        }

        const { generateMeshFromImage } = await import("./services/hunyuan");

        const result = await generateMeshFromImage(image, {
          steps: 50,
          guidanceScale: 5.5,
          octreeResolution: 384, // Higher resolution for better anime quality
          removeBackground: true,
        });

        console.log("[Hunyuan] Generation successful! GLB URL:", result.glbUrl);

        res.json({
          success: true,
          glbUrl: result.glbUrl,
          plyUrl: null, // Hunyuan doesn't generate splats
          model: "hunyuan",
          generationTime: result.generationTime,
          metadata: result.metadata,
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
