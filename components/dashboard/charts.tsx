"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ChartData {
  ratingDistribution: { range: string; count: number }[];
  priceVsRating: { price: number; rating: number; productName: string }[];
  dailySales: { date: string; count: number }[];
  revenueByProduct: { productName: string; revenue: number; reviewCount: number }[];
  categoryPerformance: { category: string; averageRating: number; productCount: number }[];
  priceDistribution: { range: string; count: number }[];
  reviewsPerProduct: { productName: string; reviewCount: number }[];
}

interface ChartsProps {
  data: ChartData;
}

export function RatingDistributionChart({ data }: { data: { range: string; count: number }[] }) {
  const maxCount = Math.max(...data.map(d => d.count));
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Rating Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {data.map((item, index) => (
            <div key={index} className="flex items-center space-x-3">
              <div className="w-16 text-sm font-medium">{item.range}</div>
              <div className="flex-1 bg-gray-200 rounded-full h-3">
                <div
                  className="bg-blue-500 h-3 rounded-full transition-all duration-300"
                  style={{
                    width: `${(item.count / (maxCount || 1)) * 100}%`
                  }}
                />
              </div>
              <div className="w-12 text-sm text-muted-foreground text-right">
                {item.count}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function PriceVsRatingChart({ data }: { data: { price: number; rating: number; productName: string }[] }) {
  const maxPrice = Math.max(...data.map(d => d.price));
  const maxRating = 5;
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Price vs Rating Scatter</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative h-64 bg-gray-50 rounded border">
          <div className="absolute inset-4">
            {data.slice(0, 20).map((item, index) => (
              <div
                key={index}
                className="absolute w-2 h-2 bg-blue-500 rounded-full hover:bg-blue-700 cursor-pointer"
                style={{
                  left: `${(item.price / maxPrice) * 100}%`,
                  bottom: `${(item.rating / maxRating) * 100}%`
                }}
                title={`${item.productName}: ₹${item.price.toLocaleString()}, ${item.rating}★`}
              />
            ))}
          </div>
          <div className="absolute bottom-0 left-0 text-xs text-muted-foreground p-2">
            Price →
          </div>
          <div className="absolute top-0 left-0 text-xs text-muted-foreground p-2 transform -rotate-90 origin-bottom-left">
            Rating →
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function DailySalesChart({ data }: { data: { date: string; count: number }[] }) {
  const maxCount = Math.max(...data.map(d => d.count));
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Daily Sales Timeline</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64 flex items-end space-x-1 overflow-x-auto">
          {data.slice(-30).map((item, index) => (
            <div key={index} className="flex flex-col items-center min-w-[20px]">
              <div
                className="bg-green-500 w-4 rounded-t transition-all duration-300 hover:bg-green-600"
                style={{
                  height: `${Math.max((item.count / (maxCount || 1)) * 200, 4)}px`
                }}
                title={`${new Date(item.date).toLocaleDateString()}: ${item.count} sales`}
              />
              <div className="text-xs text-muted-foreground mt-1 transform rotate-45 origin-bottom-left">
                {new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function RevenueByProductChart({ data }: { data: { productName: string; revenue: number; reviewCount: number }[] }) {
  const maxRevenue = Math.max(...data.map(d => d.revenue));
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Revenue Products</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {data.slice(0, 8).map((item, index) => (
            <div key={index} className="flex items-center space-x-3">
              <div className="w-32 text-sm font-medium truncate" title={item.productName}>
                {item.productName.substring(0, 20)}...
              </div>
              <div className="flex-1 bg-gray-200 rounded-full h-3">
                <div
                  className="bg-green-500 h-3 rounded-full transition-all duration-300"
                  style={{
                    width: `${(item.revenue / (maxRevenue || 1)) * 100}%`
                  }}
                />
              </div>
              <div className="w-20 text-sm text-muted-foreground text-right">
                ₹{item.revenue.toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function CategoryPerformanceChart({ data }: { data: { category: string; averageRating: number; productCount: number }[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Category Performance</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {data.slice(0, 6).map((item, index) => (
            <div key={index} className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-lg font-bold text-blue-600">
                {item.averageRating.toFixed(1)}★
              </div>
              <div className="text-xs text-muted-foreground mt-1 truncate" title={item.category}>
                {item.category}
              </div>
              <div className="text-xs text-muted-foreground">
                {item.productCount} products
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function PriceDistributionChart({ data }: { data: { range: string; count: number }[] }) {
  const maxCount = Math.max(...data.map(d => d.count));
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Price Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {data.map((item, index) => (
            <div key={index} className="flex items-center space-x-3">
              <div className="w-24 text-sm font-medium">{item.range}</div>
              <div className="flex-1 bg-gray-200 rounded-full h-3">
                <div
                  className="bg-purple-500 h-3 rounded-full transition-all duration-300"
                  style={{
                    width: `${(item.count / (maxCount || 1)) * 100}%`
                  }}
                />
              </div>
              <div className="w-12 text-sm text-muted-foreground text-right">
                {item.count}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function ReviewsPerProductChart({ data }: { data: { productName: string; reviewCount: number }[] }) {
  const maxCount = Math.max(...data.map(d => d.reviewCount));
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Most Reviewed Products</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {data.slice(0, 8).map((item, index) => (
            <div key={index} className="flex items-center space-x-3">
              <div className="w-32 text-sm font-medium truncate" title={item.productName}>
                {item.productName.substring(0, 20)}...
              </div>
              <div className="flex-1 bg-gray-200 rounded-full h-3">
                <div
                  className="bg-orange-500 h-3 rounded-full transition-all duration-300"
                  style={{
                    width: `${(item.reviewCount / (maxCount || 1)) * 100}%`
                  }}
                />
              </div>
              <div className="w-12 text-sm text-muted-foreground text-right">
                {item.reviewCount}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function DashboardCharts({ data }: ChartsProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <RatingDistributionChart data={data.ratingDistribution} />
      <PriceVsRatingChart data={data.priceVsRating} />
      <DailySalesChart data={data.dailySales} />
      <RevenueByProductChart data={data.revenueByProduct} />
      <CategoryPerformanceChart data={data.categoryPerformance} />
      <PriceDistributionChart data={data.priceDistribution} />
    </div>
  );
}