# 📸 Local Image Upload System - Complete Guide

## Overview

Product images are now stored **locally** on your server instead of AWS S3. This guide explains how to upload and manage product images.

---

## 🎯 What's Implemented

### Backend Components

1. **File Upload Utility** (`src/utils/fileUpload.ts`)
   - Multer configuration for local storage
   - Image validation (JPEG, PNG, GIF, WebP)
   - File size limit: 5MB per image
   - Automatic filename generation
   - Delete and URL helper functions

2. **Upload Routes** (`src/routes/uploadRoutes.ts`)
   - `POST /api/upload/image` - Upload single image
   - `POST /api/upload/images` - Upload multiple images (max 10)

3. **Static File Serving** (`src/index.ts`)
   - Uploaded files served at `/uploads/products/...`

4. **Storage Location**
   - **Directory**: `backend/uploads/products/`
   - Auto-created on server start
   - Files stored with unique names

---

## 📁 File Storage Structure

```
backend/
├── uploads/
│   └── products/
│       ├── product1-1706xxx-abc123.jpg
│       ├── headphones-1706xxx-def456.png
│       └── watch-1706xxx-ghi789.webp
```

### Filename Format
```
{sanitized-name}-{timestamp}-{random-hex}.{extension}

Examples:
- premium_headphones-1706489234567-a1b2c3d4e5f6.jpg
- wireless_mouse-1706489234567-f6e5d4c3b2a1.png
```

---

## 🚀 How to Upload Images

### Option 1: Using cURL (Testing)

#### Upload Single Image
```bash
curl -X POST http://localhost:3000/api/upload/image \
  -H "Cookie: accessToken=YOUR_JWT_TOKEN" \
  -F "image=@/path/to/your/image.jpg"
```

#### Upload Multiple Images
```bash
curl -X POST http://localhost:3000/api/upload/images \
  -H "Cookie: accessToken=YOUR_JWT_TOKEN" \
  -F "images=@/path/to/image1.jpg" \
  -F "images=@/path/to/image2.png" \
  -F "images=@/path/to/image3.webp"
```

### Option 2: Using Postman

1. **Set Request Type**: POST
2. **URL**: `http://localhost:3000/api/upload/image`
3. **Headers**: Ensure your cookies are set (login first)
4. **Body**: 
   - Select "form-data"
   - Key: `image` (type: File)
   - Value: Select your image file
5. **Send**

### Option 3: Using Frontend (React)

```typescript
// Upload single image
const handleImageUpload = async (file: File) => {
  const formData = new FormData();
  formData.append('image', file);

  try {
    const response = await api.post('/upload/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    const imageUrl = response.data.data.url;
    console.log('Uploaded image URL:', imageUrl);
    return imageUrl;
  } catch (error) {
    console.error('Upload failed:', error);
  }
};

// Upload multiple images
const handleMultipleUpload = async (files: FileList) => {
  const formData = new FormData();
  Array.from(files).forEach(file => {
    formData.append('images', file);
  });

  try {
    const response = await api.post('/upload/images', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    const imageUrls = response.data.data.map((img: any) => img.url);
    console.log('Uploaded image URLs:', imageUrls);
    return imageUrls;
  } catch (error) {
    console.error('Upload failed:', error);
  }
};
```

---

## 📤 API Endpoints

### Upload Single Image

**Endpoint**: `POST /api/upload/image`  
**Authentication**: Required (JWT)  
**Content-Type**: `multipart/form-data`  

**Request**:
```
Field name: image
File type: JPEG, PNG, GIF, WebP
Max size: 5MB
```

**Response** (Success):
```json
{
  "success": true,
  "data": {
    "filename": "product-1706489234567-a1b2c3d4e5f6.jpg",
    "url": "http://localhost:3000/uploads/products/product-1706489234567-a1b2c3d4e5f6.jpg",
    "size": 245678,
    "mimetype": "image/jpeg"
  }
}
```

### Upload Multiple Images

**Endpoint**: `POST /api/upload/images`  
**Authentication**: Required (JWT)  
**Content-Type**: `multipart/form-data`  

**Request**:
```
Field name: images (array)
File types: JPEG, PNG, GIF, WebP
Max size per file: 5MB
Max files: 10
```

**Response** (Success):
```json
{
  "success": true,
  "data": [
    {
      "filename": "image1-1706489234567-abc123.jpg",
      "url": "http://localhost:3000/uploads/products/image1-1706489234567-abc123.jpg",
      "size": 245678,
      "mimetype": "image/jpeg"
    },
    {
      "filename": "image2-1706489234568-def456.png",
      "url": "http://localhost:3000/uploads/products/image2-1706489234568-def456.png",
      "size": 189432,
      "mimetype": "image/png"
    }
  ]
}
```

---

## 🔒 Security Features

### Validation
- ✅ **File Type**: Only images (JPEG, PNG, GIF, WebP)
- ✅ **File Size**: Max 5MB per file
- ✅ **Authentication**: JWT required for uploads
- ✅ **Filename Sanitization**: Special characters removed

### File Storage
- ✅ **Unique Filenames**: Timestamp + random hex prevents collisions
- ✅ **Organized Structure**: All products in dedicated folder
- ✅ **No Path Traversal**: Uploads confined to designated directory

---

