import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Shield, Database, Brain, Search, BarChart3, AlertCircle } from 'lucide-react';

export function SystemOverview() {
  const pipelineSteps = [
    {
      icon: <Database className="h-5 w-5 text-primary" />,
      title: "Data Collection",
      description: "Synthetic cybersecurity message dataset",
      details: ["200+ synthetic messages", "Multiple threat categories", "Labeled training data"]
    },
    {
      icon: <Search className="h-5 w-5 text-primary" />,
      title: "Text Processing", 
      description: "Clean and extract features from messages",
      details: ["Text normalization", "N-gram features", "Entity extraction (NER)"]
    },
    {
      icon: <Brain className="h-5 w-5 text-primary" />,
      title: "ML Classification",
      description: "AI-powered threat detection using transformers",
      details: ["HuggingFace transformers", "Real-time inference", "Confidence scoring"]
    },
    {
      icon: <BarChart3 className="h-5 w-5 text-primary" />,
      title: "Risk Assessment",
      description: "Calculate risk scores and threat levels",
      details: ["Rule-based enhancement", "0-1 risk scoring", "Threat categorization"]
    },
    {
      icon: <Shield className="h-5 w-5 text-primary" />,
      title: "Alert Dashboard",
      description: "Interactive analysis and reporting interface",
      details: ["Real-time predictions", "Batch processing", "CSV export/import"]
    }
  ];

  const threatTypes = [
    { type: "Ransomware", color: "bg-red-500/20 text-red-200", description: "File encryption malware" },
    { type: "Phishing", color: "bg-orange-500/20 text-orange-200", description: "Credential harvesting" },
    { type: "DDoS", color: "bg-purple-500/20 text-purple-200", description: "Denial of service attacks" },
    { type: "Credential Theft", color: "bg-yellow-500/20 text-yellow-200", description: "Account compromise" },
    { type: "Other", color: "bg-gray-500/20 text-gray-200", description: "General cybersecurity threats" }
  ];

  return (
    <div className="space-y-6">
      <Card className="border-border/50 bg-gradient-to-br from-card to-card/80">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            Lightweight Threat Detection Pipeline
          </CardTitle>
          <CardDescription>
            An intelligent browser-based threat detection system for cybersecurity message analysis
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Ethics Notice */}
          <div className="p-4 rounded-lg border border-orange-500/30 bg-orange-500/10">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-orange-400 mt-0.5" />
              <div className="space-y-1">
                <h4 className="font-semibold text-orange-200">Ethics & Legal Notice</h4>
                <p className="text-sm text-orange-200/80">
                  All training data is synthetic or publicly released. This is a student demonstration only for educational purposes. 
                  Do not attempt to access private or illegal forums. Use responsibly.
                </p>
              </div>
            </div>
          </div>

          {/* System Architecture */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">How the System Works</h3>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {pipelineSteps.map((step, index) => (
                <React.Fragment key={index}>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      {step.icon}
                      <Badge variant="outline" className="text-xs">
                        Step {index + 1}
                      </Badge>
                    </div>
                    <div>
                      <h4 className="font-medium text-sm">{step.title}</h4>
                      <p className="text-xs text-muted-foreground mb-2">{step.description}</p>
                      <ul className="space-y-1">
                        {step.details.map((detail, idx) => (
                          <li key={idx} className="text-xs text-muted-foreground flex items-center gap-1">
                            <span className="w-1 h-1 bg-primary rounded-full" />
                            {detail}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  {index < pipelineSteps.length - 1 && (
                    <div className="hidden md:flex items-center justify-center">
                      <div className="w-8 h-px bg-border" />
                    </div>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          <Separator />

          {/* Threat Categories */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Detected Threat Categories</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {threatTypes.map((threat, index) => (
                <div key={index} className="p-3 rounded-lg border bg-card/30">
                  <div className="flex items-center justify-between mb-2">
                    <Badge className={threat.color}>
                      {threat.type}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{threat.description}</p>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Technical Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h3 className="font-semibold">Technical Features</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-primary rounded-full" />
                  Browser-based ML with HuggingFace Transformers
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-primary rounded-full" />
                  Real-time threat prediction and scoring
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-primary rounded-full" />
                  Named Entity Recognition (NER) extraction
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-primary rounded-full" />
                  Batch processing with CSV import/export
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-primary rounded-full" />
                  Rule-based enhancement for accuracy
                </li>
              </ul>
            </div>
            
            <div className="space-y-3">
              <h3 className="font-semibold">Use Cases</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-primary rounded-full" />
                  Educational cybersecurity training
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-primary rounded-full" />
                  Proof-of-concept threat detection
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-primary rounded-full" />
                  Message classification research
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-primary rounded-full" />
                  ML pipeline demonstration
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-primary rounded-full" />
                  Dataset analysis and exploration
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}