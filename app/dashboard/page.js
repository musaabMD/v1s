'use client';

// import Link from "next/link";
// import Header from "@/components/Header";

// export const dynamic = "force-dynamic";

// // This is a private page: It's protected by the layout.js component which ensures the user is authenticated.
// // It's a server compoment which means you can fetch data (like the user profile) before the page is rendered.
// // See https://shipfa.st/docs/tutorials/private-page
// export default async function Dashboard() {
//   return (
//     <>
//       <Header />
//       <main className="min-h-screen p-4 md:p-8 pb-24">
//         <section className="max-w-4xl mx-auto space-y-8">
//           <div className="flex justify-between items-center">
//             <h1 className="text-3xl md:text-4xl font-extrabold">Dashboard</h1>
//           </div>
          
//           <div className="grid gap-6 md:grid-cols-1">
//             <div className="rounded-lg border border-border bg-card text-card-foreground shadow-sm hover:shadow transition-all">
//               <div className="p-6 flex flex-col h-full">
//                 <div className="flex items-center gap-2 mb-2">
//                   <svg
//                     xmlns="http://www.w3.org/2000/svg"
//                     viewBox="0 0 24 24"
//                     fill="none"
//                     stroke="currentColor"
//                     strokeWidth="2"
//                     strokeLinecap="round"
//                     strokeLinejoin="round"
//                     className="h-5 w-5 text-primary"
//                   >
//                     <path d="M8 3H6a2 2 0 0 0-2 2v16c0 1.1.9 2 2 2h12a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2h-2" />
//                     <path d="M15 2H9a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V3a1 1 0 0 0-1-1Z" />
//                     <path d="M12 11h4" />
//                     <path d="M12 16h4" />
//                     <path d="M8 11h.01" />
//                     <path d="M8 16h.01" />
//                   </svg>
//                   <h2 className="font-semibold text-xl">Exam Library</h2>
//                 </div>
//                 <p className="text-muted-foreground mb-6 flex-grow">Browse and search through our comprehensive collection of certification exams and practice tests.</p>
//                 <Link 
//                   href="/dashboard/exams" 
//                   className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 w-full"
//                 >
//                   View All Exams
//                 </Link>
//               </div>
//             </div>
//           </div>
//         </section>
//       </main>
//     </>
//   );
// }
// app/dashboard/page.js
import Header from "@/components/Header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useUserExams } from "@/lib/hooks/useUserExams";
import { createClient } from "@/libs/supabase/client";
import { createExamSlug } from "@/libs/utils";
import Link from "next/link";
import { BookOpen, CreditCard } from 'lucide-react';
import { useState } from "react";
import { useRouter } from "next/navigation";

export const dynamic = "force-dynamic";

export default function DashboardPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen p-4 pb-24">
        <section className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl md:text-4xl font-extrabold text-center">Dashboard</h1>
          </div>
          <DashboardContent />
        </section>
      </main>
    </>
  );
}

