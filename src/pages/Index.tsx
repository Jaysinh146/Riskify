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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                LDP — Lightweight Threat Detection
              </h1>
              <p className="text-sm text-muted-foreground">
                Final Year B.Tech Project ( Group SE 33 ) - Student Prototype
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
        <Tabs defaultValue="analyzer" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4 lg:w-fit">
            <TabsTrigger value="analyzer">
              Threat Analyzer
            </TabsTrigger>
            <TabsTrigger value="dataset">
              Dataset
            </TabsTrigger>
            <TabsTrigger value="batch">
              Batch Process
            </TabsTrigger>
            <TabsTrigger value="history">
              History
            </TabsTrigger>
          </TabsList>

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
      <footer className="border-t bg-muted/30 mt-12">
        <div className="container mx-auto px-4 py-4">
          <div className="text-center">
            <p className="text-xs text-muted-foreground">
              Final Year B.Tech Project • Educational demonstration • Synthetic data only
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
