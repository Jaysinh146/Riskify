import React, { useState, useCallback, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Upload, Download, Play, Loader2, FileText, AlertCircle } from 'lucide-react';
import { threatDetector, type ThreatPrediction } from '@/ml/threatDetector';
import { useToast } from '@/hooks/use-toast';
import Papa from 'papaparse';

interface BatchResult {
  id: string;
  text: string;
  prediction: ThreatPrediction;
  originalLabel?: string;
  originalType?: string;
}

export function BatchProcessor() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<BatchResult[]>([]);
  const [uploadedData, setUploadedData] = useState<any[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
      toast({
        title: "Invalid File Type",
        description: "Please upload a CSV file.",
        variant: "destructive",
      });
      return;
    }

    Papa.parse(file, {
      header: true,
      complete: (results) => {
        if (results.errors.length > 0) {
          toast({
            title: "CSV Parse Error",
            description: "Could not parse CSV file. Please check the format.",
            variant: "destructive",
          });
          return;
        }

        const data = results.data as any[];
        if (data.length === 0) {
          toast({
            title: "Empty File",
            description: "The CSV file appears to be empty.",
            variant: "destructive",
          });
          return;
        }

        // Validate required columns
        const firstRow = data[0];
        if (!firstRow.text && !firstRow.message) {
          toast({
            title: "Invalid Format",
            description: "CSV must contain a 'text' or 'message' column.",
            variant: "destructive",
          });
          return;
        }

        setUploadedData(data);
        setResults([]);
        toast({
          title: "File Uploaded",
          description: `Loaded ${data.length} messages for batch processing.`,
        });
      },
      error: (error) => {
        toast({
          title: "Upload Failed",
          description: error.message,
          variant: "destructive",
        });
      }
    });
  }, [toast]);

  const handleBatchProcess = useCallback(async () => {
    if (uploadedData.length === 0) {
      toast({
        title: "No Data",
        description: "Please upload a CSV file first.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    setProgress(0);
    const batchResults: BatchResult[] = [];

    try {
      for (let i = 0; i < uploadedData.length; i++) {
        const row = uploadedData[i];
        const text = row.text || row.message || '';
        
        if (!text.trim()) {
          // Skip empty messages
          setProgress(((i + 1) / uploadedData.length) * 100);
          continue;
        }

        try {
          const prediction = await threatDetector.predict(text);
          
          batchResults.push({
            id: row.id || `message_${i + 1}`,
            text: text,
            prediction,
            originalLabel: row.label,
            originalType: row.type
          });
        } catch (error) {
          console.error(`Failed to process message ${i + 1}:`, error);
          // Add error result
          batchResults.push({
            id: row.id || `message_${i + 1}`,
            text: text,
            prediction: {
              label: 'benign',
              confidence: 0.1,
              riskScore: 0.1,
              riskLevel: 'low',
              entities: { targets: [], dates: [], tools: [], urls: [], ips: [] },
              explanation: 'Processing error',
              features: [],
              processingTime: 0
            },
            originalLabel: row.label,
            originalType: row.type
          });
        }

        setProgress(((i + 1) / uploadedData.length) * 100);
        
        // Small delay to prevent UI blocking
        if (i % 10 === 0) {
          await new Promise(resolve => setTimeout(resolve, 10));
        }
      }

      setResults(batchResults);
      
      toast({
        title: "Batch Processing Complete",
        description: `Processed ${batchResults.length} messages successfully.`,
      });

    } catch (error) {
      toast({
        title: "Processing Failed",
        description: "Batch processing encountered an error.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
      setProgress(0);
    }
  }, [uploadedData, toast]);

  const handleExportResults = useCallback(() => {
    if (results.length === 0) {
      toast({
        title: "No Results",
        description: "No results to export. Run batch processing first.",
        variant: "destructive",
      });
      return;
    }

    const csvData = results.map(result => ({
      id: result.id,
      text: result.text,
      predicted_label: result.prediction.label,
      risk_score: result.prediction.riskScore.toFixed(3),
      risk_level: result.prediction.riskLevel,
      confidence: result.prediction.confidence.toFixed(3),
      explanation: result.prediction.explanation,
      extracted_targets: result.prediction.entities.targets.join('; '),
      extracted_tools: result.prediction.entities.tools.join('; '),
      extracted_dates: result.prediction.entities.dates.join('; '),
      processing_time_ms: result.prediction.processingTime.toFixed(0),
      original_label: result.originalLabel || '',
      original_type: result.originalType || ''
    }));

    const csv = Papa.unparse(csvData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `batch_results_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }

    toast({
      title: "Results Exported",
      description: `Exported ${results.length} predictions to CSV file.`,
    });
  }, [results, toast]);

  const getRiskBadge = (riskLevel: 'low' | 'medium' | 'high') => {
    const colors = {
      high: 'bg-threat-high text-white',
      medium: 'bg-threat-medium text-black', 
      low: 'bg-threat-low text-white'
    };
    
    return (
      <Badge className={colors[riskLevel]}>
        {riskLevel.toUpperCase()}
      </Badge>
    );
  };

  const calculateAccuracy = () => {
    if (results.length === 0) return null;
    
    const withGroundTruth = results.filter(r => r.originalLabel);
    if (withGroundTruth.length === 0) return null;
    
    const correct = withGroundTruth.filter(r => 
      r.prediction.label === r.originalLabel
    ).length;
    
    return {
      accuracy: (correct / withGroundTruth.length * 100).toFixed(1),
      total: withGroundTruth.length,
      correct
    };
  };

  const accuracy = calculateAccuracy();

  return (
    <div className="space-y-6">
      <Card className="border-border/50 bg-gradient-to-br from-card to-card/80">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Batch Threat Analysis
          </CardTitle>
          <CardDescription>
            Upload a CSV file to analyze multiple messages at once. CSV should contain a 'text' or 'message' column.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Upload Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                className="hidden"
              />
              <Button
                onClick={() => fileInputRef.current?.click()}
                variant="outline"
                className="gap-2"
              >
                <Upload className="h-4 w-4" />
                Upload CSV
              </Button>
              
              {uploadedData.length > 0 && (
                <Button
                  onClick={handleBatchProcess}
                  disabled={isProcessing}
                  className="gap-2 bg-primary hover:bg-primary/90"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4" />
                      Analyze {uploadedData.length} Messages
                    </>
                  )}
                </Button>
              )}

              {results.length > 0 && (
                <Button
                  onClick={handleExportResults}
                  variant="outline"
                  className="gap-2"
                >
                  <Download className="h-4 w-4" />
                  Export Results
                </Button>
              )}
            </div>

            {/* Progress Bar */}
            {isProcessing && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Processing messages...</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
            )}

            {/* Upload Status */}
            {uploadedData.length > 0 && (
              <div className="p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2 text-sm">
                  <FileText className="h-4 w-4 text-primary" />
                  <span>Loaded {uploadedData.length} messages from CSV file</span>
                </div>
              </div>
            )}
          </div>

          {/* Results Summary */}
          {results.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-lg">Batch Analysis Results</h3>
                {accuracy && (
                  <div className="text-sm">
                    <span className="text-muted-foreground">Accuracy: </span>
                    <span className="font-semibold text-primary">
                      {accuracy.accuracy}% ({accuracy.correct}/{accuracy.total})
                    </span>
                  </div>
                )}
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-3 rounded-lg bg-muted/50 text-center">
                  <div className="text-2xl font-bold text-primary">{results.length}</div>
                  <div className="text-sm text-muted-foreground">Total Analyzed</div>
                </div>
                <div className="p-3 rounded-lg bg-threat-high/10 text-center">
                  <div className="text-2xl font-bold text-threat-high">
                    {results.filter(r => r.prediction.label === 'threat').length}
                  </div>
                  <div className="text-sm text-muted-foreground">Threats Found</div>
                </div>
                <div className="p-3 rounded-lg bg-threat-high/10 text-center">
                  <div className="text-2xl font-bold text-threat-high">
                    {results.filter(r => r.prediction.riskLevel === 'high').length}
                  </div>
                  <div className="text-sm text-muted-foreground">High Risk</div>
                </div>
                <div className="p-3 rounded-lg bg-muted/50 text-center">
                  <div className="text-2xl font-bold text-primary">
                    {(results.reduce((sum, r) => sum + r.prediction.processingTime, 0) / results.length).toFixed(0)}ms
                  </div>
                  <div className="text-sm text-muted-foreground">Avg Time</div>
                </div>
              </div>

              {/* Results Table */}
              <div className="border rounded-lg overflow-hidden max-h-[400px] overflow-y-auto">
                <Table>
                  <TableHeader className="sticky top-0 bg-background">
                    <TableRow>
                      <TableHead className="w-[100px]">ID</TableHead>
                      <TableHead>Message</TableHead>
                      <TableHead className="w-[100px]">Predicted</TableHead>
                      <TableHead className="w-[100px]">Risk Level</TableHead>
                      <TableHead className="w-[100px]">Score</TableHead>
                      {accuracy && <TableHead className="w-[100px]">Actual</TableHead>}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {results.slice(0, 100).map((result) => ( // Limit display for performance
                      <TableRow key={result.id}>
                        <TableCell className="font-mono text-sm">{result.id}</TableCell>
                        <TableCell className="max-w-[300px]">
                          <div className="truncate" title={result.text}>
                            {result.text}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={result.prediction.label === 'threat' ? 'destructive' : 'secondary'}>
                            {result.prediction.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {getRiskBadge(result.prediction.riskLevel)}
                        </TableCell>
                        <TableCell className="font-mono text-sm">
                          {(result.prediction.riskScore * 100).toFixed(0)}%
                        </TableCell>
                        {accuracy && (
                          <TableCell>
                            {result.originalLabel ? (
                              <div className="flex items-center gap-1">
                                <Badge 
                                  variant={result.originalLabel === 'threat' ? 'destructive' : 'secondary'}
                                  className="text-xs"
                                >
                                  {result.originalLabel}
                                </Badge>
                                {result.prediction.label !== result.originalLabel && (
                                  <AlertCircle className="h-3 w-3 text-orange-500" />
                                )}
                              </div>
                            ) : (
                              <span className="text-muted-foreground text-xs">N/A</span>
                            )}
                          </TableCell>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {results.length > 100 && (
                <div className="text-sm text-muted-foreground text-center">
                  Showing first 100 results. Export CSV to see all {results.length} results.
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}