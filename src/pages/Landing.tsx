import { Button } from "@/components/ui/button";
import { Shield, Lock, BarChart3, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-2xl font-bold text-foreground">Riskify</h1>
              <p className="text-xs text-muted-foreground">Final Year B.Tech Project</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button variant="ghost" onClick={() => navigate("/auth?mode=login")}>
              Login
            </Button>
            <Button onClick={() => navigate("/auth?mode=register")}>
              Get Started
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-3xl mx-auto space-y-6">
          <h2 className="text-5xl md:text-6xl font-bold text-foreground">
            AI-Powered Threat Detection
          </h2>
          <p className="text-xl text-muted-foreground">
            Real-time analysis and threat detection powered by advanced machine learning
          </p>
          <div className="flex gap-4 justify-center pt-4">
            <Button size="lg" onClick={() => navigate("/auth?mode=register")}>
              Start Free Trial
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate("/auth?mode=login")}>
              Sign In
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-4 gap-6">
          <div className="p-6 rounded-lg border border-border bg-card text-center space-y-3">
            <Shield className="h-12 w-12 text-primary mx-auto" />
            <h3 className="font-semibold text-lg">Advanced Detection</h3>
            <p className="text-sm text-muted-foreground">ML-powered threat analysis with high accuracy</p>
          </div>
          <div className="p-6 rounded-lg border border-border bg-card text-center space-y-3">
            <Zap className="h-12 w-12 text-primary mx-auto" />
            <h3 className="font-semibold text-lg">Real-time Analysis</h3>
            <p className="text-sm text-muted-foreground">Instant threat assessment and alerts</p>
          </div>
          <div className="p-6 rounded-lg border border-border bg-card text-center space-y-3">
            <BarChart3 className="h-12 w-12 text-primary mx-auto" />
            <h3 className="font-semibold text-lg">Detailed Insights</h3>
            <p className="text-sm text-muted-foreground">Comprehensive analytics and reporting</p>
          </div>
          <div className="p-6 rounded-lg border border-border bg-card text-center space-y-3">
            <Lock className="h-12 w-12 text-primary mx-auto" />
            <h3 className="font-semibold text-lg">Enterprise Security</h3>
            <p className="text-sm text-muted-foreground">Bank-grade encryption and compliance</p>
          </div>
        </div>
      </section>

      {/* Coming Soon */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto text-center space-y-4 p-8 rounded-lg border-2 border-primary/20 bg-primary/5">
          <h3 className="text-2xl font-bold text-foreground">Coming in Version 3.0</h3>
          <p className="text-lg text-muted-foreground">
            Seamless Integration with Office Messaging Platforms
          </p>
          <p className="text-sm text-muted-foreground">
            Direct threat detection in Slack, Teams, and more
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border mt-20">
        <div className="container mx-auto px-4 py-8 text-center text-muted-foreground">
          <p>© 2025 Riskify V2.0 - Final Year B.Tech Project</p>
        </div>
      </footer>
    </div>
  );
}
