
import { useState, useMemo } from 'react';
import { ArrowLeft, Search, Upload, Plus, LogOut, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DashboardStats } from './DashboardStats';
import { DocumentTable } from './DocumentTable';
import { DocumentForm } from './DocumentForm';
import { useDocuments } from '@/contexts/DocumentContext';
import { useAuth } from '@/contexts/AuthContext';
import { Document } from '@/types';

export const Dashboard = () => {
  const { documents, departments, loading } = useDocuments();
  const { profile, signOut } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [activeTab, setActiveTab] = useState('all');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingDocument, setEditingDocument] = useState<Document | null>(null);

  const filteredDocuments = useMemo(() => {
    let filtered = documents;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(doc =>
        doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by type
    if (selectedType !== 'all') {
      filtered = filtered.filter(doc => doc.type === selectedType);
    }

    // Filter by department
    if (selectedDepartment !== 'all') {
      filtered = filtered.filter(doc => doc.department_id === selectedDepartment);
    }

    // Filter by tab
    const now = new Date();
    const threeMonthsFromNow = new Date();
    threeMonthsFromNow.setMonth(now.getMonth() + 3);

    switch (activeTab) {
      case 'upcoming':
        return filtered.filter(doc =>
          doc.next_review > now && doc.next_review <= threeMonthsFromNow
        );
      case 'overdue':
        return filtered.filter(doc =>
          doc.next_review < now || doc.status === 'Overdue'
        );
      default:
        return filtered;
    }
  }, [documents, searchTerm, selectedType, selectedDepartment, activeTab]);

  const handleEdit = (document: Document) => {
    setEditingDocument(document);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingDocument(null);
  };

  const handleAddNew = () => {
    setEditingDocument(null);
    setIsFormOpen(true);
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="border-b border-gray-700 p-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-trik-orange-500 rounded-lg flex items-center justify-center">
              <img src="../../public/trik.png" className="h-8 w-8" alt="TRIK Logo" />
            </div>
            <span className="text-xl font-bold text-white">TRIK</span>
          </div>
          <div className="flex-1" />
          <h1 className="text-xl font-semibold text-trik-orange-400">
            SOPs & Policies Management
          </h1>
          <div className="flex-1" />

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="text-gray-400 hover:text-white">
                <User className="mr-2 h-4 w-4" />
                {profile?.full_name || profile?.email || 'User'}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-gray-950 border-gray-700">
              <DropdownMenuItem
                onClick={handleSignOut}
                className="text-gray-300 hover:text-white hover:bg-gray-700"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <div className="p-6">
        {/* Dashboard Stats */}
        <DashboardStats />

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <TabsList className="bg-gray-900 border-gray-700">
              <TabsTrigger
                value="all"
                className="data-[state=active]:bg-trik-orange-500 data-[state=active]:text-white"
              >
                All Documents
              </TabsTrigger>
              <TabsTrigger
                value="upcoming"
                className="data-[state=active]:bg-trik-orange-500 data-[state=active]:text-white"
              >
                Upcoming Reviews
              </TabsTrigger>
              <TabsTrigger
                value="overdue"
                className="data-[state=active]:bg-trik-orange-500 data-[state=active]:text-white"
              >
                Overdue
              </TabsTrigger>
            </TabsList>

            <Button onClick={handleAddNew} className="bg-trik-orange-500 hover:bg-trik-orange-600 text-white">
              <Plus className="mr-2 h-4 w-4" />
              Upload New
            </Button>
          </div>

          {/* Filters */}
          <div className="flex gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-600 h-4 w-4" />
              <Input
                placeholder="Search policies and SOPs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-gray-950 border-gray-700 text-white placeholder-gray-400"
              />
            </div>

            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="w-48 bg-gray-950 border-gray-700 text-white">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent className="bg-gray-950 border-gray-700">
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="Policy">Policy</SelectItem>
                <SelectItem value="SOP">SOP</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
              <SelectTrigger className="w-48 bg-gray-950 border-gray-700 text-white">
                <SelectValue placeholder="All Departments" />
              </SelectTrigger>
              <SelectContent className="bg-gray-950 border-gray-700">
                <SelectItem value="all">All Departments</SelectItem>
                {departments.map((dept) => (
                  <SelectItem key={dept.id} value={dept.id}>
                    {dept.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Document Table */}
          <div className="bg-gray-950 rounded-lg border border-gray-700">
            <TabsContent value="all" className="m-0">
              <DocumentTable documents={filteredDocuments} onEdit={handleEdit} />
            </TabsContent>
            <TabsContent value="upcoming" className="m-0">
              <DocumentTable documents={filteredDocuments} onEdit={handleEdit} />
            </TabsContent>
            <TabsContent value="overdue" className="m-0">
              <DocumentTable documents={filteredDocuments} onEdit={handleEdit} />
            </TabsContent>
          </div>
        </Tabs>
      </div>

      {/* Document Form Modal */}
      <DocumentForm
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        document={editingDocument}
      />
    </div>
  );
};
