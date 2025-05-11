'use client'

import React, { useEffect, useState } from 'react'; // Explicitly import React
import * as Dialog from '@radix-ui/react-dialog';
import * as Toast from '@radix-ui/react-toast';

export default function DocumentsPage() {
  interface Document {
    _id: string;
    name: string;
    type: string;
    filename: string;
    createdAt: string;
  }

  const [documents, setDocuments] = useState<Document[]>([]);
  const [isAdmin,] = useState(false); // Replace with actual admin check
  const [newDocument, setNewDocument] = useState<{ name: string; type: string; filename: File | null }>({
    name: '',
    type: '',
    filename: null,
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDocuments() {
      try {
        const res = await fetch('/api/documents');
        if (res.ok) {
          const data = await res.json();
          setDocuments(data.documents || []);
        } else {
          setToastMessage('Failed to fetch documents.');
        }
      } catch (err) {
        console.error('Error fetching documents:', err);
        setToastMessage('Error fetching documents.');
      }
    }
    fetchDocuments();
  }, []);

  const handleAddDocument = async () => {
    if (!newDocument.name || !newDocument.type || !newDocument.filename) {
      setToastMessage('All fields are required.');
      console.log('Validation failed: Missing fields', newDocument);
      return;
    }

    const uploadcarePublicKey = process.env.UPLOADCARE_PUBLIC_KEY;
    if (!uploadcarePublicKey) {
      setToastMessage('Uploadcare public key is missing. Please contact the administrator.');
      console.error('UPLOADCARE_PUBLIC_KEY is not defined in the environment variables.');
      return;
    }

    const formData = new FormData();
    formData.append('UPLOADCARE_PUB_KEY', uploadcarePublicKey);
    formData.append('file', newDocument.filename);

    try {
      console.log('Uploading file to Uploadcare...');
      const uploadRes = await fetch('https://upload.uploadcare.com/base/', {
        method: 'POST',
        body: formData,
      });

      if (uploadRes.ok) {
        const uploadData = await uploadRes.json();
        const fileUrl = `https://ucarecdn.com/${uploadData.file}/`;

        console.log('File uploaded successfully:', fileUrl);
        console.log('Saving document details to the backend...');

        const res = await fetch('/api/documents', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: newDocument.name,
            type: newDocument.type,
            fileUrl,
          }),
        });

        if (res.ok) {
          const addedDocument = await res.json();
          console.log('Document added successfully:', addedDocument);
          setDocuments((prev) => [...prev, addedDocument.document]);
          setNewDocument({ name: '', type: '', filename: null });
          setIsModalOpen(false);
          setToastMessage('Document added successfully.');
        } else {
          const errorData = await res.json();
          console.error('Failed to save document:', errorData);
          setToastMessage(errorData.error || 'Failed to add document.');
        }
      } else {
        const errorData = await uploadRes.json();
        console.error('Failed to upload file to Uploadcare:', errorData);
        setToastMessage(`Failed to upload document to Uploadcare: ${errorData.detail || 'Unknown error'}`);
      }
    } catch (err) {
      console.error('Error adding document:', err);
      setToastMessage('Error adding document.');
    }
  };

  const handleDeleteDocument = async (documentId: string) => {
    try {
      const res = await fetch(`/api/documents/${documentId}`, { method: 'DELETE' });
      if (res.ok) {
        setDocuments((prev) => prev.filter((doc) => doc._id !== documentId));
        setToastMessage('Document deleted successfully.');
      } else {
        setToastMessage('Failed to delete document.');
      }
    } catch (err) {
      console.error('Error deleting document:', err);
      setToastMessage('Error deleting document.');
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Documents</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {documents.map((doc) => (
          <div key={doc._id} className="p-4 border rounded shadow">
            <h2 className="font-bold">{doc.name}</h2>
            <p className="text-sm text-gray-600">{doc.type}</p>
            <div className="mt-2 flex space-x-2">
              <a
                href={`/api/documents/download/${doc.filename}`} // Use filename instead of _id
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline"
              >
                View
              </a>
              <a
                href={`/api/documents/download/${doc.filename}`} // Use filename instead of _id
                download
                className="text-blue-500 hover:underline"
              >
                Download
              </a>
              {isAdmin && (
                <button
                  onClick={() => handleDeleteDocument(doc._id)}
                  className="text-red-500 hover:underline"
                >
                  Delete
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {isAdmin && (
        <Dialog.Root open={isModalOpen} onOpenChange={setIsModalOpen}>
          <Dialog.Trigger className="mt-4 px-4 py-2 bg-blue-500 text-white rounded">
            Add Document
          </Dialog.Trigger>
          <Dialog.Portal>
            <Dialog.Overlay className="fixed inset-0 bg-black bg-opacity-50" />
            <Dialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded shadow-lg">
              <Dialog.Title className="text-lg font-bold">Add Document</Dialog.Title>
              <div className="mt-4 space-y-2">
                <input
                  type="text"
                  placeholder="Name"
                  value={newDocument.name}
                  onChange={(e) => setNewDocument((prev) => ({ ...prev, name: e.target.value }))}
                  className="w-full p-2 border rounded"
                />
                <input
                  type="text"
                  placeholder="Type"
                  value={newDocument.type}
                  onChange={(e) => setNewDocument((prev) => ({ ...prev, type: e.target.value }))}
                  className="w-full p-2 border rounded"
                />
                <input
                  type="file"
                  onChange={(e) => {
                    const files = e.target.files;
                    if (files && files[0]) {
                      setNewDocument((prev) => ({ ...prev, filename: files[0] }));
                    }
                  }}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div className="mt-4 flex justify-end space-x-2">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-gray-300 text-black rounded"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddDocument}
                  className="px-4 py-2 bg-blue-500 text-white rounded"
                >
                  Add
                </button>
              </div>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
      )}

      {/* Toast Notifications */}
      <Toast.Provider>
        {toastMessage && (
          <Toast.Root
            className="bg-gray-800 text-white p-4 rounded shadow-lg"
            onOpenChange={() => setToastMessage(null)}
          >
            <Toast.Title>{toastMessage}</Toast.Title>
          </Toast.Root>
        )}
        <Toast.Viewport className="fixed bottom-4 right-4" />
      </Toast.Provider>
    </div>
  );
}
