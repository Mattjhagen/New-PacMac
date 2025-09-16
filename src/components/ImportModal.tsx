'use client'

import { useState, useRef } from 'react'
import { XMarkIcon, CloudArrowUpIcon, DocumentArrowDownIcon } from '@heroicons/react/24/outline'

interface ImportResult {
  success: boolean
  imported: number
  errors: string[]
  products: Record<string, unknown>[]
}

interface ImportModalProps {
  isOpen: boolean
  onClose: () => void
  onImportComplete: () => void
}

export default function ImportModal({ isOpen, onClose, onImportComplete }: ImportModalProps) {
  const [file, setFile] = useState<File | null>(null)
  const [fetchImages, setFetchImages] = useState(true)
  const [fetchSpecs, setFetchSpecs] = useState(true)
  const [isImporting, setIsImporting] = useState(false)
  const [importResult, setImportResult] = useState<ImportResult | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
      setImportResult(null)
    }
  }

  const handleImport = async () => {
    if (!file) return

    setIsImporting(true)
    setImportResult(null)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('fetchImages', fetchImages.toString())
      formData.append('fetchSpecs', fetchSpecs.toString())

      const response = await fetch('/api/import', {
        method: 'POST',
        body: formData
      })

      const result = await response.json()

      if (response.ok) {
        setImportResult(result)
        if (result.success && result.imported > 0) {
          onImportComplete()
        }
      } else {
        setImportResult({
          success: false,
          imported: 0,
          errors: [result.error || 'Import failed'],
          products: []
        })
      }
    } catch {
      setImportResult({
        success: false,
        imported: 0,
        errors: ['Network error occurred during import'],
        products: []
      })
    } finally {
      setIsImporting(false)
    }
  }

  const handleClose = () => {
    setFile(null)
    setImportResult(null)
    setFetchImages(true)
    setFetchSpecs(true)
    onClose()
  }

  const downloadTemplate = () => {
    const templateData = [
      {
        Brand: 'Apple',
        Model: 'iPhone 15 Pro',
        Product_Name: 'iPhone 15 Pro 128GB',
        Price: '999.99',
        Stock: '10',
        Color: 'Natural Titanium',
        Storage: '128GB',
        Display: '6.1-inch Super Retina XDR',
        Processor: 'A17 Pro chip',
        Memory: '8GB',
        Camera: '48MP Main, 12MP Ultra Wide, 12MP Telephoto',
        Battery: 'Up to 23 hours video playback',
        OS: 'iOS 17',
        Description: 'Latest iPhone with titanium design',
        Image_URL: '',
        SKU: 'IPH15P-128-NT'
      }
    ]

    const csv = Papa.unparse(templateData)
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'wesellcellular-import-template.csv'
    a.click()
    window.URL.revokeObjectURL(url)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Import Products</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {!importResult ? (
          <div className="space-y-6">
            {/* File Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload Inventory File
              </label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-gray-400 transition-colors">
                <div className="space-y-1 text-center">
                  <CloudArrowUpIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="flex text-sm text-gray-600">
                    <label
                      htmlFor="file-upload"
                      className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                    >
                      <span>Upload a file</span>
                      <input
                        ref={fileInputRef}
                        id="file-upload"
                        name="file-upload"
                        type="file"
                        className="sr-only"
                        accept=".csv,.xlsx,.xls"
                        onChange={handleFileSelect}
                      />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-500">
                    CSV, XLSX, XLS up to 10MB
                  </p>
                </div>
              </div>
              {file && (
                <div className="mt-2 text-sm text-gray-600">
                  Selected: <span className="font-medium">{file.name}</span>
                  <span className="ml-2 text-gray-400">
                    ({(file.size / 1024 / 1024).toFixed(2)} MB)
                  </span>
                </div>
              )}
            </div>

            {/* Options */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Import Options</h3>
              <div className="space-y-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="fetchImages"
                    checked={fetchImages}
                    onChange={(e) => setFetchImages(e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="fetchImages" className="ml-2 block text-sm text-gray-900">
                    Automatically fetch product images from OEM websites
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="fetchSpecs"
                    checked={fetchSpecs}
                    onChange={(e) => setFetchSpecs(e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="fetchSpecs" className="ml-2 block text-sm text-gray-900">
                    Automatically fetch missing specifications from web search
                  </label>
                </div>
              </div>
              <div className="mt-3 p-3 bg-blue-50 rounded-md">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> Web search for specifications may take longer but will automatically fill in missing display, processor, memory, camera, and other technical details.
                </p>
              </div>
            </div>

            {/* Template Download */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Need a Template?</h3>
              <p className="text-sm text-gray-600 mb-4">
                Download our CSV template to see the expected format for wesellcellular data.
              </p>
              <button
                onClick={downloadTemplate}
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <DocumentArrowDownIcon className="h-4 w-4 mr-2" />
                Download Template
              </button>
            </div>

            {/* Field Mapping Info */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Supported Fields</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Required Fields:</h4>
                  <ul className="space-y-1 text-gray-600">
                    <li>• Brand</li>
                    <li>• Model</li>
                    <li>• Product_Name</li>
                    <li>• Price</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Optional Fields:</h4>
                  <ul className="space-y-1 text-gray-600">
                    <li>• Stock, Quantity</li>
                    <li>• Color, Storage</li>
                    <li>• Display, Processor</li>
                    <li>• Memory, Camera</li>
                    <li>• Battery, OS</li>
                    <li>• Description, SKU</li>
                    <li>• Image_URL</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Import Button */}
            <div className="flex justify-end space-x-3 pt-6 border-t">
              <button
                onClick={handleClose}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </button>
              <button
                onClick={handleImport}
                disabled={!file || isImporting}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isImporting ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Importing...
                  </div>
                ) : (
                  'Import Products'
                )}
              </button>
            </div>
          </div>
        ) : (
          /* Import Results */
          <div className="space-y-6">
            <div className={`p-4 rounded-md ${importResult.success ? 'bg-green-50' : 'bg-red-50'}`}>
              <div className="flex">
                <div className="flex-shrink-0">
                  {importResult.success ? (
                    <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
                <div className="ml-3">
                  <h3 className={`text-sm font-medium ${importResult.success ? 'text-green-800' : 'text-red-800'}`}>
                    Import {importResult.success ? 'Completed' : 'Failed'}
                  </h3>
                  <div className={`mt-2 text-sm ${importResult.success ? 'text-green-700' : 'text-red-700'}`}>
                    <p>
                      {importResult.success 
                        ? `Successfully imported ${importResult.imported} products`
                        : 'Import failed with errors'
                      }
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {importResult.errors.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-2">Errors:</h4>
                <div className="bg-red-50 border border-red-200 rounded-md p-3">
                  <ul className="text-sm text-red-700 space-y-1">
                    {importResult.errors.map((error, index) => (
                      <li key={index}>• {error}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {importResult.products.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-2">
                  Imported Products ({importResult.products.length}):
                </h4>
                <div className="bg-gray-50 border border-gray-200 rounded-md p-3 max-h-40 overflow-y-auto">
                  <ul className="text-sm text-gray-700 space-y-1">
                    {importResult.products.slice(0, 10).map((product, index) => (
                      <li key={index}>• {String(product.brand)} {String(product.model)} - ${String(product.price)}</li>
                    ))}
                    {importResult.products.length > 10 && (
                      <li className="text-gray-500">... and {importResult.products.length - 10} more</li>
                    )}
                  </ul>
                </div>
              </div>
            )}

            <div className="flex justify-end space-x-3 pt-6 border-t">
              <button
                onClick={handleClose}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// Add Papa import at the top
import Papa from 'papaparse'
