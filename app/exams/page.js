import { db } from '@/app/src/lib/db';
import { exams } from '@/app/src/lib/schema';

export default async function ExamsPage() {
  const allExams = await db.select().from(exams);
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">All Exams</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {allExams.map(exam => (
          <div key={exam.id} className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-2">{exam.name}</h2>
            <p className="text-gray-600 mb-4">{exam.description}</p>
            <div className="flex justify-between items-center">
              <span className="text-green-600 font-semibold">
                ${exam.subscription_price}/month
              </span>
              {exam.is_free && (
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm">
                  Free
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 