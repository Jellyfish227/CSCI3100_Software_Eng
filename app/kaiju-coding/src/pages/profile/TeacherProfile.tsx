import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

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
  return (
    <div className="container mx-auto py-8">
      <div className="grid gap-6 md:grid-cols-2">
        {/* Profile Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={avatarUrl} alt={name} />
                <AvatarFallback>{name.slice(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-2xl">{name}</CardTitle>
                <CardDescription>{email}</CardDescription>
                <div className="flex gap-2 mt-2">
                  {subjects.map((subject, index) => (
                    <Badge key={index} variant="secondary">
                      {subject}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium">Bio</h3>
                <p className="text-sm text-muted-foreground mt-1">{bio}</p>
              </div>
              <Button className="w-full">Edit Profile</Button>
            </div>
          </CardContent>
        </Card>

        {/* Classes and Achievements Card */}
        <Card>
          <CardHeader>
            <CardTitle>Teaching Overview</CardTitle>
            <CardDescription>Manage your classes and view achievements</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="classes">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="classes">Classes</TabsTrigger>
                <TabsTrigger value="achievements">Achievements</TabsTrigger>
              </TabsList>
              <TabsContent value="classes" className="space-y-4">
                {classes.map((class_, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium">{class_.name}</h4>
                      <Badge variant="secondary">{class_.students} students</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{class_.schedule}</p>
                  </div>
                ))}
              </TabsContent>
              <TabsContent value="achievements" className="space-y-4">
                {achievements.map((achievement, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium">{achievement.title}</h4>
                      <Badge variant="outline">{achievement.date}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{achievement.description}</p>
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