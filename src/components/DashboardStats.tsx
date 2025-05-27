
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useDocuments } from '@/contexts/DocumentContext';

export const DashboardStats = () => {
  const { stats } = useDocuments();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <Card className="bg-gray-950 border-gray-700">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-trik-orange-400">
            Total Policies
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-white">{stats.totalPolicies}</div>
        </CardContent>
      </Card>

      <Card className="bg-gray-950 border-gray-700">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-trik-orange-400">
            Total SOPs
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-white">{stats.totalSOPs}</div>
        </CardContent>
      </Card>

      <Card className="bg-gray-950 border-gray-700">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-trik-orange-400">
            Upcoming Reviews
          </CardTitle>
          <p className="text-xs text-gray-400">Next 3 months</p>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-white">{stats.upcomingReviews}</div>
        </CardContent>
      </Card>

      <Card className="bg-gray-950 border-gray-700">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-trik-orange-400">
            Overdue Reviews
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-400">{stats.overdueReviews}</div>
        </CardContent>
      </Card>
    </div>
  );
};
