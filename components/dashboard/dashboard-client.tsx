"use client";

import { useState, useEffect, useCallback } from "react";
import { 
  BarChart3, 
  DollarSign, 
  Package, 
  Star, 
  MessageSquare,
  TrendingUp 
} from "lucide-react";
import { MetricCard } from "./metric-card";
import { DashboardCharts } from "./charts";
import { DataTable } from "./data-table";
import { DashboardFilters } from "./dashboard-filters";
import { SyncButton } from "./sync-button";
import { DashboardSkeleton } from "./dashboard-skeleton";
import { ReviewsPerProductChart } from "./charts";

interface DashboardData {
  totalProducts: number;
  averageRating: number;
  totalReviews: number;
  averagePrice: number;
  ratingDistribution: { range: string; count: number }[];
  priceVsRating: { price: number; rating: number; productName: string }[];
  dailySales: { date: string; count: number }[];
  revenueByProduct: { productName: string; revenue: number; reviewCount: number }[];
  categoryPerformance: { category: string; averageRating: number; productCount: number }[];
  priceDistribution: { range: string; count: number }[];
  reviewsPerProduct: { productName: string; reviewCount: number }[];
  recentReviews: {
    id: string;
    title: string;
    content: string;
    productName: string;
    reviewerName: string;
    createdAt: string;
  }[];
}

interface FilterValues {
  category?: string;
  minPrice?: string;
  maxPrice?: string;
  minRating?: string;
  maxRating?: string;
  dateFrom?: string;
  dateTo?: string;
}

interface DashboardClientProps {
  isAdmin: boolean;
}

export function DashboardClient({ isAdmin }: DashboardClientProps) {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterValues>({});

  const fetchDashboardData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) {
          params.append(key, value);
        }
      });
      
      const response = await fetch(`/api/dashboard?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error("Failed to fetch dashboard data");
      }
      
      const dashboardData = await response.json();
      setData(dashboardData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      console.error("Dashboard data fetch error:", err);
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const handleFilterChange = (newFilters: FilterValues) => {
    setFilters(newFilters);
  };

  const handleSyncComplete = () => {
    fetchDashboardData();
  };

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 mb-4">Error loading dashboard data</div>
        <div className="text-gray-600 text-sm">{error}</div>
        <button 
          onClick={fetchDashboardData}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Retry
        </button>
      </div>
    );
  }

  const categories = data?.categoryPerformance?.map(cat => cat.category) || [];

  return (
    <div className="space-y-6">
      <SyncButton onSyncComplete={handleSyncComplete} isAdmin={isAdmin} />
      
      <DashboardFilters 
        onFilterChange={handleFilterChange}
        categories={categories}
        isLoading={isLoading}
      />

      {isLoading ? (
        <DashboardSkeleton />
      ) : data ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <MetricCard
              title="Total Products"
              value={data.totalProducts.toLocaleString()}
              description="Unique products in database"
              icon={Package}
            />
            <MetricCard
              title="Average Rating"
              value={`${data.averageRating}★`}
              description="Overall product satisfaction"
              icon={Star}
            />
            <MetricCard
              title="Total Reviews"
              value={data.totalReviews.toLocaleString()}
              description="Customer feedback collected"
              icon={MessageSquare}
            />
            <MetricCard
              title="Average Price"
              value={`₹${data.averagePrice.toLocaleString()}`}
              description="Mean product price"
              icon={DollarSign}
            />
          </div>

          <DashboardCharts data={data} />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ReviewsPerProductChart data={data.reviewsPerProduct} />
            
            <div className="space-y-6">
              <div className="text-center">
                <div className="text-6xl font-bold text-green-600 mb-2">
                  {data.averageRating >= 4 ? "😊" : data.averageRating >= 3 ? "😐" : "😞"}
                </div>
                <div className="text-lg font-medium">Overall Sentiment</div>
                <div className="text-sm text-muted-foreground">
                  Based on {data.totalReviews} reviews
                </div>
                <div className="mt-2">
                  <div className="inline-flex items-center space-x-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-bold">{data.averageRating}</span>
                    <span className="text-muted-foreground">/ 5.0</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <DataTable reviews={data.recentReviews} type="reviews" />
            
            <DataTable 
              reviews={[]} 
              products={data.revenueByProduct.map((item, index) => ({
                id: `product-${index}`,
                name: item.productName,
                category: "General",
                price: `₹${(item.revenue / item.reviewCount).toLocaleString()}`,
                rating: data.averageRating,
                reviewCount: item.reviewCount,
                productLink: "#"
              }))}
              type="products" 
            />
          </div>
        </>
      ) : null}
    </div>
  );
}