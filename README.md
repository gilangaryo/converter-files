# Next.js Image Converter Tool

A simple and modern image converter web app built with Next.js that supports converting HEIC, HEIF, JPEG, PNG, and WebP images into JPG, PNG, or WebP formats with adjustable quality.

---

## Features

- Convert **HEIC/HEIF** images (commonly used on iPhones) to JPG, PNG, or WebP.
- Convert other image formats: JPEG/JPG, PNG, WebP.
- Adjust output image quality (10% - 100%).
- Drag and drop file upload or click to select files.
- Preview uploaded images before conversion.
- Convert multiple files in batch.
- Download converted images individually or all at once.
- Clear uploaded and converted files.
- Built with Next.js API routes and React frontend using `react-dropzone`.
- Image processing powered by [`heic-convert`](https://www.npmjs.com/package/heic-convert) and [`sharp`](https://sharp.pixelplumbing.com/).

---

## Getting Started

### Prerequisites

- Node.js 16+  
- npm or yarn

### Installation

1. Clone the repo:

```bash
git clone https://github.com/gilangaryo/converter-files.git
cd converter-files
