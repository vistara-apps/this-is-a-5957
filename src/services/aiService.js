import OpenAI from 'openai';

// Initialize OpenAI client with OpenRouter
const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY || 'demo-key',
  baseURL: "https://openrouter.ai/api/v1",
  dangerouslyAllowBrowser: true,
});

// Mock responses for demo when API key is not available
const mockResponses = {
  headache: {
    diagnosis: "Based on your symptoms, you might be experiencing a tension headache or migraine. Common causes include stress, dehydration, eye strain, or changes in sleep patterns. If headaches persist or worsen, consider consulting a healthcare provider.",
    confidence: 0.75,
    recommendations: [
      { type: 'Lifestyle', text: 'Ensure adequate hydration by drinking 8-10 glasses of water daily' },
      { type: 'Diet', text: 'Avoid common trigger foods like aged cheese, chocolate, and caffeine' },
      { type: 'Exercise', text: 'Practice gentle neck stretches and relaxation techniques' }
    ]
  },
  fever: {
    diagnosis: "A fever typically indicates your body is fighting an infection. It could be viral (like a cold or flu) or bacterial. Monitor your temperature and watch for additional symptoms. Seek medical attention if fever exceeds 103°F (39.4°C) or persists for more than 3 days.",
    confidence: 0.8,
    recommendations: [
      { type: 'Lifestyle', text: 'Get plenty of rest and sleep to help your body recover' },
      { type: 'Diet', text: 'Stay hydrated with water, herbal teas, and clear broths' },
      { type: 'Lifestyle', text: 'Use cool compresses or take lukewarm baths to reduce body temperature' }
    ]
  },
  cough: {
    diagnosis: "Your cough could be due to various causes including viral infections, allergies, acid reflux, or environmental irritants. Dry coughs often indicate upper respiratory irritation, while productive coughs may suggest lower respiratory involvement.",
    confidence: 0.7,
    recommendations: [
      { type: 'Lifestyle', text: 'Use a humidifier to add moisture to the air' },
      { type: 'Diet', text: 'Drink warm liquids like herbal tea with honey to soothe throat irritation' },
      { type: 'Lifestyle', text: 'Avoid smoking and exposure to air pollutants' }
    ]
  }
};

export const analyzeSymptoms = async (symptoms) => {
  try {
    // Check if we have a valid API key
    if (!import.meta.env.VITE_OPENAI_API_KEY || import.meta.env.VITE_OPENAI_API_KEY === 'demo-key') {
      // Use mock response for demo
      const symptomLower = symptoms.toLowerCase();
      if (symptomLower.includes('headache') || symptomLower.includes('head')) {
        return mockResponses.headache;
      } else if (symptomLower.includes('fever') || symptomLower.includes('temperature')) {
        return mockResponses.fever;
      } else if (symptomLower.includes('cough')) {
        return mockResponses.cough;
      } else {
        return {
          diagnosis: `Thank you for describing your symptoms: "${symptoms}". This appears to be a health concern that would benefit from professional medical evaluation. While I can provide general information, I recommend consulting with a healthcare provider for proper diagnosis and treatment recommendations.`,
          confidence: 0.6,
          recommendations: [
            { type: 'Lifestyle', text: 'Monitor your symptoms and note any changes or patterns' },
            { type: 'Lifestyle', text: 'Maintain good hygiene and adequate rest' },
            { type: 'Diet', text: 'Stay hydrated and maintain a balanced diet to support your immune system' }
          ]
        };
      }
    }

    const response = await openai.chat.completions.create({
      model: "google/gemini-2.0-flash-001",
      messages: [
        {
          role: "system",
          content: `You are a helpful AI health assistant that provides initial symptom analysis. 
          
          IMPORTANT DISCLAIMERS:
          - Always remind users this is for informational purposes only
          - Emphasize that this is not a substitute for professional medical advice
          - Recommend consulting healthcare providers for proper diagnosis
          - Never provide specific medication recommendations
          
          For each symptom analysis, provide:
          1. A thoughtful analysis of potential causes
          2. A confidence score between 0-1
          3. General lifestyle and wellness recommendations
          
          Keep responses informative but accessible, and always emphasize the importance of professional medical care when appropriate.`
        },
        {
          role: "user",
          content: `Please analyze these symptoms and provide insights: ${symptoms}`
        }
      ],
      temperature: 0.7,
      max_tokens: 500
    });

    const aiResponse = response.choices[0].message.content;
    
    // Extract confidence score (simplified - in production, you'd train the AI to provide this)
    let confidence = 0.7; // Default confidence
    if (symptoms.length > 50) confidence += 0.1; // More detailed symptoms = higher confidence
    if (symptoms.toLowerCase().includes('pain')) confidence += 0.05;
    confidence = Math.min(confidence, 0.95); // Cap at 95%

    // Generate basic recommendations
    const recommendations = [
      { type: 'Lifestyle', text: 'Monitor your symptoms and seek medical attention if they worsen or persist' },
      { type: 'Diet', text: 'Maintain adequate hydration and a balanced diet' },
      { type: 'Lifestyle', text: 'Ensure adequate rest and avoid overexertion' }
    ];

    return {
      diagnosis: aiResponse,
      confidence,
      recommendations
    };

  } catch (error) {
    console.error('Error calling OpenAI API:', error);
    
    // Fallback to mock response on error
    return {
      diagnosis: "I'm having trouble analyzing your symptoms right now. This could be due to a temporary service issue. Please try again in a moment, or consider consulting with a healthcare provider for immediate concerns.",
      confidence: 0.5,
      recommendations: [
        { type: 'Lifestyle', text: 'If symptoms are severe or concerning, seek immediate medical attention' },
        { type: 'Lifestyle', text: 'Monitor your symptoms and note any changes' }
      ]
    };
  }
};

