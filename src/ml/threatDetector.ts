/**
 * Browser-based Threat Detection using Hugging Face Transformers
 * 
 * This module implements threat detection using pre-trained models that run
 * entirely in the browser. No server-side processing required.
 * 
 * ETHICS & LEGAL NOTICE:
 * This is for educational and demonstration purposes only. All training data
 * is synthetic. Do not use for actual threat detection in production systems.
 */

import { pipeline } from '@huggingface/transformers';
import { processText, calculateRiskIndicators, type ExtractedEntities } from './textProcessor';

export interface ThreatPrediction {
  label: 'threat' | 'benign';
  confidence: number;
  riskScore: number; // 0-1 scale
  riskLevel: 'low' | 'medium' | 'high';
  entities: ExtractedEntities;
  explanation: string;
  features: string[];
  processingTime: number;
}

export interface ModelMetrics {
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  confusionMatrix: number[][];
}

class ThreatDetectionModel {
  private classifier: any = null;
  private isLoading = false;
  private isReady = false;
  private modelCache: Map<string, ThreatPrediction> = new Map();

  /**
   * Initialize the threat detection model
   * Uses a lightweight sentiment analysis model adapted for threat detection
   */
  async initialize(): Promise<void> {
    if (this.isReady || this.isLoading) return;

    this.isLoading = true;
    
    try {
      console.log('Loading threat detection model...');
      
      // Use a lightweight model for browser compatibility
      // In production, you might fine-tune this model on cybersecurity data
      this.classifier = await pipeline(
        'text-classification',
        'Xenova/distilbert-base-uncased-finetuned-sst-2-english',
        { 
          device: 'webgpu', // Try WebGPU first, fallback to CPU
          dtype: 'fp16' // Use half precision for better performance
        }
      );
      
      this.isReady = true;
      console.log('Threat detection model loaded successfully');
    } catch (error) {
      console.warn('WebGPU not available, falling back to CPU:', error);
      
      // Fallback to CPU
      try {
        this.classifier = await pipeline(
          'text-classification',
          'Xenova/distilbert-base-uncased-finetuned-sst-2-english'
        );
        this.isReady = true;
        console.log('Threat detection model loaded on CPU');
      } catch (cpuError) {
        console.error('Failed to load model:', cpuError);
        throw cpuError;
      }
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Predict threat level for a given text message
   */
  async predict(text: string): Promise<ThreatPrediction> {
    const startTime = performance.now();

    // Check cache first
    const cacheKey = text.toLowerCase().trim();
    if (this.modelCache.has(cacheKey)) {
      const cached = this.modelCache.get(cacheKey)!;
      return { ...cached, processingTime: performance.now() - startTime };
    }

    if (!this.isReady) {
      await this.initialize();
    }

    if (!this.classifier) {
      throw new Error('Model not initialized');
    }

    // Process the text
    const processed = processText(text);
    const riskIndicators = calculateRiskIndicators(text);

    try {
      // Get model prediction
      // Note: We adapt the sentiment model for threat detection
      // Negative sentiment often correlates with threatening content
      const modelOutput = await this.classifier(text);
      
      let baseConfidence = 0.5;
      let threatProbability = 0.5;

      if (Array.isArray(modelOutput) && modelOutput.length > 0) {
        const prediction = modelOutput[0];
        baseConfidence = prediction.score || 0.5;
        
        // Adapt sentiment to threat detection:
        // NEGATIVE sentiment -> higher threat probability
        // POSITIVE sentiment -> lower threat probability
        if (prediction.label === 'NEGATIVE') {
          threatProbability = baseConfidence;
        } else {
          threatProbability = 1 - baseConfidence;
        }
      }

      // Enhance prediction with rule-based indicators
      const enhancedPrediction = this.enhanceWithRules(text, threatProbability, riskIndicators);
      
      const result: ThreatPrediction = {
        label: enhancedPrediction.riskScore > 0.5 ? 'threat' : 'benign',
        confidence: enhancedPrediction.confidence,
        riskScore: enhancedPrediction.riskScore,
        riskLevel: this.calculateRiskLevel(enhancedPrediction.riskScore),
        entities: processed.entities,
        explanation: enhancedPrediction.explanation,
        features: processed.features.slice(0, 10), // Top features for explanation
        processingTime: performance.now() - startTime
      };

      // Cache the result
      this.modelCache.set(cacheKey, result);
      
      // Limit cache size
      if (this.modelCache.size > 100) {
        const firstKey = this.modelCache.keys().next().value;
        this.modelCache.delete(firstKey);
      }

      return result;
    } catch (error) {
      console.error('Prediction error:', error);
      
      // Fallback to rule-based prediction
      return this.fallbackPrediction(text, processed, riskIndicators, startTime);
    }
  }

  /**
   * Enhance ML prediction with cybersecurity-specific rules
   */
  private enhanceWithRules(
    text: string, 
    baseThreatProbability: number, 
    riskIndicators: { [key: string]: number }
  ): { riskScore: number; confidence: number; explanation: string } {
    
    let riskScore = baseThreatProbability;
    let confidence = Math.abs(baseThreatProbability - 0.5) * 2; // Convert to 0-1 confidence
    const explanationParts: string[] = [];

    // High-risk keyword boost
    if (riskIndicators.highRiskCount > 0) {
      const boost = Math.min(riskIndicators.highRiskCount * 0.2, 0.4);
      riskScore += boost;
      explanationParts.push(`High-risk keywords detected (+${(boost * 100).toFixed(0)}%)`);
    }

    // Tool mentions boost
    if (riskIndicators.toolCount > 0) {
      const boost = Math.min(riskIndicators.toolCount * 0.15, 0.3);
      riskScore += boost;
      explanationParts.push(`Cybersecurity tools mentioned (+${(boost * 100).toFixed(0)}%)`);
    }

    // Commercial activity boost (selling/buying)
    if (riskIndicators.commercialScore > 0) {
      riskScore += 0.25;
      explanationParts.push(`Commercial language detected (+25%)`);
    }

    // Urgency boost
    if (riskIndicators.urgencyScore > 0) {
      riskScore += 0.15;
      explanationParts.push(`Urgency indicators found (+15%)`);
    }

    // Pattern matching for specific threats
    const ddosPattern = /ddos|dos\s+attack|denial.of.service/i;
    const phishingPattern = /phishing|phish|credential.harvest|fake.login/i;
    const ransomwarePattern = /ransom|encrypt|crypto.lock|file.lock/i;

    if (ddosPattern.test(text)) {
      riskScore += 0.3;
      explanationParts.push('DDoS attack pattern detected (+30%)');
    }
    if (phishingPattern.test(text)) {
      riskScore += 0.3;
      explanationParts.push('Phishing pattern detected (+30%)');
    }
    if (ransomwarePattern.test(text)) {
      riskScore += 0.3;
      explanationParts.push('Ransomware pattern detected (+30%)');
    }

    // Normalize risk score
    riskScore = Math.min(Math.max(riskScore, 0), 1);
    
    // Update confidence based on rule certainty
    const ruleBoost = explanationParts.length * 0.1;
    confidence = Math.min(confidence + ruleBoost, 0.95);

    const explanation = explanationParts.length > 0 
      ? `Model prediction enhanced by rules: ${explanationParts.join(', ')}`
      : `Base model prediction (${(baseThreatProbability * 100).toFixed(1)}% threat probability)`;

    return { riskScore, confidence, explanation };
  }

  /**
   * Fallback rule-based prediction when ML model fails
   */
  private fallbackPrediction(
    text: string, 
    processed: any, 
    riskIndicators: { [key: string]: number },
    startTime: number
  ): ThreatPrediction {
    
    let riskScore = 0.1; // Base low risk
    const explanationParts = ['Using rule-based fallback'];

    // Rule-based threat detection
    const threatKeywords = [
      'ddos', 'attack', 'hack', 'ransomware', 'phishing', 'exploit',
      'malware', 'botnet', 'breach', 'leak', 'credentials', 'payload'
    ];

    const commercialKeywords = ['selling', 'buying', 'cheap', 'free', 'price'];
    const urgencyKeywords = ['urgent', 'now', 'today', 'asap', 'immediate'];

    // Check for threat keywords
    const foundThreats = threatKeywords.filter(keyword => 
      text.toLowerCase().includes(keyword)
    );

    if (foundThreats.length > 0) {
      riskScore += foundThreats.length * 0.2;
      explanationParts.push(`Threat keywords: ${foundThreats.join(', ')}`);
    }

    // Check for commercial language
    const foundCommercial = commercialKeywords.filter(keyword =>
      text.toLowerCase().includes(keyword)
    );

    if (foundCommercial.length > 0) {
      riskScore += 0.25;
      explanationParts.push('Commercial language detected');
    }

    // Check for urgency
    const hasUrgency = urgencyKeywords.some(keyword =>
      text.toLowerCase().includes(keyword)
    );

    if (hasUrgency) {
      riskScore += 0.15;
      explanationParts.push('Urgency indicators found');
    }

    riskScore = Math.min(riskScore, 1);

    return {
      label: riskScore > 0.5 ? 'threat' : 'benign',
      confidence: Math.min(foundThreats.length * 0.2 + 0.3, 0.8),
      riskScore,
      riskLevel: this.calculateRiskLevel(riskScore),
      entities: processed.entities,
      explanation: explanationParts.join('; '),
      features: processed.features.slice(0, 10),
      processingTime: performance.now() - startTime
    };
  }

  /**
   * Calculate risk level based on risk score
   */
  private calculateRiskLevel(riskScore: number): 'low' | 'medium' | 'high' {
    if (riskScore >= 0.7) return 'high';
    if (riskScore >= 0.4) return 'medium';
    return 'low';
  }

  /**
   * Batch predict multiple messages
   */
  async batchPredict(messages: string[]): Promise<ThreatPrediction[]> {
    const results: ThreatPrediction[] = [];
    
    for (const message of messages) {
      try {
        const prediction = await this.predict(message);
        results.push(prediction);
      } catch (error) {
        console.error(`Error predicting message: "${message}"`, error);
        // Add a safe default prediction
        results.push({
          label: 'benign',
          confidence: 0.1,
          riskScore: 0.1,
          riskLevel: 'low',
          entities: { targets: [], dates: [], tools: [], urls: [], ips: [] },
          explanation: 'Error in prediction - defaulting to benign',
          features: [],
          processingTime: 0
        });
      }
    }

    return results;
  }

  /**
   * Get model status
   */
  getStatus(): { isReady: boolean; isLoading: boolean } {
    return {
      isReady: this.isReady,
      isLoading: this.isLoading
    };
  }
}

// Export singleton instance
export const threatDetector = new ThreatDetectionModel();