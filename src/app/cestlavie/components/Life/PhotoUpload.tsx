'use client'

import { useState, useEffect, useRef } from 'react'

export default function PhotoUpload() {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Load image from localStorage on component mount
  useEffect(() => {
    const savedImage = localStorage.getItem('taskboard-uploaded-photo')
    if (savedImage) {
      setUploadedImage(savedImage)
    }
  }, [])

  // Handle file selection
  const handleFileSelect = (file: File) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const base64String = e.target?.result as string
        console.log('Image loaded, base64 length:', base64String.length)
        setUploadedImage(base64String)
        // Save to localStorage
        localStorage.setItem('taskboard-uploaded-photo', base64String)
      }
      reader.onerror = (e) => {
        console.error('Error reading file:', e)
      }
      reader.readAsDataURL(file)
    } else {
      console.warn('Invalid file type:', file?.type)
    }
  }

  // Handle drag and drop
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    
    const files = e.dataTransfer.files
    if (files.length > 0) {
      handleFileSelect(files[0])
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  // Handle file input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleFileSelect(files[0])
    }
  }

  // Handle click to open file dialog
  const handleClick = () => {
    fileInputRef.current?.click()
  }

  // Handle remove image
  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation()
    setUploadedImage(null)
    localStorage.removeItem('taskboard-uploaded-photo')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div>
      {!uploadedImage && (
        <h4 className="text-xs font-medium text-purple-700 mb-2">Photo Upload</h4>
      )}
      
      <div
        className={`
          relative w-full h-48 cursor-pointer transition-all duration-200 flex items-center justify-center
          ${isDragging 
            ? 'bg-purple-50' 
            : uploadedImage
            ? 'bg-transparent'
            : 'bg-purple-50 hover:bg-purple-100'
          }
        `}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={handleClick}
      >
        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleInputChange}
          className="hidden"
        />

        {uploadedImage ? (
          // Display uploaded image
          <div className="relative w-full h-full group">
            <img
              src={uploadedImage}
              alt="Uploaded"
              className="w-full h-full object-contain"
              onLoad={() => console.log('Image rendered successfully')}
              onError={(e) => console.error('Image render error:', e)}
            />
            
            {/* Remove button - subtle and hidden by default */}
            <button
              onClick={handleRemove}
              className="absolute bottom-2 left-2 w-4 h-4 bg-gray-400 hover:bg-gray-600 text-white rounded-full flex items-center justify-center text-xs opacity-0 hover:opacity-100 transition-all duration-300 group-hover:opacity-70"
              title="Remove image"
            >
              ×
            </button>
            
            {/* Overlay on hover */}
            <div className="absolute inset-0 bg-transparent hover:bg-black hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center">
              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                <span className="text-white text-sm font-medium bg-black bg-opacity-70 px-3 py-1 rounded-full">
                  Click to replace
                </span>
              </div>
            </div>
          </div>
        ) : (
          // Upload prompt
          <div className="flex flex-col items-center justify-center h-full text-center p-4">
            <div className="text-purple-400 mb-3">
              <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            
            <p className="text-base text-purple-600 font-medium mb-2">
              {isDragging ? 'Drop image here' : 'Upload Photo'}
            </p>
            
            <p className="text-sm text-purple-400">
              Click or drag & drop
            </p>
          </div>
        )}
      </div>

    </div>
  )
}