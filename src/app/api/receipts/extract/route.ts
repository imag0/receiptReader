import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

// Initialize OpenAI with fallback for missing API key
const openai = process.env.OPENAI_API_KEY ? new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
}) : null

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // If no OpenAI API key, return mock data for development
    if (!openai || !process.env.OPENAI_API_KEY) {
      console.log('No OpenAI API key found, returning mock data')
      
      // Simulate processing delay
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // Return realistic mock data based on filename or random
      const mockData = {
        vendor: file.name.includes('starbucks') ? 'Starbucks' : 
                file.name.includes('uber') ? 'Uber' :
                file.name.includes('target') ? 'Target' :
                ['Coffee Shop', 'Gas Station', 'Grocery Store', 'Restaurant'][Math.floor(Math.random() * 4)],
        date: new Date().toISOString().split('T')[0],
        amount: Math.round((Math.random() * 50 + 5) * 100) / 100,
        currency: 'USD',
        category: ['Food & Drink', 'Transport', 'Shopping', 'Gas', 'Office'][Math.floor(Math.random() * 5)]
      }
      
      return NextResponse.json(mockData)
    }

    // Convert file to base64
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64 = buffer.toString('base64')

    // Process with OpenAI GPT-4 Vision
    const response = await openai.chat.completions.create({
      model: "gpt-4-vision-preview",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Extract the following information from this receipt image and return ONLY a JSON object with these exact fields:
              {
                "vendor": "store/restaurant name",
                "date": "YYYY-MM-DD format",
                "amount": number (total amount as decimal),
                "currency": "USD/EUR/etc",
                "category": "Food & Drink/Transport/Office/Shopping/Gas/Hotel/Other"
              }
              
              If any field cannot be determined, use reasonable defaults or "Unknown".`
            },
            {
              type: "image_url",
              image_url: {
                url: `data:image/${file.type.split('/')[1]};base64,${base64}`
              }
            }
          ]
        }
      ],
      max_tokens: 300
    })

    const extractedText = response.choices[0]?.message?.content
    
    if (!extractedText) {
      throw new Error('No response from OpenAI')
    }

    // Parse the JSON response
    let extractedData
    try {
      extractedData = JSON.parse(extractedText)
    } catch (parseError) {
      // If JSON parsing fails, try to extract data with regex
      const vendorMatch = extractedText.match(/"vendor":\s*"([^"]+)"/i)
      const dateMatch = extractedText.match(/"date":\s*"([^"]+)"/i)
      const amountMatch = extractedText.match(/"amount":\s*([0-9.]+)/i)
      const currencyMatch = extractedText.match(/"currency":\s*"([^"]+)"/i)
      const categoryMatch = extractedText.match(/"category":\s*"([^"]+)"/i)

      extractedData = {
        vendor: vendorMatch?.[1] || 'Unknown',
        date: dateMatch?.[1] || new Date().toISOString().split('T')[0],
        amount: parseFloat(amountMatch?.[1] || '0'),
        currency: currencyMatch?.[1] || 'USD',
        category: categoryMatch?.[1] || 'Other'
      }
    }

    // Validate and sanitize the extracted data
    const sanitizedData = {
      vendor: extractedData.vendor || 'Unknown',
      date: extractedData.date || new Date().toISOString().split('T')[0],
      amount: parseFloat(extractedData.amount) || 0,
      currency: extractedData.currency || 'USD',
      category: extractedData.category || 'Other'
    }

    return NextResponse.json(sanitizedData)
    
  } catch (error) {
    console.error('Receipt processing error:', error)
    return NextResponse.json(
      { error: 'Failed to process receipt' },
      { status: 500 }
    )
  }
}
