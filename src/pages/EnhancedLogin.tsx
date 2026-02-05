import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { PasswordInput } from '@/components/ui/password-input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabaseClient'
import { Mail, Lock, Shield, User } from 'lucide-react'

const EnhancedLogin = () => {
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [token, setToken] = useState('')
  const [authMethod, setAuthMethod] = useState<'password' | 'otp'>('password')
  const [step, setStep] = useState<'email' | 'password' | 'otp' | 'signup'>('email')
  const [loading, setLoading] = useState(false)
  const [otpSent, setOtpSent] = useState(false)
  const [signupMethod, setSignupMethod] = useState<'password' | 'otp'>('password')
  const { toast } = useToast()
  const { signUpWithOtp, signInWithOtp, signInWithEmailAndPassword, verifyOtp, refreshUser } = useAuth()
  const navigate = useNavigate()

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // If user selected password authentication, proceed directly to password step
      if (authMethod === 'password') {
        setStep('password')
        setLoading(false)
        return
      }
      
      // For OTP authentication, send OTP
      const { error: signInError } = await signInWithOtp(email)
      
      if (signInError) {
        // If user doesn't exist, show signup option
        if (signInError.message.includes('Invalid login credentials') || 
            signInError.message.includes('User not found')) {
          toast({
            title: 'User Not Found',
            description: 'No account found with this email. Please create a new account.',
            variant: 'destructive',
          })
          setStep('signup')
          setLoading(false)
          return
        } else {
          throw signInError
        }
      }

      // If user exists and selected OTP, send OTP
      setOtpSent(true)
      setStep('otp')
      toast({
        title: 'OTP Sent',
        description: `We've sent a 6-digit code to ${email}. Please check your inbox.`,
      })
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to process request. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Use the authService signInWithEmailAndPassword method
      const result = await signInWithEmailAndPassword(email, password)

      if (result.error) throw result.error

      toast({
        title: 'Welcome Back!',
        description: 'You have been successfully logged in.',
      })
      navigate('/')
    } catch (error: any) {
      toast({
        title: 'Login Failed',
        description: error.message || 'Invalid email or password. Please try again.',
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
        toast({
          title: 'Welcome!',
          description: 'You have been successfully logged in.',
        })
        navigate('/')
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

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    // Validate password for password-based signup
    if (signupMethod === 'password' && password.length < 6) {
      toast({
        title: 'Password Too Short',
        description: 'Password must be at least 6 characters long.',
        variant: 'destructive',
      })
      setLoading(false)
      return
    }

    try {
      if (signupMethod === 'password') {
        // Password-based signup
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: name,
            }
          }
        })
        
        if (signUpError) {
          throw signUpError
        }

        toast({
          title: 'Account Created',
          description: 'Your account has been created successfully. You can now sign in.',
        })
        
        // Switch to login mode
        setIsSignUp(false)
        setStep('email')
        setName('')
        setPassword('')
      } else {
        // OTP-based signup
        const { error: signUpError } = await signUpWithOtp(email, name)
        
        if (signUpError) {
          throw signUpError
        }

        setOtpSent(true)
        setStep('otp')
        toast({
          title: 'Account Created',
          description: `We've sent a 6-digit code to ${email}. Please check your inbox to verify your account.`,
        })
      }
    } catch (error: any) {
      toast({
        title: 'Signup Failed',
        description: error.message || 'Failed to create account. Please try again.',
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
      if (step === 'signup') {
        result = await signUpWithOtp(email, name)
      } else {
        result = await signInWithOtp(email)
      }

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
    setPassword('')
  }

  const handleSwitchToSignup = () => {
    setIsSignUp(true)
    setStep('signup')
  }

  const handleSwitchToLogin = () => {
    setIsSignUp(false)
    setStep('email')
    setName('')
    setPassword('')
  }

  const handleCancel = () => {
    navigate('/')
  }

  return (
    <div className="w-full flex items-center justify-center bg-gradient-to-br from-background via-muted/30 to-background p-4">
      <Card className="w-full max-w-md shadow-xl rounded-2xl overflow-hidden border-0 bg-gradient-to-br from-card to-muted mx-auto">
        <CardHeader className="text-center pb-4 pt-8">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center shadow-sm border border-primary/10 mx-auto mb-4">
            <span className="text-3xl">🌸</span>
          </div>
          <CardTitle className="text-3xl font-bold text-primary">
            {step === 'email' ? 'Welcome Back' : 
             step === 'password' ? 'Enter Password' :
             step === 'otp' ? 'Verify Your Email' :
             'Create Account'}
          </CardTitle>
          <CardDescription className="text-base mt-2">
            {step === 'email' ? 'Sign in to continue your conversation with Kiki' :
             step === 'password' ? `Enter password for ${email}` :
             step === 'otp' ? `Enter the 6-digit code sent to ${email}` :
             'Join Kiki to get personalized support'}
          </CardDescription>
        </CardHeader>
        
        {step === 'email' && (
          <form onSubmit={handleEmailSubmit}>
            <CardContent className="space-y-6 px-8">
              <div className="space-y-2">
                <div className="relative">
                  <Mail className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="pl-10 py-6 rounded-xl"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label className="text-base">Authentication Method</Label>
                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant={authMethod === 'password' ? 'default' : 'outline'}
                    className="flex-1 py-6 text-base rounded-xl"
                    onClick={() => setAuthMethod('password')}
                  >
                    <Lock className="h-5 w-5 mr-2" />
                    Password
                  </Button>
                  <Button
                    type="button"
                    variant={authMethod === 'otp' ? 'default' : 'outline'}
                    className="flex-1 py-6 text-base rounded-xl"
                    onClick={() => setAuthMethod('otp')}
                  >
                    <Shield className="h-5 w-5 mr-2" />
                    OTP
                  </Button>
                </div>
              </div>
            </CardContent>
            
            <CardFooter className="flex flex-col space-y-4 px-8 pb-8">
              <Button type="submit" className="w-full py-6 text-base rounded-xl" disabled={loading}>
                {loading ? 'Processing...' : 'Continue'}
              </Button>
              
              <div className="relative w-full my-2">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-muted"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">Or</span>
                </div>
              </div>
              
              <div className="flex gap-3 w-full">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full py-6 text-base rounded-xl"
                  onClick={handleSwitchToSignup}
                >
                  Create Account
                </Button>
                
                <Button
                  type="button"
                  variant="ghost"
                  className="w-full py-6 text-base rounded-xl"
                  onClick={handleCancel}
                >
                  Cancel
                </Button>
              </div>
            </CardFooter>
          </form>
        )}
        
        {step === 'password' && (
          <form onSubmit={handlePasswordSubmit}>
            <CardContent className="space-y-6 px-8">
              <div className="space-y-2">
                <div className="relative">
                  <Lock className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
                  <PasswordInput
                    id="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="pl-10 py-6 rounded-xl"
                  />
                </div>
              </div>
            </CardContent>
            
            <CardFooter className="flex flex-col space-y-4 px-8 pb-8">
              <Button type="submit" className="w-full py-6 text-base rounded-xl" disabled={loading}>
                {loading ? 'Signing In...' : 'Sign In'}
              </Button>
              
              <div className="flex gap-3 w-full">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full py-6 text-base rounded-xl"
                  onClick={handleBackToEmail}
                >
                  Back
                </Button>
                
                <Button
                  type="button"
                  variant="ghost"
                  className="w-full py-6 text-base rounded-xl"
                  onClick={handleCancel}
                >
                  Cancel
                </Button>
              </div>
            </CardFooter>
          </form>
        )}
        
        {step === 'otp' && (
          <form onSubmit={handleOtpSubmit}>
            <CardContent className="space-y-6 px-8">
              <div className="space-y-2">
                <Label htmlFor="token" className="text-base">6-Digit Code</Label>
                <Input
                  id="token"
                  type="text"
                  placeholder="Enter 6-digit code"
                  value={token}
                  onChange={(e) => setToken(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  maxLength={6}
                  required
                  className="py-6 text-center text-2xl tracking-widest rounded-xl"
                />
              </div>
              <p className="text-sm text-muted-foreground text-center">
                Didn't receive the code? Check your spam folder.
              </p>
            </CardContent>
            
            <CardFooter className="flex flex-col space-y-4 px-8 pb-8">
              <Button type="submit" className="w-full py-6 text-base rounded-xl" disabled={loading || token.length !== 6}>
                {loading ? 'Verifying...' : 'Verify & Continue'}
              </Button>
              
              <div className="flex gap-3 w-full">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full py-6 text-base rounded-xl"
                  onClick={handleResendOtp}
                  disabled={loading}
                >
                  Resend Code
                </Button>
                
                <Button
                  type="button"
                  variant="ghost"
                  className="w-full py-6 text-base rounded-xl"
                  onClick={handleBackToEmail}
                >
                  Back
                </Button>
              </div>
            </CardFooter>
          </form>
        )}
        
        {step === 'signup' && (
          <form onSubmit={handleSignupSubmit}>
            <CardContent className="space-y-6 px-8">
              <div className="space-y-2">
                <div className="relative">
                  <User className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="signup-name"
                    type="text"
                    placeholder="Enter your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="pl-10 py-6 rounded-xl"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="relative">
                  <Mail className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="pl-10 py-6 rounded-xl"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="relative">
                  <Lock className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
                  <PasswordInput
                    id="signup-password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required={signupMethod === 'password'}
                    disabled={signupMethod === 'otp'}
                    className="pl-10 py-6 rounded-xl"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label className="text-base">Signup Method</Label>
                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant={signupMethod === 'password' ? 'default' : 'outline'}
                    className="flex-1 py-6 text-base rounded-xl"
                    onClick={() => setSignupMethod('password')}
                  >
                    <Lock className="h-5 w-5 mr-2" />
                    Password
                  </Button>
                  <Button
                    type="button"
                    variant={signupMethod === 'otp' ? 'default' : 'outline'}
                    className="flex-1 py-6 text-base rounded-xl"
                    onClick={() => setSignupMethod('otp')}
                  >
                    <Shield className="h-5 w-5 mr-2" />
                    OTP
                  </Button>
                </div>
              </div>
            </CardContent>
            
            <CardFooter className="flex flex-col space-y-4 px-8 pb-8">
              <Button type="submit" className="w-full py-6 text-base rounded-xl" disabled={loading}>
                {loading ? 'Creating Account...' : 
                 signupMethod === 'password' ? 'Create Account with Password' : 'Create Account with OTP'}
              </Button>
              
              <div className="relative w-full my-2">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-muted"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">Or</span>
                </div>
              </div>
              
              <div className="flex gap-3 w-full">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full py-6 text-base rounded-xl"
                  onClick={handleSwitchToLogin}
                >
                  Already have an account?
                </Button>
                
                <Button
                  type="button"
                  variant="ghost"
                  className="w-full py-6 text-base rounded-xl"
                  onClick={handleCancel}
                >
                  Cancel
                </Button>
              </div>
            </CardFooter>
          </form>
        )}
      </Card>
    </div>
  )
}

export default EnhancedLogin