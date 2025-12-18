import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Brain, 
  Cpu, 
  FileText, 
  Zap, 
  Network, 
  Target, 
  Layers, 
  ArrowRight,
  X,
  Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface TechniqueNode {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
  details: string[];
  color: string;
}

const techniques: TechniqueNode[] = [
  {
    id: "input",
    name: "Text Input",
    icon: <FileText className="h-6 w-6" />,
    description: "Raw message text enters the pipeline",
    details: ["Text normalization", "Unicode handling", "Length validation"],
    color: "from-blue-500 to-blue-600"
  },
  {
    id: "preprocessing",
    name: "Text Preprocessing",
    icon: <Layers className="h-6 w-6" />,
    description: "Clean and normalize input text",
    details: ["Lowercasing", "Whitespace normalization", "Special character removal", "N-gram extraction"],
    color: "from-purple-500 to-purple-600"
  },
  {
    id: "ner",
    name: "Named Entity Recognition",
    icon: <Target className="h-6 w-6" />,
    description: "Extract entities like URLs, IPs, dates",
    details: ["URL detection", "IP address extraction", "Date/time parsing", "Tool identification"],
    color: "from-green-500 to-green-600"
  },
  {
    id: "features",
    name: "Feature Extraction",
    icon: <Network className="h-6 w-6" />,
    description: "Generate ML-ready features",
    details: ["Unigram features", "Bigram features", "Risk indicators", "Keyword matching"],
    color: "from-orange-500 to-orange-600"
  },
  {
    id: "transformer",
    name: "Transformer Model",
    icon: <Brain className="h-6 w-6" />,
    description: "HuggingFace text classification",
    details: ["BERT-based architecture", "Attention mechanism", "Context understanding", "WebGPU acceleration"],
    color: "from-pink-500 to-pink-600"
  },
  {
    id: "analysis",
    name: "Threat Analysis",
    icon: <Cpu className="h-6 w-6" />,
    description: "Rule-enhanced prediction",
    details: ["Risk score calculation", "Confidence scoring", "Rule-based enhancement", "Pattern matching"],
    color: "from-red-500 to-red-600"
  },
  {
    id: "output",
    name: "Result",
    icon: <Zap className="h-6 w-6" />,
    description: "Final threat classification",
    details: ["Risk level (Low/Medium/High)", "Detailed explanation", "Entity report", "Actionable insights"],
    color: "from-emerald-500 to-emerald-600"
  }
];

export default function NLPVisualization() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedTechnique, setSelectedTechnique] = useState<TechniqueNode | null>(null);
  const [animatingIndex, setAnimatingIndex] = useState<number>(-1);

  const runAnimation = () => {
    let index = 0;
    const interval = setInterval(() => {
      setAnimatingIndex(index);
      index++;
      if (index >= techniques.length) {
        clearInterval(interval);
        setTimeout(() => setAnimatingIndex(-1), 1000);
      }
    }, 400);
  };

  return (
    <>
      {/* Trigger Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-8 text-center"
      >
        <Button
          onClick={() => {
            setIsOpen(true);
            setTimeout(runAnimation, 500);
          }}
          variant="outline"
          className="group relative overflow-hidden border-primary/30 hover:border-primary/60 px-6 py-3 h-auto"
        >
          <span className="relative z-10 flex items-center gap-2 text-sm font-medium">
            <Sparkles className="h-4 w-4 text-primary" />
            View NLP & ML Techniques Used in Riskify
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </span>
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-primary/10 to-primary/5"
            initial={{ x: "-100%" }}
            whileHover={{ x: 0 }}
            transition={{ duration: 0.3 }}
          />
        </Button>
      </motion.div>

      {/* Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="bg-card border border-border rounded-2xl shadow-2xl max-w-4xl w-full max-h-[85vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="p-6 border-b border-border flex items-center justify-between bg-gradient-to-r from-primary/10 via-transparent to-primary/5">
                <div>
                  <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
                    <Brain className="h-6 w-6 text-primary" />
                    NLP & ML Pipeline
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Interactive visualization of Riskify's threat detection system
                  </p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
                  <X className="h-5 w-5" />
                </Button>
              </div>

              {/* Content */}
              <div className="p-6 overflow-y-auto max-h-[calc(85vh-120px)]">
                {/* Pipeline Visualization */}
                <div className="flex flex-wrap justify-center gap-4 mb-8">
                  {techniques.map((tech, index) => (
                    <motion.div
                      key={tech.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ 
                        opacity: 1, 
                        y: 0,
                        scale: animatingIndex === index ? 1.1 : 1,
                      }}
                      transition={{ 
                        delay: index * 0.1,
                        scale: { duration: 0.2 }
                      }}
                      className="relative"
                    >
                      <motion.button
                        onClick={() => setSelectedTechnique(tech)}
                        className={`relative p-4 rounded-xl border-2 transition-all duration-300 ${
                          selectedTechnique?.id === tech.id 
                            ? "border-primary bg-primary/10" 
                            : "border-border hover:border-primary/50 bg-card"
                        } ${animatingIndex === index ? "ring-2 ring-primary ring-offset-2 ring-offset-background" : ""}`}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <div className={`p-3 rounded-lg bg-gradient-to-br ${tech.color} text-white mb-2`}>
                          {tech.icon}
                        </div>
                        <p className="text-xs font-medium text-foreground text-center max-w-[80px]">
                          {tech.name}
                        </p>
                        
                        {/* Pulse effect when animating */}
                        {animatingIndex === index && (
                          <motion.div
                            className="absolute inset-0 rounded-xl border-2 border-primary"
                            initial={{ opacity: 1, scale: 1 }}
                            animate={{ opacity: 0, scale: 1.3 }}
                            transition={{ duration: 0.6 }}
                          />
                        )}
                      </motion.button>

                      {/* Arrow connector */}
                      {index < techniques.length - 1 && (
                        <motion.div 
                          className="hidden md:flex absolute -right-4 top-1/2 -translate-y-1/2 text-muted-foreground"
                          animate={{ 
                            color: animatingIndex > index ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))"
                          }}
                        >
                          <ArrowRight className="h-4 w-4" />
                        </motion.div>
                      )}
                    </motion.div>
                  ))}
                </div>

                {/* Run Animation Button */}
                <div className="flex justify-center mb-6">
                  <Button
                    variant="outline"
                    onClick={runAnimation}
                    className="gap-2"
                  >
                    <Zap className="h-4 w-4" />
                    Simulate Data Flow
                  </Button>
                </div>

                {/* Selected Technique Details */}
                <AnimatePresence mode="wait">
                  {selectedTechnique && (
                    <motion.div
                      key={selectedTechnique.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="bg-muted/50 rounded-xl p-6 border border-border"
                    >
                      <div className="flex items-start gap-4">
                        <div className={`p-4 rounded-xl bg-gradient-to-br ${selectedTechnique.color} text-white`}>
                          {selectedTechnique.icon}
                        </div>
                        <div className="flex-1">
                          <h4 className="text-lg font-semibold text-foreground mb-1">
                            {selectedTechnique.name}
                          </h4>
                          <p className="text-muted-foreground mb-4">
                            {selectedTechnique.description}
                          </p>
                          <div className="grid grid-cols-2 gap-2">
                            {selectedTechnique.details.map((detail, i) => (
                              <motion.div
                                key={detail}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className="flex items-center gap-2 text-sm"
                              >
                                <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                                <span className="text-foreground">{detail}</span>
                              </motion.div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {!selectedTechnique && (
                  <motion.p 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center text-muted-foreground"
                  >
                    Click on any node above to learn more about that stage
                  </motion.p>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
