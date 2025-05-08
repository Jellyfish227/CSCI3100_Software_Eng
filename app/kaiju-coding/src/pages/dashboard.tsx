import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { CalendarDays, Code2, BookOpen, Activity, ArrowRight } from "lucide-react"

export default function DashboardPage() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Welcome back, Alex!</h1>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Practice Time</CardTitle>
            <Code2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">45.7 hours</div>
            <p className="text-xs text-muted-foreground">+2.5 hours from last week</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">+1 this month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Coding Streak</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12 days</div>
            <p className="text-xs text-muted-foreground">Keep it up!</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Next Tutor Session</CardTitle>
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Tomorrow</div>
            <p className="text-xs text-muted-foreground">2:00 PM - Advanced React</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7 mt-6">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Your Courses</CardTitle>
            <CardDescription>Your recent and in-progress courses</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { name: "Advanced JavaScript", progress: 75 },
                { name: "React Fundamentals", progress: 50 },
                { name: "Data Structures & Algorithms", progress: 30 },
              ].map((course) => (
                <div key={course.name} className="flex items-center">
                  <div className="w-full">
                    <p className="text-sm font-medium">{course.name}</p>
                    <Progress value={course.progress} className="h-2" />
                  </div>
                  <span className="ml-4 text-sm text-muted-foreground">{course.progress}%</span>
                </div>
              ))}
            </div>
            <Button variant="outline" className="w-full mt-4">
              View All Courses
            </Button>
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Upcoming Sessions</CardTitle>
            <CardDescription>Your scheduled tutoring sessions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { name: "Advanced React", date: "May 15, 2:00 PM", tutor: "Jane Doe" },
                { name: "Algorithms Deep Dive", date: "May 18, 4:00 PM", tutor: "John Smith" },
                { name: "System Design Basics", date: "May 20, 1:00 PM", tutor: "Alice Johnson" },
              ].map((session) => (
                <div key={session.name} className="flex items-center">
                  <Avatar className="h-9 w-9">
                    <AvatarFallback>
                      {session.tutor
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="ml-4 space-y-1">
                    <p className="text-sm font-medium leading-none">{session.name}</p>
                    <p className="text-sm text-muted-foreground">{session.date}</p>
                  </div>
                  <Badge variant="outline" className="ml-auto">
                    Upcoming
                  </Badge>
                </div>
              ))}
            </div>
            <Button variant="outline" className="w-full mt-4">
              View All Sessions
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Quick Access</CardTitle>
            <CardDescription>Popular topics and resources</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {[
                "JavaScript Basics",
                "React Hooks",
                "CSS Flexbox",
                "Python for Beginners",
                "Git & GitHub",
                "RESTful APIs",
                "Database Design",
                "Responsive Web Design",
              ].map((topic) => (
                <Button key={topic} variant="outline" className="justify-between">
                  {topic}
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

