import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
    try {
        // 1. Check if we can reach the database
        const userCount = await prisma.user.count()

        return NextResponse.json({
            success: true,
            message: "Database connection successful",
            data: {
                userCount,
                env: process.env.NODE_ENV,
                db_host: process.env.DATABASE_URL?.split('@')[1]?.split(':')[0] || 'hidden'
            }
        })
    } catch (error: any) {
        console.error('Database connection test failed:', error)
        return NextResponse.json({
            success: false,
            message: "Database connection failed",
            error: error.message,
            code: error.code,
            meta: error.meta
        }, { status: 500 })
    }
}
