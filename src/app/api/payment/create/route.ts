import { NextRequest, NextResponse } from 'next/server'

/**
 * POST /api/payment/create
 *
 * Placeholder for payment integration
 * TODO: Implement PayPal / WeChat / Alipay integration
 */
export async function POST(request: NextRequest) {
  return NextResponse.json(
    {
      success: false,
      message: 'Payment not implemented'
    },
    { status: 501 }
  )
}