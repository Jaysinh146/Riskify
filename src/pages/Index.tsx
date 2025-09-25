/**
 * LDP - Lightweight Threat Detection Platform
 * A browser-based cybersecurity threat detection system for educational purposes
 * 
 * ETHICS & LEGAL NOTICE:
 * All training data is synthetic or publicly released. Do not attempt to access private forums.
 * This is a student demo only for educational purposes.
 */

import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ThreatAnalyzer } from '@/components/ThreatAnalyzer';
import { DatasetViewer } from '@/components/DatasetViewer';
import { BatchProcessor } from '@/components/BatchProcessor';
import { PredictionHistory } from '@/components/PredictionHistory';
import { SystemOverview } from '@/components/SystemOverview';
import { type ThreatPrediction } from '@/ml/threatDetector';
import { type ThreatMessage } from '@/data/syntheticData';

const Index = () => {
  const [predictionHistory, setPredictionHistory] = useState<Array<{
    id: string;
    text: string;
    prediction: ThreatPrediction;
    timestamp: Date;
  }>>([]);

  const handlePrediction = (prediction: ThreatPrediction) => {
    const newPrediction = {
      id: `pred_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      text: prediction.explanation || 'Analyzed message',
      prediction,
      timestamp: new Date()
    };
    
    setPredictionHistory(prev => [...prev, newPrediction]);
  };

  const handleDatasetMessageSelect = (message: ThreatMessage) => {
    // This will trigger the ThreatAnalyzer to analyze the selected message
    // The actual analysis happens when the user clicks the analyze button
    document.getElementById('analyzer-textarea')?.setAttribute('value', message.text);
  };

  const handleClearHistory = () => {
    setPredictionHistory([]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                LDP — Lightweight Threat Detection
              </h1>
              <p className="text-muted-foreground mt-1">
                Browser-based AI threat detection for cybersecurity education
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-primary animate-pulse" />
              <span className="text-sm text-muted-foreground">System Ready</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 lg:w-fit lg:grid-cols-5 gap-1">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <span className="hidden sm:inline">System Overview</span>
              <span className="sm:hidden">Overview</span>
            </TabsTrigger>
            <TabsTrigger value="analyzer" className="flex items-center gap-2">
              <span className="hidden sm:inline">Threat Analyzer</span>
              <span className="sm:hidden">Analyze</span>
            </TabsTrigger>
            <TabsTrigger value="dataset" className="flex items-center gap-2">
              <span className="hidden sm:inline">Dataset</span>
              <span className="sm:hidden">Data</span>
            </TabsTrigger>
            <TabsTrigger value="batch" className="flex items-center gap-2">
              <span className="hidden sm:inline">Batch Process</span>
              <span className="sm:hidden">Batch</span>
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <span className="hidden sm:inline">History</span>
              <span className="sm:hidden">History</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <SystemOverview />
          </TabsContent>

          <TabsContent value="analyzer" className="space-y-6">
            <ThreatAnalyzer
              onPrediction={handlePrediction}
            />
          </TabsContent>

          <TabsContent value="dataset" className="space-y-6">
            <DatasetViewer onMessageSelect={handleDatasetMessageSelect} />
          </TabsContent>

          <TabsContent value="batch" className="space-y-6">
            <BatchProcessor />
          </TabsContent>

          <TabsContent value="history" className="space-y-6">
            <PredictionHistory 
              predictions={predictionHistory}
              onClearHistory={handleClearHistory}
            />
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="border-t bg-card/30 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-center md:text-left">
              <p className="text-sm text-muted-foreground">
                LDP — Lightweight Threat Detection Platform
              </p>
              <p className="text-xs text-muted-foreground">
                Educational cybersecurity demonstration • Synthetic data only
              </p>
            </div>
            <div className="text-xs text-muted-foreground text-center md:text-right">
              <p>Built with React, TypeScript & HuggingFace Transformers</p>
              <p>⚠️ For educational purposes only</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
