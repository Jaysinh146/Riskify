import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Loader2, Shield, AlertTriangle, Info, Target, Calendar, Wrench } from 'lucide-react';
import { threatDetector, type ThreatPrediction } from '@/ml/threatDetector';
import { useToast } from '@/hooks/use-toast';

interface ThreatAnalyzerProps {
  onPrediction?: (prediction: ThreatPrediction) => void;
}

export function ThreatAnalyzer({ onPrediction }: ThreatAnalyzerProps) {
  const [inputText, setInputText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [prediction, setPrediction] = useState<ThreatPrediction | null>(null);
  const [modelStatus, setModelStatus] = useState(threatDetector.getStatus());
  const { toast } = useToast();

  const handleAnalyze = useCallback(async () => {
    if (!inputText.trim()) {
      toast({
        title: "Input Required",
        description: "Please enter a message to analyze.",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    try {
      const result = await threatDetector.predict(inputText);
      setPrediction(result);
      onPrediction?.(result);
      
      // Update model status
      setModelStatus(threatDetector.getStatus());
      
      toast({
        title: "Analysis Complete",
        description: `Message classified as ${result.label} with ${(result.confidence * 100).toFixed(1)}% confidence.`,
        variant: result.riskLevel === 'high' ? 'destructive' : 'default',
      });
    } catch (error) {
      console.error('Analysis failed:', error);
      toast({
        title: "Analysis Failed",
        description: "Could not analyze the message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  }, [inputText, onPrediction, toast]);

  const getRiskColor = (riskLevel: 'low' | 'medium' | 'high') => {
    switch (riskLevel) {
      case 'high': return 'bg-threat-high text-white';
      case 'medium': return 'bg-threat-medium text-black';
      case 'low': return 'bg-threat-low text-white';
      default: return 'bg-safe text-white';
    }
  };

  const getRiskIcon = (riskLevel: 'low' | 'medium' | 'high') => {
    switch (riskLevel) {
      case 'high': return <AlertTriangle className="h-4 w-4" />;
      case 'medium': return <Info className="h-4 w-4" />;
      case 'low': return <Shield className="h-4 w-4" />;
      default: return <Shield className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border-border/50 bg-gradient-to-br from-card to-card/80">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Threat Analysis Engine
          </CardTitle>
          <CardDescription>
            Enter a message to analyze for potential cybersecurity threats using AI detection.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Textarea
              id="analyzer-textarea"
              placeholder="Enter message to analyze... (e.g., 'Selling new phishing kit for bank sites')"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="min-h-[100px] bg-background/50"
            />
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Model Status: {modelStatus.isLoading ? 'Loading...' : modelStatus.isReady ? 'Ready' : 'Initializing'}
              </div>
              <Button
                onClick={handleAnalyze}
                disabled={isAnalyzing || !inputText.trim() || modelStatus.isLoading}
                className="bg-primary hover:bg-primary/90"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Shield className="h-4 w-4 mr-2" />
                    Analyze Threat
                  </>
                )}
              </Button>
            </div>
          </div>

          {prediction && (
            <div className="space-y-4 p-4 rounded-lg border bg-card/50">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-lg">Analysis Results</h3>
                <div className="text-sm text-muted-foreground">
                  Processed in {prediction.processingTime.toFixed(0)}ms
                </div>
              </div>

              {/* Risk Score and Level */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Badge className={`${getRiskColor(prediction.riskLevel)} flex items-center gap-1`}>
                    {getRiskIcon(prediction.riskLevel)}
                    {prediction.riskLevel.toUpperCase()} RISK
                  </Badge>
                </div>
                <div className="flex-1">
                  <div className="text-sm text-muted-foreground mb-1">
                    Risk Score: {(prediction.riskScore * 100).toFixed(1)}% | 
                    Confidence: {(prediction.confidence * 100).toFixed(1)}%
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-500 ${
                        prediction.riskLevel === 'high' ? 'bg-threat-high' :
                        prediction.riskLevel === 'medium' ? 'bg-threat-medium' : 'bg-threat-low'
                      }`}
                      style={{ width: `${prediction.riskScore * 100}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Classification */}
              <div className="flex items-center gap-2">
                <span className="font-medium">Classification:</span>
                <Badge variant={prediction.label === 'threat' ? 'destructive' : 'secondary'}>
                  {prediction.label.toUpperCase()}
                </Badge>
              </div>

              {/* Explanation */}
              <div className="space-y-2">
                <span className="font-medium">Explanation:</span>
                <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded">
                  {prediction.explanation}
                </p>
              </div>

              {/* Extracted Entities */}
              {(prediction.entities.targets.length > 0 || 
                prediction.entities.tools.length > 0 || 
                prediction.entities.dates.length > 0) && (
                <div className="space-y-3">
                  <span className="font-medium">Extracted Entities:</span>
                  <div className="space-y-2">
                    {prediction.entities.targets.length > 0 && (
                      <div className="flex items-center gap-2 flex-wrap">
                        <Target className="h-4 w-4 text-primary" />
                        <span className="text-sm font-medium">Targets:</span>
                        {prediction.entities.targets.map((target, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {target}
                          </Badge>
                        ))}
                      </div>
                    )}
                    {prediction.entities.tools.length > 0 && (
                      <div className="flex items-center gap-2 flex-wrap">
                        <Wrench className="h-4 w-4 text-primary" />
                        <span className="text-sm font-medium">Tools:</span>
                        {prediction.entities.tools.map((tool, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {tool}
                          </Badge>
                        ))}
                      </div>
                    )}
                    {prediction.entities.dates.length > 0 && (
                      <div className="flex items-center gap-2 flex-wrap">
                        <Calendar className="h-4 w-4 text-primary" />
                        <span className="text-sm font-medium">Dates:</span>
                        {prediction.entities.dates.map((date, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {date}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Top Features */}
              {prediction.features.length > 0 && (
                <div className="space-y-2">
                  <span className="font-medium">Key Features:</span>
                  <div className="flex flex-wrap gap-1">
                    {prediction.features.slice(0, 8).map((feature, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs">
                        {feature}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}