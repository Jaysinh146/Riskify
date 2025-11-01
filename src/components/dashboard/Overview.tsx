import { useEffect, useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { FileDown, Activity, AlertTriangle, Shield, TrendingUp, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from "recharts";
import Papa from "papaparse";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

interface OverviewProps {
  userId: string;
}

interface Stats {
  totalAnalyses: number;
  threatsFound: number;
  avgRiskScore: number;
  highRiskCount: number;
  mediumRiskCount: number;
  lowRiskCount: number;
}

export default function Overview({ userId }: OverviewProps) {
  const [timeFilter, setTimeFilter] = useState("lifetime");
  const [stats, setStats] = useState<Stats>({
    totalAnalyses: 0,
    threatsFound: 0,
    avgRiskScore: 0,
    highRiskCount: 0,
    mediumRiskCount: 0,
    lowRiskCount: 0,
  });
  const { toast } = useToast();
  const reportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchStats();

    // Real-time subscription
    const channel = supabase
      .channel("analysis_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "analysis_history",
          filter: `user_id=eq.${userId}`,
        },
        () => {
          fetchStats();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, timeFilter]);

  const fetchStats = async () => {
    const now = new Date();
    let dateFilter: Date | null = null;

    switch (timeFilter) {
      case "today":
        dateFilter = new Date(now.setHours(0, 0, 0, 0));
        break;
      case "yesterday":
        dateFilter = new Date(now.setDate(now.getDate() - 1));
        dateFilter.setHours(0, 0, 0, 0);
        break;
      case "7days":
        dateFilter = new Date(now.setDate(now.getDate() - 7));
        break;
      case "30days":
        dateFilter = new Date(now.setDate(now.getDate() - 30));
        break;
      case "6months":
        dateFilter = new Date(now.setMonth(now.getMonth() - 6));
        break;
      case "1year":
        dateFilter = new Date(now.setFullYear(now.getFullYear() - 1));
        break;
    }

    let query = supabase
      .from("analysis_history")
      .select("*")
      .eq("user_id", userId);

    if (dateFilter) {
      query = query.gte("created_at", dateFilter.toISOString());
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching stats:", error);
      return;
    }

    const analyses = data || [];
    // Normalize labels for consistent counting
    const normalizedAnalyses = analyses.map((a) => ({
      ...a,
      prediction_label: (a.prediction_label || '').toString().toLowerCase(),
    }));
    const threats = normalizedAnalyses.filter((a) => a.prediction_label === 'threat');

    setStats({
      totalAnalyses: analyses.length,
      threatsFound: threats.length,
      avgRiskScore: analyses.length > 0
        ? analyses.reduce((sum, a) => sum + Number(a.risk_score), 0) / analyses.length
        : 0,
      highRiskCount: analyses.filter((a) => a.risk_level === "high").length,
      mediumRiskCount: analyses.filter((a) => a.risk_level === "medium").length,
      lowRiskCount: analyses.filter((a) => a.risk_level === "low").length,
    });
  };

  const exportToCSV = async () => {
    const { data, error } = await supabase
      .from("analysis_history")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      toast({
        title: "Export failed",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    const csv = Papa.unparse(data || []);
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `riskify-analysis-${new Date().toISOString()}.csv`;
    a.click();

    toast({
      title: "Export successful",
      description: "Analysis data exported to CSV",
    });
  };

  const exportToPDF = async () => {
    if (!reportRef.current) return;

    toast({
      title: "Generating PDF...",
      description: "Please wait while we create your report",
    });

    try {
      const element = reportRef.current;
      const canvas = await html2canvas(element, {
        scale: 2,
        backgroundColor: "#ffffff",
        logging: false,
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      const imgX = (pdfWidth - imgWidth * ratio) / 2;
      const imgY = 10;

      // Add header
      pdf.setFontSize(20);
      pdf.text("Riskify Analysis Report", pdfWidth / 2, imgY, { align: "center" });
      pdf.setFontSize(12);
      pdf.text(`Generated: ${new Date().toLocaleString()}`, pdfWidth / 2, imgY + 7, { align: "center" });

      // Add chart image
      pdf.addImage(
        imgData,
        "PNG",
        imgX,
        imgY + 15,
        imgWidth * ratio,
        imgHeight * ratio
      );

      pdf.save(`riskify-report-${new Date().toISOString()}.pdf`);

      toast({
        title: "PDF exported successfully",
        description: "Your analysis report has been downloaded",
      });
    } catch (error) {
      console.error("PDF export error:", error);
      toast({
        title: "Export failed",
        description: "Failed to generate PDF report",
        variant: "destructive",
      });
    }
  };

  const pieData = [
    { name: "High Risk", value: stats.highRiskCount, color: "hsl(0 84% 60%)" },
    { name: "Medium Risk", value: stats.mediumRiskCount, color: "hsl(43 96% 56%)" },
    { name: "Low Risk", value: stats.lowRiskCount, color: "hsl(142 76% 36%)" },
  ];

  const barData = [
    { name: "Total", value: stats.totalAnalyses, fill: "hsl(var(--primary))" },
    { name: "Threats", value: stats.threatsFound, fill: "hsl(var(--destructive))" },
    { name: "Safe", value: stats.totalAnalyses - stats.threatsFound, fill: "hsl(var(--safe))" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Analysis Overview</h2>
          <p className="text-muted-foreground">Real-time threat detection statistics</p>
        </div>
        <div className="flex gap-3 w-full md:w-auto flex-wrap">
          <Select value={timeFilter} onValueChange={setTimeFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="yesterday">Yesterday</SelectItem>
              <SelectItem value="7days">Last 7 Days</SelectItem>
              <SelectItem value="30days">Last 30 Days</SelectItem>
              <SelectItem value="6months">Last 6 Months</SelectItem>
              <SelectItem value="1year">Last Year</SelectItem>
              <SelectItem value="lifetime">Lifetime</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={exportToPDF} variant="outline">
            <FileText className="h-4 w-4 mr-2" />
            Export PDF
          </Button>
          <Button onClick={exportToCSV} variant="outline">
            <FileDown className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      <div ref={reportRef}>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Total Analyses
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-3xl font-bold text-foreground">{stats.totalAnalyses}</p>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => window.location.href = '/dashboard/view-all?filter=all'}
              className="w-full"
            >
              View All
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Threats Detected
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-3xl font-bold text-destructive">{stats.threatsFound}</p>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => window.location.href = '/dashboard/view-all?filter=threat'}
              className="w-full"
            >
              View All
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Avg Risk Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-foreground">{stats.avgRiskScore.toFixed(2)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Safe Messages
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-3xl font-bold text-primary">
              {stats.totalAnalyses - stats.threatsFound}
            </p>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => window.location.href = '/dashboard/view-all?filter=safe'}
              className="w-full"
            >
              View All
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Risk Level Distribution</CardTitle>
            <CardDescription>Breakdown by threat severity</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Analysis Summary</CardTitle>
            <CardDescription>Total vs Threats vs Safe</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
      </div>
    </div>
  );
}
