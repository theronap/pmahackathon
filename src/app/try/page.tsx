import { redirect } from "next/navigation";

export default function TryPage() {
  redirect("/tool?sample=1&demo=1");
}