export const generateHealthRecommendations = async (symptomEntries) => {
  try {
    if (!import.meta.env.VITE_OPENAI_API_KEY || import.meta.env.VITE_OPENAI_API_KEY === 'demo-key') {
      // Mock recommendations for demo
      return [
        { type: 'Diet', text: 'Consider incorporating more anti-inflammatory foods like leafy greens, berries, and fatty fish into your diet' },
        { type: 'Exercise', text: 'Gentle yoga or stretching exercises may help reduce tension and improve overall well-being' },
        { type: 'Lifestyle', text: 'Establish a consistent sleep schedule of 7-9 hours per night to support your immune system' },
        { type: 'Lifestyle', text: 'Practice stress management techniques such as deep breathing or meditation' }
      ];
    }

    const symptomSummary = symptomEntries
      .slice(0, 10)
      .map(entry => `${entry.symptoms} (${new Date(entry.timestamp).toLocaleDateString()})`)
      .join('; ');

    const response = await openai.chat.completions.create({
      model: "google/gemini-2.0-flash-001",
      messages: [
        {
          role: "system",
          content: `You are a health and wellness advisor. Based on a user's symptom history, provide personalized lifestyle, dietary, and wellness recommendations.
          
          IMPORTANT:
          - Focus on general wellness and prevention
          - Do not provide specific medical advice or diagnose conditions
          - Recommend consulting healthcare providers for medical concerns
          - Suggest evidence-based lifestyle improvements
          
          Provide 3-5 recommendations in these categories: Diet, Exercise, Lifestyle.
          Format each as: "type|recommendation text"`
        },
        {
          role: "user",
          content: `Based on this symptom history, provide personalized health recommendations: ${symptomSummary}`
        }
      ],
      temperature: 0.7,
      max_tokens: 400
    });

    const recommendations = response.choices[0].message.content
      .split('\n')
      .filter(line => line.includes('|'))
      .map(line => {
        const [type, text] = line.split('|');
        return {
          type: type.trim(),
          text: text.trim()
        };
      });

    return recommendations.length > 0 ? recommendations : [
      { type: 'Lifestyle', text: 'Maintain a consistent daily routine with adequate sleep and stress management' },
      { type: 'Diet', text: 'Focus on a balanced diet rich in fruits, vegetables, and whole grains' },
      { type: 'Exercise', text: 'Incorporate regular physical activity appropriate for your fitness level' }
    ];

  } catch (error) {
    console.error('Error generating recommendations:', error);
    
    return [
      { type: 'Lifestyle', text: 'Focus on maintaining good sleep hygiene and stress management' },
      { type: 'Diet', text: 'Ensure adequate nutrition with a balanced, varied diet' },
      { type: 'Exercise', text: 'Stay active with regular, moderate exercise as appropriate for your condition' }
    ];
  }
};