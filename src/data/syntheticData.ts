/**
 * Synthetic Dataset Generator for Threat Detection
 * 
 * This module generates synthetic cybersecurity messages for training and testing
 * the threat detection model. All data is completely synthetic and for educational purposes only.
 * 
 * ETHICS & LEGAL NOTICE:
 * All training data is synthetic or publicly released. Do not attempt to access private forums.
 * This is a student demo only for educational purposes.
 */

export interface ThreatMessage {
  id: string;
  text: string;
  label: 'threat' | 'benign';
  type: 'ransomware' | 'phishing' | 'ddos' | 'credential_theft' | 'other' | '';
  timestamp: string;
}

// Template patterns for generating synthetic threat messages
const threatPatterns = {
  ransomware: [
    "Testing new ransomware builder, needs tester",
    "Have you tried the new crypto locker? Very effective",
    "Looking for partners to deploy file encryption malware",
    "New ransomware variant bypasses most AV solutions",
    "Selling ransomware-as-a-service platform, 70/30 split",
    "Anyone know good payment methods for ransom demands?",
    "Latest version of file locker is ready for distribution",
    "Ransomware kit with automatic payment portal included",
    "Testing encryption speeds on different file types",
    "Who wants to beta test my new file encryption tool?"
  ],
  phishing: [
    "Selling a new phishing kit that spoofs bank login pages",
    "Updated email templates that bypass spam filters perfectly",
    "New phishing framework with real-time credential harvesting",
    "Anyone interested in premium phishing hosting services?",
    "Fresh batch of convincing bank phishing pages available",
    "Selling email lists + matching phishing templates",
    "New SMS phishing campaign targeting mobile banking",
    "Spear phishing toolkit for corporate email accounts",
    "High-conversion phishing pages for popular crypto exchanges",
    "Advanced phishing kit with 2FA bypass capabilities"
  ],
  ddos: [
    "Plan DDoS on examplebank.com this Friday at 3 AM UTC",
    "Looking to rent botnet for stress testing competitor sites",
    "New amplification method increases DDoS power by 500%",
    "Anyone want to join coordinated attack on government portal?",
    "Selling access to 50k compromised IoT devices for DDoS",
    "Planning massive DDoS during Black Friday shopping",
    "New reflection attack method works great against CDNs",
    "Who has experience with volumetric attacks on infrastructure?",
    "Coordinating multi-vector DDoS attack next week",
    "Selling DDoS-for-hire service, competitive pricing"
  ],
  credential_theft: [
    "Who wants to buy credentials for mail.example.org? cheap",
    "Fresh database dump with 100k user passwords available",
    "Selling corporate VPN access credentials, active accounts",
    "New keylogger bypasses modern endpoint protection",
    "Harvested admin credentials from recent breach, interested?",
    "Selling access to compromised cloud admin accounts",
    "Fresh batch of stolen social media account credentials",
    "Banking credentials from recent phishing campaign for sale",
    "Corporate email credentials with 2FA tokens included",
    "Selling access to compromised government employee accounts"
  ],
  other: [
    "New exploit for popular CMS system, zero-day confirmed",
    "Selling access to compromised web servers, root level",
    "Anyone know good methods for crypto wallet extraction?",
    "New social engineering toolkit with voice cloning",
    "Selling compromised mobile devices with banking apps",
    "Looking for partners to monetize stolen identity data",
    "New method for bypassing hardware security modules",
    "Selling access to compromised payment processing systems",
    "Anyone interested in ATM skimming hardware?",
    "New technique for SIM swapping works 90% of the time"
  ]
};

const benignPatterns = [
  "Reminder: team meeting tomorrow, bring slides",
  "Nice writeup on SSL config — helpful for devs",
  "Great conference talk on network security best practices",
  "Anyone recommend good cybersecurity training courses?",
  "Thanks for sharing that vulnerability disclosure process",
  "Interesting article about zero-trust architecture implementation",
  "Team lunch next Friday at the usual spot",
  "New security policy update requires multi-factor authentication",
  "Scheduled maintenance window this weekend for security updates",
  "Great presentation on incident response procedures",
  "Code review meeting moved to Wednesday 2 PM",
  "Security awareness training is mandatory for all employees",
  "New firewall rules will be implemented next week",
  "Thanks for the help with the penetration testing report",
  "Reminder to update your passwords before the deadline",
  "Security audit completed successfully, no major issues found",
  "New VPN certificates will be distributed tomorrow",
  "Quarterly security metrics show improvement across all teams",
  "Emergency contact information has been updated",
  "Budget approved for new security monitoring tools",
  "Training session on secure coding practices next month",
  "New employee security orientation scheduled for Friday",
  "Backup systems tested successfully over the weekend",
  "Thanks for reporting that suspicious email quickly",
  "Security incident response drill scheduled for next quarter",
  "Updated endpoint protection software rolled out to all devices",
  "Compliance audit results will be shared in next meeting",
  "New security cameras installed in the server room",
  "Password manager deployment completed across organization",
  "Network segmentation project milestone achieved"
];

