import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Upload, FileText, Download, Loader2, AlertCircle, CheckCircle, Shield } from "lucide-react";
import { threatDetector } from "@/ml/threatDetector";
import Papa from "papaparse";

interface AnalyzeProps {
  userId: string;
}

interface AnalysisResult {
  label: string;
  confidence: number;
  riskScore: number;
  riskLevel: string;
  explanation: string;
  entities: any;
  features: string[];
  patterns: string[];
  recommendations: string[];
}

export default function Analyze({ userId }: AnalyzeProps) {
  const [textInput, setTextInput] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const analyzeText = async () => {
    if (!textInput.trim()) {
      toast({
        title: "Input required",
        description: "Please enter text to analyze",
        variant: "destructive",
      });
      return;
    }

    setAnalyzing(true);
    try {
      const prediction = await threatDetector.predict(textInput);

      // Save to database
      await supabase.from("analysis_history").insert([{
        user_id: userId,
        input_text: textInput,
        prediction_label: prediction.label,
        risk_score: prediction.riskScore,
        risk_level: prediction.riskLevel,
        confidence: prediction.confidence,
        explanation: prediction.explanation,
        entities: prediction.entities as any,
        features: prediction.features as any,
      }]);

      setResult({
        label: prediction.label,
        confidence: prediction.confidence,
        riskScore: prediction.riskScore,
        riskLevel: prediction.riskLevel,
        explanation: prediction.explanation,
        entities: prediction.entities,
        features: prediction.features || [],
        patterns: extractPatterns(prediction),
        recommendations: generateRecommendations(prediction),
      });

      toast({
        title: "Analysis complete",
        description: "Threat assessment completed successfully",
      });
    } catch (error: any) {
      toast({
        title: "Analysis failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setAnalyzing(false);
    }
  };

  const extractPatterns = (prediction: any): string[] => {
    const patterns: string[] = [];
    if (prediction.entities?.tools?.length > 0) {
      patterns.push(`Detected tools: ${prediction.entities.tools.join(", ")}`);
    }
    if (prediction.entities?.targets?.length > 0) {
      patterns.push(`Potential targets: ${prediction.entities.targets.join(", ")}`);
    }
    if (prediction.entities?.dates?.length > 0) {
      patterns.push(`Time references: ${prediction.entities.dates.join(", ")}`);
    }
    return patterns;
  };

  const generateRecommendations = (prediction: any): string[] => {
    const recommendations: string[] = [];
    
    if (prediction.riskLevel === "high") {
      recommendations.push("Immediate action required - flag for security review");
      recommendations.push("Isolate and monitor sender");
      recommendations.push("Escalate to security team");
    } else if (prediction.riskLevel === "medium") {
      recommendations.push("Review context and sender history");
      recommendations.push("Monitor for similar patterns");
      recommendations.push("Consider additional verification");
    } else {
      recommendations.push("No immediate action required");
      recommendations.push("Continue routine monitoring");
    }

    return recommendations;
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith(".csv")) {
      toast({
        title: "Invalid file",
        description: "Please upload a CSV file",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    try {
      // Upload to Supabase Storage
      const filePath = `${userId}/${Date.now()}_${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from("analysis-files")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Save file metadata
      await supabase.from("uploaded_files").insert({
        user_id: userId,
        file_name: file.name,
        file_path: filePath,
        file_size: file.size,
        mime_type: file.type,
      });

      setUploadedFile(file);
      toast({
        title: "File uploaded",
        description: "File uploaded successfully",
      });
    } catch (error: any) {
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const downloadFile = async () => {
    if (!uploadedFile) return;

    const url = URL.createObjectURL(uploadedFile);
    const a = document.createElement("a");
    a.href = url;
    a.download = uploadedFile.name;
    a.click();
  };

  const getRiskIcon = () => {
    if (!result) return null;
    switch (result.riskLevel) {
      case "high":
        return <AlertCircle className="h-12 w-12 text-destructive" />;
      case "medium":
        return <AlertCircle className="h-12 w-12 text-yellow-500" />;
      default:
        return <CheckCircle className="h-12 w-12 text-primary" />;
    }
  };

  const getRiskColor = () => {
    if (!result) return "primary";
    switch (result.riskLevel) {
      case "high":
        return "destructive";
      case "medium":
        return "secondary";
      default:
        return "default";
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-foreground">Threat Analysis</h2>
        <p className="text-muted-foreground">Analyze text or upload CSV files for batch processing</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Text Analysis */}
        <Card>
          <CardHeader>
            <CardTitle>Text Analysis</CardTitle>
            <CardDescription>Enter text to analyze for potential threats</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="Enter text to analyze..."
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              rows={6}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  analyzeText();
                }
              }}
            />
            <Button onClick={analyzeText} disabled={analyzing} className="w-full">
              {analyzing ? (
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
          </CardContent>
        </Card>

        {/* File Upload */}
        <Card>
          <CardHeader>
            <CardTitle>CSV Upload</CardTitle>
            <CardDescription>Upload CSV files for batch analysis</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="border-2 border-dashed border-border rounded-lg p-8 text-center space-y-4">
              <Upload className="h-12 w-12 mx-auto text-muted-foreground" />
              <div>
                <Label htmlFor="file-upload" className="cursor-pointer">
                  <Button variant="outline" disabled={uploading} asChild>
                    <span>
                      {uploading ? "Uploading..." : "Choose File"}
                    </span>
                  </Button>
                </Label>
                <Input
                  id="file-upload"
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>
              {uploadedFile && (
                <div className="flex items-center justify-between p-3 bg-muted rounded-md">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    <span className="text-sm">{uploadedFile.name}</span>
                  </div>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="ghost" size="sm">
                        View
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>File Preview</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">
                          Name: {uploadedFile.name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Size: {(uploadedFile.size / 1024).toFixed(2)} KB
                        </p>
                        <Button onClick={downloadFile} className="w-full">
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Results */}
      {result && (
        <Card>
          <CardHeader>
            <CardTitle>Analysis Results</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col items-center text-center space-y-4 p-6 bg-muted/50 rounded-lg">
              {getRiskIcon()}
              <div>
                <h3 className="text-2xl font-bold text-foreground capitalize">
                  {result.riskLevel} Risk
                </h3>
                <p className="text-muted-foreground">Classification: {result.label}</p>
              </div>
              <div className="w-full max-w-md space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Risk Score</span>
                  <span className="font-medium">{(result.riskScore * 100).toFixed(1)}%</span>
                </div>
                <Progress value={result.riskScore * 100} className="h-3" />
              </div>
              <div className="flex gap-2">
                <Badge variant={getRiskColor() as any}>
                  Confidence: {(result.confidence * 100).toFixed(1)}%
                </Badge>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="font-semibold">Explanation</h4>
                <p className="text-sm text-muted-foreground">{result.explanation}</p>
              </div>

              {result.patterns.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-semibold">Detected Patterns</h4>
                  <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                    {result.patterns.map((pattern, i) => (
                      <li key={i}>{pattern}</li>
                    ))}
                  </ul>
                </div>
              )}

              {result.features.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-semibold">Key Features</h4>
                  <div className="flex flex-wrap gap-2">
                    {result.features.map((feature, i) => (
                      <Badge key={i} variant="outline">
                        {feature}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <h4 className="font-semibold">Recommendations</h4>
                <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                  {result.recommendations.map((rec, i) => (
                    <li key={i}>{rec}</li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
