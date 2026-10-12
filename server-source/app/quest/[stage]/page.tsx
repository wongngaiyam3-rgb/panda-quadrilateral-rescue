import {Student} from "@/components/student";
import {notFound} from "next/navigation";
export default async function Page({params}:{params:Promise<{stage:string}>}){const {stage}=await params;const n=Number(stage);if(!Number.isInteger(n)||n<1||n>7)notFound();return <Student view="quest" stage={n}/>;}
