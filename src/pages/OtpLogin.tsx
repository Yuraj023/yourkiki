import { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/contexts/AuthContext'
import { Mail, Shield } from 'lucide-react'

const OtpLogin = () => {
  const [email, setEmail] = useState('')
  const [token, setToken] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [step, setStep] = useState<'email' | 'otp'>('email')
  const [loading, setLoading] = useState(false)
  const [otpSent, setOtpSent] = useState(false)
  const { toast } = useToast()
  const { signUpWithOtp, signInWithOtp, verifyOtp } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const otpInputRef = useRef<HTMLInputElement>(null)

  // Check if email is passed from the login page
  useState(() => {
    if (location.state && location.state.email) {
      setEmail(location.state.email)
      setStep('otp')
      setOtpSent(true)
    }
  })
  
  // Focus on OTP input when step changes to 'otp'
  useEffect(() => {
    if (step === 'otp' && otpInputRef.current) {
      // Small delay to ensure the element is rendered
      setTimeout(() => {
        otpInputRef.current?.focus()
      }, 100)
    }
  }, [step])

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      let result
      if (isSignUp) {
        result = await signUpWithOtp(email)
      } else {
        result = await signInWithOtp(email)
      }

      if (result.error) {
        throw result.error
      }

      setOtpSent(true)
      setStep('otp')
      toast({
        title: 'OTP Sent',
        description: `We've sent a 6-digit code to ${email}. Please check your inbox. The code will expire in 10 minutes.`,
      })
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to send OTP. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // Additional validation for token
    if (token.length !== 6) {
      toast({
        title: 'Validation Error',
        description: 'Please enter a valid 6-digit code.',
        variant: 'destructive',
      })
      return
    }
    
    setLoading(true)

    try {
      const result = await verifyOtp(email, token)

      if (result.error) {
        throw result.error
      }

      if (result.user) {
        toast({
          title: 'Welcome!',
          description: 'You have been successfully logged in. Redirecting to your dashboard...',
        })
        // Add a small delay before navigation for better UX
        setTimeout(() => {
          navigate('/', { replace: true })
        }, 1500)
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Invalid OTP. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleResendOtp = async () => {
    setLoading(true)
    try {
      let result
      if (isSignUp) {
        result = await signUpWithOtp(email)
      } else {
        result = await signInWithOtp(email)
      }

      if (result.error) {
        throw result.error
      }

      toast({
        title: 'OTP Resent',
        description: `We've sent a new 6-digit code to ${email}. The code will expire in 10 minutes.`,
      })
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to resend OTP. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleBackToEmail = () => {
    setStep('email')
    setToken('')
  }

  const handleCancel = () => {
    navigate('/')
  }

  return (
    <div className="w-full flex items-center justify-center bg-gradient-to-br from-background via-muted/30 to-background p-4">
      <Card className="w-full max-w-md shadow-xl rounded-2xl overflow-hidden border-0 bg-gradient-to-br from-card to-muted">
        <CardHeader className="text-center pb-4 pt-6">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center shadow-sm border border-primary/10 mx-auto mb-3">
            <Shield className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold text-primary">
            {step === 'email' ? (isSignUp ? 'Create Account' : 'Welcome Back') : 'Verify Your Email'}
          </CardTitle>
          <CardDescription className="text-sm mt-1">
            {step === 'email' 
              ? (isSignUp ? 'Join Kiki to get personalized support' : 'Sign in to continue your conversation')
              : `Enter the 6-digit code we sent to ${email}`}
          </CardDescription>
        </CardHeader>
        
        {step === 'email' ? (
          <form onSubmit={handleEmailSubmit}>
            <CardContent className="space-y-4 px-6">
              <div className="space-y-2">
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="pl-9 py-5 rounded-xl text-sm"
                  />
                </div>
              </div>
              <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                <p className="text-xs text-blue-800 dark:text-blue-200">
                  <span className="font-medium">Note:</span> After submitting, we'll send a 6-digit code to your email for verification.
                </p>
              </div>
            </CardContent>
            
            <CardFooter className="flex flex-col space-y-3 px-6 pb-6">
              <Button type="submit" className="w-full py-5 text-sm rounded-xl" disabled={loading}>
                {loading ? 'Sending OTP...' : (isSignUp ? 'Sign Up with OTP' : 'Send Verification Code')}
              </Button>
              
              <div className="flex gap-2 w-full">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full py-5 text-sm rounded-xl"
                  onClick={() => setIsSignUp(!isSignUp)}
                >
                  {isSignUp 
                    ? 'Sign In' 
                    : "Sign Up"}
                </Button>
                
                <Button
                  type="button"
                  variant="ghost"
                  className="w-full py-5 text-sm rounded-xl"
                  onClick={handleCancel}
                >
                  Cancel
                </Button>
              </div>
            </CardFooter>
          </form>
        ) : (
          <form onSubmit={handleOtpSubmit}>
            <CardContent className="space-y-4 px-6">
              <div className="space-y-2">
                <Label htmlFor="token" className="text-sm">6-Digit Code</Label>
                <Input
                  ref={otpInputRef}
                  id="token"
                  type="text"
                  placeholder="Enter 6-digit code"
                  value={token}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '').slice(0, 6)
                    setToken(value)
                  }}
                  onBlur={() => {
                    // Validate on blur as well
                    if (token.length > 0 && token.length !== 6) {
                      toast({
                        title: 'Validation Error',
                        description: 'OTP must be exactly 6 digits.',
                        variant: 'destructive',
                      })
                    }
                  }}
                  onKeyDown={(e) => {
                    // Auto-submit when 6 digits are entered and Enter is pressed
                    if (token.length === 6 && e.key === 'Enter') {
                      handleOtpSubmit(e as any)
                    }
                  }}
                  maxLength={6}
                  required
                  className="py-5 text-center text-xl tracking-widest rounded-xl"
                />
                {token.length > 0 && token.length !== 6 && (
                  <p className="text-xs text-destructive text-center">
                    Please enter exactly 6 digits
                  </p>
                )}
              </div>
              <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                <p className="text-xs text-blue-800 dark:text-blue-200">
                  <span className="font-medium">Tip:</span> The code was sent to {email}. Check your inbox or spam folder.
                </p>
              </div>
            </CardContent>
            
            <CardFooter className="flex flex-col space-y-3 px-6 pb-6">
              <Button type="submit" className="w-full py-5 text-sm rounded-xl" disabled={loading || token.length !== 6}>
                {loading ? 'Verifying...' : 'Verify & Continue'}
              </Button>
              
              <div className="flex gap-2 w-full">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full py-5 text-sm rounded-xl"
                  onClick={handleResendOtp}
                  disabled={loading}
                >
                  Resend Code
                </Button>
                
                <Button
                  type="button"
                  variant="ghost"
                  className="w-full py-5 text-sm rounded-xl"
                  onClick={handleBackToEmail}
                >
                  Back
                </Button>
              </div>
            </CardFooter>
          </form>
        )}
      </Card>
    </div>
  )
}

export default OtpLogin