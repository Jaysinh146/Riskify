import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Download, Database, Search, Filter, Eye } from 'lucide-react';
import { defaultDataset, exportToCSV, type ThreatMessage } from '@/data/syntheticData';
import { useToast } from '@/hooks/use-toast';

interface DatasetViewerProps {
  onMessageSelect?: (message: ThreatMessage) => void;
}

export function DatasetViewer({ onMessageSelect }: DatasetViewerProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLabel, setFilterLabel] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const { toast } = useToast();

  const filteredData = useMemo(() => {
    return defaultDataset.filter(message => {
      const matchesSearch = message.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           message.id.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesLabel = filterLabel === 'all' || message.label === filterLabel;
      const matchesType = filterType === 'all' || message.type === filterType || 
                         (filterType === 'empty' && message.type === '');
      
      return matchesSearch && matchesLabel && matchesType;
    });
  }, [searchTerm, filterLabel, filterType]);

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredData, currentPage]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const handleExportCSV = () => {
    try {
      const csvContent = exportToCSV(filteredData);
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      
      if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `threat_dataset_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }

      toast({
        title: "Dataset Exported",
        description: `Exported ${filteredData.length} messages to CSV file.`,
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Could not export dataset. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getLabelBadge = (label: 'threat' | 'benign') => {
    return (
      <Badge variant={label === 'threat' ? 'destructive' : 'secondary'}>
        {label.toUpperCase()}
      </Badge>
    );
  };

  const getTypeBadge = (type: string) => {
    if (!type) return null;
    
    const colors = {
      'ransomware': 'bg-red-500/20 text-red-200 border-red-500/30',
      'phishing': 'bg-orange-500/20 text-orange-200 border-orange-500/30',
      'ddos': 'bg-purple-500/20 text-purple-200 border-purple-500/30',
      'credential_theft': 'bg-yellow-500/20 text-yellow-200 border-yellow-500/30',
      'other': 'bg-gray-500/20 text-gray-200 border-gray-500/30'
    };

    return (
      <Badge className={colors[type as keyof typeof colors] || colors.other}>
        {type.replace('_', ' ').toUpperCase()}
      </Badge>
    );
  };

  const statistics = useMemo(() => {
    const total = defaultDataset.length;
    const threats = defaultDataset.filter(m => m.label === 'threat').length;
    const benign = total - threats;
    
    const typeStats = defaultDataset.reduce((acc, message) => {
      if (message.type) {
        acc[message.type] = (acc[message.type] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    return { total, threats, benign, typeStats };
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5 text-primary" />
          Synthetic Threat Dataset
        </CardTitle>
        <CardDescription className="hidden sm:block">
          Browse and analyze the synthetic cybersecurity message dataset ({statistics.total} messages)
        </CardDescription>
        <CardDescription className="sm:hidden">
          Dataset ({statistics.total} messages)
        </CardDescription>
        <Button onClick={handleExportCSV} variant="outline" className="gap-2 w-fit mt-3">
          <Download className="h-4 w-4" />
          Export CSV
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Dataset Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="p-3 rounded border bg-muted/20 text-center">
            <div className="text-xl font-semibold">{statistics.total}</div>
            <div className="text-xs text-muted-foreground">Total</div>
          </div>
          <div className="p-3 rounded border bg-red-50 text-center">
            <div className="text-xl font-semibold text-red-600">{statistics.threats}</div>
            <div className="text-xs text-muted-foreground">Threats</div>
          </div>
          <div className="p-3 rounded border bg-green-50 text-center">
            <div className="text-xl font-semibold text-green-600">{statistics.benign}</div>
            <div className="text-xs text-muted-foreground">Benign</div>
          </div>
          <div className="p-3 rounded border bg-muted/20 text-center">
            <div className="text-xl font-semibold">
              {Object.keys(statistics.typeStats).length}
            </div>
            <div className="text-xs text-muted-foreground">Types</div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search messages..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={filterLabel} onValueChange={setFilterLabel}>
            <SelectTrigger className="w-[140px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Labels</SelectItem>
              <SelectItem value="threat">Threats</SelectItem>
              <SelectItem value="benign">Benign</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-[160px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="ransomware">Ransomware</SelectItem>
              <SelectItem value="phishing">Phishing</SelectItem>
              <SelectItem value="ddos">DDoS</SelectItem>
              <SelectItem value="credential_theft">Credential Theft</SelectItem>
              <SelectItem value="other">Other</SelectItem>
              <SelectItem value="empty">No Type</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Data Table */}
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">ID</TableHead>
                <TableHead>Message</TableHead>
                <TableHead className="w-[100px]">Label</TableHead>
                <TableHead className="w-[120px]">Type</TableHead>
                <TableHead className="w-[100px]">View</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.map((message) => (
                <TableRow key={message.id} className="hover:bg-muted/50">
                  <TableCell className="font-mono text-sm">{message.id}</TableCell>
                  <TableCell className="max-w-[400px]">
                    <div className="truncate" title={message.text}>
                      {message.text}
                    </div>
                  </TableCell>
                  <TableCell>{getLabelBadge(message.label)}</TableCell>
                  <TableCell>{getTypeBadge(message.type)}</TableCell>
                  <TableCell>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button size="sm" variant="outline">
                          <Eye className="h-3 w-3" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Message Details</DialogTitle>
                          <DialogDescription>ID: {message.id}</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-3">
                          <div>
                            <label className="text-sm font-medium">Full Message:</label>
                            <p className="text-sm bg-muted p-3 rounded mt-1">{message.text}</p>
                          </div>
                          <div className="flex gap-4">
                            <div>
                              <label className="text-sm font-medium">Label:</label>
                              <div className="mt-1">{getLabelBadge(message.label)}</div>
                            </div>
                            {message.type && (
                              <div>
                                <label className="text-sm font-medium">Type:</label>
                                <div className="mt-1">{getTypeBadge(message.type)}</div>
                              </div>
                            )}
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredData.length)} of {filteredData.length} messages
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <span className="flex items-center px-3 text-sm">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}