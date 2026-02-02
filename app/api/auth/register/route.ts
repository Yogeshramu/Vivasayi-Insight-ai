import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { email, name, password, phone, otp } = body;

        if (!email || !password || !otp) {
            return new NextResponse("Missing fields", { status: 400 });
        }

        // Dynamic OTP Verification (DDMMYY)
        const now = new Date();
        const d = String(now.getDate()).padStart(2, '0');
        const m = String(now.getMonth() + 1).padStart(2, '0');
        const y = String(now.getFullYear()).slice(-2);
        const expectedOTP = `${d}${m}${y}`;

        // Also allow tomorrow's date as requested
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const dt = String(tomorrow.getDate()).padStart(2, '0');
        const mt = String(tomorrow.getMonth() + 1).padStart(2, '0');
        const yt = String(tomorrow.getFullYear()).slice(-2);
        const expectedOTPTomorrow = `${dt}${mt}${yt}`;

        if (otp !== expectedOTP && otp !== expectedOTPTomorrow) {
            return new NextResponse("Invalid OTP. Please enter today's or tomorrow's date in DDMMYY format.", { status: 400 });
        }

        // Check for existing user
        const existingUser = await prisma.user.findFirst({
            where: {
                OR: [
                    { email },
                    ...(phone ? [{ phone }] : [])
                ]
            }
        });

        if (existingUser) {
            return new NextResponse("Account already exists with this email or phone number.", { status: 400 });
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        const user = await prisma.user.create({
            data: {
                email,
                name,
                password: hashedPassword,
                phone
            }
        });

        return NextResponse.json(user);
    } catch (error: any) {
        console.error("Registration error:", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