## 🎨 Creating Products with Images

### Example: Create Product with Uploaded Image

```typescript
// Step 1: Upload image
const formData = new FormData();
formData.append('image', imageFile);

const uploadResponse = await api.post('/upload/image', formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
});

const imageUrl = uploadResponse.data.data.url;

// Step 2: Create product with image URL
const productData = {
  name: "Premium Headphones",
  description: "High-quality wireless headphones",
  price: 299.99,
  currency: "USD",
  images: [imageUrl], // Use the uploaded image URL
  purchaseUrl: "https://example.com/product/headphones",
  isFeatured: true,
  isActive: true
};

const productResponse = await api.post('/products', productData);
console.log('Product created:', productResponse.data);
```

---

## 🗑️ Deleting Images

The system includes a helper function to delete files:

```typescript
import { deleteFile, getFilenameFromUrl } from '../utils/fileUpload';

// Extract filename from URL
const filename = getFilenameFromUrl(imageUrl);

// Delete the file
if (filename) {
  deleteFile(filename);
}
```

**Note**: Currently manual, but you could add an endpoint:

```typescript
// In uploadRoutes.ts
router.delete('/image/:filename', authenticate, (req, res) => {
  const { filename } = req.params;
  deleteFile(filename);
  res.json({ success: true, message: 'File deleted' });
});
```

---

## 📍 Accessing Uploaded Images

### Direct URL Access

Once uploaded, images are publicly accessible at:
```
http://localhost:3000/uploads/products/{filename}

Example:
http://localhost:3000/uploads/products/headphones-1706489234567-abc123.jpg
```

### In HTML
```html
<img src="http://localhost:3000/uploads/products/headphones-1706489234567-abc123.jpg" 
     alt="Product" />
```

### In React
```jsx
<img 
  src={product.images[0]} 
  alt={product.name}
  className="w-full h-auto"
/>
```

---

## ⚙️ Configuration

### Change Max File Size

Edit `backend/src/utils/fileUpload.ts`:

```typescript
export const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024, // Change to 10MB
    },
});
```

### Change Upload Directory

Edit `backend/src/utils/fileUpload.ts`:

```typescript
const uploadsDir = path.join(__dirname, '../../uploads/custom-folder');
```

### Add More File Types

Edit `backend/src/utils/fileUpload.ts`:

```typescript
const allowedMimes = [
    'image/jpeg', 
    'image/jpg', 
    'image/png', 
    'image/gif', 
    'image/webp',
    'image/svg+xml',  // Add SVG
    'image/bmp',      // Add BMP
];
```

---

## 🧪 Testing the Upload System

### 1. Start Backend
```bash
cd backend
npm run dev
```

### 2. Login to Get Token
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"your@email.com","password":"yourpassword"}'
```

### 3. Upload Test Image
```bash
curl -X POST http://localhost:3000/api/upload/image \
  -H "Cookie: accessToken=YOUR_TOKEN_FROM_STEP2" \
  -F "image=@test-image.jpg"
```

### 4. Verify Upload
Check the uploaded file exists:
```bash
# Windows
dir backend\uploads\products

# Linux/Mac
ls -la backend/uploads/products
```

### 5. Access via Browser
Open: `http://localhost:3000/uploads/products/{filename-from-step3}`

---

## 🚨 Common Issues

### "No file uploaded" Error
**Cause**: Form field name doesn't match  
**Solution**: Ensure field name is `image` for single, `images` for multiple

### "Invalid file type" Error
**Cause**: Unsupported file format  
**Solution**: Only use JPEG, PNG, GIF, or WebP images

### "File too large" Error
**Cause**: Image exceeds 5MB  
**Solution**: Compress image or increase limit in config

### Upload directory not found
**Cause**: Directory creation failed  
**Solution**: Manually create `backend/uploads/products/` folder

### Cannot access uploaded image
**Cause**: Static file serving not configured  
**Solution**: Ensure `app.use('/uploads', express.static('uploads'))` is in `index.ts`

---

## 🔄 Migration from S3 (If Needed Later)

If you want to switch to S3 later:

1. Keep the same upload API endpoints
2. Change the storage backend in `fileUpload.ts`
3. Use `multer-s3` package instead of disk storage
4. Update URL generation to S3 URLs
5. Product URLs remain the same, just pointing to different storage

---

## 📊 File Organization Best Practices

### 1. **Keep files organized**
   - Products: `uploads/products/`
   - User avatars: `uploads/avatars/`
   - Company logos: `uploads/logos/`

### 2. **Backup strategy**
   - Regularly backup `uploads/` folder
   - Include in `.gitignore` (files not in git)
   - Copy to external storage periodically

### 3. **Cleanup old files**
   - When deleting products, also delete images
   - Implement cleanup job for orphaned files
   - Monitor disk usage

---

## ✅ Summary

Your system now:
- ✅ Stores images locally in `backend/uploads/products/`
- ✅ Serves them at `/uploads/products/{filename}`
- ✅ Validates file type and size
- ✅ Requires authentication to upload
- ✅ Generates unique filenames
- ✅ Supports single and multiple uploads
- ✅ Works seamlessly with product creation

**No AWS S3 or external storage needed!** 🎉

---

*Next step: Create a file upload component in the frontend for easy product image management!*
