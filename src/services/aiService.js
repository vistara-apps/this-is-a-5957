import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.REACT_APP_OPENAI_API_KEY || 'demo-key',
  baseURL: "https://openrouter.ai/api/v1",
  dangerouslyAllowBrowser: true,
})

// Fallback responses for demo mode when API key is not available
const demoResponses = [
  {
    explanation: "Based on your symptoms, there are several possible explanations. Common causes could include viral infections, stress-related symptoms, or minor conditions that often resolve on their own. However, it's important to monitor your symptoms and seek medical attention if they worsen or persist.",
    symptoms: ["general discomfort", "fatigue"],
    possibleConditions: ["Viral infection", "Stress response", "Minor illness"],
    urgencyLevel: "low",
    confidenceScore: 0.6,
    keyInsights: [
      "Symptoms appear to be mild and non-specific",
      "Could be related to common viral infections",
      "Stress and lifestyle factors may be contributing"
    ],
    recommendedActions: [
      "Rest and stay hydrated",
      "Monitor symptoms for any changes",
      "Consult healthcare provider if symptoms persist"
    ],
    recommendations: [
      { text: "Get adequate sleep (7-9 hours) to support immune function", type: "Lifestyle" },
      { text: "Stay hydrated by drinking plenty of water throughout the day", type: "General" },
      { text: "Consider gentle exercise like walking to boost circulation", type: "Exercise" }
    ]
  },
  {
    explanation: "Your symptoms suggest a possible upper respiratory condition or allergic reaction. These are common and usually manageable with proper care. The combination of symptoms you've described could indicate several conditions, from minor infections to environmental factors.",
    symptoms: ["respiratory symptoms", "congestion"],
    possibleConditions: ["Upper respiratory infection", "Allergic rhinitis", "Common cold"],
    urgencyLevel: "low",
    confidenceScore: 0.7,
    keyInsights: [
      "Respiratory symptoms are commonly caused by infections or allergies",
      "Seasonal factors may be contributing to symptoms",
      "Most cases resolve within 7-10 days with proper care"
    ],
    recommendedActions: [
      "Use a humidifier to ease congestion",
      "Avoid known allergens if applicable",
      "Seek medical care if symptoms worsen or fever develops"
    ],
    recommendations: [
      { text: "Use a humidifier or steam inhalation to ease breathing", type: "Lifestyle" },
      { text: "Avoid dairy products temporarily as they can increase mucus production", type: "Diet" },
      { text: "Try warm salt water gargles to soothe throat irritation", type: "General" }
    ]
  }
]

export const getSymptomAnalysis = async (symptoms) => {
  // Check if we have a valid API key
  const apiKey = process.env.REACT_APP_OPENAI_API_KEY || import.meta.env.VITE_OPENAI_API_KEY
  
  if (!apiKey || apiKey === 'demo-key') {
    // Return demo response when no API key is available
    console.log('Demo mode: Using fallback AI response')
    const randomResponse = demoResponses[Math.floor(Math.random() * demoResponses.length)]
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 1000))
    
    return {
      ...randomResponse,
      symptoms: extractSymptomsFromText(symptoms)
    }
  }

  try {
    const prompt = `As a medical AI assistant, analyze these symptoms and provide a helpful response. Remember this is for informational purposes only and not a substitute for professional medical advice.

Symptoms described: "${symptoms}"

Please provide a JSON response with the following structure:
{
  "explanation": "A detailed, empathetic explanation of possible causes and general guidance",
  "symptoms": ["list of identified symptoms"],
  "possibleConditions": ["list of 2-3 most likely conditions"],
  "urgencyLevel": "low/medium/high",
  "confidenceScore": 0.7,
  "keyInsights": ["3-4 key insights about the symptoms"],
  "recommendedActions": ["3-4 recommended next steps"],
  "recommendations": [
    {"text": "specific recommendation", "type": "Diet/Exercise/Lifestyle/General"}
  ]
}

Guidelines:
- Be empathetic and reassuring while being medically responsible
- Always recommend consulting healthcare professionals for persistent or concerning symptoms
- Provide practical, actionable advice
- Avoid definitive diagnoses
- Consider common causes first
- Include relevant lifestyle recommendations`

    const completion = await openai.chat.completions.create({
      model: "google/gemini-2.0-flash-001",
      messages: [
        {
          role: "system",
          content: "You are a helpful medical AI assistant. Provide informative, empathetic responses about symptoms while emphasizing that this is not a substitute for professional medical advice. Always respond with valid JSON."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 1500
    })

    const response = completion.choices[0].message.content
    
    try {
      // Try to parse JSON response
      const jsonMatch = response.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        const analysis = JSON.parse(jsonMatch[0])
        return analysis
      } else {
        // Fallback if JSON parsing fails
        return createFallbackResponse(symptoms, response)
      }
    } catch (parseError) {
      console.warn('Failed to parse AI response as JSON, using fallback')
      return createFallbackResponse(symptoms, response)
    }

  } catch (error) {
    console.error('AI service error:', error)
    
    // Return a fallback response
    return {
      explanation: "I'm having trouble analyzing your symptoms right now, but I can offer some general guidance. If you're experiencing concerning symptoms, it's always best to consult with a healthcare professional who can provide personalized advice based on your medical history.",
      symptoms: extractSymptomsFromText(symptoms),
      possibleConditions: ["Various possible causes"],
      urgencyLevel: "medium",
      confidenceScore: 0.5,
      keyInsights: [
        "Unable to complete full analysis at this time",
        "Symptoms warrant professional medical evaluation",
        "Consider monitoring symptoms closely"
      ],
      recommendedActions: [
        "Consult with a healthcare provider",
        "Monitor symptoms for any changes",
        "Seek immediate care if symptoms worsen"
      ],
      recommendations: [
        { text: "Schedule an appointment with your healthcare provider", type: "General" },
        { text: "Keep a symptom diary to track changes", type: "General" }
      ]
    }
  }
}

const createFallbackResponse = (symptoms, aiResponse) => {
  return {
    explanation: aiResponse || "Based on your symptoms, I recommend monitoring them closely and consulting with a healthcare professional for proper evaluation and guidance.",
    symptoms: extractSymptomsFromText(symptoms),
    possibleConditions: ["Various possible causes"],
    urgencyLevel: "medium",
    confidenceScore: 0.6,
    keyInsights: [
      "Symptoms require professional evaluation",
      "Multiple factors could be contributing",
      "Proper medical assessment is recommended"
    ],
    recommendedActions: [
      "Consult healthcare provider",
      "Monitor symptom progression",
      "Maintain symptom diary"
    ],
    recommendations: [
      { text: "Schedule medical consultation", type: "General" },
      { text: "Track symptoms daily", type: "General" }
    ]
  }
}

const extractSymptomsFromText = (text) => {
  // Simple symptom extraction logic
  const commonSymptoms = [
    'headache', 'fever', 'cough', 'fatigue', 'nausea', 'dizziness', 'pain',
    'shortness of breath', 'chest pain', 'stomach ache', 'muscle ache',
    'sore throat', 'runny nose', 'congestion', 'anxiety', 'stress'
  ]
  
  const foundSymptoms = commonSymptoms.filter(symptom => 
    text.toLowerCase().includes(symptom)
  )
  
  return foundSymptoms.length > 0 ? foundSymptoms : ['general symptoms']
}