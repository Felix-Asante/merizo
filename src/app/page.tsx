import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h4 className="text-primary font-bold"> Merizo 🎉</h4>
      <Link href="/login">Login</Link>
      <br />
      <Link href="/signup">Signup</Link>
    </div>
  );
}
