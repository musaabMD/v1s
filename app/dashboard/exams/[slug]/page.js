"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/libs/supabase/client";
import Header from "@/components/Header";
import Link from "next/link";
import { getIdFromSlug, createExamSlug } from "@/libs/utils";
import NoQuestionsAvailable from "@/components/NoQuestionsAvailable";
import UserDashboard from "@/components/p2/userDashboard";

export default function ExamPage() {
  return <UserDashboard />;
} 