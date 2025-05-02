"use client"

import { useState } from "react"
import { MainNav } from "@/components/main-nav"
import { UserNav } from "@/components/user-nav"
import { Footer } from "@/components/footer"
import { CourseSearch } from "@/pages/course/course-search"
// import { PopularTopics } from "@/components/course/popular-topics"
import { CourseTabs } from "@/pages/course/course-tabs"
// import { TrendingCourses } from "@/components/course/trending-courses"
import { CourseCard } from "@/pages/course/course-card"
import {
  coursesData,
  topicsData,
  getCategories,
  getFeaturedCourse,
  getTrendingCourses,
  type CourseData,
} from "@/data/course-data"

export default function CourseOverviewPage() {
  const [searchResults, setSearchResults] = useState<CourseData[]>(coursesData)
  const [isSearching, setIsSearching] = useState(false)
  const [activeView, setActiveView] = useState<"grid" | "list">("grid")
  const [activeTab, setActiveTab] = useState("all")

  const handleSearch = (results: CourseData[]) => {
    setSearchResults(results)
    setIsSearching(true)
  }

  const clearSearch = () => {
    setIsSearching(false)
    setSearchResults(coursesData)
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background">
        <div className="container flex h-16 items-center px-4 sm:px-6">
          <a href="/" className="flex items-center gap-2 font-bold text-xl">
            Kaiju Academy
          </a>
          <MainNav className="mx-6" />
          <div className="ml-auto flex items-center space-x-4">
            <UserNav />
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="w-full py-12 md:py-24 lg:py-16 bg-[#d8eaed] relative">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Course Overview</h1>
                <p className="text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
                  Explore our wide range of courses and find the perfect one for your learning journey
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <div className="container px-4 md:px-6 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-24">
                <CourseSearch onSearch={handleSearch} allCourses={coursesData} />

                {isSearching && (
                  <div className="mt-4">
                    <button onClick={clearSearch} className="text-[#4aafbf] hover:underline flex items-center">
                      ← Back to all courses
                    </button>
                  </div>
                )}

                {!isSearching && (
                  <div className="mt-8">
                    <h3 className="font-medium text-lg mb-4">Categories</h3>
                    <ul className="space-y-2">
                      {getCategories().map((category) => (
                        <li key={category}>
                          <button
                            onClick={() => setActiveTab(category)}
                            className={`text-left w-full px-3 py-2 rounded-md transition-colors ${
                              activeTab === category ? "bg-[#e6f7f9] text-[#4aafbf]" : "hover:bg-muted"
                            }`}
                          >
                            {category.charAt(0).toUpperCase() + category.slice(1).replace(/-/g, " ")}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            {/* Main Content Area */}
            <div className="lg:col-span-3">
              {isSearching ? (
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold">Search Results</h2>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setActiveView("grid")}
                        className={`p-2 rounded-md ${activeView === "grid" ? "bg-muted" : ""}`}
                        aria-label="Grid view"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="h-5 w-5"
                        >
                          <rect width="7" height="7" x="3" y="3" rx="1" />
                          <rect width="7" height="7" x="14" y="3" rx="1" />
                          <rect width="7" height="7" x="14" y="14" rx="1" />
                          <rect width="7" height="7" x="3" y="14" rx="1" />
                        </svg>
                      </button>
                      <button
                        onClick={() => setActiveView("list")}
                        className={`p-2 rounded-md ${activeView === "list" ? "bg-muted" : ""}`}
                        aria-label="List view"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="h-5 w-5"
                        >
                          <line x1="3" x2="21" y1="6" y2="6" />
                          <line x1="3" x2="21" y1="12" y2="12" />
                          <line x1="3" x2="21" y1="18" y2="18" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {searchResults.length > 0 ? (
                    <div
                      className={
                        activeView === "grid" ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6" : "space-y-4"
                      }
                    >
                      {searchResults.map((course) => (
                        <CourseCard key={course.id} course={course} />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 bg-muted rounded-lg">
                      <h3 className="text-lg font-medium mb-2">No courses found</h3>
                      <p className="text-muted-foreground">
                        Try adjusting your search terms or browse our categories below.
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-12">
                  {/* Popular Topics Carousel */}
                  <section>
                    {/* <PopularTopics topics={topicsData} /> */}
                  </section>

                  {/* Featured Course */}
                  <section>
                    <h2 className="text-2xl font-bold mb-6">Featured Course</h2>
                    <div className="bg-[#f5f5f7] rounded-lg overflow-hidden">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="aspect-video relative">
                          <img
                            src={getFeaturedCourse().image || "/placeholder.svg"}
                            alt={getFeaturedCourse().title}
                            className="object-cover w-full h-full"
                          />
                        </div>
                        <div className="p-6 flex flex-col justify-center">
                          <div className="text-sm text-[#4aafbf] mb-2">
                            {getFeaturedCourse().category.replace(/-/g, " ").toUpperCase()}
                          </div>
                          <h3 className="text-2xl font-bold mb-2">{getFeaturedCourse().title}</h3>
                          <p className="mb-4">{getFeaturedCourse().description}</p>
                          <div className="flex items-center gap-4 mb-4">
                            <div className="flex items-center">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="h-4 w-4 mr-1 text-[#4aafbf]"
                              >
                                <circle cx="12" cy="12" r="10" />
                                <polyline points="12 6 12 12 16 14" />
                              </svg>
                              <span className="text-sm">{getFeaturedCourse().duration}</span>
                            </div>
                            <div className="flex items-center">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="h-4 w-4 mr-1 text-[#4aafbf]"
                              >
                                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                                <circle cx="9" cy="7" r="4" />
                                <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                              </svg>
                              <span className="text-sm">{getFeaturedCourse().students}</span>
                            </div>
                          </div>
                          <div className="mt-auto">
                            <a
                              href={`/courses/${getFeaturedCourse().id}`}
                              className="inline-block bg-[#4aafbf] hover:bg-[#3d9aa9] text-white px-6 py-2 rounded-md"
                            >
                              View Course
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>
                  </section>

                  {/* Course Tabs by Category */}
                  <section>
                    <CourseTabs courses={coursesData} categories={getCategories()} />
                  </section>

                  {/* Trending Courses */}
                  <section>
                    {/* <TrendingCourses courses={getTrendingCourses(4)} featuredCourse={getFeaturedCourse()} /> */}
                  </section>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