// Common cybersecurity terms and entities for NER extraction
export const targetEntities = [
  'examplebank.com', 'mail.example.org', 'testcorp.net', 'democorp.com',
  'samplesite.org', 'testbank.net', 'example-gov.org', 'demo-retail.com',
  'sample-health.org', 'test-university.edu'
];

export const toolEntities = [
  'ransomware builder', 'phishing kit', 'botnet', 'keylogger', 'crypto locker',
  'email templates', 'DDoS tool', 'exploit kit', 'credential harvester',
  'network scanner', 'vulnerability scanner', 'social engineering toolkit'
];

/**
 * Generates synthetic cybersecurity messages for training
 * @param count Total number of messages to generate
 * @param threatRatio Ratio of threat to benign messages (0-1)
 * @returns Array of synthetic threat messages
 */
export function generateSyntheticDataset(count: number = 200, threatRatio: number = 0.4): ThreatMessage[] {
  const dataset: ThreatMessage[] = [];
  const threatCount = Math.floor(count * threatRatio);
  const benignCount = count - threatCount;

  // Generate threat messages
  const threatTypes = Object.keys(threatPatterns) as Array<keyof typeof threatPatterns>;
  const messagesPerType = Math.floor(threatCount / threatTypes.length);

  threatTypes.forEach((type, typeIndex) => {
    const patterns = threatPatterns[type];
    const typeCount = typeIndex === threatTypes.length - 1 
      ? threatCount - (messagesPerType * (threatTypes.length - 1)) 
      : messagesPerType;

    for (let i = 0; i < typeCount; i++) {
      const patternIndex = i % patterns.length;
      let text = patterns[patternIndex];

      // Add some variation to make messages more realistic
      text = addVariation(text);

      dataset.push({
        id: `threat_${type}_${i + 1}`,
        text,
        label: 'threat',
        type: type as any,
        timestamp: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
      });
    }
  });

  // Generate benign messages
  for (let i = 0; i < benignCount; i++) {
    const patternIndex = i % benignPatterns.length;
    let text = benignPatterns[patternIndex];
    
    // Add some variation
    text = addVariation(text);

    dataset.push({
      id: `benign_${i + 1}`,
      text,
      label: 'benign',
      type: '',
      timestamp: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
    });
  }

  // Shuffle the dataset
  return dataset.sort(() => Math.random() - 0.5);
}

/**
 * Adds realistic variations to message text
 */
function addVariation(text: string): string {
  const variations = [
    // Add urgency markers
    (t: string) => Math.random() < 0.3 ? `URGENT: ${t}` : t,
    (t: string) => Math.random() < 0.3 ? `${t} - time sensitive` : t,
    
    // Add casual language
    (t: string) => Math.random() < 0.2 ? t.replace(/\./g, '...') : t,
    (t: string) => Math.random() < 0.2 ? `${t} anyone?` : t,
    
    // Add contact info
    (t: string) => Math.random() < 0.1 ? `${t} DM for details` : t,
    (t: string) => Math.random() < 0.1 ? `${t} - contact me privately` : t,
  ];

  return variations.reduce((acc, variation) => variation(acc), text);
}

/**
 * Exports dataset as CSV format
 */
export function exportToCSV(dataset: ThreatMessage[]): string {
  const headers = ['id', 'text', 'label', 'type', 'timestamp'];
  const rows = dataset.map(msg => [
    msg.id,
    `"${msg.text.replace(/"/g, '""')}"`, // Escape quotes for CSV
    msg.label,
    msg.type,
    msg.timestamp
  ]);

  return [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
}

// Generate the default dataset
export const defaultDataset = generateSyntheticDataset(200, 0.4);

// Sample messages for immediate testing (as specified in requirements)
export const sampleMessages: ThreatMessage[] = [
  {
    id: "1",
    text: "Plan DDoS on examplebank.com this Friday at 3 AM UTC",
    label: "threat",
    type: "ddos",
    timestamp: new Date().toISOString()
  },
  {
    id: "2", 
    text: "Selling a new phishing kit that spoofs bank login pages",
    label: "threat",
    type: "phishing",
    timestamp: new Date().toISOString()
  },
  {
    id: "3",
    text: "Who wants to buy credentials for mail.example.org? cheap",
    label: "threat", 
    type: "credential_theft",
    timestamp: new Date().toISOString()
  },
  {
    id: "4",
    text: "Reminder: team meeting tomorrow, bring slides",
    label: "benign",
    type: "",
    timestamp: new Date().toISOString()
  },
  {
    id: "5",
    text: "Trying new ransomware builder, needs tester",
    label: "threat",
    type: "ransomware", 
    timestamp: new Date().toISOString()
  },
  {
    id: "6",
    text: "Nice writeup on SSL config — helpful for devs",
    label: "benign",
    type: "",
    timestamp: new Date().toISOString()
  }
];