"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  ChevronLeft, 
  ChevronRight, 
  Search, 
  Star,
  Eye,
  ExternalLink
} from "lucide-react";

interface Review {
  id: string;
  title: string;
  content: string;
  productName: string;
  reviewerName: string;
  createdAt: string;
}

interface ProductTableData {
  id: string;
  name: string;
  category: string;
  price: string;
  rating: number;
  reviewCount: number;
  productLink: string;
}

interface DataTableProps {
  reviews: Review[];
  products?: ProductTableData[];
  type: "reviews" | "products";
}

export function DataTable({ reviews, products, type }: DataTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<string>("");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  
  const itemsPerPage = 10;

  const data = type === "reviews" ? reviews : products || [];
  
  const filteredData = useMemo(() => {
    let filtered = [...data];
    
    if (searchTerm) {
      filtered = filtered.filter((item) => {
        if (type === "reviews") {
          const review = item as Review;
          return (
            review.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            review.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            review.reviewerName.toLowerCase().includes(searchTerm.toLowerCase())
          );
        } else {
          const product = item as ProductTableData;
          return (
            product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.category.toLowerCase().includes(searchTerm.toLowerCase())
          );
        }
      });
    }
    
    if (sortField) {
      filtered.sort((a, b) => {
        const aValue = (a as any)[sortField];
        const bValue = (b as any)[sortField];
        
        if (typeof aValue === "string") {
          const comparison = aValue.localeCompare(bValue);
          return sortDirection === "asc" ? comparison : -comparison;
        } else {
          const comparison = aValue - bValue;
          return sortDirection === "asc" ? comparison : -comparison;
        }
      });
    }
    
    return filtered;
  }, [data, searchTerm, sortField, sortDirection, type]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = filteredData.slice(startIndex, startIndex + itemsPerPage);

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const getSortIcon = (field: string) => {
    if (sortField !== field) return null;
    return sortDirection === "asc" ? "↑" : "↓";
  };

  if (type === "reviews") {
    return (
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Recent Reviews</CardTitle>
            <div className="flex items-center space-x-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search reviews..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {paginatedData.map((review: any) => (
              <div key={review.id} className="border rounded-lg p-4 hover:bg-gray-50">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-medium text-sm">{review.title}</h4>
                  <Badge variant="outline" className="text-xs">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-2">
                  {review.content}
                </p>
                <div className="flex justify-between items-center text-xs text-muted-foreground">
                  <span>Product: {review.productName}</span>
                  <span>Reviewer: {review.reviewerName}</span>
                </div>
              </div>
            ))}
          </div>
          
          {totalPages > 1 && (
            <div className="flex justify-between items-center mt-6">
              <div className="text-sm text-muted-foreground">
                Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredData.length)} of {filteredData.length} reviews
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="flex items-center px-3 text-sm">
                  {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Product Performance</CardTitle>
          <div className="flex items-center space-x-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-64"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th 
                  className="text-left p-2 cursor-pointer hover:bg-gray-50"
                  onClick={() => handleSort("name")}
                >
                  Product Name {getSortIcon("name")}
                </th>
                <th 
                  className="text-left p-2 cursor-pointer hover:bg-gray-50"
                  onClick={() => handleSort("category")}
                >
                  Category {getSortIcon("category")}
                </th>
                <th 
                  className="text-left p-2 cursor-pointer hover:bg-gray-50"
                  onClick={() => handleSort("price")}
                >
                  Price {getSortIcon("price")}
                </th>
                <th 
                  className="text-left p-2 cursor-pointer hover:bg-gray-50"
                  onClick={() => handleSort("rating")}
                >
                  Rating {getSortIcon("rating")}
                </th>
                <th 
                  className="text-left p-2 cursor-pointer hover:bg-gray-50"
                  onClick={() => handleSort("reviewCount")}
                >
                  Reviews {getSortIcon("reviewCount")}
                </th>
                <th className="text-left p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.map((product: any) => (
                <tr key={product.id} className="border-b hover:bg-gray-50">
                  <td className="p-2">
                    <div className="font-medium text-sm max-w-[200px] truncate" title={product.name}>
                      {product.name}
                    </div>
                  </td>
                  <td className="p-2">
                    <Badge variant="outline" className="text-xs">
                      {product.category.split('|')[0]}
                    </Badge>
                  </td>
                  <td className="p-2 font-medium">{product.price}</td>
                  <td className="p-2">
                    <div className="flex items-center space-x-1">
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-medium">{product.rating}</span>
                    </div>
                  </td>
                  <td className="p-2">
                    <Badge variant="secondary" className="text-xs">
                      {product.reviewCount}
                    </Badge>
                  </td>
                  <td className="p-2">
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" asChild>
                        <a href={product.productLink} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {totalPages > 1 && (
          <div className="flex justify-between items-center mt-6">
            <div className="text-sm text-muted-foreground">
              Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredData.length)} of {filteredData.length} products
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="flex items-center px-3 text-sm">
                {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}