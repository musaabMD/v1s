import Link from "next/link";
import ButtonSignin from "@/components/ButtonSignin";
import ExamList from "@/components/Examlist";
import Header from "@/components/Header";

export default function Page() {
  return (
    <>
      <Header />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-center mb-8">Explore Exams</h1>
        <ExamList />
      </div>
    </>
  );
}
