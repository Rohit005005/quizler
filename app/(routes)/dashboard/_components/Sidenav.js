"use client";
import { db } from "@/configs";
import { quizes } from "@/configs/schema";
import { useUser } from "@clerk/nextjs";
import { desc, eq } from "drizzle-orm";
import React, { useEffect, useState } from "react";
import CreateNote from "./CreateNote";

function Sidenav() {
  const { user } = useUser();
  const [record, setRecord] = useState();

  useEffect(() => {
    user && GetQuizs();
  }, [user]);

  const GetQuizs = async () => {
    const resp = await db
      .select()
      .from(quizes)
      .where(eq(quizes.createBy, user?.primaryEmailAddress?.emailAddress))
      .orderBy(desc(quizes.id));

    if (resp) {
      setRecord(resp);
    }
  };

  return (
    <div className="text-white border border-white h-screen w-[30%]">
      <h1>Saved Notes</h1>
      {record && (
        <div>
          {record.map((item, index) => (
            <div key={index} className="border flex p-2 m-2">
              <h2>{item.title}</h2>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Sidenav;
