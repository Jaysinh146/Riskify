/**
 * Text Processing and Feature Extraction for Threat Detection
 * 
 * This module handles cleaning, preprocessing, and feature extraction from text messages.
 * It includes regex-based entity extraction and text normalization.
 */

export interface ProcessedText {
  cleaned: string;
  features: string[];
  entities: ExtractedEntities;
}

export interface ExtractedEntities {
  targets: string[];
  dates: string[];
  tools: string[];
  urls: string[];
  ips: string[];
}

/**
 * Comprehensive text cleaning and preprocessing
 */
export function cleanText(text: string): string {
  if (!text) return '';

  let cleaned = text.toLowerCase();
  
  // Remove excessive whitespace
  cleaned = cleaned.replace(/\s+/g, ' ');
  
  // Remove special characters but keep important punctuation
  cleaned = cleaned.replace(/[^\\w\\s\\.\\!\\?\\@\\-\\_]/g, ' ');
  
  // Remove extra spaces
  cleaned = cleaned.trim();
  
  return cleaned;
}

/**
 * Extract features from text for traditional ML models
 */
export function extractFeatures(text: string): string[] {
  const cleaned = cleanText(text);
  const words = cleaned.split(/\s+/).filter(word => word.length > 2);
  
  // Create n-grams and features
  const features: string[] = [];
  
  // Unigrams (individual words)
  features.push(...words);
  
  // Bigrams (pairs of words)
  for (let i = 0; i < words.length - 1; i++) {
    features.push(`${words[i]}_${words[i + 1]}`);
  }
  
  // Special threat-related features
  const threatKeywords = [
    'ddos', 'attack', 'hack', 'breach', 'exploit', 'malware', 'virus',
    'ransomware', 'phishing', 'credentials', 'password', 'leak',
    'selling', 'buying', 'urgent', 'cheap', 'free', 'download',
    'builder', 'kit', 'tool', 'botnet', 'payload', 'exploit'
  ];
  
  threatKeywords.forEach(keyword => {
    if (cleaned.includes(keyword)) {
      features.push(`THREAT_${keyword.toUpperCase()}`);
    }
  });
  
  return features;
}

/**
 * Named Entity Recognition using regex patterns
 * Extracts targets, dates, tools, URLs, and IP addresses
 */
export function extractEntities(text: string): ExtractedEntities {
  const entities: ExtractedEntities = {
    targets: [],
    dates: [],
    tools: [],
    urls: [],
    ips: []
  };

  // Extract URLs and domains
  const urlRegex = /(?:https?:\/\/)?(?:www\.)?([a-zA-Z0-9-]+\.[a-zA-Z]{2,}(?:\.[a-zA-Z]{2,})?)/gi;
  const urls = text.match(urlRegex) || [];
  entities.urls = [...new Set(urls)];
  entities.targets = [...new Set(urls)]; // Targets are typically URLs/domains

  // Extract IP addresses
  const ipRegex = /\b(?:[0-9]{1,3}\.){3}[0-9]{1,3}\b/g;
  const ips = text.match(ipRegex) || [];
  entities.ips = [...new Set(ips)];

  // Extract dates and times
  const dateRegex = /\b(?:monday|tuesday|wednesday|thursday|friday|saturday|sunday|today|tomorrow|yesterday|\d{1,2}\/\d{1,2}\/\d{2,4}|\d{1,2}-\d{1,2}-\d{2,4}|\d{1,2}:\d{2}(?:\s*(?:am|pm|utc|gmt))?)\b/gi;
  const dates = text.match(dateRegex) || [];
  entities.dates = [...new Set(dates)];

  // Extract cybersecurity tools and techniques
  const toolPatterns = [
    /ransomware\s+(?:builder|kit|tool)/gi,
    /phishing\s+(?:kit|tool|framework)/gi,
    /(?:ddos|dos)\s+(?:tool|bot|botnet)/gi,
    /(?:exploit|vulnerability)\s+(?:kit|scanner)/gi,
    /keylogger/gi,
    /botnet/gi,
    /crypto\s+locker/gi,
    /email\s+(?:templates|harvester)/gi,
    /credential\s+(?:harvester|stealer)/gi,
    /network\s+scanner/gi,
    /social\s+engineering\s+toolkit/gi
  ];

  toolPatterns.forEach(pattern => {
    const matches = text.match(pattern) || [];
    entities.tools.push(...matches);
  });

  // Remove duplicates and clean up
  entities.tools = [...new Set(entities.tools.map(tool => tool.toLowerCase()))];

  return entities;
}

/**
 * Calculate text-based risk indicators
 */
export function calculateRiskIndicators(text: string): { [key: string]: number } {
  const cleaned = cleanText(text);
  const indicators: { [key: string]: number } = {};

  // High-risk keywords
  const highRiskKeywords = ['ddos', 'attack', 'hack', 'ransomware', 'selling', 'buying', 'exploit'];
  const mediumRiskKeywords = ['urgent', 'cheap', 'free', 'test', 'new', 'kit'];
  const toolKeywords = ['builder', 'tool', 'bot', 'payload', 'framework'];

  indicators.highRiskCount = highRiskKeywords.reduce((count, keyword) => {
    return count + (cleaned.split(keyword).length - 1);
  }, 0);

  indicators.mediumRiskCount = mediumRiskKeywords.reduce((count, keyword) => {
    return count + (cleaned.split(keyword).length - 1);
  }, 0);

  indicators.toolCount = toolKeywords.reduce((count, keyword) => {
    return count + (cleaned.split(keyword).length - 1);
  }, 0);

  // Urgency indicators
  indicators.urgencyScore = /urgent|asap|immediate|now|today|tonight|tomorrow/i.test(text) ? 1 : 0;
  
  // Commercial activity indicators
  indicators.commercialScore = /sell|buy|price|cheap|free|cost|payment|money/i.test(text) ? 1 : 0;

  return indicators;
}

/**
 * Process text comprehensively
 */
export function processText(text: string): ProcessedText {
  return {
    cleaned: cleanText(text),
    features: extractFeatures(text),
    entities: extractEntities(text)
  };
}
