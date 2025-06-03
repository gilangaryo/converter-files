'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import Image from 'next/image';

const HomePage = () => {
  const [files, setFiles] = useState([]);
  const [converting, setConverting] = useState(false);
  const [convertedFiles, setConvertedFiles] = useState([]);
  const [format, setFormat] = useState('jpg');
  const [quality, setQuality] = useState(90);
  const [loadingItems, setLoadingItems] = useState([]);

  useEffect(() => {
    setLoadingItems(new Array(files.length).fill(false));
  }, [files]);

  const onDrop = useCallback((acceptedFiles) => {
    const filesWithPreview = acceptedFiles.map(file => {
      if (file.type.startsWith('image/')) {
        file.preview = URL.createObjectURL(file);
      }
      return file;
    });
    setFiles(prev => [...prev, ...filesWithPreview]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.heic', '.heif', '.jpg', '.jpeg', '.png', '.webp'],
    },
    multiple: true,
  });

  const removeFile = (index) => {
    setFiles(prev => {
      const newFiles = [...prev];
      if (newFiles[index].preview) {
        URL.revokeObjectURL(newFiles[index].preview);
      }
      newFiles.splice(index, 1);
      return newFiles;
    });
  };

  const convertFile = async (file, index) => {
    setLoadingItems(prev => {
      const newLoading = [...prev];
      newLoading[index] = true;
      return newLoading;
    });

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('format', format);
      formData.append('quality', quality.toString());

      const response = await fetch('/api/convert', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Conversion failed');
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);

      return {
        originalName: file.name,
        convertedName: `${file.name.split('.')[0]}.${format}`,
        blob,
        url,
        format,
        size: blob.size,
        originalSize: file.size,
      };
    } catch (error) {
      console.error('Error converting file:', error);
      return null;
    } finally {
      setLoadingItems(prev => {
        const newLoading = [...prev];
        newLoading[index] = false;
        return newLoading;
      });
    }
  };

  const convertAllFiles = async () => {
    if (files.length === 0) return;
    setConverting(true);
    const results = [];
    for (let i = 0; i < files.length; i++) {
      const result = await convertFile(files[i], i);
      if (result) results.push(result);
    }
    setConvertedFiles(results);
    setConverting(false);
  };

  const downloadFile = (convertedFile) => {
    const a = document.createElement('a');
    a.href = convertedFile.url;
    a.download = convertedFile.convertedName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const downloadAllConverted = () => {
    convertedFiles.forEach(file => {
      setTimeout(() => downloadFile(file), 100);
    });
  };

  const clearAllFiles = () => {
    files.forEach(file => {
      if (file.preview) {
        URL.revokeObjectURL(file.preview);
      }
    });
    convertedFiles.forEach(file => {
      URL.revokeObjectURL(file.url);
    });
    setFiles([]);
    setConvertedFiles([]);
  };

  const clearConverted = () => {
    convertedFiles.forEach(file => {
      URL.revokeObjectURL(file.url);
    });
    setConvertedFiles([]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4 text-black">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-black mb-2">
            Image Converter Tool
          </h1>
          <p className="text-gray-600">
            Convert HEIC, JPEG, PNG, and WebP images with ease
          </p>
        </div>

        {/* Settings Panel */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 text-black">Conversion Settings</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Output Format
              </label>
              <select
                value={format}
                onChange={(e) => setFormat(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="jpg">JPG</option>
                <option value="png">PNG</option>
                <option value="webp">WebP</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quality: {quality}%
              </label>
              <input
                type="range"
                min="10"
                max="100"
                value={quality}
                onChange={(e) => setQuality(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
              />
            </div>
          </div>
        </div>

        {/* Upload Area */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              isDragActive
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            <input {...getInputProps()} />
            <div className="flex flex-col items-center">
              <svg
                className="w-12 h-12 text-gray-400 mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
              <p className="text-lg font-medium text-gray-600 mb-2">
                {isDragActive
                  ? 'Drop the files here...'
                  : 'Drag & drop files here, or click to select'}
              </p>
              <p className="text-sm text-gray-500">
                Supports HEIC, HEIF, JPEG, PNG, WebP files
              </p>
            </div>
          </div>
        </div>

        {/* Files to Convert */}
        {files.length > 0 && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Files to Convert</h2>
              <div className="space-x-2">
                <button
                  onClick={convertAllFiles}
                  disabled={converting}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  {converting ? 'Converting...' : `Convert All (${files.length})`}
                </button>
                <button
                  onClick={clearAllFiles}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                >
                  Clear All
                </button>
              </div>
            </div>

            <div className="grid gap-4">
              {files.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                >
                  <div className="flex items-center space-x-4">
                    {file.preview && (
                      <div className="flex-shrink-0">
                        <Image
                          src={file.preview}
                          alt={file.name}
                          width={48}
                          height={48}
                          className="w-12 h-12 object-cover rounded"
                        />
                      </div>
                    )}
                    <div>
                      <p className="font-medium text-gray-800">{file.name}</p>
                      <p className="text-sm text-gray-500">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500">→</span>
                    <span className="text-sm font-medium text-blue-600 uppercase">
                      {format}
                    </span>
                    {loadingItems[index] ? (
                      <span className="text-sm text-blue-600 font-semibold animate-pulse">
                        Converting...
                      </span>
                    ) : (
                      <button
                        onClick={() => removeFile(index)}
                        className="p-1 text-red-600 hover:text-red-800"
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Converted Files */}
        {convertedFiles.length > 0 && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Converted Files</h2>
              <div className="space-x-2">
                <button
                  onClick={downloadAllConverted}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                >
                  Download All
                </button>
                <button
                  onClick={clearConverted}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                >
                  Clear Converted
                </button>
              </div>
            </div>

            <div className="grid gap-4">
              {convertedFiles.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                >
                  <div className="flex items-center space-x-4">
                    <Image
                      src={file.url}
                      alt={file.convertedName}
                      width={48}
                      height={48}
                      className="w-12 h-12 object-cover rounded"
                    />
                    <div>
                      <p className="font-medium text-gray-800">{file.convertedName}</p>
                      <p className="text-sm text-gray-500">
                        Size: {(file.size / 1024).toFixed(2)} KB (Original: {(file.originalSize / 1024).toFixed(2)} KB)
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => downloadFile(file)}
                    className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Download
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Info Panel */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Supported Formats</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-medium text-gray-800 mb-2">Input Formats:</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• HEIC (High Efficiency Image Container)</li>
                <li>• HEIF (High Efficiency Image Format)</li>
                <li>• JPEG/JPG</li>
                <li>• PNG</li>
                <li>• WebP</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium text-gray-800 mb-2">Output Formats:</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• JPG (Lossy compression, smaller files)</li>
                <li>• PNG (Lossless, supports transparency)</li>
                <li>• WebP (Modern format, great compression)</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
        }
        .slider::-moz-range-thumb {
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
          border: none;
        }
      `}</style>
    </div>
  );
};

export default HomePage;