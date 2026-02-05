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
import { Mail, Lock, User, Shield } from 'lucide-react'

const Login = () => {
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [username, setUsername] = useState('')
  const [authMethod, setAuthMethod] = useState<'password' | 'otp'>('password')
  const [loading, setLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  const [otpSent, setOtpSent] = useState(false)
  const [otp, setOtp] = useState('')
  const { toast } = useToast()
  const { refreshUser, signUpWithOtp, signInWithOtp, signInWithEmailAndPassword, verifyOtp } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (isSignUp) {
        // For signup, collect username, email, and password
        if (!username || !email || !password) {
          throw new Error('Please fill in all fields')
        }
        
        // For signup with password
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: name,
              username: username
            }
          }
        })
        
        if (error) throw error
        
        toast({
          title: 'Account Created',
          description: 'Your account has been created successfully. Please check your email for verification.',
        })
        
        // Switch to login mode after successful signup
        setIsSignUp(false)
        setUsername('')
        setName('')
        setEmail('')
        setPassword('')
      } else {
        if (authMethod === 'password') {
          // For signin with password
          const { user, error } = await signInWithEmailAndPassword(email, password)
          if (error) throw error
          if (user) {
            toast({
              title: 'Welcome Back!',
              description: 'You have been successfully logged in.',
            })
            navigate('/')
          }
        } else {
          // For signin with OTP
          if (!otpSent) {
            // Send OTP
            const { error } = await signInWithOtp(email)
            if (error) throw error
            
            setOtpSent(true)
            toast({
              title: 'OTP Sent',
              description: `We've sent a 6-digit verification code to ${email}. Please check your inbox.`,
            })
          } else {
            // Verify OTP
            if (otp.length !== 6) {
              throw new Error('Please enter a valid 6-digit code')
            }
            
            const result = await verifyOtp(email, otp)
            if (result.error) throw result.error
            
            if (result.user) {
              toast({
                title: 'Welcome!',
                description: 'You have been successfully logged in.',
              })
              navigate('/')
            }
          }
        }
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'An error occurred. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    navigate('/')
  }

  const handleResendEmail = async () => {
    toast({
      title: 'Email resent',
      description: 'Please check your inbox for the confirmation email.',
    })
  }

  const handleRefresh = async () => {
    await refreshUser()
    toast({
      title: 'Checking confirmation status',
      description: 'Refreshing your account status...',
    })
    setTimeout(() => {
      navigate('/')
    }, 1000)
  }

  const handleResetPassword = () => {
    navigate('/reset-password')
  }

  const handleResendOtp = async () => {
    setLoading(true)
    try {
      const { error } = await signInWithOtp(email)
      if (error) throw error
      
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
    setOtpSent(false)
    setOtp('')
  }

  // If email was sent during signup, show confirmation message
  if (emailSent) {
    return (
      <div className="w-full flex items-center justify-center bg-gradient-to-br from-background via-muted/30 to-background p-4">
        <Card className="w-full max-w-md shadow-xl rounded-2xl overflow-hidden border-0 bg-gradient-to-br from-card to-muted">
          <CardHeader className="text-center pb-4 pt-6">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center shadow-sm border border-primary/10 mx-auto mb-3">
              <Shield className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-2xl font-bold text-primary">
              Check Your Email
            </CardTitle>
            <CardDescription className="text-sm mt-1">
              We've sent a confirmation email to your inbox
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4 px-6">
            <p className="text-center text-muted-foreground text-sm">
              Please check your inbox and click the confirmation link to activate your account.
            </p>
            <p className="text-center text-muted-foreground text-sm">
              Didn't receive the email? Check your spam folder.
            </p>
          </CardContent>
          
          <CardFooter className="flex flex-col space-y-3 px-6 pb-6">
            <Button onClick={handleResendEmail} variant="outline" className="w-full py-5 text-sm rounded-xl">
              Resend Confirmation Email
            </Button>
            <Button onClick={handleRefresh} className="w-full py-5 text-sm rounded-xl">
              I've Confirmed My Email
            </Button>
            <Button onClick={() => setEmailSent(false)} variant="ghost" className="w-full py-5 text-sm rounded-xl">
              Back to Login
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className="w-full flex items-center justify-center bg-gradient-to-br from-background via-muted/30 to-background p-4">
      <Card className="w-full max-w-md shadow-xl rounded-2xl overflow-hidden border-0 bg-gradient-to-br from-card to-muted">
        <CardHeader className="text-center pb-4 pt-6">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center shadow-sm border border-primary/10 mx-auto mb-3">
            <span className="text-2xl">🌸</span>
          </div>
          <CardTitle className="text-2xl font-bold text-primary">
            {isSignUp ? 'Create Account' : otpSent ? 'Verify Your Email' : 'Welcome Back'}
          </CardTitle>
          <CardDescription className="text-sm mt-1">
            {isSignUp 
              ? 'Join Kiki to get personalized support' 
              : otpSent
                ? `Enter the 6-digit code sent to ${email}`
                : authMethod === 'otp' 
                  ? 'Sign in with a one-time password' 
                  : 'Sign in to continue your conversation'}
          </CardDescription>
        </CardHeader>
        
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4 px-6">
            {isSignUp && (
              <>
                <div className="space-y-2">
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="username"
                      type="text"
                      placeholder="Username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required={isSignUp}
                      className="pl-9 py-5 rounded-xl text-sm"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="name"
                      type="text"
                      placeholder="Full name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="pl-9 py-5 rounded-xl text-sm"
                    />
                  </div>
                </div>
              </>
            )}
            
            {!otpSent ? (
              <>
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
                
                {(isSignUp || authMethod === 'password') && (
                  <div className="space-y-2">
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <PasswordInput
                        id="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required={isSignUp || authMethod === 'password'}
                        className="pl-9 py-5 rounded-xl text-sm"
                      />
                    </div>
                  </div>
                )}
                
                {!isSignUp && (
                  <div className="space-y-4">
                    <div className="space-y-3">
                      <Label className="text-sm font-medium">Sign in method</Label>
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant={authMethod === 'password' ? 'default' : 'outline'}
                          className="flex-1 py-5 text-sm rounded-xl"
                          onClick={() => setAuthMethod('password')}
                        >
                          <Lock className="h-4 w-4 mr-2" />
                          Password
                        </Button>
                        <Button
                          type="button"
                          variant={authMethod === 'otp' ? 'default' : 'outline'}
                          className="flex-1 py-5 text-sm rounded-xl"
                          onClick={() => setAuthMethod('otp')}
                        >
                          <Shield className="h-4 w-4 mr-2" />
                          Email OTP
                        </Button>
                      </div>
                    </div>
                    
                    {authMethod === 'password' && (
                      <Button 
                        type="button" 
                        variant="link" 
                        className="p-0 h-auto text-muted-foreground hover:text-primary text-sm"
                        onClick={handleResetPassword}
                      >
                        Forgot Password?
                      </Button>
                    )}
                    
                    {authMethod === 'otp' && (
                      <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                        <p className="text-xs text-blue-800 dark:text-blue-200">
                          <span className="font-medium">How it works:</span> We'll send a 6-digit code to your email. 
                          After entering your email and clicking "Sign In", you can enter the code on this page.
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="otp" className="text-sm">6-Digit Code</Label>
                  <Input
                    id="otp"
                    type="text"
                    placeholder="Enter 6-digit code"
                    value={otp}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '').slice(0, 6)
                      setOtp(value)
                    }}
                    maxLength={6}
                    required
                    className="py-5 text-center text-xl tracking-widest rounded-xl"
                  />
                  {otp.length > 0 && otp.length !== 6 && (
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
              </div>
            )}
          </CardContent>
          
          <CardFooter className="flex flex-col space-y-3 px-6 pb-6">
            {!otpSent ? (
              <Button type="submit" className="w-full py-5 text-sm rounded-xl" disabled={loading}>
                {loading ? 'Please wait...' : (isSignUp ? 'Create Account' : 'Sign In')}
              </Button>
            ) : (
              <div className="w-full space-y-3">
                <Button type="submit" className="w-full py-5 text-sm rounded-xl" disabled={loading || otp.length !== 6}>
                  {loading ? 'Verifying...' : 'Verify & Continue'}
                </Button>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1 py-5 text-sm rounded-xl"
                    onClick={handleResendOtp}
                    disabled={loading}
                  >
                    Resend Code
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    className="flex-1 py-5 text-sm rounded-xl"
                    onClick={handleBackToEmail}
                  >
                    Back
                  </Button>
                </div>
              </div>
            )}
            
            <Button
              type="button"
              variant="ghost"
              className="w-full py-5 text-sm rounded-xl"
              onClick={() => {
                setIsSignUp(!isSignUp)
                setOtpSent(false)
                setOtp('')
              }}
            >
              {isSignUp 
                ? 'Already have an account? Sign In' 
                : "Don't have an account? Sign Up"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}

export default Login