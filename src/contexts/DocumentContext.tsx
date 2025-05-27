import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Document, Department, DashboardStats } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface DocumentContextType {
  documents: Document[];
  departments: Department[];
  stats: DashboardStats;
  loading: boolean;
  addDocument: (document: Omit<Document, 'id' | 'created_at' | 'updated_at' | 'created_by'>, file?: File) => Promise<void>;
  updateDocument: (id: string, updates: Partial<Document>, file?: File) => Promise<void>;
  deleteDocument: (id: string) => Promise<void>;
  refreshData: () => Promise<void>;
}

const DocumentContext = createContext<DocumentContextType | undefined>(undefined);

export const useDocuments = () => {
  const context = useContext(DocumentContext);
  if (!context) {
    throw new Error('useDocuments must be used within a DocumentProvider');
  }
  return context;
};

interface DocumentProviderProps {
  children: ReactNode;
}

export const DocumentProvider = ({ children }: DocumentProviderProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    totalPolicies: 0,
    totalSOPs: 0,
    upcomingReviews: 0,
    overdueReviews: 0,
  });

  const refreshData = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      // Fetch departments
      const { data: deptData, error: deptError } = await supabase
        .from('departments')
        .select('*')
        .order('name');

      if (deptError) {
        console.error('Error fetching departments:', deptError);
        toast({
          title: "Error",
          description: "Failed to load departments",
          variant: "destructive",
        });
      } else {
        setDepartments(deptData.map(dept => ({
          ...dept,
          created_at: new Date(dept.created_at),
        })));
      }

      // Fetch documents with department info
      const { data: docData, error: docError } = await supabase
        .from('documents')
        .select(`
          *,
          departments(name)
        `)
        .order('created_at', { ascending: false });

      if (docError) {
        console.error('Error fetching documents:', docError);
        toast({
          title: "Error",
          description: "Failed to load documents",
          variant: "destructive",
        });
      } else {
        const formattedDocs: Document[] = docData.map(doc => ({
          id: doc.id,
          name: doc.name,
          type: doc.type as 'SOP' | 'Policy',
          department_id: doc.department_id,
          last_review: doc.last_review ? new Date(doc.last_review) : null,
          next_review: new Date(doc.next_review),
          status: doc.status as 'Current' | 'Overdue' | 'Under Review' | 'Draft',
          description: doc.description,
          file_url: doc.file_url,
          file_name: doc.file_name,
          file_size: doc.file_size,
          created_by: doc.created_by,
          created_at: new Date(doc.created_at),
          updated_at: new Date(doc.updated_at),
        }));
        
        setDocuments(formattedDocs);
        
        // Calculate stats
        const now = new Date();
        const threeMonthsFromNow = new Date();
        threeMonthsFromNow.setMonth(now.getMonth() + 3);
        
        const newStats: DashboardStats = {
          totalPolicies: formattedDocs.filter(doc => doc.type === 'Policy').length,
          totalSOPs: formattedDocs.filter(doc => doc.type === 'SOP').length,
          upcomingReviews: formattedDocs.filter(doc => 
            doc.next_review > now && doc.next_review <= threeMonthsFromNow
          ).length,
          overdueReviews: formattedDocs.filter(doc => 
            doc.next_review < now || doc.status === 'Overdue'
          ).length,
        };
        
        setStats(newStats);
      }
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setLoading(false);
    }
  };

  const uploadFile = async (file: File, documentId: string): Promise<string | null> => {
    if (!user) return null;

    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}/${documentId}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('documents')
      .upload(fileName, file);

    if (uploadError) {
      console.error('Error uploading file:', uploadError);
      throw uploadError;
    }

    const { data } = supabase.storage
      .from('documents')
      .getPublicUrl(fileName);

    return data.publicUrl;
  };

  const addDocument = async (document: Omit<Document, 'id' | 'created_at' | 'updated_at' | 'created_by'>, file?: File) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('documents')
        .insert({
          ...document,
          created_by: user.id,
          last_review: document.last_review ? document.last_review.toISOString() : null,
          next_review: document.next_review.toISOString(),
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      let fileUrl = null;
      if (file && data) {
        fileUrl = await uploadFile(file, data.id);
        
        // Update document with file info
        const { error: updateError } = await supabase
          .from('documents')
          .update({
            file_url: fileUrl,
            file_name: file.name,
            file_size: file.size,
          })
          .eq('id', data.id);

        if (updateError) {
          throw updateError;
        }
      }

      await refreshData();
      
      toast({
        title: "Success",
        description: "Document created successfully!",
      });
    } catch (error: any) {
      console.error('Error adding document:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create document",
        variant: "destructive",
      });
    }
  };

  const updateDocument = async (id: string, updates: Partial<Document>, file?: File) => {
    if (!user) return;

    try {
      let fileUrl = null;
      if (file) {
        fileUrl = await uploadFile(file, id);
      }

      const updateData: any = {
        ...updates,
        updated_at: new Date().toISOString(),
      };

      if (updates.last_review) {
        updateData.last_review = updates.last_review.toISOString();
      }
      if (updates.next_review) {
        updateData.next_review = updates.next_review.toISOString();
      }
      if (fileUrl) {
        updateData.file_url = fileUrl;
        updateData.file_name = file!.name;
        updateData.file_size = file!.size;
      }

      const { error } = await supabase
        .from('documents')
        .update(updateData)
        .eq('id', id);

      if (error) {
        throw error;
      }

      await refreshData();
      
      toast({
        title: "Success",
        description: "Document updated successfully!",
      });
    } catch (error: any) {
      console.error('Error updating document:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update document",
        variant: "destructive",
      });
    }
  };

  const deleteDocument = async (id: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('documents')
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }

      await refreshData();
      
      toast({
        title: "Success",
        description: "Document deleted successfully!",
      });
    } catch (error: any) {
      console.error('Error deleting document:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete document",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    if (user) {
      refreshData();
    } else {
      setLoading(false);
    }
  }, [user]);

  return (
    <DocumentContext.Provider value={{
      documents,
      departments,
      stats,
      loading,
      addDocument,
      updateDocument,
      deleteDocument,
      refreshData,
    }}>
      {children}
    </DocumentContext.Provider>
  );
};
