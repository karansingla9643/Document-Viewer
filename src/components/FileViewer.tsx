
import { useState } from 'react';
import { X, Download, FileText, Image, File } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';

interface FileViewerProps {
  isOpen: boolean;
  onClose: () => void;
  fileUrl: string;
  fileName: string;
  fileSize?: number;
}

export const FileViewer = ({ isOpen, onClose, fileUrl, fileName, fileSize }: FileViewerProps) => {
  const [loading, setLoading] = useState(true);

  const getFileExtension = (filename: string) => {
    return filename.split('.').pop()?.toLowerCase() || '';
  };

  const getFileType = (filename: string) => {
    const ext = getFileExtension(filename);
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext)) return 'image';
    if (ext === 'pdf') return 'pdf';
    if (['txt', 'md', 'csv'].includes(ext)) return 'text';
    return 'other';
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'Unknown size';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleDownload = () => {
    window.open(fileUrl, '_blank');
  };

  const renderFileContent = () => {
    const fileType = getFileType(fileName);

    switch (fileType) {
      case 'image':
        return (
          <div className="flex items-center justify-center p-4">
            <img
              src={fileUrl}
              alt={fileName}
              className="max-w-full max-h-[70vh] object-contain rounded-lg"
              onLoad={() => setLoading(false)}
              onError={() => setLoading(false)}
            />
          </div>
        );

      case 'pdf':
        return (
          <div className="w-full h-[70vh]">
            <iframe
              src={fileUrl}
              className="w-full h-full border-0 rounded-lg"
              title={fileName}
              onLoad={() => setLoading(false)}
            />
          </div>
        );

      case 'text':
        return (
          <div className="p-4">
            <iframe
              src={fileUrl}
              className="w-full h-[60vh] border border-gray-600 rounded-lg bg-white"
              title={fileName}
              onLoad={() => setLoading(false)}
            />
          </div>
        );

      default:
        return (
          <div className="flex flex-col items-center justify-center p-8 text-gray-400">
            <File className="h-16 w-16 mb-4" />
            <p className="text-lg font-medium mb-2">Preview not available</p>
            <p className="text-sm text-center mb-4">
              This file type cannot be previewed in the browser.
              Click download to view the file.
            </p>
            <Button
              onClick={handleDownload}
              className="bg-trik-orange-500 hover:bg-trik-orange-600 text-white"
            >
              <Download className="mr-2 h-4 w-4" />
              Download File
            </Button>
          </div>
        );
    }
  };

  const getFileIcon = () => {
    const fileType = getFileType(fileName);
    switch (fileType) {
      case 'image':
        return <Image className="h-5 w-5" />;
      case 'pdf':
        return <FileText className="h-5 w-5" />;
      default:
        return <File className="h-5 w-5" />;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gray-800 border-gray-700 text-white max-w-4xl max-h-[90vh] p-0">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <div className="flex items-center gap-3">
            {getFileIcon()}
            <div>
              <h3 className="font-semibold text-white">{fileName}</h3>
              <p className="text-sm text-gray-400">{formatFileSize(fileSize)}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDownload}
              className="text-gray-400 hover:text-white mr-4"
            >
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="relative">
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
              <div className="text-white">Loading...</div>
            </div>
          )}
          {renderFileContent()}
        </div>
      </DialogContent>
    </Dialog>
  );
};
