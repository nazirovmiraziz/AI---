"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";

export default function LibraryTopicRedirect() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  useEffect(() => {
    router.replace(`/lesson/${id}`);
  }, [id, router]);
  return <div className="skeleton h-32" />;
}
