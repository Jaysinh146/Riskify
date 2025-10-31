import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { ArrowLeft, AlertTriangle, CheckCircle, Search } from "lucide-react";
import { User } from "@supabase/supabase-js";

interface Analysis {
  id: string;
  input_text: string;
  prediction_label: string;
  risk_level: string;
  risk_score: number;
  confidence: number;
  created_at: string;
  explanation: string;
}

export default function ViewAll() {
  const [user, setUser] = useState<User | null>(null);
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [filteredAnalyses, setFilteredAnalyses] = useState<Analysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState("date");
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const filter = searchParams.get("filter") || "all";
  const urlSearch = searchParams.get("search") || "";

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/auth?mode=login");
      } else {
        setUser(session.user);
        fetchAnalyses(session.user.id);
      }
    });
  }, [navigate]);

  useEffect(() => {
    if (urlSearch) {
      setSearchQuery(urlSearch);
    }
  }, [urlSearch]);

  const fetchAnalyses = async (userId: string) => {
    setLoading(true);
    let query = supabase
      .from("analysis_history")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching analyses:", error);
      setLoading(false);
      return;
    }

    setAnalyses(data || []);
    applyFilters(data || []);
    setLoading(false);
  };

  const applyFilters = (data: Analysis[]) => {
    let filtered = [...data];

    // Apply type filter (case-insensitive)
    if (filter === "threat") {
      filtered = filtered.filter((a) => (a.prediction_label || '').toString().toLowerCase() === 'threat');
    } else if (filter === "safe") {
      filtered = filtered.filter((a) => (a.prediction_label || '').toString().toLowerCase() !== 'threat');
    }

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter((a) =>
        a.input_text.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply sorting
    if (sortBy === "date") {
      filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    } else if (sortBy === "risk") {
      filtered.sort((a, b) => b.risk_score - a.risk_score);
    } else if (sortBy === "confidence") {
      filtered.sort((a, b) => b.confidence - a.confidence);
    }

    setFilteredAnalyses(filtered);
  };

  useEffect(() => {
    applyFilters(analyses);
  }, [filter, searchQuery, sortBy, analyses]);

  const getRiskColor = (level: string) => {
    switch (level) {
      case "high":
        return "text-destructive";
      case "medium":
        return "text-yellow-500";
      default:
        return "text-primary";
    }
  };

  const getFilterTitle = () => {
    switch (filter) {
      case "threat":
        return "All Threats";
      case "safe":
        return "All Safe Messages";
      default:
        return "All Analyses";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <Button variant="ghost" onClick={() => navigate("/dashboard")} className="mb-2">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <h1 className="text-3xl font-bold text-foreground">{getFilterTitle()}</h1>
          <p className="text-muted-foreground">
            Showing {filteredAnalyses.length} of {analyses.length} analyses
          </p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Filters and Search */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search messages..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date">Date (Newest)</SelectItem>
              <SelectItem value="risk">Risk Score</SelectItem>
              <SelectItem value="confidence">Confidence</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Analysis Cards */}
        {filteredAnalyses.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">No analyses found</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredAnalyses.map((analysis) => (
              <Card key={analysis.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      {analysis.prediction_label === "Threat" ? (
                        <AlertTriangle className="h-5 w-5 text-destructive" />
                      ) : (
                        <CheckCircle className="h-5 w-5 text-primary" />
                      )}
                      <CardTitle className="text-base">
                        {analysis.prediction_label}
                      </CardTitle>
                    </div>
                    <Badge
                      variant={
                        analysis.risk_level === "high"
                          ? "destructive"
                          : analysis.risk_level === "medium"
                          ? "secondary"
                          : "default"
                      }
                    >
                      {analysis.risk_level}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {analysis.input_text}
                  </p>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Risk Score:</span>
                      <span className={`font-semibold ${getRiskColor(analysis.risk_level)}`}>
                        {(analysis.risk_score * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Confidence:</span>
                      <span className="font-semibold">
                        {(analysis.confidence * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Date:</span>
                      <span>
                        {new Date(analysis.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  {analysis.explanation && (
                    <p className="text-xs text-muted-foreground pt-2 border-t line-clamp-2">
                      {analysis.explanation}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t bg-muted/30 mt-12">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              Developed by <span className="font-semibold">SE 33</span> - Jaysinh, Sujal, Sannidhya, and Harsh
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
