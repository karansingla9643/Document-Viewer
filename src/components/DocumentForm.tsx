import { useState, useRef } from 'react';
import { format } from 'date-fns';
import { CalendarIcon, Upload, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { useDocuments } from '@/contexts/DocumentContext';
import { Document } from '@/types';

interface DocumentFormProps {
  isOpen: boolean;
  onClose: () => void;
  document?: Document | null;
}

export const DocumentForm = ({ isOpen, onClose, document }: DocumentFormProps) => {
  const { addDocument, updateDocument, departments } = useDocuments();
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    name: document?.name || '',
    type: document?.type || 'Policy' as 'Policy' | 'SOP',
    department_id: document?.department_id || '',
    next_review: document?.next_review || new Date(),
    status: document?.status || 'Draft' as Document['status'],
    description: document?.description || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (document) {
        await updateDocument(document.id, {
          ...formData,
          last_review: new Date(),
        }, selectedFile || undefined);
      } else {
        await addDocument({
          ...formData,
          last_review: null,
        }, selectedFile || undefined);
      }

      onClose();
      resetForm();
    } catch (error) {
      console.error('Error saving document:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      type: 'Policy',
      department_id: '',
      next_review: new Date(),
      status: 'Draft',
      description: '',
    });
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert('File size must be less than 10MB');
        return;
      }
      setSelectedFile(file);
    }
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gray-900 border-gray-700 text-white max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-trik-orange-400">
            {document ? 'Edit Document' : 'Add New Document'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name" className="text-gray-300">Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="bg-gray-700 border-gray-600 text-white"
              required
            />
          </div>

          <div>
            <Label htmlFor="type" className="text-gray-300">Type</Label>
            <Select value={formData.type} onValueChange={(value: 'Policy' | 'SOP') =>
              setFormData({ ...formData, type: value })
            }>
              <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-700 border-gray-600">
                <SelectItem value="Policy">Policy</SelectItem>
                <SelectItem value="SOP">SOP</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="department" className="text-gray-300">Department</Label>
            <Select value={formData.department_id} onValueChange={(value) =>
              setFormData({ ...formData, department_id: value })
            }>
              <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                <SelectValue placeholder="Select department" />
              </SelectTrigger>
              <SelectContent className="bg-gray-700 border-gray-600">
                {departments.map((dept) => (
                  <SelectItem key={dept.id} value={dept.id}>
                    {dept.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-gray-300">Next Review Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal bg-gray-700 border-gray-600 text-white hover:bg-gray-600",
                    !formData.next_review && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.next_review ? format(formData.next_review, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-gray-700 border-gray-600" align="start">
                <Calendar
                  mode="single"
                  selected={formData.next_review}
                  onSelect={(date) => date && setFormData({ ...formData, next_review: date })}
                  initialFocus
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>

          <div>
            <Label htmlFor="status" className="text-gray-300">Status</Label>
            <Select value={formData.status} onValueChange={(value: Document['status']) =>
              setFormData({ ...formData, status: value })
            }>
              <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-700 border-gray-600">
                <SelectItem value="Draft">Draft</SelectItem>
                <SelectItem value="Current">Current</SelectItem>
                <SelectItem value="Under Review">Under Review</SelectItem>
                <SelectItem value="Overdue">Overdue</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="file" className="text-gray-300">Document File</Label>
            <div className="mt-1">
              <input
                id="file"
                type="file"
                onChange={handleFileSelect}
                ref={fileInputRef}
                className="hidden"
                accept=".pdf,.doc,.docx,.txt"
              />
              <Button
                type="button"
                variant="outline"
                onClick={triggerFileInput}
                className="w-full bg-gray-700 border-gray-600 text-white hover:bg-gray-600"
              >
                <Upload className="mr-2 h-4 w-4" />
                {selectedFile ? selectedFile.name : 'Choose File'}
              </Button>
              {selectedFile && (
                <div className="mt-2 flex items-center text-sm text-gray-400">
                  <FileText className="mr-2 h-4 w-4" />
                  {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setSelectedFile(null);
                      if (fileInputRef.current) {
                        fileInputRef.current.value = '';
                      }
                    }}
                    className="ml-2 bg-gray-700 border-gray-600 text-white hover:bg-gray-600"
                  >
                    Remove File
                  </Button>
                </div>
              )}
              {document?.file_name && !selectedFile && (
                <div className="mt-2 flex items-center text-sm text-gray-400">
                  <FileText className="mr-2 h-4 w-4" />
                  Current: {document.file_name}
                </div>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="description" className="text-gray-300">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="bg-gray-700 border-gray-600 text-white"
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} className="bg-gray-700 border-gray-600 text-white hover:bg-gray-600">
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-trik-orange-500 hover:bg-trik-orange-600 text-white"
              disabled={loading || !formData.name || !formData.department_id}
            >
              {loading ? 'Saving...' : (document ? 'Update' : 'Add')} Document
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
