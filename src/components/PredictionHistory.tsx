import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Clock, TrendingUp, AlertTriangle, Shield } from 'lucide-react';
import { type ThreatPrediction } from '@/ml/threatDetector';

interface PredictionHistoryProps {
  predictions: Array<{
    id: string;
    text: string;
    prediction: ThreatPrediction;
    timestamp: Date;
  }>;
  onClearHistory?: () => void;
}

export function PredictionHistory({ predictions, onClearHistory }: PredictionHistoryProps) {
  const recentPredictions = predictions.slice(-10).reverse();

  const getRiskIcon = (riskLevel: 'low' | 'medium' | 'high') => {
    switch (riskLevel) {
      case 'high': return <AlertTriangle className="h-4 w-4 text-threat-high" />;
      case 'medium': return <TrendingUp className="h-4 w-4 text-threat-medium" />;
      case 'low': return <Shield className="h-4 w-4 text-threat-low" />;
    }
  };

  const getRiskBadge = (riskLevel: 'low' | 'medium' | 'high') => {
    const colors = {
      high: 'bg-threat-high text-white',
      medium: 'bg-threat-medium text-black',
      low: 'bg-threat-low text-white'
    };
    
    return (
      <Badge className={`${colors[riskLevel]} text-xs`}>
        {riskLevel}
      </Badge>
    );
  };

  if (predictions.length === 0) {
    return (
      <Card className="border-border/50 bg-gradient-to-br from-card to-card/80">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            Recent Predictions
          </CardTitle>
            <CardDescription className="hidden sm:block">
              Your recent threat analysis results will appear here
            </CardDescription>
            <CardDescription className="sm:hidden">
              Recent analysis results
            </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Clock className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No predictions yet</p>
            <p className="text-sm">Analyze messages to see history</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/50 bg-gradient-to-br from-card to-card/80">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              Recent Predictions
            </CardTitle>
            <CardDescription className="hidden sm:block">
              Last {recentPredictions.length} threat analysis results
            </CardDescription>
            <CardDescription className="sm:hidden">
              Last {recentPredictions.length} results
            </CardDescription>
          </div>
          {predictions.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={onClearHistory}
              className="text-xs"
            >
              Clear History
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-4">
            {recentPredictions.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-lg border bg-card/50 hover:bg-card/70 transition-colors"
              >
                <div className="space-y-3">
                  {/* Header with timestamp and risk level */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getRiskIcon(item.prediction.riskLevel)}
                      <span className="text-sm text-muted-foreground">
                        {item.timestamp.toLocaleTimeString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {getRiskBadge(item.prediction.riskLevel)}
                      <Badge variant={item.prediction.label === 'threat' ? 'destructive' : 'secondary'} className="text-xs">
                        {item.prediction.label}
                      </Badge>
                    </div>
                  </div>

                  {/* Message text */}
                  <div className="text-sm">
                    <p className="line-clamp-2 text-foreground">
                      "{item.text}"
                    </p>
                  </div>

                  {/* Metrics */}
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-4">
                      <span>Risk: {(item.prediction.riskScore * 100).toFixed(0)}%</span>
                      <span>Confidence: {(item.prediction.confidence * 100).toFixed(0)}%</span>
                    </div>
                    <span>{item.prediction.processingTime.toFixed(0)}ms</span>
                  </div>

                  {/* Entities (if any) */}
                  {(item.prediction.entities.targets.length > 0 || 
                    item.prediction.entities.tools.length > 0) && (
                    <div className="flex flex-wrap gap-1">
                      {item.prediction.entities.targets.slice(0, 2).map((target, idx) => (
                        <Badge key={`target-${idx}`} variant="outline" className="text-xs">
                          🎯 {target}
                        </Badge>
                      ))}
                      {item.prediction.entities.tools.slice(0, 2).map((tool, idx) => (
                        <Badge key={`tool-${idx}`} variant="outline" className="text-xs">
                          🔧 {tool}
                        </Badge>
                      ))}
                      {(item.prediction.entities.targets.length > 2 || 
                        item.prediction.entities.tools.length > 2) && (
                        <Badge variant="outline" className="text-xs">
                          +more
                        </Badge>
                      )}
                    </div>
                  )}

                  {/* Risk score bar */}
                  <div className="w-full bg-secondary rounded-full h-1.5">
                    <div 
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        item.prediction.riskLevel === 'high' ? 'bg-threat-high' :
                        item.prediction.riskLevel === 'medium' ? 'bg-threat-medium' : 'bg-threat-low'
                      }`}
                      style={{ width: `${item.prediction.riskScore * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}