function DashboardContent() {
  const { demos, subscriptions, isLoading } = useUserExams();
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const supabase = createClient();
  const router = useRouter();

  // Function to remove a demo exam
  const removeDemoExam = async (examId) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return;

      const { error: deleteError } = await supabase
        .from('s_user_exams')
        .delete()
        .eq('user_id', user.id)
        .eq('exam_id', examId)
        .eq('is_demo', true)
        .eq('access_type', 'demo');

      if (deleteError) throw deleteError;
      
      // Show success message
      setSuccess("Demo removed successfully");
      setTimeout(() => {
        setSuccess(null);
        router.refresh();
      }, 2000);
      
    } catch (error) {
      console.error("Error removing demo:", error);
      setError("Failed to remove demo");
      setTimeout(() => setError(null), 3000);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-solid border-black border-r-transparent"></div>
      </div>
    );
  }

  const ExamCard = ({ exam, isDemoExam = false }) => {
    const examSlug = createExamSlug(exam.id, exam.name);
    
    return (
      <div className="bg-white rounded-lg overflow-hidden border-2 border-gray-300 hover:shadow-lg transition-shadow duration-200">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 flex items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold text-lg">
                {exam.name.substring(0, 2).toUpperCase()}
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-800">
                  {exam.name}
                </h2>
                <p className="text-sm text-gray-500">
                  {exam.questions_count || 0} Questions
                </p>
                {exam.subscription_price && (
                  <p className="text-xs text-gray-400 mt-1">
                    ${exam.subscription_price}/year
                    {exam.lifetime_price && ` or $${exam.lifetime_price} lifetime`}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-col space-y-2">
            <Link 
              href={`/dashboard/exams/${examSlug}`} 
              className="w-full h-10 flex items-center justify-center gap-2 bg-gradient-to-r from-green-500 to-blue-600 text-white font-medium rounded-md hover:from-green-600 hover:to-blue-700 transition-colors"
            >
              View Exam
            </Link>
            
            {isDemoExam && (
              <button
                onClick={() => removeDemoExam(exam.id)}
                className="w-full h-10 flex items-center justify-center gap-2 bg-white text-red-600 font-medium rounded-md border border-red-300 hover:bg-red-50 transition-colors"
              >
                Remove Demo
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-12">
      {error && (
        <div className="fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg bg-red-50 text-red-900 border border-red-200">
          {error}
        </div>
      )}
      
      {success && (
        <div className="fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg bg-green-50 text-green-900 border border-green-200">
          {success}
        </div>
      )}
      
      <div className="space-y-6 sm:space-y-12">
        <div className="space-y-6 sm:space-y-8">
          <div className="flex flex-col items-center space-y-4 sm:space-y-8">            
            <div className="w-full">
              <Tabs defaultValue="demo" className="w-full">
                {/* Desktop Tabs */}
                <div className="hidden sm:flex justify-center mb-6 sm:mb-12">
                  <TabsList className="h-12 p-1 bg-white rounded-lg border border-gray-300 shadow-sm">
                    <TabsTrigger 
                      value="demo" 
                      className="px-6 h-full rounded-md text-base font-medium data-[state=active]:bg-blue-500 data-[state=active]:text-white transition-colors"
                    >
                      My Demos
                    </TabsTrigger>
                    <TabsTrigger 
                      value="subscription" 
                      className="px-6 h-full rounded-md text-base font-medium data-[state=active]:bg-blue-500 data-[state=active]:text-white transition-colors"
                    >
                      Purchased
                    </TabsTrigger>
                  </TabsList>
                </div>

                {/* Mobile Bottom Tab Bar */}
                <div className="fixed bottom-0 left-0 right-0 sm:hidden bg-white border-t border-gray-200 shadow-lg z-50">
                  <TabsList className="flex w-full h-16 items-center justify-around">
                    <TabsTrigger 
                      value="demo" 
                      className="flex flex-col items-center px-3 py-2 space-y-1 data-[state=active]:text-blue-500"
                    >
                      <BookOpen size={20} />
                      <span className="text-xs">Demos</span>
                    </TabsTrigger>
                    <TabsTrigger 
                      value="subscription" 
                      className="flex flex-col items-center px-3 py-2 space-y-1 data-[state=active]:text-blue-500"
                    >
                      <CreditCard size={20} />
                      <span className="text-xs">Paid</span>
                    </TabsTrigger>
                  </TabsList>
                </div>

                {/* Add bottom padding on mobile to account for tab bar */}
                <div className="pb-20 sm:pb-0">
                  <TabsContent value="demo" className="mt-4 sm:mt-6">
                    {demos.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                        {demos.map(demo => (
                          <ExamCard key={demo.exam_id} exam={demo.s_exams} isDemoExam={true} />
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 sm:py-16 text-gray-500">
                        No demos added yet. Visit the home page to explore available exams.
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="subscription" className="mt-4 sm:mt-6">
                    {subscriptions.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                        {subscriptions.map(sub => (
                          <ExamCard key={sub.exam_id} exam={sub.s_exams} isDemoExam={false} />
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 sm:py-16 text-gray-500">
                        No purchased exams yet. Visit the home page to explore available exams.
                      </div>
                    )}
                  </TabsContent>
                </div>
              </Tabs>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}