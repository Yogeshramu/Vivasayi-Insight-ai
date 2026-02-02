'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import axios from 'axios'

export default function RegisterPage() {
    const [email, setEmail] = useState('')
    const [name, setName] = useState('')
    const [password, setPassword] = useState('')
    const [phone, setPhone] = useState('')
    const [otp, setOtp] = useState('')
    const [step, setStep] = useState(1)
    const [error, setError] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const router = useRouter()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (step === 1) {
            setStep(2)
            return
        }

        setIsLoading(true)
        setError('')

        try {
            await axios.post('/api/auth/register', {
                email,
                name,
                password,
                phone,
                otp
            })
            router.push('/login')
        } catch (err: any) {
            setError(err.response?.data || 'Something went wrong')
            // If OTP is wrong, we stay on step 2, but allow them to try again
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="flex justify-center items-center min-h-[70vh]">
            <div className="card max-w-md w-full p-8">
                <h1 className="text-2xl font-bold text-center mb-6">Create Account</h1>

                {error && (
                    <div className="bg-red-50 text-red-500 p-3 rounded-lg mb-4 text-sm text-center">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    {step === 1 ? (
                        <>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="input-field"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="input-field"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Phone (Optional)</label>
                                <input
                                    type="text"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    className="input-field"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="input-field"
                                    required
                                />
                            </div>
                            <button
                                type="submit"
                                className="w-full btn-primary"
                            >
                                Continue to Verification
                            </button>
                        </>
                    ) : (
                        <>
                            <div className="text-center mb-4">
                                <p className="text-sm text-gray-600">A verification code is required to complete your registration.</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Verification Code</label>
                                <input
                                    type="text"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                    placeholder="Enter 6-digit code"
                                    className="input-field"
                                    required
                                    autoFocus
                                />
                            </div>
                            <div className="flex flex-col space-y-2">
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full btn-primary"
                                >
                                    {isLoading ? 'Verifying...' : 'Verify & Create Account'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setStep(1)}
                                    className="text-sm text-gray-500 hover:text-gray-700"
                                >
                                    ← Back to details
                                </button>
                            </div>
                        </>
                    )}
                </form>

                <p className="mt-6 text-center text-sm text-gray-600">
                    Already have an account?{' '}
                    <Link href="/login" className="text-primary-600 font-medium hover:underline">
                        Sign In here
                    </Link>
                </p>
            </div>
        </div>
    )
}
