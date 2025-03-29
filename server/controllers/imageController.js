const Replicate = require("replicate");
const { writeFile } = require("fs/promises");
const fetch = require("node-fetch");
const path = require("path");
const fs = require("fs");

// Initialize Replicate with your API Key
const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN, // Replace with your Replicate API Key
});



// Image generation logic

const generateImage = async (req, res) => {
  const { prompt, userId } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: "Prompt is required" });
  }

  try {
    console.log('Starting image generation with prompt:', prompt);
    
    const input = { prompt };
    const output = await replicate.run(
      "black-forest-labs/flux-schnell",
      {input}
    );

    console.log('Replicate API Response:', output);

    if (Array.isArray(output) && output.length > 0) {
      const imageUrl = output[0];
      console.log('Fetching image from:', imageUrl);

      const resImage = await fetch(imageUrl);
      if (!resImage.ok) {
        throw new Error(`Failed to fetch image: ${resImage.statusText}`);
      }

      const buffer = await resImage.buffer();
      const filename = `generated_${Date.now()}.png`;
      const imagePath = path.join(__dirname, '../images', filename);
      
      // Ensure images directory exists
      const imagesDir = path.join(__dirname, '../images');
      if (!fs.existsSync(imagesDir)) {
        fs.mkdirSync(imagesDir, { recursive: true });
      }

      await writeFile(imagePath, buffer);
      console.log('Image saved to:', imagePath);

      res.status(200).json({
        message: "Image generated successfully",
        imageUrl: `/images/${filename}`
      });
    } else {
      throw new Error('Invalid response from Replicate API');
    }
  } catch (error) {
    console.error('Error details:', error);
    res.status(500).json({ 
      error: "Error generating image",
      details: error.message 
    });
  }
};

module.exports = { generateImage };
