import { NextResponse } from 'next/server'

export async function GET() {
  const config = {
    CLIENT_ID: process.env.OUTLOOK_CLIENT_ID ? 'Present' : 'Missing',
    CLIENT_SECRET: process.env.OUTLOOK_CLIENT_SECRET ? 'Present' : 'Missing', 
    TENANT_ID: process.env.OUTLOOK_TENANT_ID || 'common',
    REDIRECT_URI: process.env.OUTLOOK_REDIRECT_URI
  }
  
  return NextResponse.json(config)
}