"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/libs/supabase/client";
import { useRouter } from 'next/navigation';
import Link from "next/link";
import { createExamSlug } from "@/libs/utils";
import { Search, Play, Plus, Lock, Grid, BookOpen, CreditCard } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { useUserExams } from "@/lib/hooks/useUserExams";

export default function ExamList() {
  const [allExams, setAllExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const { demos, subscriptions, isLoading: userExamsLoading } = useUserExams();
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    fetchExams();
  }, []);

  const fetchExams = async () => {
    try {
      setLoading(true);
      
      const { data: exams, error: examsError } = await supabase
        .from('s_exams')
        .select(`
          *,
          s_practice_subjects!inner (
            id,
            name,
            category,
            total_questions
          ),
          stripe_product_id,
          stripe_subscription_price_id,
          stripe_lifetime_price_id,
          subscription_price,
          lifetime_price,
          demo_available,
          demo_questions_count
        `);

      if (examsError) throw examsError;

      const examsWithCounts = await Promise.all(
        exams.map(async (exam) => {
          // Calculate total questions from subjects
          const totalQuestions = exam.s_practice_subjects.reduce((sum, subject) => sum + (subject.total_questions || 0), 0);
          
          // Group subjects by category
          const subjectsByCategory = exam.s_practice_subjects.reduce((acc, subject) => {
            if (!acc[subject.category]) {
              acc[subject.category] = [];
            }
            acc[subject.category].push(subject);
            return acc;
          }, {});
          
          return {
            ...exam,
            questions_count: totalQuestions,
            subjectsByCategory
          };
        })
      );

      setAllExams(examsWithCounts);
    } catch (error) {
      console.error("Error fetching exams:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const addToMyDemos = async (examId) => {
    try {
      setError(null);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push('/signin');
        return;
      }

      // First ensure user profile exists
      await supabase
        .from('profiles')
        .upsert([{ 
          id: user.id, 
          email: user.email,
          updated_at: new Date().toISOString() 
        }], {
          onConflict: 'id'
        });

      // Add demo access with correct fields
      const { error } = await supabase
        .from('s_user_exams')
        .upsert([{ 
          user_id: user.id, 
          exam_id: examId,
          is_demo: true,
          is_paid: false,
          access_type: 'demo',
          subscription_start: new Date().toISOString(),
          added_at: new Date().toISOString()
        }], {
          onConflict: 'user_id,exam_id'
        });

      if (error) {
        console.error("Error adding demo:", error);
        setError("Failed to add demo. Please try again.");
        return;
      }

      setError("Demo added successfully!");
      setTimeout(() => setError(null), 3000);
      router.refresh();
    } catch (error) {
      console.error("Error adding demo:", error);
      setError("Failed to add demo. Please try again.");
    }
  };

  const handleBuyAccess = async (examId) => {
    try {
      setError(null);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push('/signin');
        return;
      }

      const response = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ examId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session');
      }

      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (error) {
      console.error('Error redirecting to checkout:', error);
      setError(error.message || 'Failed to initiate checkout. Please try again.');
    }
  };

  const filteredExams = (searchQuery) => {
    return allExams.filter(exam => 
      exam.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const filteredDemos = (searchQuery) => {
    return demos.filter(demo => 
      demo.s_exams.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const filteredSubscriptions = (searchQuery) => {
    return subscriptions.filter(sub => 
      sub.s_exams.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const ExamCard = ({ exam, type = 'all' }) => {
    const examSlug = createExamSlug(exam.id, exam.name);
    const isInDemos = demos.some(d => d.exam_id === exam.id && d.access_type === 'demo');
    const subscription = subscriptions.find(s => s.exam_id === exam.id);
    const hasLifetimeAccess = subscriptions.find(s => s.exam_id === exam.id && s.access_type === 'lifetime');
    const hasSubscriptionAccess = subscriptions.find(s => s.exam_id === exam.id && s.access_type === 'subscription');
    
    const showDemoButton = exam.demo_available && !hasSubscriptionAccess && !hasLifetimeAccess && type !== 'subscription';
    const showBuyButton = !hasSubscriptionAccess && !hasLifetimeAccess;
    
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
                  {exam.questions_count} Total Questions • {exam.s_practice_subjects?.length || 0} Subjects
                </p>
                {exam.subjectsByCategory && (
                  <div className="mt-1 text-xs text-gray-400 space-y-0.5">
                    {Object.entries(exam.subjectsByCategory).map(([category, subjects]) => (
                      <div key={category} className="flex items-center gap-1">
                        <span className="font-medium">{category}:</span>
                        <span>{subjects.length} subjects, {subjects.reduce((sum, s) => sum + (s.total_questions || 0), 0)} questions</span>
                      </div>
                    ))}
                  </div>
                )}
                {exam.subscription_price && (
                  <p className="text-xs text-gray-400 mt-1">
                    From ${exam.subscription_price}/year
                    {exam.lifetime_price && ` or ${exam.lifetime_price} lifetime`}
                  </p>
                )}
              </div>
            </div>
            {!exam.demo_available && !hasSubscriptionAccess && !hasLifetimeAccess && (
              <Lock className="text-gray-300" size={20} />
            )}
          </div>

          <div className="mt-4 space-y-2">
            {hasLifetimeAccess ? (
              <Link 
                href={`/dashboard/exams/${examSlug}`} 
                className="w-full h-10 flex items-center justify-center gap-2 bg-gradient-to-r from-green-500 to-blue-600 text-white font-medium rounded-md hover:from-green-600 hover:to-blue-700 transition-colors"
              >
                <Play size={16} /> Practice Now (Lifetime Access)
              </Link>
            ) : hasSubscriptionAccess ? (
              <>
                <Link 
                  href={`/dashboard/exams/${examSlug}`} 
                  className="w-full h-10 flex items-center justify-center gap-2 bg-gradient-to-r from-green-500 to-blue-600 text-white font-medium rounded-md hover:from-green-600 hover:to-blue-700 transition-colors"
                >
                  <Play size={16} /> Practice Now
                </Link>
                {subscription?.daysLeft && (
                  <p className="text-xs text-center text-gray-400">
                    {subscription.daysLeft} days left in subscription
                  </p>
                )}
              </>
            ) : (
              <>
                {isInDemos ? (
                  <Link 
                    href={`/dashboard/exams/${examSlug}`} 
                    className="w-full h-10 flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium rounded-md hover:from-blue-600 hover:to-purple-700 transition-colors"
                  >
                    <Play size={16} /> Try Free Demo
                  </Link>
                ) : showDemoButton && (
                  <button 
                    onClick={() => addToMyDemos(exam.id)}
                    className="w-full h-10 flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium rounded-md hover:from-blue-600 hover:to-purple-700 transition-colors"
                  >
                    <Plus size={16} /> Try Free Demo
                  </button>
                )}
                {showBuyButton && (
                  <button
                    onClick={() => handleBuyAccess(exam.id)}
                    className="w-full h-10 flex items-center justify-center gap-2 bg-white text-gray-800 font-medium rounded-md border border-gray-300 hover:border-gray-400 transition-colors"
                  >
                    Buy Full Access - $49/yr
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    );
  };

  useEffect(() => {
    if (error && error.includes("successfully")) {
      setTimeout(() => {
        setError(null);
        router.refresh();
      }, 3000);
    }
  }, [error, router]);

  if (loading || userExamsLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-solid border-black border-r-transparent"></div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-12">
      <div className="space-y-6 sm:space-y-12">
        {error && (
          <div className={`fixed top-4 right-4 z-50 px-4 sm:px-6 py-2 sm:py-3 rounded-lg shadow-lg ${
            error.includes("successfully") 
              ? "bg-green-50 text-green-900 border border-green-200"
              : "bg-red-50 text-red-900 border border-red-200"
          }`}>
            {error}
          </div>
        )}

        <div className="space-y-6 sm:space-y-8">
          <div className="flex flex-col items-center space-y-4 sm:space-y-8">
            <div className="w-full max-w-xl">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <Input
                  type="search"
                  placeholder="Search exams..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-10 sm:h-12 pl-10 pr-4 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-0 bg-white"
                />
              </div>
            </div>
            
            <div className="w-full">
              <Tabs defaultValue="all" className="w-full">
                {/* Desktop Tabs */}
                <div className="hidden sm:flex justify-center mb-6 sm:mb-12">
                  <TabsList className="h-12 p-1 bg-white rounded-lg border border-gray-300 shadow-sm">
                    <TabsTrigger 
                      value="all" 
                      className="px-6 h-full rounded-md text-base font-medium data-[state=active]:bg-blue-500 data-[state=active]:text-white transition-colors"
                    >
                      All Exams
                    </TabsTrigger>
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
                      value="all" 
                      className="flex flex-col items-center px-3 py-2 space-y-1 data-[state=active]:text-blue-500"
                    >
                      <Grid size={20} />
                      <span className="text-xs">All</span>
                    </TabsTrigger>
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
                  <TabsContent value="all" className="mt-4 sm:mt-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                      {filteredExams(searchQuery).map(exam => (
                        <ExamCard key={exam.id} exam={exam} type="all" />
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="demo" className="mt-4 sm:mt-6">
                    {demos.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                        {filteredDemos(searchQuery).map(demo => (
                          <ExamCard key={demo.exam_id} exam={demo.s_exams} type="demo" />
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 sm:py-16 text-gray-500">
                        No demos added yet
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="subscription" className="mt-4 sm:mt-6">
                    {subscriptions.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                        {filteredSubscriptions(searchQuery).map(sub => (
                          <ExamCard key={sub.exam_id} exam={sub.s_exams} type="subscription" />
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 sm:py-16 text-gray-500">
                        No purchased exams
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
