import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Book, Award, UserCircle, Save } from "lucide-react"
import { useState } from "react"
import { Textarea } from "@/components/ui/textarea"

interface TeacherProfileProps {
  name: string
  email: string
  subjects: string[]
  avatarUrl?: string
  bio: string
  classes: {
    name: string
    students: number
    schedule: string
  }[]
  achievements: {
    title: string
    date: string
    description: string
  }[]
}

export function TeacherProfile({
  name,
  email,
  subjects,
  avatarUrl,
  bio,
  classes,
  achievements,
}: TeacherProfileProps) {
  const [editedBio, setEditedBio] = useState(bio)
  const [isEditing, setIsEditing] = useState(false)

  // Function to handle the form submission (POST request)
  const handleUpdateProfile = () => {
    // Prepare data for POST request
    const profileData = {
      name,
      email,
      bio: editedBio,
      subjects
    }

    // Log the data that would be sent (instead of actually sending)
    console.log('Profile data to be updated:', profileData)
    
    // Here you would normally send the POST request
    // Example:
    // async function updateProfile() {
    //   try {
    //     const response = await fetch('/api/profile/update', {
    //       method: 'POST',
    //       headers: {
    //         'Content-Type': 'application/json',
    //       },
    //       body: JSON.stringify(profileData),
    //     });
    //     const data = await response.json();
    //     if (response.ok) {
    //       // Handle success
    //       setIsEditing(false);
    //     } else {
    //       // Handle error
    //       console.error('Failed to update profile:', data.message);
    //     }
    //   } catch (error) {
    //     console.error('Error updating profile:', error);
    //   }
    // }
    
    // For now, just toggle the editing state
    setIsEditing(false)
  }

  return (
    <div className="container mx-auto py-8 mt-16">
      <div className="flex items-center gap-2 mb-6">
        <UserCircle className="h-6 w-6 text-[#4aafbf]" />
        <h1 className="text-2xl font-bold">Teacher Profile</h1>
      </div>
      <hr className="mb-6" />
      
      <div className="grid gap-8 md:grid-cols-2">
        {/* Profile Card */}
        <Card className="shadow-lg border-t-4 border-t-[#4aafbf]">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-6">
              <Avatar className="h-24 w-24 border-2 border-[#4aafbf] shadow-md">
                <AvatarImage src={avatarUrl} alt={name} />
                <AvatarFallback className="bg-[#4aafbf] text-white text-xl">{name.slice(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-2xl font-bold">{name}</CardTitle>
                <CardDescription className="text-base mt-1">{email}</CardDescription>
                <div className="flex flex-wrap gap-2 mt-2">
                  {subjects.map((subject, index) => (
                    <Badge key={index} variant="secondary" className="bg-[#f0f9fa] text-[#4aafbf]">
                      {subject}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-6">
              <div className="bg-[#f0f9fa] p-4 rounded-lg">
                <h3 className="text-sm font-medium mb-2 flex items-center justify-between">
                  Bio
                  {isEditing && (
                    <span className="text-xs text-[#4aafbf]">Editing</span>
                  )}
                </h3>
                {isEditing ? (
                  <Textarea
                    value={editedBio}
                    onChange={(e) => setEditedBio(e.target.value)}
                    className="min-h-[100px] text-sm resize-none border-[#4aafbf] focus-visible:ring-[#4aafbf]"
                    placeholder="Tell us about yourself..."
                  />
                ) : (
                  <p className="text-sm text-muted-foreground">{editedBio}</p>
                )}
              </div>
              <div className="flex gap-3">
                {isEditing ? (
                  <>
                    <Button 
                      className="w-h bg-[#4aafbf] hover:bg-[#3d9aa9] flex items-center gap-2"
                      onClick={handleUpdateProfile}
                    >
                      <Save className="h-4 w-4" />
                      Save Changes
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-h border-[#4aafbf] text-[#4aafbf] hover:bg-[#f0f9fa]"
                      onClick={() => {
                        setEditedBio(bio) // Reset to original
                        setIsEditing(false)
                      }}
                    >
                      Cancel
                    </Button>
                  </>
                ) : (
                  <>
                    <Button 
                      className="w-h bg-[#4aafbf] hover:bg-[#3d9aa9]"
                      onClick={() => setIsEditing(true)}
                    >
                      Edit Profile
                    </Button>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Classes and Achievements Card */}
        <Card className="shadow-lg border-t-4 border-t-[#4aafbf]">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Award className="h-5 w-5 text-[#4aafbf]" />
              <CardTitle>Teaching Overview</CardTitle>
            </div>
            <CardDescription>Manage your classes and view achievements</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="classes" className="mt-2">
              <TabsList className="grid w-full grid-cols-2 bg-[#f0f9fa]">
                <TabsTrigger value="classes" className="data-[state=active]:bg-[#4aafbf] data-[state=active]:text-white">
                  <Book className="h-4 w-4 mr-2" />
                  Classes
                </TabsTrigger>
                <TabsTrigger value="achievements" className="data-[state=active]:bg-[#4aafbf] data-[state=active]:text-white">
                  <Award className="h-4 w-4 mr-2" />
                  Achievements
                </TabsTrigger>
              </TabsList>
              <TabsContent value="classes" className="space-y-4 mt-4">
                {classes.map((class_, index) => (
                  <div key={index} className="p-4 rounded-lg hover:bg-[#f0f9fa] transition-colors">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium">{class_.name}</h4>
                      <Badge className="bg-[#f0f9fa] text-[#4aafbf] hover:bg-[#e0eef0]">
                        {class_.students} students
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">{class_.schedule}</p>
                    {index < classes.length - 1 && <hr className="mt-4" />}
                  </div>
                ))}
              </TabsContent>
              <TabsContent value="achievements" className="space-y-4 mt-4">
                {achievements.map((achievement, index) => (
                  <div key={index} className="p-4 rounded-lg hover:bg-[#f0f9fa] transition-colors">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium">{achievement.title}</h4>
                      <Badge variant="outline" className="border-[#4aafbf] text-[#4aafbf]">
                        {achievement.date}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">{achievement.description}</p>
                    {index < achievements.length - 1 && <hr className="mt-4" />}
                  </div>
                ))}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 