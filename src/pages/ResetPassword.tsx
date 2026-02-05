import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { PasswordInput } from '@/components/ui/password-input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/contexts/AuthContext'
import { Mail, Shield, Lock } from 'lucide-react'

const ResetPassword = () => {
  const [email, setEmail] = useState('')
  const [token, setToken] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [step, setStep] = useState<'email' | 'otp' | 'password'>('email')
  const [loading, setLoading] = useState(false)
  const [otpSent, setOtpSent] = useState(false)
  const { toast } = useToast()
  const { signInWithOtp, verifyOtp, updatePassword } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  // Check if email is provided in URL params
  useState(() => {
    const emailParam = searchParams.get('email')
    if (emailParam) {
      setEmail(emailParam)
      setStep('otp')
    }
  })

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const result = await signInWithOtp(email)

      if (result.error) {
        throw result.error
      }

      setOtpSent(true)
      setStep('otp')
      toast({
        title: 'OTP Sent',
        description: `We've sent a 6-digit code to ${email}. Please check your inbox.`,
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
    setLoading(true)

    try {
      const result = await verifyOtp(email, token)

      if (result.error) {
        throw result.error
      }

      if (result.user) {
        setStep('password')
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

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (newPassword !== confirmPassword) {
      toast({
        title: 'Error',
        description: 'Passwords do not match.',
        variant: 'destructive',
      })
      return
    }
    
    if (newPassword.length < 6) {
      toast({
        title: 'Error',
        description: 'Password must be at least 6 characters long.',
        variant: 'destructive',
      })
      return
    }

    setLoading(true)

    try {
      const result = await updatePassword(newPassword)

      if (result.error) {
        throw result.error
      }

      toast({
        title: 'Password Updated',
        description: 'Your password has been successfully updated.',
      })
      
      // Redirect to login after a short delay
      setTimeout(() => {
        navigate('/login')
      }, 2000)
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update password. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleResendOtp = async () => {
    setLoading(true)
    try {
      const result = await signInWithOtp(email)

      if (result.error) {
        throw result.error
      }

      toast({
        title: 'OTP Resent',
        description: `We've sent a new 6-digit code to ${email}.`,
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

  const handleBackToOtp = () => {
    setStep('otp')
    setNewPassword('')
    setConfirmPassword('')
  }

  return (
    <div className="w-full flex items-center justify-center bg-gradient-to-br from-background via-muted/30 to-background p-4">
      <Card className="w-full max-w-md shadow-xl rounded-2xl overflow-hidden border-0 bg-gradient-to-br from-card to-muted">
        <CardHeader className="text-center pb-4 pt-6">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center shadow-sm border border-primary/10 mx-auto mb-3">
            <Lock className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold text-primary">
            {step === 'email' ? 'Reset Password' : step === 'otp' ? 'Verify Your Email' : 'Set New Password'}
          </CardTitle>
          <CardDescription className="text-sm mt-1">
            {step === 'email' 
              ? 'Enter your email to receive a verification code'
              : step === 'otp' 
                ? `Enter the 6-digit code sent to ${email}`
                : 'Create a new password for your account'}
          </CardDescription>
        </CardHeader>
        
        {step === 'email' && (
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
            </CardContent>
            
            <CardFooter className="flex flex-col space-y-3 px-6 pb-6">
              <Button type="submit" className="w-full py-5 text-sm rounded-xl" disabled={loading}>
                {loading ? 'Sending...' : 'Send Verification Code'}
              </Button>
              
              <Button 
                type="button" 
                variant="ghost" 
                className="w-full py-5 text-sm rounded-xl"
                onClick={() => navigate('/login')}
              >
                Back to Login
              </Button>
            </CardFooter>
          </form>
        )}
        
        {step === 'otp' && (
          <form onSubmit={handleOtpSubmit}>
            <CardContent className="space-y-4 px-6">
              <div className="space-y-2">
                <Label htmlFor="token" className="text-sm">6-Digit Code</Label>
                <Input
                  id="token"
                  type="text"
                  placeholder="Enter 6-digit code"
                  value={token}
                  onChange={(e) => setToken(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  maxLength={6}
                  required
                  className="py-5 text-center text-xl tracking-widest rounded-xl"
                />
              </div>
              <p className="text-xs text-muted-foreground text-center">
                Didn't receive the code? Check your spam folder.
              </p>
            </CardContent>
            
            <CardFooter className="flex flex-col space-y-3 px-6 pb-6">
              <Button type="submit" className="w-full py-5 text-sm rounded-xl" disabled={loading || token.length !== 6}>
                {loading ? 'Verifying...' : 'Verify Code'}
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
        
        {step === 'password' && (
          <form onSubmit={handlePasswordSubmit}>
            <CardContent className="space-y-4 px-6">
              <div className="space-y-2">
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <PasswordInput
                    id="new-password"
                    placeholder="New password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    className="pl-9 py-5 rounded-xl text-sm"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <PasswordInput
                    id="confirm-password"
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="pl-9 py-5 rounded-xl text-sm"
                  />
                </div>
              </div>
            </CardContent>
            
            <CardFooter className="flex flex-col space-y-3 px-6 pb-6">
              <Button type="submit" className="w-full py-5 text-sm rounded-xl" disabled={loading}>
                {loading ? 'Updating...' : 'Update Password'}
              </Button>
              
              <Button
                type="button"
                variant="ghost"
                className="w-full py-5 text-sm rounded-xl"
                onClick={handleBackToOtp}
              >
                Back
              </Button>
            </CardFooter>
          </form>
        )}
      </Card>
    </div>
  )
}

export default ResetPassword