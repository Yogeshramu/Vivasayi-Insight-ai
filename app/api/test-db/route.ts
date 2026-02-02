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

        // Attempt simple query with default DATABASE_URL
        const startTime = Date.now();
        let count;
        try {
            count = await prisma.user.count();
            console.log(`DB Connection Successful (Default). User count: ${count}`);
        } catch (e: any) {
            console.error("Default Connection Failed:", e.message);

            // Fallback Test: Try Direct Connection if available
            if (process.env.DIRECT_URL) {
                console.log("Attempting Direct URL connection...");
                const { PrismaClient } = require('@prisma/client');
                const directPrisma = new PrismaClient({
                    datasources: {
                        db: {
                            url: process.env.DIRECT_URL
                        }
                    }
                });
                try {
                    count = await directPrisma.user.count();
                    console.log(`Direct Connection Successful! User count: ${count}`);
                    await directPrisma.$disconnect();
                    return NextResponse.json({
                        success: true,
                        message: 'Default failed, but Direct Connection passed. Please update env vars.',
                        userCount: count,
                        mode: 'direct_fallback'
                    });
                } catch (directErr: any) {
                    console.error("Direct Connection also failed:", directErr.message);
                    throw e; // Throw original error if both fail
                }
            } else {
                throw e;
            }
        }
        const duration = Date.now() - startTime;

        console.log(`DB Test Complete. Duration: ${duration}ms`);

        return NextResponse.json({
            success: true,
            message: 'Database connected successfully (Default URL)',
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
