import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { X } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useNavigate } from 'react-router-dom'

interface FeedbackPopupProps {
  onClose: () => void
}

const FeedbackPopup = ({ onClose }: FeedbackPopupProps) => {
  const [showPopup, setShowPopup] = useState(true)
  const { user } = useAuth()
  const navigate = useNavigate()

  // Don't show popup if user has already submitted feedback
  useEffect(() => {
    if (user?.id) {
      const feedbackSubmitted = localStorage.getItem(`feedback_submitted_${user.id}`);
      if (feedbackSubmitted) {
        setShowPopup(false);
        onClose();
      }
    }
  }, [user, onClose]);

  const handleFeedbackSubmit = () => {
    // Mark feedback as submitted in localStorage
    if (user?.id) {
      localStorage.setItem(`feedback_submitted_${user.id}`, 'true')
    }
    
    // Navigate to feedback page
    navigate('/feedback')
    setShowPopup(false)
    onClose()
  }

  const handleClose = () => {
    // Mark as seen so it doesn't show again
    if (user?.id) {
      localStorage.setItem(`feedback_seen_${user.id}`, 'true')
    }
    setShowPopup(false)
    onClose()
  }

  if (!showPopup) {
    return null
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <Card className="w-full max-w-md mx-4">
        <CardHeader className="relative">
          <CardTitle className="text-2xl font-bold text-primary">We'd Love Your Feedback!</CardTitle>
          <CardDescription>
            Help us improve your experience with Kiki
          </CardDescription>
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 top-4"
            onClick={handleClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        
        <CardContent>
          <p className="text-muted-foreground">
            Your feedback helps us make Kiki better for everyone. It only takes a minute!
          </p>
        </CardContent>
        
        <CardFooter className="flex flex-col space-y-2">
          <Button 
            className="w-full"
            onClick={handleFeedbackSubmit}
          >
            Give Feedback
          </Button>
          <Button 
            variant="outline" 
            className="w-full"
            onClick={handleClose}
          >
            Maybe Later
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

export default FeedbackPopup