import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        console.log("Testing DB Connection...");

        // Log Environment (Safe)
        const dbUrl = process.env.DATABASE_URL;
        const directUrl = process.env.DIRECT_URL;

        console.log("DB URL Configured:", !!dbUrl);
        console.log("Direct URL Configured:", !!directUrl);

        if (dbUrl) {
            // Show protocol, host, port, and query params (masking credentials)
            const sanitizedDbUrl = dbUrl.replace(/\/\/.*@/, '//***:***@');
            console.log("Sanitized DATABASE_URL:", sanitizedDbUrl);
        }

        // Attempt simple query
        const startTime = Date.now();
        const count = await prisma.user.count();
        const duration = Date.now() - startTime;

        console.log(`DB Connection Successful. User count: ${count}. Duration: ${duration}ms`);

        return NextResponse.json({
            success: true,
            message: 'Database connected successfully',
            userCount: count,
            duration,
            envCheck: {
                hasDbUrl: !!process.env.DATABASE_URL,
                hasDirectUrl: !!process.env.DIRECT_URL
            }
        });
    } catch (error: any) {
        console.error("DB Connection Test Failed:", error);

        return NextResponse.json({
            success: false,
            error: error.message,
            stack: error.stack,
            envCheck: {
                hasDbUrl: !!process.env.DATABASE_URL,
                hasDirectUrl: !!process.env.DIRECT_URL
            }
        }, { status: 500 });
    }
}
