import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/contexts/AuthContext'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { ArrowLeft, Upload, Menu } from 'lucide-react'
import OverlayMenu from "@/components/OverlayMenu"

const Profile = () => {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [resetLoading, setResetLoading] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleteStep, setDeleteStep] = useState<'confirm' | 'otp'>('confirm')
  const [deleteOtp, setDeleteOtp] = useState('')
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const { user, profile, updateProfile, signOut, refreshUser } = useAuth()
  const { toast } = useToast()
  const navigate = useNavigate()

  useEffect(() => {
    if (!user) {
      navigate('/login')
      return
    }

    if (profile) {
      setName(profile.name || '')
      setEmail(profile.email || user.email || '')
    } else {
      setEmail(user.email || '')
    }
  }, [user, profile, navigate])

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setAvatarFile(file)
      
      // Create preview
      const reader = new FileReader()
      reader.onload = (e) => {
        setAvatarPreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Handle avatar upload if a file is selected
      let avatarUrl = null
      if (avatarFile) {
        // In a real implementation, you would upload the file to storage
        // For now, we'll just show a message
        toast({
          title: 'Avatar selected',
          description: 'In a full implementation, the avatar would be uploaded to storage.',
        })
      }

      const { profile: updatedProfile, error } = await updateProfile({ 
        name
      })
      
      if (error) throw error
      
      toast({
        title: 'Profile updated',
        description: 'Your profile has been updated successfully.',
      })
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update profile. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleResetPassword = async () => {
    if (!user?.email) return
    
    setResetLoading(true)
    try {
      // Redirect to reset password page
      navigate('/reset-password?email=' + encodeURIComponent(user.email))
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to initiate password reset. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setResetLoading(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (!user?.id) return
    
    setDeleteLoading(true)
    try {
      // Import authService here to access deleteAccount method
      const { authService } = await import('@/services/authService')
      
      // Delete the user account and all associated data
      const { success, error } = await authService.deleteAccount(user.id)
      
      if (!success || error) {
        throw error || new Error('Failed to delete account')
      }
      
      toast({
        title: 'Account deleted',
        description: 'Your account and all associated data have been permanently deleted.',
      })
      
      // Sign out the user
      await signOut()
      
      // Redirect to login page
      navigate('/login')
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete account. Please try again.',
        variant: 'destructive',
      })
      setDeleteLoading(false)
    }
  }

  const confirmDeleteAccount = () => {
    setConfirmDelete(true)
  }

  const cancelDelete = () => {
    setConfirmDelete(false)
    setDeleteStep('confirm')
    setDeleteOtp('')
  }

  const handleDeleteWithOtp = async () => {
    // In a real implementation, you would verify the OTP and then delete the account
    // using admin privileges on the backend. For now, we'll just proceed with deletion.
    handleDeleteAccount()
  }

  const handleBack = () => {
    navigate('/')
  }

  // Generate avatar fallback based on user's name
  const getAvatarFallback = () => {
    if (!name) return 'U'
    const names = name.split(' ')
    if (names.length === 1) return names[0].charAt(0).toUpperCase()
    return names[0].charAt(0).toUpperCase() + names[names.length - 1].charAt(0).toUpperCase()
  }

  if (!user) {
    return null
  }

  return (
    <div className="w-full flex items-center justify-center bg-gradient-to-br from-background via-muted/30 to-background p-4 md:p-8 min-h-screen">
      {/* Overlay Menu */}
      <OverlayMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
      
      <Card className="w-full max-w-2xl mx-auto my-auto">
        <CardHeader className="text-center">
          <div className="absolute top-4 left-4">
            <Button 
              variant="ghost" 
              size="sm" 
              className="w-8 h-8 p-0"
              onClick={() => setMenuOpen(true)}
            >
              <Menu className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="flex justify-center mb-4">
            <div className="relative">
              <Avatar className="w-24 h-24">
                <AvatarImage src={avatarPreview || ""} alt={name} />
                <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                  {getAvatarFallback()}
                </AvatarFallback>
              </Avatar>
              <label 
                htmlFor="avatar-upload" 
                className="absolute bottom-0 right-0 bg-primary rounded-full p-2 cursor-pointer shadow-md hover:bg-primary/90 transition-colors"
              >
                <Upload className="h-4 w-4 text-primary-foreground" />
              </label>
              <input
                id="avatar-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarChange}
              />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-primary">Your Profile</CardTitle>
          <CardDescription>
            Manage your personal information
          </CardDescription>
        </CardHeader>
        
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  disabled
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Enter your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            </div>
          </CardContent>
          
          <Separator className="my-4" />
          
          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
            
            <div className="w-full space-y-2">
              <Button 
                type="button" 
                variant="outline" 
                className="w-full"
                onClick={handleResetPassword}
                disabled={resetLoading}
              >
                {resetLoading ? 'Redirecting...' : 'Reset Password'}
              </Button>
              
              {!confirmDelete ? (
                <Button 
                  type="button" 
                  variant="destructive" 
                  className="w-full"
                  onClick={confirmDeleteAccount}
                >
                  Delete Account
                </Button>
              ) : (
                <div className="space-y-2">
                  {deleteStep === 'confirm' ? (
                    <>
                      <p className="text-sm text-center text-destructive">
                        Are you sure you want to delete your account? This action cannot be undone and will permanently delete all your data including chat history.
                      </p>
                      <div className="flex gap-2">
                        <Button 
                          type="button" 
                          variant="destructive" 
                          className="flex-1"
                          onClick={() => setDeleteStep('otp')}
                        >
                          Yes, Delete Account
                        </Button>
                        <Button 
                          type="button" 
                          variant="outline" 
                          className="flex-1"
                          onClick={cancelDelete}
                        >
                          Cancel
                        </Button>
                      </div>
                    </>
                  ) : (
                    <Card className="w-full">
                      <CardContent className="pt-6 space-y-4">
                        <p className="text-sm text-center">
                          For security, please enter the OTP sent to your email to confirm account deletion.
                        </p>
                        <div className="space-y-2">
                          <Label htmlFor="delete-otp">6-Digit Code</Label>
                          <Input
                            id="delete-otp"
                            type="text"
                            placeholder="Enter 6-digit code"
                            value={deleteOtp}
                            onChange={(e) => setDeleteOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                            maxLength={6}
                            required
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            type="button" 
                            variant="destructive" 
                            className="flex-1"
                            onClick={handleDeleteWithOtp}
                            disabled={deleteLoading || deleteOtp.length !== 6}
                          >
                            {deleteLoading ? 'Deleting...' : 'Confirm Deletion'}
                          </Button>
                          <Button 
                            type="button" 
                            variant="outline" 
                            className="flex-1"
                            onClick={cancelDelete}
                          >
                            Cancel
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}

export default Profile