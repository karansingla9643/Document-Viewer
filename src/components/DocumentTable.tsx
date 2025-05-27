
import { useState } from 'react';
import { format } from 'date-fns';
import { MoreHorizontal, Edit, Trash2, Download, FileText, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { useDocuments } from '@/contexts/DocumentContext';
import { Document } from '@/types';
import { FileViewer } from './FileViewer';
import { CustomAlert } from './CustomAlert';

interface DocumentTableProps {
  documents: Document[];
  onEdit: (document: Document) => void;
}

export const DocumentTable = ({ documents, onEdit }: DocumentTableProps) => {
  const { deleteDocument, departments } = useDocuments();
  const [viewingFile, setViewingFile] = useState<Document | null>(null);
  const [alertOpen, setAlertOpen] = useState(false);
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(null);
  const getDepartmentName = (departmentId: string) => {
    const dept = departments.find(d => d.id === departmentId);
    return dept?.name || 'Unknown';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Current':
        return 'bg-green-600 hover:bg-green-700';
      case 'Overdue':
        return 'bg-red-600 hover:bg-red-700';
      case 'Under Review':
        return 'bg-yellow-600 hover:bg-yellow-700';
      case 'Draft':
        return 'bg-gray-600 hover:bg-gray-700';
      default:
        return 'bg-gray-600 hover:bg-gray-700';
    }
  };

  const handleDelete = (id: string) => {
    setSelectedDocumentId(id);
    setAlertOpen(true);
  };

  const confirmDelete = () => {
    if (selectedDocumentId) {
      deleteDocument(selectedDocumentId);
      setAlertOpen(false);
      setSelectedDocumentId(null);
    }
  };

  const handleDownload = (document: Document) => {
    if (document.file_url) {
      window.open(document.file_url, '_blank');
    }
  };

  const handleView = (document: Document) => {
    if (document.file_url) {
      setViewingFile(document);
    }
  };

  if (documents.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400">
        No documents found
      </div>
    );
  }

  return (
    <>
      <CustomAlert
        open={alertOpen}
        onClose={() => setAlertOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Document"
        description="Are you sure you want to delete this document?"
      />
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-700">
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Name</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Type</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Department</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">File</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Last Review</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Next Review</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Status</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Actions</th>
            </tr>
          </thead>
          <tbody>
            {documents.map((document) => (
              <tr key={document.id} className="border-b border-gray-700 hover:bg-gray-800/50">
                <td className="py-3 px-4 text-white">{document.name}</td>
                <td className="py-3 px-4 text-gray-300">{document.type}</td>
                <td className="py-3 px-4 text-gray-300">{getDepartmentName(document.department_id)}</td>
                <td className="py-3 px-4">
                  {document.file_url ? (
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleView(document)}
                        className="text-trik-orange-400 hover:text-trik-orange-300 p-1"
                        title="View file"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDownload(document)}
                        className="text-trik-orange-400 hover:text-trik-orange-300 p-1"
                        title="Download file"
                      >
                        <FileText className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <span className="text-gray-500 text-sm">No file</span>
                  )}
                </td>
                <td className="py-3 px-4 text-gray-300">
                  {document.last_review ? format(document.last_review, 'MMM dd, yyyy') : 'Never'}
                </td>
                <td className="py-3 px-4 text-gray-300">
                  {format(document.next_review, 'MMM dd, yyyy')}
                </td>
                <td className="py-3 px-4">
                  <Badge className={`text-white ${getStatusColor(document.status)}`}>
                    {document.status}
                  </Badge>
                </td>
                <td className="py-3 px-4">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0 text-gray-400 hover:text-white">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-gray-800 border-gray-700">
                      {document.file_url && (
                        <>
                          <DropdownMenuItem
                            onClick={() => handleView(document)}
                            className="text-gray-300 hover:text-white hover:bg-gray-700"
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            View
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDownload(document)}
                            className="text-gray-300 hover:text-white hover:bg-gray-700"
                          >
                            <Download className="mr-2 h-4 w-4" />
                            Download
                          </DropdownMenuItem>
                        </>
                      )}
                      <DropdownMenuItem
                        onClick={() => onEdit(document)}
                        className="text-gray-300 hover:text-white hover:bg-gray-700"
                      >
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleDelete(document.id)}
                        className="text-red-400 hover:text-red-300 hover:bg-gray-700"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* File Viewer Modal */}
      {viewingFile && (
        <FileViewer
          isOpen={true}
          onClose={() => setViewingFile(null)}
          fileUrl={viewingFile.file_url!}
          fileName={viewingFile.file_name || viewingFile.name}
          fileSize={viewingFile.file_size}
        />
      )}
    </>
  );
};
