import { AzureOpenAI } from 'openai'

// Validate environment variables
const validateConfig = () => {
  const requiredVars = {
    AZURE_OPENAI_API_KEY: process.env.AZURE_OPENAI_API_KEY,
    AZURE_OPENAI_ENDPOINT: process.env.AZURE_OPENAI_ENDPOINT,
    AZURE_OPENAI_API_VERSION: process.env.AZURE_OPENAI_API_VERSION,
    AZURE_OPENAI_DEPLOYMENT_NAME: process.env.AZURE_OPENAI_DEPLOYMENT_NAME,
  }

  for (const [key, value] of Object.entries(requiredVars)) {
    if (!value || value.includes('your-azure-api-key') || value.includes('your-actual-azure')) {
      throw new Error(`Missing or invalid ${key}. Please check your .env.local file and add your actual Azure OpenAI credentials.`)
    }
  }
}

// Validate config on import
validateConfig()

const client = new AzureOpenAI({
  apiKey: process.env.AZURE_OPENAI_API_KEY,
  endpoint: process.env.AZURE_OPENAI_ENDPOINT,
  apiVersion: process.env.AZURE_OPENAI_API_VERSION,
  deployment: process.env.AZURE_OPENAI_DEPLOYMENT_NAME,
})

export async function translateText(text: string, targetLanguage: string) {
  try {
    // Validate inputs
    if (!text || text.trim().length === 0) {
      throw new Error('Text to translate cannot be empty')
    }

    if (!targetLanguage) {
      throw new Error('Target language must be specified')
    }

    // Enhanced system prompt for better translation quality
    const systemPrompt = `You are an expert professional translator with deep knowledge of linguistics, cultural nuances, and context preservation. 

Your task is to translate text to ${targetLanguage} with the following requirements:
1. Maintain the original meaning and tone precisely
2. Preserve formatting, structure, and any special characters
3. Consider cultural context and idiomatic expressions
4. For technical or specialized content, use appropriate terminology
5. Return ONLY the translated text without explanations, notes, or additional content

Translation target: ${targetLanguage}`

    console.log(`Starting Azure OpenAI translation to ${targetLanguage}...`)

    const response = await client.chat.completions.create({
      messages: [
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user",
          content: `Translate this text to ${targetLanguage}:\n\n${text}`
        }
      ],
      max_completion_tokens: 100000,
      model: process.env.AZURE_OPENAI_DEPLOYMENT_NAME || 'o3',
      // Note: O3 model only supports default temperature (1)
    })

    const translatedText = response.choices[0]?.message?.content

    if (!translatedText) {
      throw new Error('No translation received from Azure OpenAI')
    }

    console.log(`Azure OpenAI translation completed successfully`)
    return translatedText.trim()
    
  } catch (error: unknown) {
    console.error('Azure OpenAI translation error:', error)
    
    const apiError = error as { status?: number; code?: string; message?: string } // Type assertion for Azure OpenAI error structure
    
    // Handle specific Azure OpenAI error cases
    if (apiError.status === 401 || apiError.code === '401') {
      throw new Error('Invalid Azure OpenAI API key or endpoint. Please verify your credentials in the .env.local file.')
    }
    
    if (apiError.status === 404 || apiError.code === 'DeploymentNotFound') {
      throw new Error('O3 model deployment not found. Please verify your deployment name in Azure.')
    }
    
    if (apiError.status === 429 || apiError.code === 'rate_limit_exceeded') {
      throw new Error('Rate limit exceeded. Please wait a moment and try again.')
    }
    
    if (apiError.code === 'insufficient_quota') {
      throw new Error('Azure OpenAI quota exceeded. Please check your billing.')
    }
    
    if (apiError.code === 'content_filter') {
      throw new Error('Content was filtered by Azure OpenAI. Please try different text.')
    }

    if (apiError.message?.includes('temperature') || apiError.message?.includes('Unsupported value')) {
      throw new Error('Model configuration issue. The O3 model has specific parameter requirements.')
    }

    // If the error message contains configuration hints, include them
    if (apiError.message && apiError.message.includes('subscription key')) {
      throw new Error('Azure API key issue: ' + apiError.message + '\n\nPlease check your .env.local file and ensure you have the correct API key from your Azure portal.')
    }

    throw new Error(apiError.message || 'Translation failed. Please check your Azure OpenAI configuration.')
  }
}

// Additional utility function for batch translations
export async function translateBatch(texts: string[], targetLanguage: string) {
  try {
    const translations = await Promise.all(
      texts.map(text => translateText(text, targetLanguage))
    )
    return translations
  } catch (error) {
    console.error('Batch translation error:', error)
    throw error
  }
}
